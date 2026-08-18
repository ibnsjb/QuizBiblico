const SOURCE = 'https://raw.githubusercontent.com/ibnsjb/QuizBiblico/main/public/seguranca-tech/index.html';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const response = await fetch(SOURCE, { cache: 'no-store' });

    if (!response.ok) {
      return Response.redirect(new URL('/techseg-arena.html', request.url), 302);
    }

    let html = await response.text();

    html = html.replace(
      '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>',
      '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" onerror="this.onerror=null;this.src=\'https://unpkg.com/@supabase/supabase-js@2\'"></script>',
    );

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return Response.redirect(new URL('/techseg-arena.html', request.url), 302);
  }
}
