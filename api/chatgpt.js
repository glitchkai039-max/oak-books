// Minimal serverless endpoint for ChatGPT calls.
// Expected deployment: Vercel/Netlify-style function runtime.
// Requires env var: OPENAI_API_KEY

const ALLOWED_MODELS = new Set(["gpt-4.1-mini", "gpt-4o-mini"]);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "text/plain");
    res.end("Method Not Allowed");
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("OPENAI_API_KEY is not configured.");
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }

  const prompt = (body && body.prompt ? String(body.prompt) : "").trim();
  const model = (body && body.model ? String(body.model) : "gpt-4.1-mini").trim();

  if (!prompt) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain");
    res.end("Prompt is required.");
    return;
  }

  if (!ALLOWED_MODELS.has(model)) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "text/plain");
    res.end("Unsupported model.");
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model,
        input: prompt
      })
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data && data.error && data.error.message ? data.error.message : "OpenAI request failed.";
      res.statusCode = response.status;
      res.setHeader("Content-Type", "text/plain");
      res.end(message);
      return;
    }

    const output = typeof data.output_text === "string" ? data.output_text : "";
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ output }));
  } catch {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("ChatGPT endpoint error.");
  }
};
