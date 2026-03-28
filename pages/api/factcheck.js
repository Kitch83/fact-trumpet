import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function saveScore(dateKey, score, grade, summary) {
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return;
    // Save today's score
    await fetch(`${url}/set/score:${dateKey}/${encodeURIComponent(JSON.stringify({ score, grade, summary, date: dateKey }))}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Add to history list (keep last 30 days)
    await fetch(`${url}/lpush/score_history/${encodeURIComponent(JSON.stringify({ score, grade, summary, date: dateKey }))}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetch(`${url}/ltrim/score_history/0/29`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch(e) {
    console.error("Failed to save score:", e);
  }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Return history for chart
    try {
      const url = process.env.KV_REST_API_URL;
      const token = process.env.KV_REST_API_TOKEN;
      if (!url || !token) return res.status(200).json({ ok: true, history: [] });
      const r = await fetch(`${url}/lrange/score_history/0/29`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json();
      const history = (data.result || []).map(item => {
        try { return JSON.parse(decodeURIComponent(item)); } catch(e) { return null; }
      }).filter(Boolean).reverse();
      return res.status(200).json({ ok: true, history });
    } catch(e) {
      return res.status(200).json({ ok: true, history: [] });
    }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  const dateKey = now.toISOString().slice(0,10);

  try {
    // Step 1: Live web search
    const searchResponse = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Today is ${dateStr}. Search for the most recent Donald Trump statements from the last 7 days. Prioritise:
1. Today's speeches, rallies, public addresses
2. Today's press conferences or White House briefings
3. Today's Truth Social posts
4. Today's TV interviews
5. Most recent from this week if nothing today
Find direct quotes and specific factual claims. Return a detailed summary with real dates.`
      }]
    });

    let searchResults = "";
    for (const block of searchResponse.content) {
      if (block.type === "text") searchResults += block.text + "\n";
    }
    if (!searchResults.trim()) searchResults = "No search results — use most recent knowledge.";

    // Step 2: Fact-check
    const factCheckResponse = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2500,
      messages: [{
        role: "user",
        content: `You are The Fact Trumpet — witty, dry, non-partisan fact-checker. Today: ${dateStr}.
Fact-check 5-6 of Trump's most interesting claims from the news below. Label each with its real date.

NEWS AND STATEMENTS:
${searchResults}

Return ONLY raw JSON — no markdown, no backticks:
{
  "summary": "Punchy sarcastic one-liner, max 25 words, funny but fair",
  "dailyScore": 42,
  "dailyGrade": "C+",
  "dailyScoreDesc": "One sentence explaining the score with dry humor",
  "contradictionScore": 6,
  "contradictionHeadline": "Witty 5-7 word headline on consistency",
  "contradictionDesc": "1-2 sentences on contradictions found, dry humor",
  "shareText": "Punchy 1-2 sentence summary for social media with emoji",
  "sources": [{"emoji":"📰","name":"Source name","desc":"e.g. CNN, Truth Social"}],
  "claims": [{
    "quote": "Exact or close paraphrase of the claim",
    "source": "Event type · Actual date",
    "verdict": "TRUE",
    "explanation": "2-3 accurate factual sentences, no partisan spin",
    "quip": "Dry aside, max 12 words"
  }]
}
verdict = TRUE | FALSE | MIXED | UNVERIFIED
contradictionScore = integer 0-10
dailyScore = integer 0-100 (100 = perfectly honest)
dailyGrade = letter grade A/B/C/D/F with optional +/-`
      }]
    });

    let raw = "";
    for (const block of factCheckResponse.content) {
      if (block.type === "text") { raw = block.text; break; }
    }
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const si = raw.indexOf("{"), ei = raw.lastIndexOf("}");
    if (si < 0 || ei < 0) throw new Error("No JSON in response");
    const parsed = JSON.parse(raw.slice(si, ei + 1));
    if (!parsed.claims?.length) throw new Error("No claims returned");

    // Save to database
    await saveScore(dateKey, parsed.dailyScore, parsed.dailyGrade, parsed.summary);

    return res.status(200).json({ ok: true, data: parsed });
  } catch (err) {
    console.error("Fact Trumpet API error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export const config = { api: { responseLimit: "8mb" } };
