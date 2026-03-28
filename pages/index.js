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
  { id:"today",  flag:"🔥", label:"Today's Top Claims",        short:"Today",        who:"AI picks the biggest claims from any world leader today" },
  { id:"us",     flag:"🇺🇸", label:"US & Allies",               short:"US & Allies",  who:"USA, UK, EU, NATO, Australia, Japan, South Korea" },
  { id:"israel", flag:"🇮🇱", label:"Israel",                    short:"Israel",       who:"Netanyahu, IDF, Israeli government ministers" },
  { id:"iran",   flag:"🇮🇷", label:"Iran & Axis",               short:"Iran & Axis",  who:"Iran, Hezbollah, Houthis, Hamas" },
  { id:"russia", flag:"🇷🇺", label:"Russia",                    short:"Russia",       who:"Putin, Kremlin, Russian military" },
  { id:"china",  flag:"🇨🇳", label:"China",                     short:"China",        who:"Xi Jinping, CCP, Beijing officials" },
  { id:"gulf",   flag:"🌍",  label:"Gulf & Middle East",        short:"Gulf",         who:"Saudi Arabia, UAE, Qatar, Jordan, Egypt, Turkey" },
  { id:"un",     flag:"🏛️",  label:"UN & International Bodies", short:"UN & ICC",    who:"United Nations, ICC, ICJ, WHO, IMF, World Bank" },
];

