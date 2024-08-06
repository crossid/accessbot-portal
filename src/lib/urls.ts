import { core } from '@/config/core';
import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { headers } from 'next/headers';

export function getBackendHost() {
  // TODO is it safe? this host is getting access tokens!
  return headers().get('x-forwarded-host');
}

/**
 * Get the backend URL
 * Currently expecting the backend to be relative to the host
 */
export function getBackendURL() {
  let host = getBackendHost();
  if (host) {
    return `https://${host}`;
  } else {
    throw new Error('No host');
  }
}

export function getBackendAPIURL() {
  return `${getBackendURL()}/api`;
}

export function getServerURL(headers: ReadonlyHeaders) {
  let host = headers.get('x-forwarded-host');
  let proto = headers.get('x-forwarded-proto');
  // let port = headers().get('x-forwarded-port')

  return `${proto}://${host}/${core.basePath}`;
}

export function getServerAPIURL(headers: ReadonlyHeaders) {
  return `${getServerURL(headers)}/api`;
}
