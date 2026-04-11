const MODEL_NAME = "gemini-2.5-flash";

export async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY is not configured");

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
    if (err.name === "AbortError") throw new Error("LLM request timed out after 45s");
    throw new Error(`LLM network error: ${err.message}`);
  } finally {
    clearTimeout(timeout);
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