const V = {
  TRUE:       { bg:"#E8F9ED", color:"#1a7a35", label:"✅ True" },
  FALSE:      { bg:"#FFF0EF", color:"#CC0000", label:"❌ False" },
  MIXED:      { bg:"#FFF4E5", color:"#8B4800", label:"🤔 Mixed" },
  UNVERIFIED: { bg:"#F5F5F5", color:"#555",    label:"❓ Unverified" },
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

const WorldMap = () => (
  <svg style={{position:"absolute",top:60,left:-20,width:520,height:360,opacity:0.055,zIndex:0,pointerEvents:"none"}} viewBox="0 0 1000 500">
    <path d="M120,60 L180,40 L220,50 L250,80 L260,120 L240,160 L220,200 L200,220 L180,240 L160,260 L140,280 L120,260 L100,240 L90,200 L95,160 L100,120 L110,90 Z" fill="#1A1A1A"/>
    <path d="M200,280 L240,270 L270,290 L280,330 L275,380 L260,420 L240,440 L220,430 L200,400 L190,360 L185,320 L190,290 Z" fill="#1A1A1A"/>
    <path d="M440,60 L480,50 L510,60 L520,80 L510,100 L490,110 L470,120 L450,110 L440,90 Z" fill="#1A1A1A"/>
    <path d="M450,130 L490,120 L520,130 L540,160 L550,200 L545,250 L530,300 L510,330 L490,340 L470,330 L450,300 L440,260 L435,210 L440,170 Z" fill="#1A1A1A"/>
    <path d="M530,40 L620,30 L720,40 L800,60 L840,80 L860,110 L850,140 L820,160 L780,170 L740,160 L700,150 L660,160 L630,150 L600,130 L570,110 L540,90 L525,70 Z" fill="#1A1A1A"/>
    <path d="M760,300 L820,290 L860,300 L880,330 L875,370 L850,390 L810,395 L775,380 L755,350 L750,320 Z" fill="#1A1A1A"/>
    <path d="M260,20 L310,15 L330,30 L320,55 L290,60 L265,50 Z" fill="#1A1A1A"/>
    <path d="M425,65 L435,60 L440,70 L432,78 L425,72 Z" fill="#1A1A1A"/>
  </svg>
);

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
  * { box-sizing: border-box; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  body { font-family: 'DM Sans', -apple-system, sans-serif; }
  .row { display:flex; align-items:center; justify-content:space-between; padding:14px 20px; border-bottom:0.5px solid #E8E8E8; cursor:pointer; background:rgba(255,255,255,0.88); text-align:left; width:100%; border-left:none; border-right:none; border-top:none; backdrop-filter:blur(4px); font-family:'DM Sans',sans-serif; }
  .row:hover { background:rgba(255,255,255,0.97); }
  .row:last-child { border-bottom:none; }
  .bubble-grey { background:#F0F0F0; border-radius:18px 18px 18px 4px; padding:14px 16px; position:relative; margin-bottom:20px; }
  .bubble-grey::after { content:''; position:absolute; bottom:-9px; left:16px; width:0; height:0; border-left:10px solid transparent; border-right:4px solid transparent; border-top:10px solid #F0F0F0; }
  .bubble-red { background:#CC0000; border-radius:18px 18px 4px 18px; padding:14px 16px; position:relative; margin-bottom:20px; }
  .bubble-red::after { content:''; position:absolute; bottom:-9px; right:16px; width:0; height:0; border-left:4px solid transparent; border-right:10px solid transparent; border-top:10px solid #CC0000; }
`;

export default function Home() {
  const [screen,  setScreen]  = useState("home");
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [errMsg,  setErrMsg]  = useState("");
  const [shared,  setShared]  = useState(false);
  const [quipIdx, setQuipIdx] = useState(0);
  const quipTimer = useRef(null);

  const dateStr = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

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
  const flipScore = Math.min(10,Math.max(0,Math.round(+results?.data?.contradictionScore||0)));
  const flipCol  = flipScore<=3?"#1a7a35":flipScore<=6?"#8B4800":"#CC0000";
  const grade    = results?.data?.dailyGrade||"?";
  const gCol     = gradeColor(grade);
  const tab      = TABS.find(t=>t.id===results?.region)||TABS[0];

  // ── LOADING ──
  if (screen==="loading") return (
    <div style={{minHeight:"100vh",background:"#F4F4F2",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,fontFamily:"'DM Sans',sans-serif",padding:40}}>
      <style>{css}</style>
      <Head><title>Making Accuracy Great Again</title></Head>
      <div style={{width:40,height:40,border:"2px solid #E0E0E0",borderTopColor:"#CC0000",borderRadius:"50%",animation:"spin .75s linear infinite"}}/>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#1A1A1A"}}>Checking the facts…</div>
      <div style={{fontSize:14,color:"#666",fontStyle:"italic",textAlign:"center",maxWidth:300,lineHeight:1.6}}>{QUIPS[quipIdx]}</div>
      <div style={{fontSize:12,color:"#999"}}>Searching global news — about 15 seconds</div>
    </div>
  );

  // ── ERROR ──
  if (screen==="error") return (
    <div style={{minHeight:"100vh",background:"#F4F4F2",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'DM Sans',sans-serif",padding:40}}>
      <style>{css}</style>
      <div style={{fontSize:36}}>📣</div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#1A1A1A"}}>Reality Check Failed</div>
      <div style={{fontSize:14,color:"#666",textAlign:"center",maxWidth:300,lineHeight:1.6}}>{errMsg}</div>
      <button onClick={()=>setScreen("home")} style={{background:"#CC0000",color:"white",border:"none",padding:"12px 28px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Try Again</button>
    </div>
  );

  // ── RESULTS ──
  if (screen==="results"&&results) return (
    <div style={{background:"#F4F4F2",minHeight:"100vh",paddingBottom:80,fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{css}</style>
      <Head><title>Making Accuracy Great Again — {tab.short}</title></Head>
      <WorldMap/>

      {/* Header */}
      <div style={{borderBottom:"3px solid #CC0000",padding:"40px 20px 16px",position:"sticky",top:0,background:"rgba(255,255,255,0.95)",zIndex:10,backdropFilter:"blur(8px)"}}>
        <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",color:"#CC0000",fontSize:14,fontWeight:600,cursor:"pointer",padding:0,marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>← Back</button>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",marginBottom:4}}>{tab.flag} {tab.short} Report · {dateStr}</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#1A1A1A"}}>Making Accuracy <span style={{color:"#CC0000"}}>Great Again</span></div>
          </div>
          <button onClick={handleShare} style={{background:"#F5F5F5",border:"0.5px solid #E0E0E0",padding:"8px 14px",fontSize:12,fontWeight:600,cursor:"pointer",color:"#1A1A1A",fontFamily:"'DM Sans',sans-serif"}}>
            {shared?"✅ Copied":"🔗 Share"}
          </button>
        </div>
      </div>

      <div style={{maxWidth:720,margin:"0 auto",position:"relative",zIndex:1}}>

        {/* Who's covered */}
        <div style={{padding:"10px 20px",background:"rgba(255,255,255,0.85)",borderBottom:"0.5px solid #E8E8E8",fontSize:12,color:"#555",backdropFilter:"blur(4px)"}}>
          <strong style={{color:"#1A1A1A"}}>Covering:</strong> {results.regionWho||tab.who}
        </div>

        {/* Verdict banner */}
        <div style={{padding:"22px 20px",borderBottom:"2px solid #1A1A1A",background:"rgba(255,255,255,0.88)",backdropFilter:"blur(4px)"}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Today's Verdict</div>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:20}}>
            <div style={{flex:1}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:19,color:"#1A1A1A",lineHeight:1.4,marginBottom:8}}>{results.data.summary}</div>
              <div style={{fontSize:13,color:"#666",lineHeight:1.6}}>{results.data.dailyScoreDesc}</div>
            </div>
            <div style={{flexShrink:0,textAlign:"center",borderLeft:"0.5px solid #E8E8E8",paddingLeft:18}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:58,color:gCol,lineHeight:1}}>{grade}</div>
              <div style={{fontSize:12,color:"#999",marginTop:2}}>{results.data.dailyScore}/100</div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:"2px solid #1A1A1A",background:"rgba(255,255,255,0.88)"}}>
          {[
            {n:cnt.TRUE,       l:"True",      col:"#1a7a35"},
            {n:cnt.FALSE,      l:"False",     col:"#CC0000"},
            {n:cnt.MIXED,      l:"Mixed",     col:"#8B4800"},
            {n:cnt.UNVERIFIED, l:"Unverified",col:"#555"},
          ].map((s,i)=>(
            <div key={i} style={{padding:"14px 10px",textAlign:"center",borderRight:i<3?"0.5px solid #E8E8E8":"none"}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:34,color:s.col,lineHeight:1,marginBottom:3}}>{s.n}</div>
              <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"#999",fontWeight:600}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Truth-O-Meter */}
        <div style={{padding:"14px 20px",borderBottom:"0.5px solid #E8E8E8",background:"rgba(255,255,255,0.85)"}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Truth-O-Meter™</div>
          <div style={{height:7,background:"#F0F0F0",display:"flex",overflow:"hidden",borderRadius:2}}>
            {[{col:"#1a7a35",pct:cnt.TRUE/total*100},{col:"#8B4800",pct:cnt.MIXED/total*100},{col:"#CC0000",pct:cnt.FALSE/total*100},{col:"#999",pct:cnt.UNVERIFIED/total*100}]
              .map((s,i)=><div key={i} style={{height:"100%",width:`${s.pct.toFixed(1)}%`,background:s.col}}/>)}
          </div>
          <div style={{display:"flex",gap:14,marginTop:7,flexWrap:"wrap"}}>
            {[{col:"#1a7a35",l:`True (${cnt.TRUE})`},{col:"#8B4800",l:`Mixed (${cnt.MIXED})`},{col:"#CC0000",l:`False (${cnt.FALSE})`},{col:"#999",l:`Unverified (${cnt.UNVERIFIED})`}]
              .map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#555"}}>
                  <div style={{width:8,height:8,background:s.col,borderRadius:1}}/>{s.l}
                </div>
              ))}
          </div>
        </div>

        {/* Flip-Flop */}
        <div style={{padding:"14px 20px",borderBottom:"2px solid #1A1A1A",background:"rgba(255,255,255,0.85)",display:"flex",alignItems:"center",gap:18}}>
          <div style={{flexShrink:0,width:60,height:60,border:`3px solid ${flipCol}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:flipCol,lineHeight:1}}>{flipScore}</span>
            <span style={{fontSize:9,color:"#999",fontWeight:600}}>/10</span>
          </div>
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>Flip-Flop Index</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:15,color:"#1A1A1A",marginBottom:4}}>{results.data.contradictionHeadline}</div>
            <div style={{fontSize:13,color:"#666",lineHeight:1.5}}>{results.data.contradictionDesc}</div>
          </div>
        </div>

        {/* Claims header */}
        <div style={{padding:"14px 20px 10px",background:"rgba(248,248,246,0.9)"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between"}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600}}>What They Said</div>
            <div style={{fontSize:11,color:"#CC0000",fontWeight:600}}>{claims.length} claims checked</div>
          </div>
        </div>

        {/* CLAIM CARDS */}
        {claims.map((c,i)=>{
          const vs   = V[c.verdict]||V.UNVERIFIED;
          const conf = c.confidenceScore||3;
          const confCol   = CONF_COLORS[conf]||"#8B4800";
          const confLabel = CONF_LABELS[conf]||"Medium";
          return (
            <div key={i} style={{borderTop:"0.5px solid #E8E8E8",background:"rgba(255,255,255,0.88)",backdropFilter:"blur(4px)",animation:`fadeUp .3s ${i*.06}s ease both`}}>
              <div style={{padding:"18px 20px"}}>

                {/* 1. VERDICT + CONFIDENCE — first */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,paddingBottom:14,borderBottom:"2px solid #F0F0F0"}}>
                  <span style={{fontSize:13,fontWeight:700,padding:"6px 14px",background:vs.bg,color:vs.color}}>{vs.label}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <span style={{fontSize:10,color:"#999"}}>Confidence</span>
                    <div style={{display:"flex",gap:2}}>
                      {[1,2,3,4,5].map(n=>(
                        <div key={n} style={{width:4,height:14,background:n<=conf?confCol:"#E0E0E0",borderRadius:1}}/>
                      ))}
                    </div>
                    <span style={{fontSize:10,color:confCol,fontWeight:700}}>{confLabel}</span>
                  </div>
                </div>

                {/* 2. WHO */}
                <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12}}>
                  <span style={{fontSize:22,flexShrink:0}}>{tab.flag}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:4}}>{c.who||"Unknown official"}</div>
                    {c.fullDate&&<div style={{fontSize:11,color:"#999",marginBottom:2}}>📅 {c.fullDate}</div>}
                    {c.location&&<div style={{fontSize:11,color:"#999"}}>📍 {c.location}</div>}
                    {!c.fullDate&&c.source&&<div style={{fontSize:11,color:"#999"}}>📅 {c.source}</div>}
                  </div>
                </div>

                {/* 3. THE QUOTE */}
                <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:18,color:"#1A1A1A",lineHeight:1.55,marginBottom:12,paddingBottom:12,borderBottom:"0.5px solid #EEEEEE"}}>
                  "{c.quote}"
                </div>

                {/* 4. CONTEXT */}
                {c.context&&(
                  <div style={{borderLeft:"3px solid #CC0000",paddingLeft:12,marginBottom:16,fontSize:12,color:"#666",lineHeight:1.6,fontStyle:"italic"}}>
                    {c.context}
                  </div>
                )}

                {/* 5. REALITY CHECK — grey speech bubble */}
                <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Reality Check 🔍</div>
                <div className="bubble-grey">
                  <div style={{fontSize:13,color:"#333",lineHeight:1.7}}>{c.explanation}</div>
                </div>

                {/* 6. OUR TAKE — red speech bubble */}
                <div style={{fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:600,marginBottom:8,textAlign:"right"}}>📣 Our Take</div>
                <div className="bubble-red">
                  <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                    <span style={{fontSize:16,flexShrink:0}}>📣</span>
                    <span style={{fontSize:13,fontStyle:"italic",color:"white",lineHeight:1.6}}>{c.quip}</span>
                  </div>
                </div>

                {/* 7. SAID THIS BEFORE */}
                {c.relatedClaims&&c.relatedClaims.length>0&&(
                  <div style={{background:"#FAFAFA",padding:"12px 14px",marginBottom:14}}>
                    <div style={{fontSize:9,letterSpacing:2,color:"#999",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Said This Before</div>
                    {c.relatedClaims.map((r,j)=>(
                      <div key={j} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:j<c.relatedClaims.length-1?8:0,paddingBottom:j<c.relatedClaims.length-1?8:0,borderBottom:j<c.relatedClaims.length-1?"0.5px solid #EEEEEE":"none"}}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,color:"#333",marginBottom:2}}>{r.claim}</div>
                          <div style={{fontSize:10,color:"#AEAEB2"}}>{r.date}</div>
                        </div>
                        <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",background:(V[r.verdict]||V.UNVERIFIED).bg,color:(V[r.verdict]||V.UNVERIFIED).color,flexShrink:0}}>
                          {(V[r.verdict]||V.UNVERIFIED).label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 8. SOURCE */}
                {c.sourceUrl&&(
                  <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:10,borderTop:"0.5px solid #F0F0F0"}}>
                    <span style={{fontSize:10,color:"#999",fontWeight:700,letterSpacing:1,flexShrink:0}}>SOURCE</span>
                    <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#CC0000",fontWeight:600,textDecoration:"none"}}>
                      {c.sourceName||c.sourceUrl} →
                    </a>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Sources */}
        <div style={{padding:"18px 20px",borderTop:"2px solid #1A1A1A",borderBottom:"0.5px solid #E8E8E8",background:"rgba(255,255,255,0.85)"}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600,marginBottom:12}}>Checked Against</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {(results.data.sources||[]).map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6,background:"#F5F5F5",padding:"6px 10px",fontSize:12,color:"#333"}}>
                <span>{s.emoji}</span><span style={{fontWeight:500}}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{padding:"16px 20px",background:"rgba(255,255,255,0.85)"}}>
          <button onClick={handleShare} style={{width:"100%",background:"#CC0000",color:"white",border:"none",padding:14,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:10}}>
            {shared?"✅ Copied!":"🔗 Share This Report"}
          </button>
          <button onClick={()=>setScreen("home")} style={{width:"100%",background:"#F5F5F5",color:"#555",border:"0.5px solid #E0E0E0",padding:14,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            ← Back to Home
          </button>
        </div>

      </div>
    </div>
  );

  // ── HOME ──
  return (
    <div style={{background:"#F4F4F2",minHeight:"100vh",paddingBottom:60,fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{css}</style>
      <Head>
        <title>Making Accuracy Great Again — Global Fact Check</title>
        <meta name="description" content="Global fact-checking of world leaders. Because someone has to."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>
      <WorldMap/>

      <div style={{position:"relative",zIndex:1}}>

        {/* MASTHEAD */}
        <div style={{borderBottom:"3px solid #CC0000",padding:"32px 20px 16px",background:"rgba(255,255,255,0.92)",backdropFilter:"blur(8px)"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",maxWidth:720,margin:"0 auto"}}>
            <div>
              <div style={{fontSize:9,letterSpacing:4,color:"#999",textTransform:"uppercase",marginBottom:6}}>Global Fact Check</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:30,color:"#1A1A1A",lineHeight:1.1,letterSpacing:-0.5}}>
                Making Accuracy<br/><span style={{color:"#CC0000"}}>Great Again</span>
              </div>
            </div>
            <div style={{fontSize:34,marginTop:6}}>📣</div>
          </div>
        </div>

        {/* DATE + TAGLINE */}
        <div style={{padding:"8px 20px",borderBottom:"0.5px solid #E8E8E8",background:"rgba(255,255,255,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"space-between",maxWidth:720,margin:"0 auto",width:"100%"}}>
          <div style={{fontSize:11,color:"#999"}}>{dateStr}</div>
          <div style={{fontSize:11,color:"#999",fontStyle:"italic",fontFamily:"'DM Serif Display',serif"}}>"Because someone has to."</div>
        </div>

        <div style={{maxWidth:720,margin:"0 auto"}}>

          {/* TODAY HERO */}
          <div onClick={()=>checkRegion("today")} style={{padding:"20px",borderBottom:"2px solid #1A1A1A",cursor:"pointer",background:"rgba(255,255,255,0.88)",backdropFilter:"blur(8px)"}}>
            <div style={{fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>Featured · Tap to fact-check</div>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#1A1A1A",lineHeight:1.2,marginBottom:8}}>🔥 Today's Biggest Claims</div>
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

          {/* SELECT REGION LABEL */}
          <div style={{padding:"14px 20px",background:"#1A1A1A",borderBottom:"3px solid #CC0000",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:"white",marginBottom:2}}>Select a Region</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.45)"}}>Tap to run a live fact-check</div>
            </div>
            <div style={{fontSize:20}}>🌍</div>
          </div>

          {/* REGION ROWS */}
          {TABS.slice(1).map(t=>{
            const last = lastScore[t.id];
            const g    = last?.grade||last?.dailyGrade;
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
                  {g?(
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:gradeColor(g),lineHeight:1}}>{g}</div>
                      <div style={{fontSize:9,color:"#CCC"}}>{last.score}/100</div>
                    </div>
                  ):(
                    <div style={{fontSize:11,color:"#CCC"}}>Not checked</div>
                  )}
                  <div style={{fontSize:16,color:"#CC0000",fontWeight:700}}>→</div>
                </div>
              </button>
            );
          })}

          {/* DIVIDER */}
          <div style={{height:2,background:"#1A1A1A"}}/>

          {/* RECENT SCORES */}
          {history.length>0&&(
            <div style={{padding:"16px 20px",borderBottom:"0.5px solid #E8E8E8",background:"rgba(255,255,255,0.85)"}}>
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
                      <div style={{width:"100%",background:col,height:`${pct}%`,borderRadius:"2px 2px 0 0"}}/>
                      <div style={{fontSize:8,color:"#999",marginTop:3}}>{flag}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SHARE */}
          <div style={{padding:"14px 20px",background:"rgba(245,245,243,0.9)",textAlign:"center",cursor:"pointer"}} onClick={()=>{
            const url="https://maga.news";
            if(navigator.share){navigator.share({title:"Making Accuracy Great Again",url});}
            else{navigator.clipboard.writeText(url);}
          }}>
            <div style={{fontSize:12,fontWeight:600,color:"#555"}}>🔗 Share Making Accuracy Great Again</div>
            <div style={{fontSize:10,color:"#999",marginTop:2}}>Because someone has to.</div>
          </div>

        </div>
      </div>
    </div>
  );
}
