import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(MODULE_DIR, '..');
const DEFAULT_DATA_DIR = path.resolve(PROJECT_DIR, 'server/data');
const SERVER_STORAGE_SCHEMA_VERSION = 1;
const CURRENT_SNAPSHOT_KEY = 'current';
const BACKUP_SNAPSHOT_KEY = 'backup';

let database = null;
let databaseFilePath = null;

function resolveDataDir() {
  if (process.env.MYINTERNSHIP_DATA_DIR) {
    return path.resolve(process.env.MYINTERNSHIP_DATA_DIR);
  }

  return DEFAULT_DATA_DIR;
}

function resolveDatabaseFilePath() {
  return path.join(resolveDataDir(), 'applications.sqlite');
}

function resolveLegacyDataFilePath() {
  return path.join(resolveDataDir(), 'applications.json');
}

function resolveLegacyBackupFilePath() {
  return path.join(resolveDataDir(), 'applications.backup.json');
}

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
  await fs.mkdir(resolveDataDir(), { recursive: true });
}

function getDatabase() {
  if (database) {
    return database;
  }

  databaseFilePath = resolveDatabaseFilePath();
  database = new DatabaseSync(databaseFilePath);
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
    primaryEnvelope = await readLegacyEnvelopeFromFile(resolveLegacyDataFilePath());
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      primaryInvalid = true;
    }
  }

  try {
    const backupEnvelope = await readLegacyEnvelopeFromFile(resolveLegacyBackupFilePath());

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
        sourceFile: databaseFilePath ?? resolveDatabaseFilePath(),
      };
    } catch (error) {
      const backupSnapshotRow = getSnapshotRow(BACKUP_SNAPSHOT_KEY);

      if (backupSnapshotRow) {
        return {
          envelope: parseSnapshotRow(backupSnapshotRow),
          found: true,
          recovered: true,
          sourceFile: databaseFilePath ?? resolveDatabaseFilePath(),
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
      sourceFile: databaseFilePath ?? resolveDatabaseFilePath(),
    };
  }

  return {
    envelope: createEmptyEnvelope(),
    found: false,
    recovered: false,
    sourceFile: databaseFilePath ?? resolveDatabaseFilePath(),
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