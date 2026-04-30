import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DATA_DIR = path.resolve(process.cwd(), 'server/data');
const DATABASE_FILE = path.join(DATA_DIR, 'applications.sqlite');
const LEGACY_DATA_FILE = path.join(DATA_DIR, 'applications.json');
const LEGACY_BACKUP_FILE = path.join(DATA_DIR, 'applications.backup.json');
const SERVER_STORAGE_SCHEMA_VERSION = 1;
const CURRENT_SNAPSHOT_KEY = 'current';
const BACKUP_SNAPSHOT_KEY = 'backup';

let database = null;

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeEnvelope(value) {
  if (Array.isArray(value)) {
    return {
      schemaVersion: SERVER_STORAGE_SCHEMA_VERSION,
      savedAt: new Date(0).toISOString(),
      applications: value,
    };
  }

  if (!isRecord(value) || !Array.isArray(value.applications)) {
    return null;
  }

  return {
    schemaVersion: typeof value.schemaVersion === 'number' ? value.schemaVersion : SERVER_STORAGE_SCHEMA_VERSION,
    savedAt: typeof value.savedAt === 'string' ? value.savedAt : new Date().toISOString(),
    applications: value.applications,
  };
}

function createEmptyEnvelope() {
  return {
    schemaVersion: SERVER_STORAGE_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    applications: [],
  };
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function getDatabase() {
  if (database) {
    return database;
  }

  database = new DatabaseSync(DATABASE_FILE);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = FULL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS storage_snapshots (
      snapshot_key TEXT PRIMARY KEY,
      schema_version INTEGER NOT NULL,
      saved_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );
  `);

  return database;
}

function getSnapshotRow(snapshotKey) {
  const statement = getDatabase().prepare(`
    SELECT
      snapshot_key AS snapshotKey,
      schema_version AS schemaVersion,
      saved_at AS savedAt,
      payload
    FROM storage_snapshots
    WHERE snapshot_key = ?
  `);

  return statement.get(snapshotKey) ?? null;
}

function parseSnapshotRow(snapshotRow) {
  if (!snapshotRow) {
    return null;
  }

  const parsedPayload = JSON.parse(snapshotRow.payload);
  const envelope = normalizeEnvelope({
    schemaVersion: snapshotRow.schemaVersion,
    savedAt: snapshotRow.savedAt,
    applications: parsedPayload,
  });

  if (!envelope) {
    throw new Error(`Invalid SQLite snapshot payload for key ${snapshotRow.snapshotKey}`);
  }

  return envelope;
}

function writeSnapshot(snapshotKey, envelope) {
  const statement = getDatabase().prepare(`
    INSERT INTO storage_snapshots (snapshot_key, schema_version, saved_at, payload)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(snapshot_key) DO UPDATE SET
      schema_version = excluded.schema_version,
      saved_at = excluded.saved_at,
      payload = excluded.payload
  `);

  statement.run(
    snapshotKey,
    envelope.schemaVersion,
    envelope.savedAt,
    JSON.stringify(envelope.applications),
  );
}

function withTransaction(run) {
  const db = getDatabase();
  db.exec('BEGIN IMMEDIATE');

  try {
    const result = run();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

async function readLegacyEnvelopeFromFile(filePath) {
  const rawValue = await fs.readFile(filePath, 'utf8');
  const parsedValue = JSON.parse(rawValue);
  const normalizedEnvelope = normalizeEnvelope(parsedValue);

  if (!normalizedEnvelope) {
    throw new Error(`Invalid applications storage format: ${filePath}`);
  }

  return normalizedEnvelope;
}

async function readLegacyMigrationSource() {
  let primaryEnvelope = null;
  let primaryInvalid = false;

  try {
    primaryEnvelope = await readLegacyEnvelopeFromFile(LEGACY_DATA_FILE);
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      primaryInvalid = true;
    }
  }

  try {
    const backupEnvelope = await readLegacyEnvelopeFromFile(LEGACY_BACKUP_FILE);

    if (primaryEnvelope) {
      return {
        envelope: primaryEnvelope,
        backupEnvelope,
        found: true,
        recovered: false,
      };
    }

    return {
      envelope: backupEnvelope,
      backupEnvelope,
      found: true,
      recovered: true,
    };
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.warn('[myinternship-api] legacy backup file is unreadable, skipping JSON migration fallback');
    }
  }

  if (primaryEnvelope) {
    return {
      envelope: primaryEnvelope,
      backupEnvelope: null,
      found: true,
      recovered: false,
    };
  }

  if (primaryInvalid) {
    console.warn('[myinternship-api] legacy primary JSON storage is unreadable, starting with empty SQLite storage');
  }

  return {
    envelope: null,
    backupEnvelope: null,
    found: false,
    recovered: false,
  };
}

async function migrateLegacyJsonIfNeeded() {
  if (getSnapshotRow(CURRENT_SNAPSHOT_KEY)) {
    return null;
  }

  const migrationSource = await readLegacyMigrationSource();

  if (!migrationSource.found || !migrationSource.envelope) {
    return null;
  }

  withTransaction(() => {
    writeSnapshot(CURRENT_SNAPSHOT_KEY, migrationSource.envelope);

    if (migrationSource.backupEnvelope) {
      writeSnapshot(BACKUP_SNAPSHOT_KEY, migrationSource.backupEnvelope);
      return;
    }

    writeSnapshot(BACKUP_SNAPSHOT_KEY, migrationSource.envelope);
  });

  return migrationSource;
}

export async function loadApplicationsEnvelope() {
  await ensureDataDir();
  getDatabase();

  const currentSnapshotRow = getSnapshotRow(CURRENT_SNAPSHOT_KEY);

  if (currentSnapshotRow) {
    try {
      return {
        envelope: parseSnapshotRow(currentSnapshotRow),
        found: true,
        recovered: false,
        sourceFile: DATABASE_FILE,
      };
    } catch (error) {
      const backupSnapshotRow = getSnapshotRow(BACKUP_SNAPSHOT_KEY);

      if (backupSnapshotRow) {
        return {
          envelope: parseSnapshotRow(backupSnapshotRow),
          found: true,
          recovered: true,
          sourceFile: DATABASE_FILE,
        };
      }

      throw error;
    }
  }

  const migratedSource = await migrateLegacyJsonIfNeeded();

  if (migratedSource?.envelope) {
    return {
      envelope: migratedSource.envelope,
      found: true,
      recovered: migratedSource.recovered,
      sourceFile: DATABASE_FILE,
    };
  }

  return {
    envelope: createEmptyEnvelope(),
    found: false,
    recovered: false,
    sourceFile: DATABASE_FILE,
  };
}

export async function saveApplications(applications) {
  await ensureDataDir();
  getDatabase();

  const nextEnvelope = {
    schemaVersion: SERVER_STORAGE_SCHEMA_VERSION,
    savedAt: new Date().toISOString(),
    applications,
  };

  withTransaction(() => {
    const currentSnapshotRow = getSnapshotRow(CURRENT_SNAPSHOT_KEY);

    if (currentSnapshotRow) {
      getDatabase().prepare(`
        INSERT INTO storage_snapshots (snapshot_key, schema_version, saved_at, payload)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(snapshot_key) DO UPDATE SET
          schema_version = excluded.schema_version,
          saved_at = excluded.saved_at,
          payload = excluded.payload
      `).run(
        BACKUP_SNAPSHOT_KEY,
        currentSnapshotRow.schemaVersion,
        currentSnapshotRow.savedAt,
        currentSnapshotRow.payload,
      );
    }

    writeSnapshot(CURRENT_SNAPSHOT_KEY, nextEnvelope);
  });

  return nextEnvelope;
}