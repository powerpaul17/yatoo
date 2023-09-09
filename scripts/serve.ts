import path from 'path';

Bun.serve({
  fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      return new Response(Bun.file('./index.html'));
    } else {
      return new Response(Bun.file(path.join('.', url.pathname)));
    }
  }
});
