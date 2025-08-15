// /api/coach.js  (Vercel serverless or similar)
export default async function handler(req, res) {
  try {
    const { messages, plan, profile } = await parseJSON(req);
    // IMPORTANT: Never expose your API key client-side. Put it in env var on the server.
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        role: "assistant",
        text: "Local rules applied. (Server model disabled.)",
        patch: {}, // no-op; client-side rules will run
      });
    }

    // Build a compact system prompt to force JSON patch
    const sys = [
      "You are FitFusion AI Coach.",
      "Given user's recent message, current plan, and profile, return:",
      "1) concise coaching response (2-6 sentences).",
      "2) a JSON 'patch' that only mutates fields that should change.",
      "Patch format example: { calories: 2500, macros: { protein: 180 }, training: { daysPerWeek: 4, focus: 'hypertrophy', deload: true } }",
      "Safety: do not give medical advice; recommend seeing a clinician for injuries/medical issues.",
    ].join(" ");

    // Minimal formatting for the conversation
    const convo = messages.map(m => ({
      role: m.role,
      content: m.text
    }));

    const payload = {
      model: "gpt-4o-mini", // or any capable JSON-friendly model you use
      messages: [
        { role: "system", content: sys },
        { role: "user", content: [
          "User profile JSON:",
          JSON.stringify(profile || {}),
          "Current plan JSON:",
          JSON.stringify(plan || {}),
          "Conversation (last 8 turns):",
          JSON.stringify(convo.slice(-8))
        ].join("\n") }
      ],
      temperature: 0.4
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await r.json();

    const text = data?.choices?.[0]?.message?.content || "Coach update.";
    // Expect the model to place a JSON block after a delimiter or in code fence.
    const patch = extractJSON(text) || {};

    return res.status(200).json({
      role: "assistant",
      text: stripJSON(text),
      patch
    });
  } catch (e) {
    console.error(e);
    return res.status(200).json({
      role: "assistant",
      text: "Local rules applied (server error).",
      patch: {}
    });
  }
}

function extractJSON(s) {
  // Simple greedy JSON block finder
  const m = s.match(/\{[\s\S]*\}$/m) || s.match(/\{[\s\S]*\}/m);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}
function stripJSON(s) {
  // Remove trailing JSON blocks if present
  return s.replace(/```json[\s\S]*?```/g, "").replace(/\{[\s\S]*\}$/m, "").trim();
}
async function parseJSON(req) {
  if (req.method !== "POST") throw new Error("POST only");
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  return body || {};
}
