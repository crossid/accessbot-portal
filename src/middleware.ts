// import { authConfig } from './src/auth.config'

import { NextRequest, NextResponse } from 'next/server';
import { Workspace } from './lib/types';

let workspace: Workspace;

export async function middleware(request: NextRequest) {
  // Clone the request headers and set a new header `x-hello-from-middleware1`
  const requestHeaders = new Headers(request.headers);
  if (!workspace) {
    const host = request.headers.get('host')?.split(':')[0];
    const resp = await fetch(`http://${host}/api/workspaces/public`);
    if (resp.status != 200 && resp.status != 404) {
      throw new Error('Failed to fetch workspace');
    }
    if (resp.status == 200) {
      workspace = await resp.json();
    }
  }

  if (workspace) {
    requestHeaders.set('x-workspace-id', workspace.external_id);
  }

  // You can also set request headers in NextResponse.rewrite
  const response = NextResponse.next({
    request: {
      // New request headers
      headers: requestHeaders
    }
  });

  return response;
}
