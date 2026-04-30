import express from 'express';
import { loadApplicationsEnvelope, saveApplications } from './storage.js';

const HOST = process.env.MYINTERNSHIP_API_HOST ?? '127.0.0.1';
const PORT = Number(process.env.MYINTERNSHIP_API_PORT ?? '8787');
const BODY_LIMIT = process.env.MYINTERNSHIP_API_BODY_LIMIT ?? '15mb';

const app = express();

app.use(express.json({ limit: BODY_LIMIT }));

app.get('/api/health', async (_request, response, next) => {
  try {
    const { envelope, found, recovered } = await loadApplicationsEnvelope();

    response.json({
      ok: true,
      storage: 'sqlite',
      found,
      recovered,
      count: envelope.applications.length,
      savedAt: envelope.savedAt,
      schemaVersion: envelope.schemaVersion,
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

app.listen(PORT, HOST, () => {
  console.log(`[myinternship-api] listening on http://${HOST}:${PORT}`);
});