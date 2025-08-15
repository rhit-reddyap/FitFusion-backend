// /api/coach.js  (Vercel / Next.js API route)
// If you use Next.js App Router, convert to route handler syntax; logic is identical.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages = [], plan = {}, profile = {} } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "OPENAI_API_KEY not set" });

    // Build a compact conversation for the model
    // Your UI already persists `messages` as [{role: "user"|"assistant", text, at,...}]
    // Convert to OpenAI messages: [{role, content}]
    const chat = messages.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.text || ""
    }));

    // System prompt: keep it brief but targeted
    const system = `
You are Fusion Fitness, a friendly AI coach.
- Respond conversationally to anything (greetings, jokes, small talk).
- When relevant, propose gentle plan updates (calories/macros/training/deload/sleep_target_h).
- Keep answers concise and actionable.
- NEVER guess user data—only use what is sent in profile/plan/messages.
- If you propose plan changes, include them in the JSON "patch".

Current profile (JSON):
${JSON.stringify(profile)}

Current plan (JSON):
${JSON.stringify(plan)}
`.trim();

    // We want a strict JSON envelope back: { text, patch? }
    // Use Responses API structured output (json_schema) so we always get valid JSON.
    const responseSchema = {
      name: "CoachReply",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          text: { type: "string", description: "Natural language coach reply for the chat UI." },
          patch: {
            type: "object",
            description: "Optional plan updates for the client to merge.",
            additionalProperties: false,
            properties: {
              calories: { type: "number" },
              sleep_target_h: { type: "number" },
              macros: {
                type: "object",
                additionalProperties: false,
                properties: {
                  protein: { type: "number" },
                  carbs:   { type: "number" },
                  fat:     { type: "number" }
                }
              },
              training: {
                type: "object",
                additionalProperties: false,
                properties: {
                  daysPerWeek: { type: "number" },
                  focus: { type: "string" },
                  deload: { type: "boolean" },
                  template: {
                    type: "array",
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        day: { type: "string" },
                        blocks: { type: "array", items: { type: "string" } }
                      },
                      required: ["day", "blocks"]
                    }
                  }
                }
              }
            }
          }
        },
        required: ["text"]
      }
    };

    const payload = {
      model: "gpt-4.1-mini",        // solid, fast general model; swap if you prefer
      input: [
        { role: "system", content: system },
        ...chat
      ],
      response_format: { type: "json_schema", json_schema: responseSchema }
    };

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const errTxt = await r.text().catch(() => "");
      return res.status(r.status).json({ error: `OpenAI error ${r.status}`, detail: errTxt.slice(0, 500) });
    }

    const data = await r.json();

    // The Responses API returns the structured output in data.output[0].content[0].text for text mode,
    // but for JSON schema it provides parsed content under data.output[0].content[0].json usually.
    // Normalize defensively:
    let parsed = null;
    try {
      const c = data?.output?.[0]?.content?.[0];
      if (c?.type === "output_text" && c?.text) {
        // Fallback: not using schema
        parsed = JSON.parse(c.text);
      } else if (c?.type === "output_json" && c?.json) {
        parsed = c.json;
      }
    } catch (e) {
      // last resort: try whole body text field (older libs)
      parsed = null;
    }

    if (!parsed || typeof parsed.text !== "string") {
      // fail safe: just return a minimal reply
      return res.status(200).json({ text: "Hey! I’m here — how can I help with your training or nutrition today?", patch: {} });
    }

    // match AIPlans.jsx expectation: "patch" is the plan delta we should merge client-side
    const patch = parsed.patch && typeof parsed.patch === "object" ? parsed.patch : {};

    return res.status(200).json({ text: parsed.text, patch });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
