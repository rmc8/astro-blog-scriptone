import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const clientId = `${url.protocol}//${url.host}/api/moodesky/oauth/client-metadata.json`;

  const metadata = {
    client_id: clientId,
    application_type: "native",
    client_name: "MoodeSky",
    client_uri: "https://github.com/rmc-8/moodesky",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
    redirect_uris: [
      "https://rmc-8.com/moodesky/oauth/callback",
      "mooodysky://oauth/callback"
    ],
    scope: "atproto",
    dpop_bound_access_tokens: true,
    token_endpoint_auth_method: "none"
  };

  return new Response(JSON.stringify(metadata, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};