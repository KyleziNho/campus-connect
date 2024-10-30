// app/product/[id]/route.js
export async function GET(request, { params }) {
    return new Response(JSON.stringify({ id: params.id }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }