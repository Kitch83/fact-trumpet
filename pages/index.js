import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Link from "next/link";

const TrumpHead = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="40" fill="#FFE0B2"/>
    <path d="M13 30C11 15 24 5 40 7C56 5 69 15 67 30C62 19 50 16 40 17C30 17 18 19 13 30Z" fill="#F2C240"/>
    <path d="M13 30C9 34 10 40 14 37C12 42 15 44 17 42C15 48 20 48 22 45" fill="#F2C240"/>
    <path d="M20 32C20 24 28 18 40 18C52 18 60 24 60 32L60 50C60 60 51 68 40 68C29 68 20 60 20 50Z" fill="#FFCBAA"/>
    <path d="M22 32C22 26 29 21 40 21C51 21 58 26 58 32L58 36C48 33 32 33 22 36Z" fill="#FFB07A" opacity=".3"/>
    <ellipse cx="31" cy="39" rx="4" ry="3.5" fill="#282828"/>
    <ellipse cx="49" cy="39" rx="4" ry="3.5" fill="#282828"/>
    <ellipse cx="32.2" cy="37.8" rx="1.4" ry="1.1" fill="white" opacity=".55"/>
    <ellipse cx="50.2" cy="37.8" rx="1.4" ry="1.1" fill="white" opacity=".55"/>
    <path d="M26 34C28.5 32 35 32 36.5 33.5" stroke="#B8780A" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M43.5 33.5C45 32 51.5 32 54 34" stroke="#B8780A" strokeWidth="2.2" strokeLinecap="round"/>
    <path d="M37 43L35 52C37 54 43 54 45 52L43 43Z" fill="#F0A875" stroke="#E09060" strokeWidth=".5"/>
    <path d="M30 58C33 56 47 56 50 58C47 62 33 62 30 58Z" fill="#C86644"/>
    <path d="M30 58C33 59.5 47 59.5 50 58" stroke="#AA4433" strokeWidth=".8"/>
    <ellipse cx="19" cy="44" rx="4.5" ry="6" fill="#FFCBAA"/>
    <ellipse cx="61" cy="44" rx="4.5" ry="6" fill="#FFCBAA"/>
    <path d="M35 68L37 71L40 80L43 71L45 68C43 66 37 66 35 68Z" fill="#CC2020"/>
    <path d="M37 71L40 80L43 71L41 73.5L39 73.5Z" fill="#AA0E0E"/>
  </svg>
);

