import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

const gradeColor = (g) => {
  if (!g) return "#AEAEB2";
  const l = g[0];
  if (l === "A") return "#34C759";
  if (l === "B") return "#30D158";
  if (l === "C") return "#FF9500";
  if (l === "D") return "#FF6B00";
  return "#FF3B30";
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/factcheck").then(r => r.json()).then(d => {
      setHistory(d.history || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const avg = history.length ? Math.round(history.reduce((a,h) => a + (h.score||0), 0) / history.length) : 0;
  const trend = history.length >= 2 ? history[history.length-1].score - history[0].score : 0;
  const maxScore = Math.max(...history.map(h => h.score || 0), 1);

  return (
    <div style={{ background:"#F2F2F7", minHeight:"100vh", paddingBottom:60, fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <Head>
        <title>Fact Trumpet — Honesty History</title>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet"/>
      </Head>

      {/* Header */}
      <div style={{ background:"rgba(255,255,255,.95)", borderBottom:"1px solid #E5E5EA", padding:"54px 22px 20px", position:"sticky", top:0, zIndex:10, backdropFilter:"blur(20px)" }}>
        <Link href="/" style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#007AFF", fontSize:17, textDecoration:"none", marginBottom:16 }}>← Back</Link>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:30, letterSpacing:-0.3 }}>
          Honesty <span style={{ color:"#007AFF" }}>History</span>
        </div>
        <div style={{ fontSize:13, color:"#AEAEB2", marginTop:3 }}>Trump's daily truth score over time</div>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"26px 18px" }}>

        {loading && (
          <div style={{ textAlign:"center", padding:60, color:"#AEAEB2", fontStyle:"italic" }}>Loading history…</div>
        )}

        {!loading && history.length === 0 && (
          <div style={{ background:"#fff", borderRadius:20, padding:40, textAlign:"center", boxShadow:"0 4px 24px rgba(0,0,0,.07)" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, marginBottom:8 }}>No history yet</div>
            <div style={{ fontSize:14, color:"#636366", marginBottom:24 }}>Hit the trumpet a few times and your history will appear here</div>
            <Link href="/" style={{ background:"#007AFF", color:"#fff", borderRadius:12, padding:"14px 28px", textDecoration:"none", fontWeight:600, fontSize:15 }}>
              🎺 Go fact-check
            </Link>
          </div>
        )}

        {!loading && history.length > 0 && (
          <>
            {/* Summary stats */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20, animation:"fadeUp .4s ease both" }}>
              {[
                { label:"Days Tracked", val: history.length, col:"#007AFF" },
                { label:"Avg Score", val: `${avg}/100`, col: avg >= 60 ? "#34C759" : avg >= 40 ? "#FF9500" : "#FF3B30" },
                { label:"Trend", val: trend > 0 ? `📈 +${trend}` : trend < 0 ? `📉 ${trend}` : "➡️ Flat", col: trend > 0 ? "#34C759" : trend < 0 ? "#FF3B30" : "#AEAEB2" },
              ].map((s,i) => (
                <div key={i} style={{ background:"#fff", borderRadius:12, padding:"16px 12px", textAlign:"center", boxShadow:"0 4px 24px rgba(0,0,0,.07)" }}>
                  <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:s.col, lineHeight:1, marginBottom:4 }}>{s.val}</div>
                  <div style={{ fontSize:11, fontWeight:600, letterSpacing:1.2, textTransform:"uppercase", color:"#AEAEB2" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div style={{ background:"#fff", borderRadius:20, padding:22, marginBottom:20, boxShadow:"0 4px 24px rgba(0,0,0,.07)", animation:"fadeUp .4s .06s ease both" }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:2, textTransform:"uppercase", color:"#AEAEB2", marginBottom:16 }}>Score Chart</div>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:21, marginBottom:20 }}>Daily Honesty Score</div>

              {/* Y-axis labels + bars */}
              <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:160, paddingBottom:24, position:"relative" }}>
                {/* Y labels */}
                <div style={{ display:"flex", flexDirection:"column", justifyContent:"space-between", height:"100%", paddingBottom:0, marginRight:4 }}>
                  {[100,75,50,25,0].map(n => (
                    <div key={n} style={{ fontSize:10, color:"#AEAEB2", lineHeight:1 }}>{n}</div>
                  ))}
                </div>
                {/* Grid lines */}
                <div style={{ position:"absolute", left:28, right:0, top:0, bottom:24, pointerEvents:"none" }}>
                  {[0,25,50,75,100].map((n,i) => (
                    <div key={n} style={{ position:"absolute", left:0, right:0, bottom:`${n}%`, borderTop:"1px solid #F2F2F7" }}/>
                  ))}
                </div>
                {/* Bars */}
                <div style={{ display:"flex", alignItems:"flex-end", gap:4, flex:1, height:"100%", paddingBottom:0 }}>
                  {history.map((h, i) => {
                    const pct = Math.max(4, (h.score || 0));
                    const col = h.score >= 60 ? "#34C759" : h.score >= 40 ? "#FF9500" : "#FF3B30";
                    const dateLabel = h.date ? h.date.slice(5) : "";
                    return (
                      <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", height:"100%" }}>
                        <div style={{ fontSize:10, color:"#AEAEB2", marginBottom:3, fontWeight:600 }}>{h.dailyGrade || gradeColor(h.grade)}</div>
                        <div style={{ width:"100%", background:col, borderRadius:"4px 4px 0 0", height:`${pct}%`, minHeight:4, transition:"height .6s ease", opacity:0.85 }}/>
                        <div style={{ fontSize:9, color:"#AEAEB2", marginTop:4, transform:"rotate(-45deg)", transformOrigin:"top left", whiteSpace:"nowrap", marginLeft:6 }}>{dateLabel}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div style={{ display:"flex", gap:16, marginTop:8, flexWrap:"wrap" }}>
                {[{col:"#34C759",l:"60-100: Mostly True"},{col:"#FF9500",l:"40-59: Mixed"},{col:"#FF3B30",l:"0-39: Mostly False"}]
                  .map((s,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#636366" }}>
                      <div style={{ width:10, height:10, borderRadius:2, background:s.col }}/>{s.l}
                    </div>
                  ))}
              </div>
            </div>

            {/* History list */}
            <div style={{ animation:"fadeUp .4s .12s ease both" }}>
              <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:24, marginBottom:14 }}>Daily Breakdown</div>
              {history.slice().reverse().map((h, i) => {
                const col = gradeColor(h.grade || h.dailyGrade);
                return (
                  <div key={i} style={{ background:"#fff", borderRadius:16, padding:"16px 18px", marginBottom:10, boxShadow:"0 4px 24px rgba(0,0,0,.07)", display:"flex", alignItems:"center", gap:16 }}>
                    <div style={{ flexShrink:0, width:56, height:56, borderRadius:"50%", border:`3px solid ${col}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:col }}>
                      <span style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, lineHeight:1 }}>{h.grade || h.dailyGrade || "?"}</span>
                      <span style={{ fontSize:9, opacity:.65 }}>{h.score}/100</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color:"#AEAEB2", fontWeight:500, marginBottom:3 }}>{h.date}</div>
                      <div style={{ fontSize:14, color:"#3A3A3C", fontStyle:"italic", lineHeight:1.4 }}>{h.summary}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
