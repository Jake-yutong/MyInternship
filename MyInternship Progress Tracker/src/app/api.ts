import { Application, parseApplicationsPayload } from './data';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '');

type RemoteApplicationsPayload = {
  applications: Application[];
  found: boolean;
  recovered: boolean;
  savedAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function requestJson(path: string, init?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return (await response.json()) as unknown;
}

function parseRemoteApplicationsPayload(payload: unknown): RemoteApplicationsPayload {
  if (!isRecord(payload)) {
    throw new Error('Unknown API response format.');
  }

  return {
    applications: parseApplicationsPayload(payload),
    found: payload.found === true,
    recovered: payload.recovered === true,
    savedAt: typeof payload.savedAt === 'string' ? payload.savedAt : null,
  };
}

export async function fetchApplicationsFromServer() {
  const payload = await requestJson('/applications');
  return parseRemoteApplicationsPayload(payload);
}

export async function saveApplicationsToServer(applications: Application[]) {
  const payload = await requestJson('/applications', {
    method: 'PUT',
    body: JSON.stringify({ applications }),
  });

  return parseRemoteApplicationsPayload(payload);
}