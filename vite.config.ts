import type { IncomingMessage } from "node:http";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";

interface LocalApiRequest {
  method?: string;
  body: unknown;
}

interface LocalApiResponse {
  status: (code: number) => {
    json: (payload: unknown) => void;
  };
}

type LocalApiHandler = (
  req: LocalApiRequest,
  res: LocalApiResponse,
) => Promise<void> | void;

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

// Dev-only: run /api/* the way Vercel does, so `pnpm dev` reaches the real API.
function localApiPlugin(): Plugin {
  return {
    name: "local-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res) => {
        const body = await readJsonBody(req);
        const reqLike: LocalApiRequest = { method: req.method, body };

        const resLike: LocalApiResponse = {
          status(code) {
            res.statusCode = code;
            return {
              json(payload) {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(payload));
              },
            };
          },
        };

        try {
          const mod = (await server.ssrLoadModule("/api/chat.ts")) as {
            default: LocalApiHandler;
          };
          await mod.default(reqLike, resLike);
        } catch (error) {
          console.error("[local-api] handler error:", error);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Local API handler failed" }));
          }
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Make non-VITE_ vars (e.g. GROQ_API_KEY) from .env/.env.local visible to the
  // API handler running in this Node process. These are NOT sent to the browser.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
  };
});
