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
  { id:"today",  flag:"🔥", label:"Today",          who:"AI picks the biggest claims from any world leader today" },
  { id:"us",     flag:"🇺🇸", label:"US & Allies",    who:"USA, UK, EU, NATO, Australia, Japan, South Korea" },
  { id:"israel", flag:"🇮🇱", label:"Israel",          who:"Netanyahu, IDF, Israeli government ministers" },
  { id:"iran",   flag:"🇮🇷", label:"Iran & Axis",     who:"Iran, Hezbollah, Houthis, Hamas" },
  { id:"russia", flag:"🇷🇺", label:"Russia",          who:"Putin, Kremlin, Russian military" },
  { id:"china",  flag:"🇨🇳", label:"China",           who:"Xi Jinping, CCP, Beijing officials" },
  { id:"gulf",   flag:"🌍", label:"Gulf & Mid East", who:"Saudi Arabia, UAE, Qatar, Jordan, Egypt, Turkey" },
  { id:"un",     flag:"🏛️", label:"UN & ICC",         who:"United Nations, ICC, ICJ, WHO, IMF, World Bank" },
];

const V = {
  TRUE:       { bg:"#E8F9ED", color:"#34C759", label:"✅ True" },
  FALSE:      { bg:"#FFF0EF", color:"#FF3B30", label:"❌ False" },
  MIXED:      { bg:"#FFF4E5", color:"#FF9500", label:"🤔 Mixed" },
  UNVERIFIED: { bg:"#F5EEFF", color:"#AF52DE", label:"❓ Unverified" },
};

const gradeColor = (g) => {
  if (!g) return "#AEAEB2";
  const l = g[0];
  if (l === "A") return "#34C759";
  if (l === "B") return "#30D158";
  if (l === "C") return "#FF9500";
  if (l === "D") return "#FF6B00";
  return "#FF3B30";
};

