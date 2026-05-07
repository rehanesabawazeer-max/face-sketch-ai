import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({ prompt: z.string().min(10).max(2000) });

export const generateSketch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { image: null, error: "AI gateway not configured." };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            { role: "user", content: data.prompt },
          ],
          modalities: ["image", "text"],
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        console.error("AI gateway:", res.status, t);
        if (res.status === 429) return { image: null, error: "Rate limited. Try again in a moment." };
        if (res.status === 402) return { image: null, error: "AI credits exhausted. Add funds in Workspace settings." };
        return { image: null, error: `Generation failed (${res.status})` };
      }

      const json = await res.json();
      const image: string | undefined = json?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!image) return { image: null, error: "No image returned by model." };
      return { image, error: null };
    } catch (e) {
      console.error("generateSketch error", e);
      return { image: null, error: "Network error contacting AI gateway." };
    }
  });
