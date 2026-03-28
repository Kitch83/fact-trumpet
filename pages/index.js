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
  { id:"today",  flag:"🔥", label:"Today's Top Claims",  short:"Today",         who:"AI picks the biggest claims from any world leader today" },
  { id:"us",     flag:"🇺🇸", label:"US & Allies",         short:"US & Allies",   who:"USA, UK, EU, NATO, Australia, Japan, South Korea" },
  { id:"israel", flag:"🇮🇱", label:"Israel",               short:"Israel",        who:"Netanyahu, IDF, Israeli government ministers" },
  { id:"iran",   flag:"🇮🇷", label:"Iran & Axis",          short:"Iran & Axis",   who:"Iran, Hezbollah, Houthis, Hamas" },
  { id:"russia", flag:"🇷🇺", label:"Russia",               short:"Russia",        who:"Putin, Kremlin, Russian military" },
  { id:"china",  flag:"🇨🇳", label:"China",                short:"China",         who:"Xi Jinping, CCP, Beijing officials" },
  { id:"gulf",   flag:"🌍",  label:"Gulf & Mid East",      short:"Gulf",          who:"Saudi Arabia, UAE, Qatar, Jordan, Egypt, Turkey" },
  { id:"un",     flag:"🏛️",  label:"UN & International Bodies", short:"UN & ICC", who:"United Nations, ICC, ICJ, WHO, IMF, World Bank" },
];

const V = {
  TRUE:       { bg:"#E8F9ED", color:"#34C759", label:"✅ True" },
  FALSE:      { bg:"#FFF0EF", color:"#FF3B30", label:"❌ False" },
  MIXED:      { bg:"#FFF4E5", color:"#FF9500", label:"🤔 Mixed" },
  UNVERIFIED: { bg:"#F5EEFF", color:"#AF52DE", label:"❓ Unverified" },
};

const CONF_LABELS = { 5:"Very High", 4:"High", 3:"Medium", 2:"Low", 1:"Very Low" };
const CONF_COLORS = { 5:"#34C759", 4:"#34C759", 3:"#FF9500", 2:"#FF3B30", 1:"#FF3B30" };

const gradeColor = (g) => {
  if (!g) return "#AEAEB2";
  const l = g[0];
  if (l==="A") return "#34C759";
  if (l==="B") return "#30D158";
  if (l==="C") return "#FF9500";
  if (l==="D") return "#FF6B00";
  return "#FF3B30";
};

const gradeBg = (g) => {
  if (!g) return "#F2F2F7";
  const l = g[0];
  if (l==="A") return "#E8F9ED";
  if (l==="B") return "#E8F9ED";
  if (l==="C") return "#FFF4E5";
  if (l==="D") return "#FFF0EF";
  return "#FFF0EF";
};

