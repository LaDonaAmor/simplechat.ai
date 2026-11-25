import type { IncomingMessage } from "node:http";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

interface LocalApiRequest {
  method?: string;
  body: unknown;
  on?: (event: "close", listener: () => void) => void;
}

interface LocalApiResponse {
  status: (code: number) => { json: (payload: unknown) => void };
  setHeader: (name: string, value: string) => void;
  write: (chunk: string) => unknown;
  end: () => void;
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

function localApiPlugin(): Plugin {
  return {
    name: "local-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/api/chat", async (req, res) => {
        const body = await readJsonBody(req);

        const reqLike: LocalApiRequest = {
          method: req.method,
          body,
          on: (event, listener) => {
            req.on(event, listener);
          },
        };

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
          setHeader(name, value) {
            res.setHeader(name, value);
          },
          write(chunk) {
            return res.write(chunk);
          },
          end() {
            res.end();
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
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      localApiPlugin(),
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: "auto",
        includeAssets: [
          "favicon_io/favicon.ico",
          "favicon_io/apple-touch-icon.png",
          "logo.png",
        ],
        manifest: {
          id: "/",
          name: "SimpleChat",
          short_name: "SimpleChat",
          description:
            "A small, focused AI chat app. Conversations stay on your device.",
          lang: "en",
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait-primary",
          background_color: "#fdfdfd",
          theme_color: "#016030",
          categories: ["productivity", "utilities"],
          icons: [
            {
              src: "/favicon_io/android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/favicon_io/android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/favicon_io/android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,woff2,ico}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api\//],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.fontshare\.com\/.*/i,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "fontshare",
                expiration: {
                  maxEntries: 24,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },
          ],
        },
        devOptions: { enabled: true, type: "module" },
      }),
    ],
  };
});
