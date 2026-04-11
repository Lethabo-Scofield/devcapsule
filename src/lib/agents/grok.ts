const MODEL_NAME = "gemini-2.5-flash";
const MAX_RETRIES = 3;

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is not configured");

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
        }
      );
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === "AbortError") throw new Error("LLM request timed out after 45s");
      throw new Error(`LLM network error: ${err.message}`);
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 429) {
      let retryAfter = 5 * (attempt + 1);
      let isDailyQuota = false;
      try {
        const body = await response.text();
        isDailyQuota = body.includes("PerDay") || body.includes("per_day");
        const match = body.match(/"retryDelay":\s*"(\d+)s"/);
        if (match) retryAfter = Math.min(parseInt(match[1], 10) + 1, 15);
      } catch {}

      if (isDailyQuota) {
        console.error("[LLM] Daily API quota exhausted — retries won't help");
        throw new Error("AI service daily quota exhausted. Please try again tomorrow or upgrade your API plan.");
      }

      console.warn(`[LLM] Rate limited (429), retrying in ${retryAfter}s (attempt ${attempt + 1}/${MAX_RETRIES})`);
      lastError = new Error("AI service rate limited. Please try again in a minute.");

      if (attempt < MAX_RETRIES - 1) {
        await sleep(retryAfter * 1000);
        continue;
      }
      throw lastError;
    }

    if (!response.ok) {
      let errorBody = "";
      try { errorBody = await response.text(); } catch {}
      console.error(`LLM API error ${response.status}:`, errorBody);
      throw new Error(`LLM API returned ${response.status}: ${errorBody.slice(0, 200)}`);
    }

    let result: any;
    try {
      result = await response.json();
    } catch {
      throw new Error("LLM returned non-JSON response");
    }

    const parts = result?.candidates?.[0]?.content?.parts;
    const textPart = parts?.find((p: any) => typeof p.text === "string");

    if (!textPart?.text) {
      console.error("LLM raw response:", JSON.stringify(result, null, 2));
      throw new Error("Model returned no text output");
    }

    return textPart.text;
  }

  throw lastError || new Error("LLM call failed after retries");
}
