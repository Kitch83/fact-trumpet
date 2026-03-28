import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const REGIONS = {
  today: {
    label: "Today's Top",
    search: `Search for the most important and newsworthy claims made by ANY world leader or government official today. Include USA, Russia, China, Iran, Israel, Gulf states, UN officials. Find the biggest lies or misleading statements making headlines right now.`,
    factcheck: `You are fact-checking the world's biggest claims from today across ALL nations and leaders. Be equal and non-partisan — fact-check everyone the same way.`
  },
  us: {
    label: "US & Allies",
    who: "USA (Trump, White House, Pentagon, State Department), UK, EU leaders, NATO officials, Australia, Japan, South Korea",
    search: `Search for the most recent statements and claims from US officials (Trump, White House, Pentagon), UK, EU, NATO, Australia, Japan, South Korea from the last 7 days.`,
    factcheck: `You are fact-checking statements from US and Allied officials including Trump, White House, Pentagon, UK, EU, NATO leaders. Be non-partisan and equally rigorous.`
  },
  israel: {
    label: "Israel",
    who: "Netanyahu, Israeli government ministers, IDF spokespeople, Israeli state officials",
    search: `Search for the most recent statements and claims from Israeli officials including Netanyahu, IDF, Israeli government from the last 7 days.`,
    factcheck: `You are fact-checking statements from Israeli officials including Netanyahu, IDF and Israeli government. Be non-partisan and equally rigorous.`
  },
  iran: {
    label: "Iran & Axis",
    who: "Iran (Khamenei, IRGC, Iranian government), Hezbollah, Houthis, Hamas",
    search: `Search for the most recent statements and claims from Iranian officials (Khamenei, IRGC), Hezbollah, Houthis, Hamas from the last 7 days.`,
    factcheck: `You are fact-checking statements from Iran, Hezbollah, Houthis and Hamas. Be non-partisan and equally rigorous.`
  },
  russia: {
    label: "Russia",
    who: "Putin, Kremlin officials, Russian military, Russian state media spokespeople",
    search: `Search for the most recent statements and claims from Russian officials including Putin, Kremlin, Russian military from the last 7 days.`,
    factcheck: `You are fact-checking statements from Russian officials including Putin and the Kremlin. Be non-partisan and equally rigorous.`
  },
  china: {
    label: "China",
    who: "Xi Jinping, CCP officials, Beijing government, Chinese state media",
    search: `Search for the most recent statements and claims from Chinese officials including Xi Jinping, CCP, Beijing from the last 7 days.`,
    factcheck: `You are fact-checking statements from Chinese officials including Xi Jinping and the CCP. Be non-partisan and equally rigorous.`
  },
  gulf: {
    label: "Gulf & Middle East",
    who: "Saudi Arabia, UAE, Qatar, Jordan, Egypt, Turkey, other Middle East nations",
    search: `Search for the most recent statements and claims from Gulf and Middle East officials including Saudi Arabia, UAE, Qatar, Jordan, Egypt, Turkey from the last 7 days.`,
    factcheck: `You are fact-checking statements from Gulf and Middle East officials. Be non-partisan and equally rigorous.`
  },
  un: {
    label: "UN & ICC",
    who: "United Nations, ICC (International Criminal Court), ICJ (International Court of Justice), WHO, IMF, World Bank",
    search: `Search for the most recent statements and claims from international bodies including UN, ICC, ICJ, WHO, IMF from the last 7 days.`,
    factcheck: `You are fact-checking statements from international bodies including the UN, ICC and ICJ. Be non-partisan and equally rigorous.`
  }
};

async function saveScore(dateKey, region, score, grade, summary) {
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url || !token) return;
    const payload = JSON.stringify({ score, grade, summary, date: dateKey, region });
    await fetch(`${url}/set/score:${region}:${dateKey}/${encodeURIComponent(payload)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetch(`${url}/lpush/score_history/${encodeURIComponent(payload)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetch(`${url}/ltrim/score_history/0/89`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch(e) { console.error("Failed to save score:", e); }
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const url = process.env.KV_REST_API_URL;
      const token = process.env.KV_REST_API_TOKEN;
      if (!url || !token) return res.status(200).json({ ok: true, history: [] });
      const r = await fetch(`${url}/lrange/score_history/0/89`, {
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

  const { region = "today" } = req.body || {};
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  const dateKey = now.toISOString().slice(0,10);
  const R = REGIONS[region] || REGIONS.today;

  try {
    // Step 1: Web search
    const searchResponse = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `Today is ${dateStr}. ${R.search} Find direct quotes and specific factual claims. Return a detailed summary with real dates and sources.`
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
        content: `${R.factcheck} Today: ${dateStr}.

Fact-check 5-6 of the most interesting and checkable claims from the news below. Label each with its real actual date and who said it.

NEWS AND STATEMENTS:
${searchResults}

Return ONLY raw JSON — no markdown, no backticks:
{
  "summary": "Punchy sarcastic one-liner max 25 words, funny but fair",
  "dailyScore": 42,
  "dailyGrade": "C+",
  "dailyScoreDesc": "One sentence explaining the score with dry humor",
  "contradictionScore": 6,
  "contradictionHeadline": "Witty 5-7 word headline on consistency",
  "contradictionDesc": "1-2 sentences on contradictions found, dry humor",
  "shareText": "Punchy 1-2 sentence summary for social media with emoji",
  "sources": [{"emoji":"📰","name":"Source name","desc":"e.g. CNN, Truth Social, State TV"}],
  "claims": [{
    "quote": "Exact or close paraphrase of the claim",
    "who": "Full name and title e.g. Donald Trump, President of the United States",
    "fullDate": "Full date e.g. Wednesday, 26 March 2026",
    "location": "Where it was said e.g. White House Press Briefing, Washington D.C.",
    "context": "1 sentence explaining why they made this claim and what prompted it",
    "source": "Event type · Full date",
    "sourceUrl": "Direct URL to the news article or official source if available, else null",
    "sourceName": "Name of the source e.g. Reuters, BBC News, Truth Social",
    "verdict": "TRUE",
    "explanation": "2-3 accurate factual sentences, no partisan spin",
    "quip": "Dry aside, max 12 words",
    "confidenceScore": 4,
    "relatedClaims": [
      {"claim": "Brief description of a similar previous claim", "date": "Month Year", "verdict": "FALSE"}
    ]
  }]
}
verdict = TRUE | FALSE | MIXED | UNVERIFIED
contradictionScore = integer 0-10
dailyScore = integer 0-100 (100 = perfectly honest)
dailyGrade = letter grade A/B/C/D/F with optional +/-
confidenceScore = integer 1-5 (5=very high confidence, 1=very low)
relatedClaims = array of up to 2 similar past claims by the same person, or empty array if none known`
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

    await saveScore(dateKey, region, parsed.dailyScore, parsed.dailyGrade, parsed.summary);

    return res.status(200).json({ ok: true, data: parsed, region, regionLabel: R.label, regionWho: R.who });
  } catch (err) {
    console.error("MAGA News API error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

export const config = { api: { responseLimit: "8mb" } };
