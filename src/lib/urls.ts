import { headers } from 'next/headers';

/**
 * Get the backend URL
 * Currently expecting the backend to be relative to the host
 */
export function getBackendURL() {
  // TODO is it safe? this host is getting access tokens!
  let host = headers().get('x-forwarded-host');
  if (host) {
    // TODO this can be safely removed in case we run in dev/integration modes via proxy
    host = host.split(':')[0];
    return `https://${host}`;
  } else {
    throw new Error('No host');
  }
}

export function getBackendAPIURL() {
  return `${getBackendURL()}/api`;
}

export function getServerURL() {
  let host = headers().get('x-forwarded-host');
  let proto = headers().get('x-forwarded-proto');
  // let port = headers().get('x-forwarded-port')

  return `${proto}://${host}`;
}

export function getServerAPIURL() {
  return `${getServerURL()}/api`;
}