const QUIPS = [
  "Searching today's news for Trump statements…",
  "Scanning speeches, rallies & Truth Social…",
  "Pulling the freshest headlines from news outlets…",
  "Cross-referencing claims with reality…",
  "Checking articles, press conferences & interviews…",
  "Fact-checkers working very hard right now…",
  "Almost done — calculating the daily score…",
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
  const [screen,  setScreen]  = useState("home");
  const [results, setResults] = useState(null);
  const [errMsg,  setErrMsg]  = useState("");
  const [quipIdx, setQuipIdx] = useState(0);
  const [streak,  setStreak]  = useState(0);
  const [shared,  setShared]  = useState(false);
  const quipTimer = useRef(null);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday:"long", month:"long", day:"numeric", year:"numeric"
  });
  const todayKey = new Date().toISOString().slice(0,10);

  // Load and update streak
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("ft_streak") || "{}");
      const last = data.lastVisit;
      const yesterday = new Date(Date.now()-864e5).toISOString().slice(0,10);
      if (last === todayKey) {
        setStreak(data.streak || 1);
      } else if (last === yesterday) {
        const newStreak = (data.streak || 0) + 1;
        setStreak(newStreak);
        localStorage.setItem("ft_streak", JSON.stringify({ streak: newStreak, lastVisit: todayKey }));
      } else {
        setStreak(1);
        localStorage.setItem("ft_streak", JSON.stringify({ streak: 1, lastVisit: todayKey }));
      }
    } catch(e) {}
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

  async function blowTrumpet() {
    setScreen("loading");
    setErrMsg("");
    setShared(false);
    try {
      const res = await fetch("/api/factcheck", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Server error");
      if (!data.data?.claims?.length) throw new Error("No claims returned");
      setResults(data.data);
      setScreen("results");
    } catch (ex) {
      setErrMsg(ex.message);
      setScreen("error");
    }
  }

  function handleShare() {
    const text = results?.shareText || `🎺 Today's Fact Trumpet Report: ${results?.summary}`;
    const url = "https://fact-trumpet.vercel.app";
    const fullText = `${text}\n\n${url}`;
    if (navigator.share) {
      navigator.share({ title: "The Fact Trumpet", text: fullText, url });
    } else {
      navigator.clipboard.writeText(fullText);
      setShared(true);
      setTimeout(() => setShared(false), 3000);
    }
  }

  const claims   = results?.claims || [];
  const cnt      = claims.reduce((a,c) => { a[c.verdict]=(a[c.verdict]||0)+1; return a; }, {TRUE:0,FALSE:0,MIXED:0,UNVERIFIED:0});
  const total    = Math.max(claims.length, 1);
  const score    = Math.min(10, Math.max(0, Math.round(+results?.contradictionScore || 0)));
  const scoreCol = score<=3?"#34C759":score<=6?"#FF9500":"#FF3B30";
  const grade    = results?.dailyGrade || "?";
  const gCol     = gradeColor(grade);

  if (screen === "loading") return (
    <div style={S.overlay}>
      <Head><title>Fact Trumpet — Loading…</title></Head>
      <div style={S.spinner}/>
      <div style={S.ovTitle}>Blowing the Trumpet…</div>
      <div style={S.ovQuip}>{QUIPS[quipIdx]}</div>
      <div style={{fontSize:12,color:"#AEAEB2",marginTop:4}}>Searching latest news — takes ~15 seconds</div>
    </div>
  );

  if (screen === "error") return (
    <div style={S.overlay}>
      <Head><title>Fact Trumpet</title></Head>
      <div style={{fontSize:48}}>🎺</div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:"#1C1C1E",marginBottom:8}}>Trumpet Jammed</div>
      <div style={{fontSize:14,color:"#636366",textAlign:"center",maxWidth:300,lineHeight:1.6,marginBottom:24}}>{errMsg}</div>
      <button style={S.againBtn} onClick={() => setScreen("home")}>Try Again</button>
    </div>
  );

  if (screen === "home") return (
    <div style={S.home}>
      <Head>
        <title>The Fact Trumpet — Daily Trump Fact Check</title>
        <meta name="description" content="Live daily fact-checking of Trump's speeches, rallies, Truth Social posts and interviews"/>
        <meta property="og:title" content="The Fact Trumpet"/>
        <meta property="og:description" content="Live daily fact-checking of Trump's statements"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>
      <div style={S.inner}>

        {/* Streak badge */}
        {streak > 1 && (
          <div style={S.streakBadge}>
            🔥 {streak} day streak — keep it up!
          </div>
        )}

        <div style={S.logoRow}>
          <div style={{filter:"drop-shadow(0 6px 18px rgba(0,0,0,.15))"}}>
            <TrumpHead size={82}/>
          </div>
          <div>
            <div style={S.eyebrowSm}>Daily Edition</div>
            <div style={S.logoName}>The Fact<br/><span style={{color:"#007AFF"}}>Trumpet</span></div>
          </div>
        </div>

        <p style={S.tagline}>"Making accuracy great again —<br/>one claim at a time"</p>

        <div style={S.datePill}>
          <div style={S.liveDot}/>{dateStr}
        </div>

        <button style={S.cta} onClick={blowTrumpet}>
          <span style={{fontSize:36,display:"block",marginBottom:10,animation:"toot 3s ease-in-out infinite"}}>🎺</span>
          <span style={{fontSize:24,fontWeight:700,letterSpacing:-0.4,display:"block",lineHeight:1.2}}>Blow the Trumpet!</span>
          <span style={{fontSize:14,opacity:.82,display:"block",marginTop:5}}>Live fact-check of Trump's latest statements</span>
        </button>

        <div style={S.note}>Speeches · Rallies · Truth Social · News · Non-partisan</div>
        <Link href="/history" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid #E5E5EA", borderRadius:100, padding:"8px 20px", fontSize:13, fontWeight:500, color:"#007AFF", textDecoration:"none", marginTop:16, boxShadow:"0 2px 12px rgba(0,0,0,.05)" }}>
          📈 View Honesty History
        </Link>

        {/* Bookmark prompt */}
        <div style={S.bookmarkBox}>
          <span style={{fontSize:20}}>📌</span>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"#1C1C1E",marginBottom:2}}>Check back every day</div>
            <div style={{fontSize:12,color:"#636366"}}>Bookmark this page for your daily dose of reality</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{background:"#F2F2F7",minHeight:"100vh",paddingBottom:70}}>
      <Head><title>Fact Trumpet — Today's Report</title></Head>

      <div style={S.rHeader}>
        <button style={S.backBtn} onClick={() => { setScreen("home"); setResults(null); }}>← Back</button>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <TrumpHead size={46}/>
            <div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,letterSpacing:-0.3}}>
                Fact <span style={{color:"#007AFF"}}>Report</span>
              </div>
              <div style={{fontSize:13,color:"#AEAEB2",marginTop:2,fontWeight:500}}>{dateStr}</div>
            </div>
          </div>
          {/* Share button in header */}
          <button style={S.shareBtn} onClick={handleShare}>
            {shared ? "✅ Copied!" : "🔗 Share"}
          </button>
        </div>
      </div>

      <div style={S.body}>

        {/* Daily Score Card */}
        <div style={{...S.card, animation:"fadeUp .4s ease both", background: `linear-gradient(135deg, #1C1C1E, #2C2C2E)`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div>
              <div style={{fontSize:11,fontWeight:600,letterSpacing:2,textTransform:"uppercase",color:"rgba(255,255,255,.5)",marginBottom:6}}>Today's Honesty Score</div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,fontStyle:"italic",color:"rgba(255,255,255,.8)",lineHeight:1.4,maxWidth:220}}>
                {results.summary}
              </div>
            </div>
            <div style={{flexShrink:0,textAlign:"center"}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:64,lineHeight:1,color:gCol,textShadow:`0 0 30px ${gCol}66`}}>{grade}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,.5)",marginTop:2}}>{results.dailyScore}/100</div>
            </div>
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.55)",fontStyle:"italic",lineHeight:1.5,borderTop:"1px solid rgba(255,255,255,.1)",paddingTop:12}}>
            {results.dailyScoreDesc}
          </div>
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
        <div style={{...S.card, animation:"fadeUp .4s .12s ease both"}}>
          <div style={S.eyebrow}>Honesty Breakdown</div>
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

        {/* Flip-Flop Index */}
        <div style={{...S.card, animation:"fadeUp .4s .18s ease both"}}>
          <div style={S.eyebrow}>Flip-Flop Index</div>
          <div style={{display:"flex",alignItems:"center",gap:22}}>
            <div style={{flexShrink:0,width:86,height:86,borderRadius:"50%",border:`4px solid ${scoreCol}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:scoreCol}}>
              <span style={{fontFamily:"'DM Serif Display',serif",fontSize:30,lineHeight:1}}>{score}</span>
              <span style={{fontSize:10,fontWeight:600,letterSpacing:1,textTransform:"uppercase",opacity:.65}}>/ 10</span>
            </div>
            <div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,fontStyle:"italic",marginBottom:6}}>{results.contradictionHeadline}</div>
              <div style={{fontSize:14,color:"#636366",lineHeight:1.65}}>{results.contradictionDesc}</div>
            </div>
          </div>
        </div>

        {/* Claims */}
        <div style={{animation:"fadeUp .4s .24s ease both"}}>
          <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:14}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24}}>What He Said</div>
            <span style={{background:"#E8F1FF",color:"#007AFF",fontSize:13,fontWeight:600,padding:"3px 11px",borderRadius:100}}>{claims.length} claims</span>
          </div>
          {claims.map((c,i) => {
            const vs = V[c.verdict]||V.UNVERIFIED;
            return (
              <div key={i} style={{background:"#fff",borderRadius:20,marginBottom:14,boxShadow:"0 4px 24px rgba(0,0,0,.07)",overflow:"hidden",animation:`fadeUp .4s ${i*.07}s ease both`}}>
                <div style={{padding:"18px 18px 0"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,padding:"5px 13px",borderRadius:100,background:vs.bg,color:vs.color}}>{vs.label}</span>
                    <span style={{fontSize:11,color:"#AEAEB2",fontWeight:500}}>{c.source}</span>
                  </div>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:17,lineHeight:1.55,paddingBottom:16,borderBottom:"1px solid #E5E5EA"}}>
                    "{c.quote}"
                  </div>
                </div>
                <div style={{padding:"14px 18px 18px",background:"#F9F9FB"}}>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:"#AEAEB2",marginBottom:7}}>The Real Tea ☕</div>
                  <div style={{fontSize:14,lineHeight:1.72,color:"#3A3A3C"}}>{c.explanation}</div>
                  <div style={{marginTop:12,background:"#fff",borderRadius:12,padding:"11px 14px",display:"flex",gap:10,alignItems:"flex-start",border:"1px solid #E5E5EA"}}>
                    <span style={{fontSize:17,flexShrink:0,marginTop:1}}>🎺</span>
                    <span style={{fontSize:13,fontStyle:"italic",color:"#636366",lineHeight:1.6}}>{c.quip}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sources */}
        <div style={{...S.card, animation:"fadeUp .4s .30s ease both"}}>
          <div style={S.eyebrow}>Receipts 🧾</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:21,marginBottom:14}}>Checked Against</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {(results.sources||[]).map((s,i) => (
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

        {/* Share + come back tomorrow */}
        <div style={{...S.card, animation:"fadeUp .4s .36s ease both", textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>📣</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:18,marginBottom:6}}>Share today's report</div>
          <div style={{fontSize:13,color:"#636366",marginBottom:16,lineHeight:1.5}}>
            {results.shareText}
          </div>
          <button style={{...S.againBtn, marginTop:0, marginBottom:12}} onClick={handleShare}>
            {shared ? "✅ Copied to clipboard!" : "🔗 Share The Fact Trumpet"}
          </button>
          <div style={{fontSize:12,color:"#AEAEB2"}}>New fact-check every day · Bookmark fact-trumpet.vercel.app</div>
        </div>

        <button style={{...S.againBtn, background:"#F2F2F7", color:"#007AFF", boxShadow:"none", border:"1px solid #E5E5EA"}}
          onClick={() => { setScreen("home"); setResults(null); }}>
          ← Check Again
        </button>

      </div>
    </div>
  );
}

const S = {
  home:        { background:"linear-gradient(155deg,#FAFAFA,#EEEFF5)", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px" },
  inner:       { maxWidth:440, width:"100%", textAlign:"center" },
  streakBadge: { display:"inline-flex", alignItems:"center", gap:6, background:"linear-gradient(135deg,#FF9500,#FF6B00)", color:"white", fontSize:13, fontWeight:600, padding:"6px 16px", borderRadius:100, marginBottom:24, boxShadow:"0 4px 12px rgba(255,149,0,.3)" },
  logoRow:     { display:"flex", alignItems:"center", justifyContent:"center", gap:20, marginBottom:14 },
  eyebrowSm:   { fontSize:11, fontWeight:500, letterSpacing:3, textTransform:"uppercase", color:"#AEAEB2", marginBottom:3 },
  logoName:    { fontFamily:"'DM Serif Display',Georgia,serif", fontSize:40, lineHeight:1, letterSpacing:-0.5, color:"#1C1C1E" },
  tagline:     { fontSize:16, fontWeight:300, color:"#636366", fontStyle:"italic", lineHeight:1.65, margin:"10px 0 36px" },
  datePill:    { display:"inline-flex", alignItems:"center", gap:8, background:"#fff", border:"1px solid #E5E5EA", borderRadius:100, padding:"7px 18px", fontSize:13, fontWeight:500, color:"#636366", marginBottom:40, boxShadow:"0 4px 24px rgba(0,0,0,.07)" },
  liveDot:     { width:7, height:7, borderRadius:"50%", background:"#34C759", animation:"pulse 2s ease-in-out infinite" },
  cta:         { width:"100%", background:"#007AFF", color:"#fff", border:"none", borderRadius:22, padding:"26px 32px", cursor:"pointer", marginBottom:18, boxShadow:"0 10px 40px rgba(0,122,255,.38)", fontFamily:"'DM Sans',sans-serif" },
  note:        { fontSize:12, color:"#AEAEB2", lineHeight:1.6, marginBottom:24 },
  bookmarkBox: { display:"flex", alignItems:"center", gap:12, background:"white", border:"1px solid #E5E5EA", borderRadius:16, padding:"14px 16px", textAlign:"left", boxShadow:"0 2px 12px rgba(0,0,0,.05)" },
  overlay:     { minHeight:"100vh", background:"rgba(242,242,247,.98)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 },
  spinner:     { width:52, height:52, border:"3px solid #E5E5EA", borderTopColor:"#007AFF", borderRadius:"50%", animation:"spin .75s linear infinite" },
  ovTitle:     { fontFamily:"'DM Serif Display',serif", fontSize:24, color:"#1C1C1E" },
  ovQuip:      { fontSize:15, color:"#636366", fontStyle:"italic", textAlign:"center", maxWidth:280, lineHeight:1.5 },
  rHeader:     { background:"rgba(255,255,255,.95)", borderBottom:"1px solid #E5E5EA", padding:"40px 22px 20px", position:"sticky", top:0, zIndex:10, backdropFilter:"blur(20px)" },
  backBtn:     { display:"inline-flex", alignItems:"center", gap:6, background:"none", border:"none", color:"#007AFF", fontFamily:"'DM Sans',sans-serif", fontSize:17, cursor:"pointer", marginBottom:16, padding:0 },
  shareBtn:    { background:"#F2F2F7", border:"1px solid #E5E5EA", borderRadius:100, padding:"8px 16px", fontSize:13, fontWeight:600, color:"#1C1C1E", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" },
  body:        { maxWidth:760, margin:"0 auto", padding:"26px 18px 70px" },
  card:        { background:"#fff", borderRadius:20, padding:22, marginBottom:20, boxShadow:"0 4px 24px rgba(0,0,0,.07)" },
  eyebrow:     { fontSize:11, fontWeight:600, letterSpacing:2, textTransform:"uppercase", color:"#AEAEB2", marginBottom:10 },
  againBtn:    { width:"100%", background:"#007AFF", color:"#fff", border:"none", borderRadius:12, padding:17, fontFamily:"'DM Sans',sans-serif", fontSize:16, fontWeight:600, cursor:"pointer", marginTop:6, boxShadow:"0 4px 16px rgba(0,122,255,.28)" },
};
