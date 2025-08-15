// pages/api/coach.js
import Together from "together-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages = [], plan = {}, profile = {} } = req.body || {};
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "TOGETHER_API_KEY is not set" });
    }

    const together = new Together({ apiKey });

    // System prompt to make it act like your AI coach
    const systemPrompt = `
You are Fusion Fitness, a supportive AI fitness coach.
- Greet users warmly, even if they just say "hello".
- Give fitness/nutrition tips based on their profile and plan.
- Suggest changes only if relevant (training, nutrition, recovery).
- Keep responses short and actionable.

User Profile:
${JSON.stringify(profile)}

Current Plan:
${JSON.stringify(plan)}
`.trim();

    const chatMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text || ""
      }))
    ];

    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3-8b-chat-hf",
      messages: chatMessages,
      temperature: 0.7,
    });

    const text = response?.choices?.[0]?.message?.content || "Hey! How can I help today?";

    return res.status(200).json({
      text,
      patch: {} // optional — if you want the AI to return plan updates later
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error", details: error.message });
  }
}
