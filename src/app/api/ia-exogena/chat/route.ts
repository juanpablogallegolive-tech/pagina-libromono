import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { streamChat, PROMPT_EXOGENA, ChatMsg } from '@/lib/llm';

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  if (!s?.user) return new Response('No autorizado', { status: 401 });
  const { messages } = (await req.json()) as { messages: ChatMsg[] };
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const trozo of streamChat(messages ?? [], PROMPT_EXOGENA)) {
          controller.enqueue(encoder.encode(trozo));
        }
      } catch {
        controller.enqueue(encoder.encode('⚠️ Error inesperado del asistente.'));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
}
