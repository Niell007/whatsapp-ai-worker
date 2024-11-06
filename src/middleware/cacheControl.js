export function setCacheHeaders(response) {
  const headers = new Headers(response.headers);

  // Set cache control headers
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('Surrogate-Control', 'public, max-age=86400');

  return new Response(response.body, {
    status: response.status,
    headers
  });
}
