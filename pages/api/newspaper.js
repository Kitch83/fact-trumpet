import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const NEWSPAPER_KEY = () => `daily_reckoning:${new Date().toISOString().slice(0,10)}`;

async function getKV(key) {
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url||!token) return null;
    const r = await fetch(`${url}/get/${key}`, { headers:{ Authorization:`Bearer ${token}` } });
    const d = await r.json();
    if (!d.result) return null;
    return JSON.parse(decodeURIComponent(d.result));
  } catch(e) { return null; }
}

async function setKV(key, value, ex=90000) {
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url||!token) return;
    await fetch(`${url}/set/${key}/${encodeURIComponent(JSON.stringify(value))}/ex/${ex}`, {
      headers:{ Authorization:`Bearer ${token}` }
    });
  } catch(e) {}
}

export default async function handler(req, res) {
  const { force } = req.query;
  const dateStr = new Date().toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric", year:"numeric" });

  if (req.method==="GET") {
    const cached = await getKV(NEWSPAPER_KEY());
    if (cached && !force) return res.status(200).json({ ok:true, data:cached, cached:true });
    return res.status(200).json({ ok:true, data:null, cached:false });
  }

  if (req.method!=="POST") return res.status(405).json({ error:"Method not allowed" });

  const existing = await getKV(NEWSPAPER_KEY());
  if (existing && !force) return res.status(200).json({ ok:true, data:existing, cached:true });

  try {
    // Step 1: Search for today's US news
    const searchResp = await client.messages.create({
      model:"claude-haiku-4-5", max_tokens:4000,
      tools:[{ type:"web_search_20250305", name:"web_search" }],
      messages:[{ role:"user", content:`Today is ${dateStr}. Search for the most recent statements and claims made by US officials in the last 48 hours. Focus on:
1. Donald Trump speeches, rallies, Truth Social posts, press conferences
2. White House briefings and statements
3. Pentagon and State Department claims
4. Senior Republican and Democratic officials
5. Any major policy claims or factual assertions

Find at least 5-6 specific direct quotes with dates and sources. Return detailed summary.` }]
    });

    let searchResults = "";
    for (const b of searchResp.content) { if (b.type==="text") searchResults += b.text+"\n"; }
    if (!searchResults.trim()) searchResults = "No results found — use recent knowledge.";

    // Step 2: Fact-check and build newspaper content
    const fcResp = await client.messages.create({
      model:"claude-haiku-4-5", max_tokens:3000,
      messages:[{ role:"user", content:`You are the editor of "The Daily Reckoning" — a witty, dry, non-partisan fact-checking newspaper. Today: ${dateStr}.

Using the news below, write today's edition. Be fair, accurate, and funny without being partisan.

NEWS:
${searchResults}

Return ONLY raw JSON, no markdown, no backticks:
{
  "editionDate": "${dateStr}",
  "overallGrade": "C+",
  "overallScore": 44,
  "overallQuip": "One dry witty sentence about today's honesty level, max 20 words",
  "leadStory": {
    "headline": "Dramatic newspaper headline, 8-12 words, no dashes",
    "deck": "Two sentence summary of the claim and why it matters",
    "who": "Full name and title",
    "fullDate": "Full date e.g. Saturday, 28 March 2026",
    "location": "Where it was said",
    "context": "One sentence on why they said it",
    "quote": "The exact or close paraphrase of the claim",
    "bodyText": "Two paragraph newspaper article explaining the facts. Write in proper journalistic style. No dashes. Use commas and short sentences instead.",
    "verdict": "FALSE",
    "explanation": "2-3 factual sentences debunking the claim",
    "quip": "Dry witty aside max 12 words",
    "confidenceScore": 4,
    "sourceUrl": null,
    "sourceName": "Reuters"
  },
  "sidebarStory": {
    "headline": "Second most important headline, 8-10 words, no dashes",
    "who": "Name and title",
    "quote": "The claim",
    "verdict": "FALSE",
    "explanation": "1-2 sentences",
    "quip": "Dry aside max 10 words"
  },
  "columns": [
    {
      "headline": "Column headline, 6-8 words, no dashes",
      "who": "Name and title",
      "quote": "Short version of the claim",
      "bodyText": "Two sentences of context and fact-check",
      "verdict": "FALSE",
      "quip": "Dry aside max 10 words"
    }
  ]
}

overallGrade = A/B/C/D/F with optional +/-
overallScore = 0-100
verdict = TRUE, FALSE, MIXED, or UNVERIFIED
confidenceScore = 1-5
columns = array of exactly 3 items covering 3 different claims
No dashes anywhere in the text. Use short sentences instead.` }]
    });

    let raw = "";
    for (const b of fcResp.content) { if (b.type==="text") { raw=b.text; break; } }
    raw = raw.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"").trim();
    const si=raw.indexOf("{"), ei=raw.lastIndexOf("}");
    if (si<0||ei<0) throw new Error("No JSON returned");
    const parsed = JSON.parse(raw.slice(si,ei+1));
    if (!parsed.leadStory) throw new Error("No lead story");

    // Save to cache and history
    await setKV(NEWSPAPER_KEY(), parsed, 90000);

    try {
      const url = process.env.KV_REST_API_URL;
      const token = process.env.KV_REST_API_TOKEN;
      if (url&&token) {
        const today = new Date().toISOString().slice(0,10);
        const payload = encodeURIComponent(JSON.stringify({
          score:parsed.overallScore, grade:parsed.overallGrade,
          summary:parsed.overallQuip, date:today, region:"us"
        }));
        await fetch(`${url}/lpush/score_history/${payload}`, { headers:{ Authorization:`Bearer ${token}` } });
        await fetch(`${url}/ltrim/score_history/0/89`, { headers:{ Authorization:`Bearer ${token}` } });
      }
    } catch(e) {}

    return res.status(200).json({ ok:true, data:parsed, cached:false });
  } catch(err) {
    console.error("Newspaper error:", err);
    return res.status(500).json({ ok:false, error:err.message });
  }
}

export const config = { api:{ responseLimit:"8mb" }, maxDuration:120 };