export default function Home() {
  const [screen,     setScreen]     = useState("home");
  const [activeTab,  setActiveTab]  = useState("today");
  const [tooltip,    setTooltip]    = useState(null);
  const [results,    setResults]    = useState(null);
  const [history,    setHistory]    = useState([]);
  const [errMsg,     setErrMsg]     = useState("");
  const [shared,     setShared]     = useState(false);
  const [quipIdx,    setQuipIdx]    = useState(0);
  const quipTimer = useRef(null);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday:"long", month:"long", day:"numeric", year:"numeric"
  });

  useEffect(() => {
    fetch("/api/factcheck")
      .then(r => r.json())
      .then(d => setHistory(d.history || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (screen === "loading") {
      setQuipIdx(0);
      quipTimer.current = setInterval(() => setQuipIdx(i => (i+1) % QUIPS.length), 2800);
    } else {
      clearInterval(quipTimer.current);
    }
    return () => clearInterval(quipTimer.current);
  }, [screen]);

  async function soundAlarm() {
    setScreen("loading");
    setErrMsg("");
    setShared(false);
    try {
      const res = await fetch("/api/factcheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region: activeTab })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Server error");
      if (!data.data?.claims?.length) throw new Error("No claims returned");
      setResults(data);
      fetch("/api/factcheck").then(r=>r.json()).then(d=>setHistory(d.history||[])).catch(()=>{});
      setScreen("results");
    } catch (ex) {
      setErrMsg(ex.message);
      setScreen("error");
    }
  }

  function handleShare() {
    const text = results?.data?.shareText || `📣 Making Accuracy Great Again: ${results?.data?.summary}`;
    const url = "https://maga-news.vercel.app";
    const full = `${text}\n\n${url}`;
    if (navigator.share) { navigator.share({ title:"Making Accuracy Great Again", text: full, url }); }
    else { navigator.clipboard.writeText(full); setShared(true); setTimeout(() => setShared(false), 3000); }
  }

  const claims   = results?.data?.claims || [];
  const cnt      = claims.reduce((a,c) => { a[c.verdict]=(a[c.verdict]||0)+1; return a; }, {TRUE:0,FALSE:0,MIXED:0,UNVERIFIED:0});
  const total    = Math.max(claims.length, 1);
  const score    = Math.min(10, Math.max(0, Math.round(+results?.data?.contradictionScore||0)));
  const scoreCol = score<=3?"#34C759":score<=6?"#FF9500":"#FF3B30";
  const grade    = results?.data?.dailyGrade || "?";
  const gCol     = gradeColor(grade);
  const yesterday = history.length > 0 ? history[0] : null;
  const weekHistory = history.slice(0, 7);
  const activeTabObj = TABS.find(t => t.id === activeTab) || TABS[0];

  // ── LOADING ──
  if (screen === "loading") return (
    <div style={S.overlay}>
      <Head><title>Making Accuracy Great Again — Loading…</title></Head>
      <div style={S.spinner}/>
      <div style={S.ovTitle}>Sounding the Alarm…</div>
      <div style={S.ovQuip}>{QUIPS[quipIdx]}</div>
      <div style={{fontSize:12,color:"#AEAEB2",marginTop:4}}>Searching global news — takes ~15 seconds</div>
    </div>
  );

  // ── ERROR ──
  if (screen === "error") return (
    <div style={S.overlay}>
      <Head><title>Making Accuracy Great Again</title></Head>
      <div style={{fontSize:48,marginBottom:12}}>📣</div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#1C1C1E",marginBottom:8}}>Alarm Jammed</div>
      <div style={{fontSize:14,color:"#636366",textAlign:"center",maxWidth:300,lineHeight:1.6,marginBottom:24}}>{errMsg}</div>
      <button style={S.btn} onClick={() => setScreen("home")}>Try Again</button>
    </div>
  );

  // ── RESULTS ──
  if (screen === "results" && results) {
    const tab = TABS.find(t => t.id === results.region) || TABS[0];
    return (
      <div style={{background:"#F2F2F7",minHeight:"100vh",paddingBottom:70}}>
        <Head><title>Making Accuracy Great Again — {tab.label} Report</title></Head>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

        <div style={S.rHeader}>
          <button style={S.backBtn} onClick={() => setScreen("home")}>← Back</button>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{fontSize:36}}>📣</span>
              <div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,letterSpacing:-0.3}}>
                  {tab.flag} {tab.label} <span style={{color:"#007AFF"}}>Report</span>
                </div>
                <div style={{fontSize:12,color:"#AEAEB2",marginTop:2}}>{dateStr}</div>
              </div>
            </div>
            <button style={S.shareBtn} onClick={handleShare}>
              {shared ? "✅ Copied!" : "🔗 Share"}
            </button>
          </div>
        </div>

        <div style={S.body}>
          {/* Who is covered */}
          <div style={{background:"#E8F1FF",border:"1px solid #B5D4F4",borderRadius:14,padding:"10px 14px",marginBottom:16,fontSize:12,color:"#185FA5",animation:"fadeUp .3s ease both"}}>
            <strong>Who's covered:</strong> {results.regionWho || tab.who}
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
            ].map((s,i) => (
              <div key={i} style={{background:"#fff",borderRadius:12,padding:"18px 12px 14px",textAlign:"center",boxShadow:"0 4px 24px rgba(0,0,0,.07)",borderBottom:`3px solid ${s.col}`}}>
                <div style={{fontSize:20,marginBottom:6}}>{s.e}</div>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:42,lineHeight:1,marginBottom:4,color:s.col}}>{s.n}</div>
                <div style={{fontSize:11,fontWeight:600,letterSpacing:1.2,textTransform:"uppercase",color:"#AEAEB2"}}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Truth-O-Meter */}
          <div style={{background:"#fff",borderRadius:20,padding:22,marginBottom:20,boxShadow:"0 4px 24px rgba(0,0,0,.07)",animation:"fadeUp .4s .12s ease both"}}>
            <div style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:"#AEAEB2",marginBottom:10}}>Honesty Breakdown</div>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:21,marginBottom:16}}>The Truth-O-Meter™</div>
            <div style={{background:"#F2F2F7",borderRadius:100,height:14,overflow:"hidden",display:"flex",marginBottom:12}}>
              {[{col:"#34C759",pct:cnt.TRUE/total*100},{col:"#FF9500",pct:cnt.MIXED/total*100},{col:"#FF3B30",pct:cnt.FALSE/total*100},{col:"#AF52DE",pct:cnt.UNVERIFIED/total*100}]
                .map((s,i) => <div key={i} style={{height:"100%",width:`${s.pct.toFixed(1)}%`,background:s.col}}/>)}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
              {[{col:"#34C759",l:`True (${cnt.TRUE})`},{col:"#FF9500",l:`Mixed (${cnt.MIXED})`},{col:"#FF3B30",l:`False (${cnt.FALSE})`},{col:"#AF52DE",l:`Unverified (${cnt.UNVERIFIED})`}]
                .map((s,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"#3A3A3C"}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:s.col}}/>{s.l}
                  </div>
                ))}
            </div>
          </div>

          {/* Flip-Flop */}
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
            {claims.map((c,i) => {
              const vs = V[c.verdict]||V.UNVERIFIED;
              return (
                <div key={i} style={{background:"#fff",borderRadius:20,marginBottom:14,boxShadow:"0 4px 24px rgba(0,0,0,.07)",overflow:"hidden",animation:`fadeUp .4s ${i*.07}s ease both`}}>
                  <div style={{padding:"18px 18px 0"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,padding:"5px 13px",borderRadius:100,background:vs.bg,color:vs.color}}>{vs.label}</span>
                      <span style={{fontSize:11,color:"#AEAEB2"}}>{c.source}</span>
                    </div>
                    {c.who && <div style={{fontSize:12,fontWeight:600,color:"#007AFF",marginBottom:8}}>— {c.who}</div>}
                    <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:17,lineHeight:1.55,paddingBottom:16,borderBottom:"1px solid #E5E5EA"}}>"{c.quote}"</div>
                  </div>
                  <div style={{padding:"14px 18px 18px",background:"#F9F9FB"}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#AEAEB2",marginBottom:7}}>The Real Tea ☕</div>
                    <div style={{fontSize:14,lineHeight:1.72,color:"#3A3A3C"}}>{c.explanation}</div>
                    <div style={{marginTop:12,background:"#fff",borderRadius:12,padding:"11px 14px",display:"flex",gap:10,alignItems:"flex-start",border:"1px solid #E5E5EA"}}>
                      <span style={{fontSize:17,flexShrink:0}}>📣</span>
                      <span style={{fontSize:13,fontStyle:"italic",color:"#636366",lineHeight:1.6}}>{c.quip}</span>
                    </div>
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
              {(results.data.sources||[]).map((s,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:"#F2F2F7",borderRadius:12}}>
                  <div style={{width:36,height:36,borderRadius:8,background:"#E8F1FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.emoji}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600,color:"#1C1C1E"}}>{s.name}</div>
                    <div style={{fontSize:12,color:"#AEAEB2",marginTop:2}}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button style={{...S.btn,background:"#007AFF",color:"#fff",boxShadow:"0 4px 16px rgba(0,122,255,.3)",marginBottom:10}} onClick={handleShare}>
            {shared ? "✅ Copied to clipboard!" : "🔗 Share This Report"}
          </button>
          <button style={{...S.btn,background:"#F2F2F7",color:"#007AFF",border:"1px solid #E5E5EA",boxShadow:"none"}} onClick={() => setScreen("home")}>
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ── HOME ──
  return (
    <div style={{background:"#F2F2F7",minHeight:"100vh",paddingBottom:60,fontFamily:"'DM Sans',-apple-system,sans-serif"}}>
      <Head>
        <title>Making Accuracy Great Again — Global Fact Check</title>
        <meta name="description" content="Global fact-checking of world leaders — US, Iran, Russia, China, Israel, Gulf states and more. Because someone has to."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes toot{0%,100%{transform:rotate(0)}20%{transform:rotate(-14deg)}40%{transform:rotate(14deg)}60%{transform:rotate(-7deg)}80%{transform:rotate(7deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.7}}
        .tab-scroll::-webkit-scrollbar{display:none}
      `}</style>

      {/* HERO */}
      <div style={{background:"#EEEEF3",padding:"40px 20px 24px",textAlign:"center",borderBottom:"1px solid #E0E0EA"}}>
        <div style={{fontSize:52,marginBottom:8,animation:"toot 4s ease-in-out infinite"}}>📣</div>
        <div style={{fontSize:11,fontWeight:500,letterSpacing:4,textTransform:"uppercase",color:"#AEAEB2",marginBottom:6}}>Global Fact Check</div>
        <div style={{fontFamily:"'DM Serif Display',Georgia,serif",fontSize:34,lineHeight:1.1,color:"#1C1C1E",marginBottom:6}}>
          Making Accuracy<br/><span style={{color:"#007AFF"}}>Great Again</span>
        </div>
        <div style={{fontSize:14,color:"#636366",fontStyle:"italic",fontFamily:"'DM Serif Display',serif",marginBottom:16,lineHeight:1.6}}>
          "Because someone has to."
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"#fff",border:"1px solid #E5E5EA",borderRadius:100,padding:"7px 18px",fontSize:13,fontWeight:500,color:"#636366",marginBottom:20,boxShadow:"0 2px 12px rgba(0,0,0,.05)"}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#34C759",animation:"pulse 2s ease-in-out infinite"}}/>
          {dateStr}
        </div>

        {/* Region tabs */}
        <div className="tab-scroll" style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch",marginBottom:20,justifyContent:"flex-start"}}>
          {TABS.map(tab => (
            <div key={tab.id} style={{position:"relative",flexShrink:0}}>
              <button
                onClick={() => { setActiveTab(tab.id); setTooltip(null); }}
                style={{
                  background: activeTab===tab.id ? "#007AFF" : "#fff",
                  color: activeTab===tab.id ? "white" : "#636366",
                  border: activeTab===tab.id ? "none" : "1px solid #E5E5EA",
                  borderRadius:100, padding:"7px 14px", fontSize:12,
                  fontWeight: activeTab===tab.id ? 600 : 400,
                  cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                  whiteSpace:"nowrap",
                }}
              >
                {tab.flag} {tab.label}
              </button>
              <button
                onClick={() => setTooltip(tooltip===tab.id ? null : tab.id)}
                style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:"#AEAEB2",color:"white",border:"none",fontSize:9,cursor:"pointer",fontWeight:700,lineHeight:"16px",display:"flex",alignItems:"center",justifyContent:"center"}}
              >i</button>
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div style={{background:"#1C1C2E",color:"white",borderRadius:12,padding:"10px 14px",fontSize:13,marginBottom:16,textAlign:"left",lineHeight:1.5}}>
            <strong style={{color:"#007AFF"}}>{TABS.find(t=>t.id===tooltip)?.flag} {TABS.find(t=>t.id===tooltip)?.label}:</strong><br/>
            {TABS.find(t=>t.id===tooltip)?.who}
          </div>
        )}

        {/* CTA button */}
        <div style={{maxWidth:440,margin:"0 auto"}}>
          <button style={{width:"100%",background:"#007AFF",color:"#fff",border:"none",borderRadius:22,padding:"22px 32px",cursor:"pointer",boxShadow:"0 10px 36px rgba(0,122,255,.4)",fontFamily:"'DM Sans',sans-serif"}} onClick={soundAlarm}>
            <span style={{fontSize:32,display:"block",marginBottom:8}}>📣</span>
            <span style={{fontSize:20,fontWeight:700,letterSpacing:-0.4,display:"block",lineHeight:1.2}}>Sound the Alarm!</span>
            <span style={{fontSize:13,opacity:.82,display:"block",marginTop:5}}>
              Fact-checking: {activeTabObj.flag} {activeTabObj.label}
            </span>
          </button>
        </div>
      </div>

      <div style={{maxWidth:500,margin:"0 auto",padding:"18px 16px 0"}}>

        {/* Yesterday's score */}
        {yesterday && (
          <div style={{background:"#E8F1FF",border:"1px solid #B5D4F4",borderRadius:20,padding:20,marginBottom:14,animation:"fadeUp .4s ease both"}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#5A8FC4",marginBottom:4}}>Latest Score · {yesterday.region ? TABS.find(t=>t.id===yesterday.region)?.label || yesterday.region : "Global"}</div>
                <div style={{fontSize:11,color:"#6B9FD4",marginBottom:6}}>{yesterday.date}</div>
                <div style={{fontSize:13,fontFamily:"'DM Serif Display',serif",fontStyle:"italic",color:"#185FA5",lineHeight:1.4}}>"{yesterday.summary}"</div>
              </div>
              <div style={{textAlign:"center",flexShrink:0,marginLeft:12}}>
                <div style={{fontFamily:"'DM Serif Display',serif",fontSize:50,lineHeight:1,color:gradeColor(yesterday.grade||yesterday.dailyGrade)}}>{yesterday.grade||yesterday.dailyGrade||"?"}</div>
                <div style={{fontSize:11,color:"#5A8FC4"}}>{yesterday.score}/100</div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly chart */}
        {weekHistory.length > 0 && (
          <div style={{background:"#fff",borderRadius:20,padding:18,marginBottom:14,boxShadow:"0 4px 24px rgba(0,0,0,.07)",animation:"fadeUp .4s .1s ease both"}}>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:2}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:17}}>Recent Scores</div>
              <Link href="/history" style={{fontSize:12,color:"#007AFF",fontWeight:500,textDecoration:"none"}}>Full history →</Link>
            </div>
            <div style={{fontSize:11,color:"#AEAEB2",marginBottom:12}}>Last {weekHistory.length} checks · Tap for full history</div>
            <div style={{display:"flex",alignItems:"flex-end",gap:6,height:72,marginBottom:10}}>
              {weekHistory.map((h,i) => {
                const pct = Math.max(6, h.score||0);
                const col = (h.score||0)>=60?"#34C759":(h.score||0)>=40?"#FF9500":"#FF3B30";
                const g = h.grade||h.dailyGrade||"?";
                const flag = TABS.find(t=>t.id===h.region)?.flag || "🌍";
                return (
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",height:"100%"}}>
                    <div style={{fontSize:8,color:col,marginBottom:2,fontWeight:600}}>{g}</div>
                    <div style={{width:"100%",background:col,borderRadius:"3px 3px 0 0",height:`${pct}%`,opacity:.85}}/>
                    <div style={{fontSize:9,color:"#AEAEB2",marginTop:3}}>{flag}</div>
                  </div>
                );
              })}
            </div>
            <Link href="/history" style={{display:"block",background:"#F2F2F7",borderRadius:100,padding:"9px 14px",textAlign:"center",fontSize:12,color:"#007AFF",fontWeight:500,textDecoration:"none"}}>
              📈 View full 30-day history
            </Link>
          </div>
        )}

        {/* Share */}
        <div style={{background:"#007AFF",borderRadius:16,padding:"16px",textAlign:"center",marginBottom:16,boxShadow:"0 4px 16px rgba(0,122,255,.28)"}}>
          <div style={{fontSize:15,fontWeight:600,color:"white"}}>🔗 Share Making Accuracy Great Again</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginTop:3}}>Because someone has to.</div>
        </div>

        <div style={{textAlign:"center",fontSize:12,color:"#AEAEB2",lineHeight:1.6}}>
          Non-partisan · Equal scrutiny for all leaders · Updated daily<br/>
          <strong style={{color:"#1C1C1E"}}>maga.news</strong> — coming soon
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay: { minHeight:"100vh", background:"rgba(242,242,247,.98)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, fontFamily:"'DM Sans',-apple-system,sans-serif" },
  spinner: { width:52, height:52, border:"3px solid #E5E5EA", borderTopColor:"#007AFF", borderRadius:"50%", animation:"spin .75s linear infinite" },
  ovTitle: { fontFamily:"'DM Serif Display',serif", fontSize:24, color:"#1C1C1E" },
  ovQuip:  { fontSize:15, color:"#636366", fontStyle:"italic", textAlign:"center", maxWidth:280, lineHeight:1.5 },
  rHeader: { background:"rgba(255,255,255,.95)", borderBottom:"1px solid #E5E5EA", padding:"44px 22px 20px", position:"sticky", top:0, zIndex:10, backdropFilter:"blur(20px)", fontFamily:"'DM Sans',-apple-system,sans-serif" },
  backBtn: { display:"inline-flex", alignItems:"center", gap:6, background:"none", border:"none", color:"#007AFF", fontFamily:"'DM Sans',sans-serif", fontSize:17, cursor:"pointer", marginBottom:16, padding:0 },
  shareBtn:{ background:"#F2F2F7", border:"1px solid #E5E5EA", borderRadius:100, padding:"8px 16px", fontSize:13, fontWeight:600, color:"#1C1C1E", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  body:    { maxWidth:760, margin:"0 auto", padding:"26px 18px 70px", fontFamily:"'DM Sans',-apple-system,sans-serif" },
  btn:     { width:"100%", border:"none", borderRadius:12, padding:17, fontFamily:"'DM Sans',sans-serif", fontSize:16, fontWeight:600, cursor:"pointer", display:"block" },
};
