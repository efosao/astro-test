import { Elysia, t } from "elysia";

const app = new Elysia()
  .get("/api", () => "hi")
  .post("/api", ({ body }) => body, {
    body: t.Object({
      name: t.String()
    })
  });

const handle = ({ request }: { request: Request }) => {
  console.log(`Elysia handling: ${request.url}`);
  return app.handle(request);
};

console.log("Elysia is ready to handle requests");

export const GET = handle;
export const POST = handle;