export default function Home() {
  const [screen,  setScreen]  = useState("home");
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [errMsg,  setErrMsg]  = useState("");
  const [shared,  setShared]  = useState(false);
  const [quipIdx, setQuipIdx] = useState(0);
  const [activeRegion, setActiveRegion] = useState(null);
  const quipTimer = useRef(null);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday:"long", month:"long", day:"numeric", year:"numeric"
  });

  // Load history on mount
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
    setActiveRegion(regionId);
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
      if (!res.ok || !data.ok) throw new Error(data.error||"Server error");
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
    const full = `${text}\n\n${url}`;
    if (navigator.share) { navigator.share({title:"Making Accuracy Great Again", text:full, url}); }
    else { navigator.clipboard.writeText(full); setShared(true); setTimeout(()=>setShared(false),3000); }
  }

  // Latest score per region from history
  const lastScore = {};
  history.forEach(h => { if (h.region && !lastScore[h.region]) lastScore[h.region]=h; });

  const claims   = results?.data?.claims||[];
  const cnt      = claims.reduce((a,c)=>{a[c.verdict]=(a[c.verdict]||0)+1;return a;},{TRUE:0,FALSE:0,MIXED:0,UNVERIFIED:0});
  const total    = Math.max(claims.length,1);
  const score    = Math.min(10,Math.max(0,Math.round(+results?.data?.contradictionScore||0)));
  const scoreCol = score<=3?"#34C759":score<=6?"#FF9500":"#FF3B30";
  const grade    = results?.data?.dailyGrade||"?";
  const gCol     = gradeColor(grade);
  const tab      = TABS.find(t=>t.id===results?.region)||TABS[0];

  // ── LOADING ──
  if (screen==="loading") return (
    <div style={S.overlay}>
      <Head><title>Making Accuracy Great Again — Checking…</title></Head>
      <style>{kf}</style>
      <div style={S.spinner}/>
      <div style={S.ovTitle}>Sounding the Alarm…</div>
      <div style={S.ovQuip}>{QUIPS[quipIdx]}</div>
      <div style={{fontSize:12,color:"#AEAEB2",marginTop:4}}>Searching global news — ~15 seconds</div>
    </div>
  );

  // ── ERROR ──
  if (screen==="error") return (
    <div style={S.overlay}>
      <Head><title>Making Accuracy Great Again</title></Head>
      <style>{kf}</style>
      <div style={{fontSize:48,marginBottom:12}}>📣</div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#1C1C1E",marginBottom:8}}>Alarm Jammed</div>
      <div style={{fontSize:14,color:"#636366",textAlign:"center",maxWidth:300,lineHeight:1.6,marginBottom:24}}>{errMsg}</div>
      <button style={S.btn} onClick={()=>setScreen("home")}>Try Again</button>
    </div>
  );

  // ── RESULTS ──
  if (screen==="results"&&results) return (
    <div style={{background:"#F2F2F7",minHeight:"100vh",paddingBottom:70,fontFamily:"'DM Sans',-apple-system,sans-serif"}}>
      <Head><title>Making Accuracy Great Again — {tab.short}</title></Head>
      <style>{kf}</style>

      <div style={S.rHeader}>
        <button style={S.backBtn} onClick={()=>setScreen("home")}>← Back</button>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:28}}>📣</span>
            <div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,letterSpacing:-0.3}}>
                {tab.flag} {tab.short} <span style={{color:"#007AFF"}}>Report</span>
              </div>
              <div style={{fontSize:11,color:"#AEAEB2",marginTop:2}}>{dateStr}</div>
            </div>
          </div>
          <button style={S.shareBtn} onClick={handleShare}>
            {shared?"✅ Copied!":"🔗 Share"}
          </button>
        </div>
      </div>

      <div style={S.body}>
        {/* Who is covered */}
        <div style={{background:"#E8F1FF",border:"1px solid #B5D4F4",borderRadius:14,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#185FA5",animation:"fadeUp .3s ease both"}}>
          <strong>Who's covered:</strong> {results.regionWho||tab.who}
        </div>

        {/* Score card */}
        <div style={{background:"#1C1C2E",borderRadius:20,padding:22,marginBottom:20,animation:"fadeUp .4s ease both"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,.35)",marginBottom:6}}>Today's Verdict</div>
              <div style={{fontSize:15,fontFamily:"'DM Serif Display',serif",fontStyle:"italic",color:"rgba(255,255,255,.8)",lineHeight:1.45}}>{results.data.summary}</div>
            </div>
            <div style={{textAlign:"center",flexShrink:0,marginLeft:16}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:56,lineHeight:1,color:gCol}}>{grade}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,.35)"}}>{results.data.dailyScore}/100</div>
            </div>
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.5)",fontStyle:"italic",borderTop:"1px solid rgba(255,255,255,.08)",paddingTop:12,lineHeight:1.5}}>{results.data.dailyScoreDesc}</div>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:20,animation:"fadeUp .4s .06s ease both"}}>
          {[
            {col:"#34C759",e:"✅",n:cnt.TRUE,       l:"Confirmed True"},
            {col:"#FF3B30",e:"❌",n:cnt.FALSE,      l:"Straight-Up False"},
            {col:"#FF9500",e:"🤔",n:cnt.MIXED,      l:"It's Complicated"},
            {col:"#AF52DE",e:"❓",n:cnt.UNVERIFIED, l:"Who Knows"},
          ].map((s,i)=>(
            <div key={i} style={{background:"#fff",borderRadius:12,padding:"18px 12px 14px",textAlign:"center",boxShadow:"0 4px 24px rgba(0,0,0,.07)",borderBottom:`3px solid ${s.col}`}}>
              <div style={{fontSize:20,marginBottom:6}}>{s.e}</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:42,lineHeight:1,marginBottom:4,color:s.col}}>{s.n}</div>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",color:"#AEAEB2"}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Meter */}
        <div style={{background:"#fff",borderRadius:20,padding:22,marginBottom:20,boxShadow:"0 4px 24px rgba(0,0,0,.07)",animation:"fadeUp .4s .12s ease both"}}>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:"#AEAEB2",marginBottom:10}}>Honesty Breakdown</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:21,marginBottom:16}}>The Truth-O-Meter™</div>
          <div style={{background:"#F2F2F7",borderRadius:100,height:14,overflow:"hidden",display:"flex",marginBottom:12}}>
            {[{col:"#34C759",pct:cnt.TRUE/total*100},{col:"#FF9500",pct:cnt.MIXED/total*100},{col:"#FF3B30",pct:cnt.FALSE/total*100},{col:"#AF52DE",pct:cnt.UNVERIFIED/total*100}]
              .map((s,i)=><div key={i} style={{height:"100%",width:`${s.pct.toFixed(1)}%`,background:s.col}}/>)}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
            {[{col:"#34C759",l:`True (${cnt.TRUE})`},{col:"#FF9500",l:`Mixed (${cnt.MIXED})`},{col:"#FF3B30",l:`False (${cnt.FALSE})`},{col:"#AF52DE",l:`Unverified (${cnt.UNVERIFIED})`}]
              .map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#3A3A3C"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.col}}/>{s.l}
                </div>
              ))}
          </div>
        </div>

        {/* Flip flop */}
        <div style={{background:"#fff",borderRadius:20,padding:22,marginBottom:20,boxShadow:"0 4px 24px rgba(0,0,0,.07)",animation:"fadeUp .4s .18s ease both"}}>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:"#AEAEB2",marginBottom:10}}>Flip-Flop Index</div>
          <div style={{display:"flex",alignItems:"center",gap:22}}>
            <div style={{flexShrink:0,width:86,height:86,borderRadius:"50%",border:`4px solid ${scoreCol}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:scoreCol}}>
              <span style={{fontFamily:"'DM Serif Display',serif",fontSize:30,lineHeight:1}}>{score}</span>
              <span style={{fontSize:10,fontWeight:600,opacity:.65}}>/ 10</span>
            </div>
            <div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,fontStyle:"italic",marginBottom:6}}>{results.data.contradictionHeadline}</div>
              <div style={{fontSize:14,color:"#636366",lineHeight:1.65}}>{results.data.contradictionDesc}</div>
            </div>
          </div>
        </div>

        {/* Claims */}
        <div style={{animation:"fadeUp .4s .24s ease both"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>What They Said</div>
            <span style={{background:"#E8F1FF",color:"#007AFF",fontSize:13,fontWeight:600,padding:"3px 11px",borderRadius:100}}>{claims.length} claims</span>
          </div>

          {claims.map((c,i)=>{
            const vs=V[c.verdict]||V.UNVERIFIED;
            const conf=c.confidenceScore||3;
            const confCol=CONF_COLORS[conf]||"#FF9500";
            const confLabel=CONF_LABELS[conf]||"Medium";
            return (
              <div key={i} style={{background:"#fff",borderRadius:20,marginBottom:16,boxShadow:"0 4px 24px rgba(0,0,0,.07)",overflow:"hidden",animation:`fadeUp .4s ${i*.07}s ease both`}}>
                <div style={{padding:"18px 18px 0"}}>

                  {/* 1. WHO said it */}
                  <div style={{background:"#F2F2F7",borderRadius:12,padding:"12px 14px",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <span style={{fontSize:22,flexShrink:0}}>{tab.flag}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:"#1C1C1E",marginBottom:3}}>{c.who||"Unknown official"}</div>
                        {c.fullDate&&<div style={{fontSize:11,color:"#636366",marginBottom:2}}>📅 {c.fullDate}</div>}
                        {c.location&&<div style={{fontSize:11,color:"#636366"}}>📍 {c.location}</div>}
                        {!c.fullDate&&c.source&&<div style={{fontSize:11,color:"#636366"}}>📅 {c.source}</div>}
                      </div>
                    </div>
                  </div>

                  {/* 2. CONTEXT — why they said it */}
                  {c.context&&(
                    <div style={{background:"#FFF4E5",borderLeft:"3px solid #FF9500",borderRadius:"0 8px 8px 0",padding:"8px 12px",marginBottom:12,fontSize:12,color:"#C47800",lineHeight:1.5}}>
                      <strong>Context:</strong> {c.context}
                    </div>
                  )}

                  {/* 3. THE QUOTE */}
                  <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:17,lineHeight:1.55,paddingBottom:14,borderBottom:"1px solid #E5E5EA",marginBottom:12}}>
                    "{c.quote}"
                  </div>

                  {/* 4. VERDICT + CONFIDENCE */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,padding:"5px 13px",borderRadius:100,background:vs.bg,color:vs.color}}>{vs.label}</span>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div style={{fontSize:10,color:"#AEAEB2"}}>Confidence</div>
                      <div style={{display:"flex",gap:2}}>
                        {[1,2,3,4,5].map(n=>(
                          <div key={n} style={{width:5,height:12,borderRadius:2,background:n<=conf?confCol:"#E5E5EA"}}/>
                        ))}
                      </div>
                      <div style={{fontSize:10,color:confCol,fontWeight:600}}>{confLabel}</div>
                    </div>
                  </div>
                </div>

                {/* 5. FACT CHECK */}
                <div style={{padding:"14px 18px 0",background:"#F9F9FB"}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#AEAEB2",marginBottom:7}}>The Real Tea ☕</div>
                  <div style={{fontSize:14,lineHeight:1.72,color:"#3A3A3C",marginBottom:12}}>{c.explanation}</div>

                  {/* Quip */}
                  <div style={{background:"#fff",borderRadius:12,padding:"11px 14px",display:"flex",gap:10,alignItems:"flex-start",border:"1px solid #E5E5EA",marginBottom:12}}>
                    <span style={{fontSize:17,flexShrink:0}}>📣</span>
                    <span style={{fontSize:13,fontStyle:"italic",color:"#636366",lineHeight:1.6}}>{c.quip}</span>
                  </div>

                  {/* 6. RELATED CLAIMS */}
                  {c.relatedClaims&&c.relatedClaims.length>0&&(
                    <div style={{background:"#fff",borderRadius:12,padding:"11px 14px",border:"1px solid #E5E5EA",marginBottom:12}}>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#AEAEB2",marginBottom:8}}>Said This Before</div>
                      {c.relatedClaims.map((r,j)=>(
                        <div key={j} style={{display:"flex",alignItems:"center",justifyContent:"space-between",fontSize:12,marginBottom:j<c.relatedClaims.length-1?6:0}}>
                          <span style={{color:"#3A3A3C",flex:1,marginRight:8}}>{r.claim} — {r.date}</span>
                          <span style={{background:(V[r.verdict]||V.UNVERIFIED).bg,color:(V[r.verdict]||V.UNVERIFIED).color,fontSize:10,padding:"2px 8px",borderRadius:100,flexShrink:0}}>{(V[r.verdict]||V.UNVERIFIED).label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SOURCE LINK */}
                  {c.sourceUrl&&(
                    <div style={{display:"flex",alignItems:"center",gap:10,paddingBottom:14}}>
                      <div style={{width:30,height:30,borderRadius:8,background:"#E8F1FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>📰</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:10,color:"#AEAEB2",letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>Source</div>
                        <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#007AFF",fontWeight:500,textDecoration:"none"}}>
                          {c.sourceName||c.sourceUrl} →
                        </a>
                      </div>
                    </div>
                  )}
                  {!c.sourceUrl&&<div style={{paddingBottom:4}}/>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sources */}
        <div style={{background:"#fff",borderRadius:20,padding:22,marginBottom:20,boxShadow:"0 4px 24px rgba(0,0,0,.07)",animation:"fadeUp .4s .3s ease both"}}>
          <div style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:"#AEAEB2",marginBottom:10}}>Receipts 🧾</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:21,marginBottom:14}}>Checked Against</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {(results.data.sources||[]).map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#F2F2F7",borderRadius:12}}>
                <div style={{width:36,height:36,borderRadius:8,background:"#E8F1FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.emoji}</div>
                <div><div style={{fontSize:14,fontWeight:600,color:"#1C1C1E"}}>{s.name}</div><div style={{fontSize:12,color:"#AEAEB2",marginTop:2}}>{s.desc}</div></div>
              </div>
            ))}
          </div>
        </div>

        <button style={{...S.btn,background:"#007AFF",color:"#fff",boxShadow:"0 4px 16px rgba(0,122,255,.3)",marginBottom:10}} onClick={handleShare}>
          {shared?"✅ Copied!":"🔗 Share This Report"}
        </button>
        <button style={{...S.btn,background:"#F2F2F7",color:"#636366",border:"none",boxShadow:"none"}} onClick={()=>setScreen("home")}>
          ← Back to Home
        </button>
      </div>
    </div>
  );

  // ── HOME ──
  return (
    <div style={{background:"#F2F2F7",minHeight:"100vh",paddingBottom:60,fontFamily:"'DM Sans',-apple-system,sans-serif"}}>
      <Head>
        <title>Making Accuracy Great Again — Global Fact Check</title>
        <meta name="description" content="Global fact-checking of world leaders. Because someone has to."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>
      <style>{kf}</style>

      {/* HERO */}
      <div style={{background:"#EEEEF3",padding:"36px 20px 22px",textAlign:"center",borderBottom:"1px solid #E0E0EA"}}>
        <div style={{fontSize:46,marginBottom:6}}>📣</div>
        <div style={{fontSize:11,fontWeight:500,letterSpacing:4,textTransform:"uppercase",color:"#AEAEB2",marginBottom:4}}>Global Fact Check</div>
        <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:30,lineHeight:1.1,color:"#1C1C1E",marginBottom:4}}>
          Making Accuracy<br/><span style={{color:"#007AFF"}}>Great Again</span>
        </div>
        <div style={{fontSize:13,color:"#636366",fontStyle:"italic",fontFamily:"'DM Serif Display',serif",marginBottom:14,lineHeight:1.6}}>"Because someone has to."</div>
        <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"#fff",border:"1px solid #E5E5EA",borderRadius:100,padding:"6px 16px",fontSize:12,fontWeight:500,color:"#636366",boxShadow:"0 2px 10px rgba(0,0,0,.05)"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:"#34C759",animation:"pulse 2s ease-in-out infinite"}}/>
          {dateStr}
        </div>
      </div>

      <div style={{maxWidth:500,margin:"0 auto",padding:"16px 14px 0"}}>

        <div style={{fontSize:10,fontWeight:600,letterSpacing:3,textTransform:"uppercase",color:"#AEAEB2",textAlign:"center",marginBottom:12}}>Tap any region to fact-check</div>

        {/* TODAY - featured full width */}
        {(()=>{
          const last = lastScore["today"];
          return (
            <button onClick={()=>checkRegion("today")} style={{width:"100%",background:"#007AFF",border:"none",borderRadius:18,padding:"16px 18px",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 6px 20px rgba(0,122,255,.3)",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:28}}>🔥</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:16,fontWeight:700,color:"white",marginBottom:2}}>Today's Top Claims</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.75)"}}>AI picks the biggest lies of the day</div>
                </div>
              </div>
              {last?(
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"white",lineHeight:1}}>{last.grade||last.dailyGrade||"?"}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,.6)"}}>{last.score}/100</div>
                </div>
              ):(
                <div style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>No data yet</div>
              )}
            </button>
          );
        })()}

        {/* 2 column region grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          {TABS.slice(1,7).map(tab=>{
            const last = lastScore[tab.id];
            const g = last?.grade||last?.dailyGrade;
            const gCol = gradeColor(g);
            const gBg = gradeBg(g);
            return (
              <button key={tab.id} onClick={()=>checkRegion(tab.id)} style={{background:"#fff",border:"none",borderRadius:16,padding:14,cursor:"pointer",boxShadow:"0 2px 12px rgba(0,0,0,.06)",display:"flex",flexDirection:"column",gap:5,textAlign:"left",fontFamily:"'DM Sans',sans-serif"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:22}}>{tab.flag}</span>
                  {g&&<div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:gCol,lineHeight:1}}>{g}</div>}
                </div>
                <div style={{fontSize:13,fontWeight:600,color:"#1C1C1E"}}>{tab.short}</div>
                <div style={{fontSize:10,color:"#AEAEB2",lineHeight:1.4}}>{tab.who.split(",").slice(0,2).join(", ")}</div>
                {last?(
                  <div style={{background:gBg,borderRadius:6,padding:"3px 8px",fontSize:9,color:gCol,fontWeight:500}}>{last.score}/100 · {last.date}</div>
                ):(
                  <div style={{background:"#F2F2F7",borderRadius:6,padding:"3px 8px",fontSize:9,color:"#AEAEB2"}}>Not checked yet</div>
                )}
              </button>
            );
          })}
        </div>

        {/* UN - full width */}
        {(()=>{
          const last = lastScore["un"];
          const g = last?.grade||last?.dailyGrade;
          const gCol = gradeColor(g);
          return (
            <button onClick={()=>checkRegion("un")} style={{width:"100%",background:"#fff",border:"none",borderRadius:16,padding:"14px 18px",marginBottom:14,cursor:"pointer",boxShadow:"0 2px 12px rgba(0,0,0,.06)",display:"flex",alignItems:"center",justifyContent:"space-between",fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <span style={{fontSize:24}}>🏛️</span>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#1C1C1E"}}>UN & International Bodies</div>
                  <div style={{fontSize:10,color:"#AEAEB2"}}>United Nations, ICC, ICJ, WHO, IMF</div>
                </div>
              </div>
              {last?(
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:gCol,lineHeight:1}}>{g}</div>
                  <div style={{fontSize:9,color:"#AEAEB2"}}>{last.score}/100</div>
                </div>
              ):(
                <div style={{fontSize:11,color:"#AEAEB2"}}>Not checked yet</div>
              )}
            </button>
          );
        })()}

        {/* Divider */}
        <div style={{borderTop:"0.5px solid #E5E5EA",marginBottom:14}}/>

        {/* Mini chart */}
        {history.length>0&&(
          <div style={{background:"#fff",borderRadius:16,padding:14,marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,.06)"}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:10}}>
              <div style={{fontSize:13,fontFamily:"'DM Serif Display',serif"}}>Recent Scores</div>
              <Link href="/history" style={{fontSize:11,color:"#007AFF",fontWeight:500,textDecoration:"none"}}>Full history →</Link>
            </div>
            <div style={{display:"flex",alignItems:"flex-end",gap:4,height:48,marginBottom:8}}>
              {history.slice(0,10).map((h,i)=>{
                const pct=Math.max(6,h.score||0);
                const col=(h.score||0)>=60?"#34C759":(h.score||0)>=40?"#FF9500":"#FF3B30";
                const flag=TABS.find(t=>t.id===h.region)?.flag||"🌍";
                return (
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                    <div style={{width:"100%",background:col,borderRadius:"2px 2px 0 0",height:`${pct}%`,opacity:.85}}/>
                    <div style={{fontSize:8,color:"#AEAEB2",marginTop:3}}>{flag}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Share button - light grey */}
        <button style={{...S.btn,background:"#E5E5EA",color:"#636366",border:"none",boxShadow:"none",marginBottom:8}} onClick={()=>{
          const url="https://maga.news";
          if(navigator.share){navigator.share({title:"Making Accuracy Great Again",url});}
          else{navigator.clipboard.writeText(url);}
        }}>
          🔗 Share Making Accuracy Great Again
        </button>

        <div style={{textAlign:"center",fontSize:11,color:"#AEAEB2",lineHeight:1.6,marginBottom:16}}>
          Non-partisan · Equal scrutiny for all leaders · Updated daily<br/>
          <strong style={{color:"#1C1C1E"}}>maga.news</strong> — coming soon
        </div>

      </div>
    </div>
  );
}

const S = {
  overlay: {minHeight:"100vh",background:"rgba(242,242,247,.98)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'DM Sans',-apple-system,sans-serif"},
  spinner: {width:52,height:52,border:"3px solid #E5E5EA",borderTopColor:"#007AFF",borderRadius:"50%",animation:"spin .75s linear infinite"},
  ovTitle: {fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#1C1C1E"},
  ovQuip:  {fontSize:15,color:"#636366",fontStyle:"italic",textAlign:"center",maxWidth:280,lineHeight:1.5},
  rHeader: {background:"rgba(255,255,255,.95)",borderBottom:"1px solid #E5E5EA",padding:"44px 22px 20px",position:"sticky",top:0,zIndex:10,backdropFilter:"blur(20px)",fontFamily:"'DM Sans',-apple-system,sans-serif"},
  backBtn: {display:"inline-flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#007AFF",fontFamily:"'DM Sans',sans-serif",fontSize:17,cursor:"pointer",marginBottom:16,padding:0},
  shareBtn:{background:"#F2F2F7",border:"1px solid #E5E5EA",borderRadius:100,padding:"8px 16px",fontSize:13,fontWeight:600,color:"#1C1C1E",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  body:    {maxWidth:760,margin:"0 auto",padding:"26px 18px 70px",fontFamily:"'DM Sans',-apple-system,sans-serif"},
  btn:     {width:"100%",border:"none",borderRadius:12,padding:17,fontFamily:"'DM Sans',sans-serif",fontSize:16,fontWeight:600,cursor:"pointer",display:"block"},
};

const kf = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.7}}
`;
