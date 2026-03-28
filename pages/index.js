import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";

const QUIPS = [
  "Scanning today's biggest claims worldwide…",
  "Cross-referencing with something called 'facts'…",
  "Asking the world's leaders to explain themselves…",
  "Fact-checkers working very hard right now…",
  "Searching for the truth — it's in here somewhere…",
  "Holding power to account, one claim at a time…",
  "Almost done — accuracy incoming…",
];

const TABS = [
  { id:"today",  flag:"🔥", label:"Today's Top Claims",       short:"Today",         who:"AI picks the biggest claims from any world leader today" },
  { id:"us",     flag:"🇺🇸", label:"US & Allies",              short:"US & Allies",   who:"USA, UK, EU, NATO, Australia, Japan, South Korea" },
  { id:"israel", flag:"🇮🇱", label:"Israel",                   short:"Israel",        who:"Netanyahu, IDF, Israeli government ministers" },
  { id:"iran",   flag:"🇮🇷", label:"Iran & Axis",              short:"Iran & Axis",   who:"Iran, Hezbollah, Houthis, Hamas" },
  { id:"russia", flag:"🇷🇺", label:"Russia",                   short:"Russia",        who:"Putin, Kremlin, Russian military" },
  { id:"china",  flag:"🇨🇳", label:"China",                    short:"China",         who:"Xi Jinping, CCP, Beijing officials" },
  { id:"gulf",   flag:"🌍",  label:"Gulf & Middle East",       short:"Gulf",          who:"Saudi Arabia, UAE, Qatar, Jordan, Egypt, Turkey" },
  { id:"un",     flag:"🏛️",  label:"UN & International Bodies",short:"UN & ICC",     who:"United Nations, ICC, ICJ, WHO, IMF, World Bank" },
];

const V = {
  TRUE:       { bg:"#E8F9ED", color:"#1a7a35", label:"✅ True" },
  FALSE:      { bg:"#FFF0EF", color:"#CC0000", label:"❌ False" },
  MIXED:      { bg:"#FFF4E5", color:"#8B4800", label:"🤔 Mixed" },
  UNVERIFIED: { bg:"#F5EEFF", color:"#4B0082", label:"❓ Unverified" },
};

const CONF_LABELS = { 5:"Very High", 4:"High", 3:"Medium", 2:"Low", 1:"Very Low" };
const CONF_COLORS = { 5:"#1a7a35", 4:"#1a7a35", 3:"#8B4800", 2:"#CC0000", 1:"#CC0000" };

