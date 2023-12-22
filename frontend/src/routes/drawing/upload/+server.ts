import { put } from "@vercel/blob";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const PUT: RequestHandler = async ({ request, locals }) => {
  const { user } = locals;
  if (!user) throw error(401);

  const blob = await request.clone().blob();

  console.log(`PUT`, { blob });
  const contentHashBuffer = await crypto.subtle.digest(
    "SHA-256",
    await request.clone().arrayBuffer(),
  );
  const contentHash = Array.from(new Uint8Array(contentHashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const pathname = `/${user.id}/${contentHash}.png`;
  console.log(`PUT`, { contentHash, pathname });
  const result = await put(pathname, blob, { access: "public" });

  console.log(`PUT`, { pathname, result });

  if (!result?.url) throw error(400, `failed to upload image`);
  return json(result);
};
