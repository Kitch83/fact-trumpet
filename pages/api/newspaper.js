import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const REGIONS = [
  { id:"us",     flag:"🇺🇸", label:"US & Allies",          who:"USA (Trump, White House, Pentagon), UK, EU, NATO, Australia, Japan, South Korea", search:`Search for the most recent statements and claims from Trump, White House, Pentagon, UK, EU, NATO leaders from the last 48 hours. Find direct quotes.`, factcheck:`Fact-check statements from US and Allied officials. Be non-partisan and rigorous.` },
  { id:"israel", flag:"🇮🇱", label:"Israel",                who:"Netanyahu, IDF, Israeli government", search:`Search for the most recent statements from Israeli officials including Netanyahu, IDF from the last 48 hours.`, factcheck:`Fact-check statements from Israeli officials. Be non-partisan and rigorous.` },
  { id:"iran",   flag:"🇮🇷", label:"Iran & Axis",           who:"Iran, Hezbollah, Houthis, Hamas", search:`Search for the most recent statements from Iranian officials, Hezbollah, Houthis, Hamas from the last 48 hours.`, factcheck:`Fact-check statements from Iran and allied groups. Be non-partisan and rigorous.` },
  { id:"russia", flag:"🇷🇺", label:"Russia",                who:"Putin, Kremlin, Russian military", search:`Search for the most recent statements from Putin, Kremlin and Russian military from the last 48 hours.`, factcheck:`Fact-check statements from Russian officials. Be non-partisan and rigorous.` },
  { id:"china",  flag:"🇨🇳", label:"China",                 who:"Xi Jinping, CCP, Beijing", search:`Search for the most recent statements from Xi Jinping, CCP and Beijing officials from the last 48 hours.`, factcheck:`Fact-check statements from Chinese officials. Be non-partisan and rigorous.` },
  { id:"gulf",   flag:"🌍",  label:"Gulf & Middle East",   who:"Saudi Arabia, UAE, Qatar, Jordan, Egypt, Turkey", search:`Search for the most recent statements from Gulf and Middle East officials from the last 48 hours.`, factcheck:`Fact-check statements from Gulf and Middle East officials. Be non-partisan and rigorous.` },
  { id:"un",     flag:"🏛️",  label:"UN & International",   who:"United Nations, ICC, ICJ, WHO, IMF", search:`Search for the most recent statements from UN, ICC, ICJ, WHO and IMF from the last 48 hours.`, factcheck:`Fact-check statements from international bodies. Be non-partisan and rigorous.` },
];

const NEWSPAPER_KEY = () => `newspaper:${new Date().toISOString().slice(0,10)}`;

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

async function setKV(key, value, exSeconds=90000) {
  try {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;
    if (!url||!token) return;
    await fetch(`${url}/set/${key}/${encodeURIComponent(JSON.stringify(value))}/ex/${exSeconds}`, {
      headers:{ Authorization:`Bearer ${token}` }
    });
  } catch(e) { console.error("KV set error:", e); }
}

async function factcheckRegion(region, dateStr) {
  // Search
  const searchResp = await client.messages.create({
    model:"claude-haiku-4-5", max_tokens:4000,
    tools:[{ type:"web_search_20250305", name:"web_search" }],
    messages:[{ role:"user", content:`Today is ${dateStr}. ${region.search} Return detailed summary with quotes, dates and sources.` }]
  });
  let searchResults = "";
  for (const b of searchResp.content) { if (b.type==="text") searchResults += b.text + "\n"; }
  if (!searchResults.trim()) searchResults = "No results found.";

  // Fact-check
  const fcResp = await client.messages.create({
    model:"claude-haiku-4-5", max_tokens:2000,
    messages:[{ role:"user", content:`${region.factcheck} Today: ${dateStr}.

NEWS:
${searchResults}

Return ONLY raw JSON, no markdown:
{
  "regionGrade": "C+",
  "regionScore": 44,
  "regionSummary": "One punchy sentence about this region's honesty today, max 20 words",
  "claims": [{
    "headline": "Short punchy 10-word headline summarising the claim, like a newspaper",
    "who": "Full name and title",
    "fullDate": "e.g. Saturday, 28 March 2026",
    "location": "Where it was said",
    "context": "One sentence on why they said it",
    "quote": "The actual claim verbatim or close paraphrase",
    "verdict": "FALSE",
    "explanation": "2-3 factual sentences explaining why",
    "quip": "Dry witty aside, max 12 words",
    "confidenceScore": 4,
    "sourceUrl": null,
    "sourceName": "Reuters",
    "relatedClaims": []
  }]
}
verdict = TRUE|FALSE|MIXED|UNVERIFIED
regionScore = 0-100
regionGrade = A/B/C/D/F with optional +/-
confidenceScore = 1-5
Return max 4 claims. Keep headlines punchy like newspaper front page.` }]
  });

  let raw = "";
  for (const b of fcResp.content) { if (b.type==="text") { raw=b.text; break; } }
  raw = raw.replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/i,"").trim();
  const si=raw.indexOf("{"), ei=raw.lastIndexOf("}");
  if (si<0||ei<0) throw new Error("No JSON");
  return JSON.parse(raw.slice(si,ei+1));
}