const gradeColor = (g) => {
  if (!g) return "#999";
  const l = g[0];
  if (l==="A") return "#1a7a35";
  if (l==="B") return "#2d7a2d";
  if (l==="C") return "#8B4800";
  if (l==="D") return "#CC3300";
  return "#CC0000";
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
  * { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  body { font-family: 'DM Sans', -apple-system, sans-serif; }
  .row { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-bottom:0.5px solid #E8E8E8; cursor:pointer; background:white; text-align:left; width:100%; border-left:none; border-right:none; border-top:none; }
  .row:hover { background:#FAFAFA; }
  .row:active { background:#F5F5F5; }
`;

export default function Home() {
  const [screen,  setScreen]  = useState("home");
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [errMsg,  setErrMsg]  = useState("");
  const [shared,  setShared]  = useState(false);
  const [quipIdx, setQuipIdx] = useState(0);
  const quipTimer = useRef(null);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday:"long", month:"long", day:"numeric", year:"numeric"
  });

  useEffect(() => {
    fetch("/api/factcheck").then(r=>r.json()).then(d=>setHistory(d.history||[])).catch(()=>{});
  }, []);

  useEffect(() => {
    if (screen==="loading") {
      setQuipIdx(0);
      quipTimer.current = setInterval(()=>setQuipIdx(i=>(i+1)%QUIPS.length), 2800);
    } else {
      clearInterval(quipTimer.current);
    }
    return ()=>clearInterval(quipTimer.current);
  }, [screen]);

  async function checkRegion(regionId) {
    setScreen("loading");
    setErrMsg("");
    setShared(false);
    try {
      const res = await fetch("/api/factcheck", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ region: regionId })
      });
      const data = await res.json();
      if (!res.ok||!data.ok) throw new Error(data.error||"Server error");
      if (!data.data?.claims?.length) throw new Error("No claims returned");
      setResults(data);
      fetch("/api/factcheck").then(r=>r.json()).then(d=>setHistory(d.history||[])).catch(()=>{});
      setScreen("results");
    } catch(ex) {
      setErrMsg(ex.message);
      setScreen("error");
    }
  }

  function handleShare() {
    const text = results?.data?.shareText||`📣 Making Accuracy Great Again: ${results?.data?.summary}`;
    const url = "https://maga.news";
    if (navigator.share) { navigator.share({title:"Making Accuracy Great Again", text:`${text}\n\n${url}`, url}); }
    else { navigator.clipboard.writeText(`${text}\n\n${url}`); setShared(true); setTimeout(()=>setShared(false),3000); }
  }

  const lastScore = {};
  history.forEach(h=>{ if(h.region&&!lastScore[h.region]) lastScore[h.region]=h; });

  const claims   = results?.data?.claims||[];
  const cnt      = claims.reduce((a,c)=>{a[c.verdict]=(a[c.verdict]||0)+1;return a;},{TRUE:0,FALSE:0,MIXED:0,UNVERIFIED:0});
  const total    = Math.max(claims.length,1);
  const score    = Math.min(10,Math.max(0,Math.round(+results?.data?.contradictionScore||0)));
  const scoreCol = score<=3?"#1a7a35":score<=6?"#8B4800":"#CC0000";
  const grade    = results?.data?.dailyGrade||"?";
  const gCol     = gradeColor(grade);
  const tab      = TABS.find(t=>t.id===results?.region)||TABS[0];

  // ── LOADING ──
  if (screen==="loading") return (
    <div style={{minHeight:"100vh",background:"white",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,fontFamily:"'DM Sans',sans-serif",padding:40}}>
      <style>{css}</style>
      <Head><title>Making Accuracy Great Again</title></Head>
      <div style={{width:40,height:40,border:"2px solid #E0E0E0",borderTopColor:"#CC0000",borderRadius:"50%",animation:"spin .75s linear infinite"}}/>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#1A1A1A"}}>Sounding the Alarm…</div>
      <div style={{fontSize:14,color:"#666",fontStyle:"italic",textAlign:"center",maxWidth:300,lineHeight:1.6}}>{QUIPS[quipIdx]}</div>
      <div style={{fontSize:12,color:"#999"}}>Searching global news — about 15 seconds</div>
    </div>
  );

  // ── ERROR ──
  if (screen==="error") return (
    <div style={{minHeight:"100vh",background:"white",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'DM Sans',sans-serif",padding:40}}>
      <style>{css}</style>
      <div style={{fontSize:36}}>📣</div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#1A1A1A"}}>Alarm Jammed</div>
      <div style={{fontSize:14,color:"#666",textAlign:"center",maxWidth:300,lineHeight:1.6}}>{errMsg}</div>
      <button onClick={()=>setScreen("home")} style={{background:"#CC0000",color:"white",border:"none",padding:"12px 28px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Try Again</button>
    </div>
  );

  // ── RESULTS ──
  if (screen==="results"&&results) return (
    <div style={{background:"white",minHeight:"100vh",paddingBottom:80,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{css}</style>
      <Head><title>Making Accuracy Great Again — {tab.short}</title></Head>

      {/* Header */}
      <div style={{borderBottom:"3px solid #CC0000",padding:"40px 20px 16px",position:"sticky",top:0,background:"white",zIndex:10}}>
        <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"#CC0000",fontSize:14,fontWeight:600,cursor:"pointer",padding:0,marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>← Back</button>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",marginBottom:4}}>{tab.flag} {tab.short} Report · {dateStr}</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#1A1A1A"}}>Making Accuracy <span style={{color:"#CC0000"}}>Great Again</span></div>
          </div>
          <button onClick={handleShare} style={{background:"#F5F5F5",border:"0.5px solid #E0E0E0",padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer",color:"#1A1A1A",fontFamily:"'DM Sans',sans-serif"}}>
            {shared?"✅ Copied":"🔗 Share"}
          </button>
        </div>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",padding:"0 0 40px"}}>

        {/* Who's covered */}
        <div style={{padding:"12px 20px",background:"#FAFAFA",borderBottom:"0.5px solid #E8E8E8",fontSize:12,color:"#555"}}>
          <strong style={{color:"#1A1A1A"}}>Covering:</strong> {results.regionWho||tab.who}
        </div>

        {/* Verdict banner */}
        <div style={{padding:"24px 20px",borderBottom:"2px solid #1A1A1A"}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Today's Verdict</div>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:20}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:20,color:"#1A1A1A",lineHeight:1.4,marginBottom:8}}>{results.data.summary}</div>
              <div style={{fontSize:13,color:"#666",lineHeight:1.6}}>{results.data.dailyScoreDesc}</div>
            </div>
            <div style={{flexShrink:0,textAlign:"center",borderLeft:"0.5px solid #E8E8E8",paddingLeft:20}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:56,color:gCol,lineHeight:1}}>{grade}</div>
              <div style={{fontSize:11,color:"#999",marginTop:4}}>{results.data.dailyScore}/100</div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:"2px solid #1A1A1A"}}>
          {[
            {n:cnt.TRUE,       l:"True",       col:"#1a7a35"},
            {n:cnt.FALSE,      l:"False",      col:"#CC0000"},
            {n:cnt.MIXED,      l:"Mixed",      col:"#8B4800"},
            {n:cnt.UNVERIFIED, l:"Unverified", col:"#555"},
          ].map((s,i)=>(
            <div key={i} style={{padding:"16px 12px",textAlign:"center",borderRight:i<3?"0.5px solid #E8E8E8":"none"}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:36,color:s.col,lineHeight:1,marginBottom:4}}>{s.n}</div>
              <div style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",color:"#999",fontWeight:600}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Truth-O-Meter bar */}
        <div style={{padding:"16px 20px",borderBottom:"0.5px solid #E8E8E8"}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Truth-O-Meter™</div>
          <div style={{height:8,background:"#F0F0F0",display:"flex",overflow:"hidden"}}>
            {[{col:"#1a7a35",pct:cnt.TRUE/total*100},{col:"#8B4800",pct:cnt.MIXED/total*100},{col:"#CC0000",pct:cnt.FALSE/total*100},{col:"#999",pct:cnt.UNVERIFIED/total*100}]
              .map((s,i)=><div key={i} style={{height:"100%",width:`${s.pct.toFixed(1)}%`,background:s.col}}/>)}
          </div>
        </div>

        {/* Flip-flop */}
        <div style={{padding:"16px 20px",borderBottom:"2px solid #1A1A1A",display:"flex",alignItems:"center",gap:20}}>
          <div style={{flexShrink:0,width:64,height:64,border:`3px solid ${scoreCol}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:scoreCol,lineHeight:1}}>{score}</span>
            <span style={{fontSize:9,color:"#999",fontWeight:600}}>/10</span>
          </div>
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Flip-Flop Index</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:16,color:"#1A1A1A",marginBottom:4}}>{results.data.contradictionHeadline}</div>
            <div style={{fontSize:13,color:"#666",lineHeight:1.5}}>{results.data.contradictionDesc}</div>
          </div>
        </div>

        {/* Claims */}
        <div style={{padding:"16px 20px 0"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:16}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600}}>What They Said</div>
            <div style={{fontSize:11,color:"#CC0000",fontWeight:600}}>{claims.length} claims checked</div>
          </div>
        </div>

        {claims.map((c,i)=>{
          const vs=V[c.verdict]||V.UNVERIFIED;
          const conf=c.confidenceScore||3;
          const confCol=CONF_COLORS[conf]||"#8B4800";
          return (
            <div key={i} style={{borderTop:"0.5px solid #E8E8E8",padding:"20px",animation:`fadeUp .3s ${i*.06}s ease both`}}>

              {/* WHO */}
              <div style={{marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontSize:18}}>{tab.flag}</span>
                  <div style={{fontWeight:600,fontSize:14,color:"#1A1A1A"}}>{c.who||"Unknown official"}</div>
                </div>
                <div style={{fontSize:11,color:"#999",display:"flex",flexWrap:"wrap",gap:12}}>
                  {c.fullDate&&<span>📅 {c.fullDate}</span>}
                  {c.location&&<span>📍 {c.location}</span>}
                  {!c.fullDate&&c.source&&<span>📅 {c.source}</span>}
                </div>
              </div>

              {/* CONTEXT */}
              {c.context&&(
                <div style={{borderLeft:"3px solid #CC0000",paddingLeft:12,marginBottom:12,fontSize:12,color:"#555",lineHeight:1.5,fontStyle:"italic"}}>
                  {c.context}
                </div>
              )}

              {/* QUOTE */}
              <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:18,color:"#1A1A1A",lineHeight:1.5,marginBottom:14,paddingBottom:14,borderBottom:"0.5px solid #E8E8E8"}}>
                "{c.quote}"
              </div>

              {/* VERDICT + CONFIDENCE */}
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <span style={{fontSize:12,fontWeight:600,padding:"4px 12px",background:vs.bg,color:vs.color}}>{vs.label}</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:10,color:"#999"}}>Confidence</span>
                  <div style={{display:"flex",gap:2}}>
                    {[1,2,3,4,5].map(n=>(
                      <div key={n} style={{width:4,height:12,background:n<=conf?confCol:"#E0E0E0"}}/>
                    ))}
                  </div>
                  <span style={{fontSize:10,color:confCol,fontWeight:600}}>{CONF_LABELS[conf]}</span>
                </div>
              </div>

              {/* FACT CHECK */}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>The Real Tea ☕</div>
                <div style={{fontSize:14,color:"#333",lineHeight:1.7}}>{c.explanation}</div>
              </div>

              {/* QUIP */}
              <div style={{borderLeft:"3px solid #E0E0E0",paddingLeft:12,marginBottom:12,display:"flex",gap:8,alignItems:"flex-start"}}>
                <span style={{fontSize:14,flexShrink:0}}>📣</span>
                <span style={{fontSize:13,fontStyle:"italic",color:"#888",lineHeight:1.5}}>{c.quip}</span>
              </div>

              {/* RELATED CLAIMS */}
              {c.relatedClaims&&c.relatedClaims.length>0&&(
                <div style={{background:"#FAFAFA",padding:"12px",marginBottom:12}}>
                  <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Said This Before</div>
                  {c.relatedClaims.map((r,j)=>(
                    <div key={j} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,marginBottom:j<c.relatedClaims.length-1?6:0}}>
                      <span style={{color:"#555",flex:1,marginRight:10}}>{r.claim} — {r.date}</span>
                      <span style={{fontSize:10,fontWeight:600,padding:"2px 8px",background:(V[r.verdict]||V.UNVERIFIED).bg,color:(V[r.verdict]||V.UNVERIFIED).color,flexShrink:0}}>
                        {(V[r.verdict]||V.UNVERIFIED).label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* SOURCE */}
              {c.sourceUrl&&(
                <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:8,borderTop:"0.5px solid #F0F0F0"}}>
                  <span style={{fontSize:12,color:"#999",fontWeight:600,flexShrink:0}}>SOURCE</span>
                  <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#CC0000",textDecoration:"none",fontWeight:500}}>
                    {c.sourceName||c.sourceUrl} →
                  </a>
                </div>
              )}
            </div>
          );
        })}

        {/* Sources */}
        <div style={{padding:"20px",borderTop:"2px solid #1A1A1A",borderBottom:"0.5px solid #E8E8E8"}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600,marginBottom:14}}>Checked Against</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {(results.data.sources||[]).map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:"#F5F5F5",padding:"6px 10px",fontSize:12,color:"#333"}}>
                <span>{s.emoji}</span>
                <span style={{fontWeight:500}}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share */}
        <div style={{padding:"16px 20px"}}>
          <button onClick={handleShare} style={{width:"100%",background:"#CC0000",color:"white",border:"none",padding:"14px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:10}}>
            {shared?"✅ Copied to clipboard!":"🔗 Share This Report"}
          </button>
          <button onClick={()=>setScreen("home")} style={{width:"100%",background:"#F5F5F5",color:"#555",border:"0.5px solid #E0E0E0",padding:"14px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  // ── HOME ──
  return (
    <div style={{background:"white",minHeight:"100vh",paddingBottom:60,fontFamily:"'DM Sans',sans-serif"}}>
      <style>{css}</style>
      <Head>
        <title>Making Accuracy Great Again — Global Fact Check</title>
        <meta name="description" content="Global fact-checking of world leaders. Because someone has to."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>

      {/* MASTHEAD */}
      <div style={{borderBottom:"3px solid #CC0000",padding:"32px 20px 16px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",maxWidth:720,margin:"0 auto"}}>
          <div>
            <div style={{fontSize:9,letterSpacing:4,color:"#999",textTransform:"uppercase",marginBottom:6}}>Global Fact Check</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,color:"#1A1A1A",lineHeight:1.1,letterSpacing:-0.5}}>
              Making Accuracy<br/><span style={{color:"#CC0000"}}>Great Again</span>
            </div>
          </div>
          <div style={{fontSize:36,marginTop:4}}>📣</div>
        </div>
      </div>

      {/* DATE + TAGLINE */}
      <div style={{padding:"8px 20px",borderBottom:"0.5px solid #E8E8E8",display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:720,margin:"0 auto",width:"100%"}}>
        <div style={{fontSize:11,color:"#999"}}>{dateStr}</div>
        <div style={{fontSize:11,color:"#999",fontStyle:"italic",fontFamily:"'DM Serif Display',serif"}}>"Because someone has to."</div>
      </div>

      <div style={{maxWidth:720,margin:"0 auto"}}>

        {/* TODAY HERO */}
        <div onClick={()=>checkRegion("today")} style={{padding:"20px",borderBottom:"2px solid #1A1A1A",cursor:"pointer",background:"white"}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Featured · Tap to fact-check</div>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#1A1A1A",lineHeight:1.2,marginBottom:8}}>🔥 Today's Biggest Claims</div>
              <div style={{fontSize:13,color:"#555",lineHeight:1.6,marginBottom:12}}>AI scans every world leader and picks today's most important checkable claims — ranked by significance.</div>
              <div style={{fontSize:12,color:"#CC0000",fontWeight:600}}>Fact-check now →</div>
            </div>
            {lastScore["today"]&&(
              <div style={{flexShrink:0,borderLeft:"0.5px solid #E8E8E8",paddingLeft:16,textAlign:"center"}}>
                <div style={{fontSize:9,color:"#999",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Yesterday</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:44,color:gradeColor(lastScore["today"].grade||lastScore["today"].dailyGrade),lineHeight:1}}>
                  {lastScore["today"].grade||lastScore["today"].dailyGrade||"?"}
                </div>
                <div style={{fontSize:11,color:"#999"}}>{lastScore["today"].score}/100</div>
              </div>
            )}
          </div>
        </div>

        {/* REGION LABEL */}
        <div style={{padding:"10px 20px",background:"#FAFAFA",borderBottom:"0.5px solid #E8E8E8"}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600}}>Select a region to fact-check</div>
        </div>

        {/* REGION ROWS */}
        {TABS.slice(1).map(t=>{
          const last = lastScore[t.id];
          const g = last?.grade||last?.dailyGrade;
          return (
            <button key={t.id} className="row" onClick={()=>checkRegion(t.id)}>
              <div style={{display:"flex",alignItems:"center",gap:14}}>
                <span style={{fontSize:22,flexShrink:0}}>{t.flag}</span>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:"#1A1A1A",marginBottom:2}}>{t.short}</div>
                  <div style={{fontSize:11,color:"#999"}}>{t.who}</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                {g&&(
                  <div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:gradeColor(g),lineHeight:1}}>{g}</div>
                    <div style={{fontSize:9,color:"#CCC"}}>{last.score}/100</div>
                  </div>
                )}
                {!g&&<div style={{fontSize:11,color:"#CCC"}}>Not checked</div>}
                <div style={{fontSize:16,color:"#CC0000",fontWeight:600}}>→</div>
              </div>
            </button>
          );
        })}

        {/* DIVIDER */}
        <div style={{height:2,background:"#1A1A1A",margin:"0"}}/>

        {/* RECENT SCORES */}
        {history.length>0&&(
          <div style={{padding:"16px 20px",borderBottom:"0.5px solid #E8E8E8"}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:12}}>
              <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600}}>Recent Scores</div>
              <Link href="/history" style={{fontSize:11,color:"#CC0000",fontWeight:600,textDecoration:"none"}}>Full history →</Link>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:3,height:40}}>
              {history.slice(0,12).map((h,i)=>{
                const pct=Math.max(6,h.score||0);
                const col=(h.score||0)>=60?"#1a7a35":(h.score||0)>=40?"#8B4800":"#CC0000";
                const flag=TABS.find(t=>t.id===h.region)?.flag||"🌍";
                return (
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                    <div style={{width:"100%",background:col,height:`${pct}%`}}/>
                    <div style={{fontSize:8,color:"#999",marginTop:3}}>{flag}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SHARE - light grey */}
        <div style={{padding:"14px 20px",background:"#F5F5F5",borderTop:"0.5px solid #E8E8E8",textAlign:"center",cursor:"pointer"}} onClick={()=>{
          const url="https://maga.news";
          if(navigator.share){navigator.share({title:"Making Accuracy Great Again",url});}
          else{navigator.clipboard.writeText(url);}
        }}>
          <div style={{fontSize:12,fontWeight:600,color:"#555"}}>🔗 Share Making Accuracy Great Again</div>
          <div style={{fontSize:10,color:"#999",marginTop:2}}>Because someone has to.</div>
        </div>

      </div>
    </div>
  );
}
