import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { loadApplicationsEnvelope, saveApplications } from './storage.js';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(MODULE_DIR, '..');
const DEFAULT_DIST_DIR = path.resolve(PROJECT_DIR, 'dist');

function resolveServerOptions(options = {}) {
  const host = options.host ?? process.env.MYINTERNSHIP_API_HOST ?? '127.0.0.1';
  const port = Number(options.port ?? process.env.MYINTERNSHIP_API_PORT ?? '8787');
  const bodyLimit = options.bodyLimit ?? process.env.MYINTERNSHIP_API_BODY_LIMIT ?? '15mb';
  const distDir = path.resolve(options.distDir ?? process.env.MYINTERNSHIP_DIST_DIR ?? DEFAULT_DIST_DIR);
  const distIndexFile = path.join(distDir, 'index.html');

  return {
    host,
    port,
    bodyLimit,
    distDir,
    distIndexFile,
    hasBuiltFrontend: fs.existsSync(distIndexFile),
  };
}

export function createServerApp(options = {}) {
  const serverOptions = resolveServerOptions(options);
  const app = express();

  app.use(express.json({ limit: serverOptions.bodyLimit }));

  app.get('/api/health', async (_request, response, next) => {
    try {
      const { envelope, found, recovered, sourceFile } = await loadApplicationsEnvelope();

      response.json({
        ok: true,
        storage: 'sqlite',
        found,
        recovered,
        count: envelope.applications.length,
        savedAt: envelope.savedAt,
        schemaVersion: envelope.schemaVersion,
        sourceFile,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/applications', async (_request, response, next) => {
    try {
      const { envelope, found, recovered } = await loadApplicationsEnvelope();

      response.json({
        ...envelope,
        found,
        recovered,
      });
    } catch (error) {
      next(error);
    }
  });

  app.put('/api/applications', async (request, response, next) => {
    try {
      const applications = request.body?.applications;

      if (!Array.isArray(applications)) {
        response.status(400).json({
          message: 'applications must be an array',
        });
        return;
      }

      const envelope = await saveApplications(applications);

      response.json({
        ...envelope,
        count: envelope.applications.length,
      });
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _request, response, _next) => {
    if (error?.type === 'entity.too.large') {
      response.status(413).json({
        message: 'request body is too large',
      });
      return;
    }

    console.error('[myinternship-api] unexpected error', error);

    response.status(500).json({
      message: 'internal server error',
    });
  });

  if (serverOptions.hasBuiltFrontend) {
    app.use(express.static(serverOptions.distDir));

    app.get(/^\/(?!api(?:\/|$)).*/, (_request, response) => {
      response.sendFile(serverOptions.distIndexFile);
    });
  }

  return {
    app,
    serverOptions,
  };
}

export function startServer(options = {}) {
  const { app, serverOptions } = createServerApp(options);
  const server = app.listen(serverOptions.port, serverOptions.host, () => {
    console.log(`[myinternship-api] listening on http://${serverOptions.host}:${serverOptions.port}`);

    if (serverOptions.hasBuiltFrontend) {
      console.log(`[myinternship-api] serving frontend from ${serverOptions.distDir}`);
    }
  });

  return {
    server,
    serverOptions,
  };
}

if (import.meta.main) {
  startServer();
}