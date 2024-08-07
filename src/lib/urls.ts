import { core } from '@/config/core';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { headers } from 'next/headers';

export function getHTTPRequestHost() {
  // this is the domain of the workspace that the user writes in the browser
  return headers().get('x-forwarded-host');
}

/**
 * Get the backend URL
 * Currently expecting the backend to be relative to the host
 */
export function getBackendURL() {
  return process.env.BACKEND_URI;
}

export function getBackendAPIURL() {
  return `${getBackendURL()}/api`;
}

export function getUIServerURL(headers: ReadonlyHeaders) {
  return process.env.UI_SERVER_URI + "/" + core.basePath;
}

export function getUIServerAPIURL(headers: ReadonlyHeaders) {
  return `${getUIServerURL(headers)}/api`;
}