export default async function handler(req, res) {
  const { force } = req.query;
  const dateStr = new Date().toLocaleDateString("en-US",{ weekday:"long", month:"long", day:"numeric", year:"numeric" });

  // GET — return cached newspaper
  if (req.method==="GET") {
    const cached = await getKV(NEWSPAPER_KEY());
    if (cached && !force) {
      return res.status(200).json({ ok:true, data:cached, cached:true });
    }
    // Not cached yet
    return res.status(200).json({ ok:true, data:null, cached:false });
  }

  // POST — build the newspaper
  if (req.method!=="POST") return res.status(405).json({ error:"Method not allowed" });

  // Check cache again
  const existing = await getKV(NEWSPAPER_KEY());
  if (existing && !force) {
    return res.status(200).json({ ok:true, data:existing, cached:true });
  }

  try {
    const results = [];
    for (const region of REGIONS) {
      try {
        const data = await factcheckRegion(region, dateStr);
        results.push({ id:region.id, flag:region.flag, label:region.label, who:region.who, ...data });
      } catch(e) {
        console.error(`Failed region ${region.id}:`, e.message);
        results.push({ id:region.id, flag:region.flag, label:region.label, who:region.who, regionGrade:"?", regionScore:0, regionSummary:"Could not retrieve data for this region today.", claims:[] });
      }
      // Wait 15 seconds between each region to avoid rate limits
      if (region !== REGIONS[REGIONS.length - 1]) {
        await new Promise(r => setTimeout(r, 15000));
      }
    }

    // Global score
    const scored = results.filter(r=>r.regionScore>0);
    const globalScore = scored.length ? Math.round(scored.reduce((a,r)=>a+r.regionScore,0)/scored.length) : 0;
    const globalGrade = globalScore>=90?"A+":globalScore>=80?"A":globalScore>=70?"B+":globalScore>=60?"B":globalScore>=50?"C+":globalScore>=40?"C":globalScore>=30?"D+":globalScore>=20?"D":"F";

    // Top claim — most notable false claim across all regions
    let topClaim = null;
    let topRegion = null;
    for (const r of results) {
      const falseClaims = (r.claims||[]).filter(c=>c.verdict==="FALSE");
      if (falseClaims.length>0 && (!topClaim || (r.regionScore < (topRegion?.regionScore||100)))) {
        topClaim = falseClaims[0];
        topRegion = r;
      }
    }

    const newspaper = { date:dateStr, globalScore, globalGrade, topClaim, topRegion, regions:results };

    // Cache for 25 hours
    await setKV(NEWSPAPER_KEY(), newspaper, 90000);

    // Save to history
    try {
      const url = process.env.KV_REST_API_URL;
      const token = process.env.KV_REST_API_TOKEN;
      if (url&&token) {
        const today = new Date().toISOString().slice(0,10);
        const payload = encodeURIComponent(JSON.stringify({ score:globalScore, grade:globalGrade, summary:`Global daily check — ${globalScore}/100`, date:today, region:"today" }));
        await fetch(`${url}/lpush/score_history/${payload}`, { headers:{ Authorization:`Bearer ${token}` } });
        await fetch(`${url}/ltrim/score_history/0/89`, { headers:{ Authorization:`Bearer ${token}` } });
      }
    } catch(e) {}

    return res.status(200).json({ ok:true, data:newspaper, cached:false });
  } catch(err) {
    console.error("Newspaper build error:", err);
    return res.status(500).json({ ok:false, error:err.message });
  }
}

export const config = { api: { responseLimit:"8mb", bodyParser:{ sizeLimit:"4mb" } }, maxDuration: 300 };
