import { auth } from "@/lib/auth";
import { registerSSEClient, unregisterSSEClient } from "@/lib/notifications";
import type { SessionUser } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = (session.user as SessionUser).id;

  const stream = new ReadableStream({
    start(controller) {
      registerSSEClient(userId, controller);

      // Send initial heartbeat
      controller.enqueue(": heartbeat\n\n");
    },
    cancel() {
      unregisterSSEClient(userId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
