import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { getIllustration } from "./illustrations";

const V = {
  TRUE:       { bg:"#E8F9ED", color:"#1a7a35", label:"✅ True",       short:"TRUE"  },
  FALSE:      { bg:"#FFF0EF", color:"#CC0000", label:"❌ False",      short:"FALSE" },
  MIXED:      { bg:"#FFF4E5", color:"#8B4800", label:"🤔 Mixed",      short:"MIXED" },
  UNVERIFIED: { bg:"#F5F5F5", color:"#555555", label:"❓ Unverified", short:"UNVERIFIED" },
};

const CONF_LABELS = { 5:"Very High", 4:"High", 3:"Medium", 2:"Low", 1:"Very Low" };
const CONF_COLORS = { 5:"#1a7a35", 4:"#1a7a35", 3:"#8B4800", 2:"#CC0000", 1:"#CC0000" };

const gradeColor = g => {
  if (!g) return "#999";
  const l = g[0];
  if (l==="A") return "#1a7a35";
  if (l==="B") return "#2d7a2d";
  if (l==="C") return "#8B4800";
  if (l==="D") return "#CC3300";
  return "#CC0000";
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#F5F0E8; font-family:'DM Sans',sans-serif; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
  .divider { height:1px; background:#1A1A1A; }
  .divider-thin { height:0.5px; background:#CCC; }
  .divider-double { border-top:3px double #1A1A1A; }
  .article-link { cursor:pointer; }
  .article-link:hover { opacity:0.75; }
  .bubble-grey { background:#EDEDED; border-radius:14px 14px 14px 3px; padding:12px 14px; position:relative; margin-bottom:16px; }
  .bubble-grey::after { content:''; position:absolute; bottom:-8px; left:14px; border-left:8px solid transparent; border-right:3px solid transparent; border-top:9px solid #EDEDED; }
  .bubble-red { background:#CC0000; border-radius:14px 14px 3px 14px; padding:12px 14px; position:relative; margin-bottom:8px; }
  .bubble-red::after { content:''; position:absolute; bottom:-8px; right:14px; border-left:3px solid transparent; border-right:8px solid transparent; border-top:9px solid #CC0000; }
`;

const BUILD_MSGS = [
  "Scanning today's White House briefings…",
  "Reading Trump's Truth Social posts…",
  "Cross-referencing with actual facts…",
  "Checking the Pentagon's claims…",
  "Consulting the historical record…",
  "Calculating today's honesty score…",
  "Building your daily newspaper…",
];

export default function Home() {
  const [paper,    setPaper]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [building, setBuilding] = useState(false);
  const [article,  setArticle]  = useState(null);
  const [msgIdx,   setMsgIdx]   = useState(0);
  const timer = useRef(null);

  useEffect(() => { loadPaper(); }, []);

  async function loadPaper() {
    setLoading(true);
    try {
      const r = await fetch("/api/newspaper");
      const d = await r.json();
      if (d.ok && d.data) { setPaper(d.data); setLoading(false); }
      else { await buildPaper(); }
    } catch(e) { await buildPaper(); }
  }

  async function buildPaper() {
    setBuilding(true); setLoading(true);
    let i=0;
    timer.current = setInterval(()=>{ i=(i+1)%BUILD_MSGS.length; setMsgIdx(i); }, 3500);
    try {
      const r = await fetch("/api/newspaper", { method:"POST" });
      const d = await r.json();
      if (d.ok && d.data) setPaper(d.data);
    } catch(e) {}
    clearInterval(timer.current);
    setBuilding(false); setLoading(false);
  }

  // ── ARTICLE VIEW ──
  if (article) {
    const c = article;
    const vs = V[c.verdict]||V.UNVERIFIED;
    const conf = c.confidenceScore||3;
    return (
      <div style={{background:"#F5F0E8",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif"}}>
        <style>{css}</style>
        <Head><title>{c.headline} — The Daily Reckoning</title></Head>
        <div style={{maxWidth:680,margin:"0 auto",background:"#FDFCF8",borderLeft:"0.5px solid #DDD",borderRight:"0.5px solid #DDD",minHeight:"100vh"}}>

          {/* Back header */}
          <div style={{borderBottom:"3px solid #1A1A1A",padding:"32px 20px 14px",background:"#FDFCF8",position:"sticky",top:0,zIndex:10}}>
            <button onClick={()=>setArticle(null)} style={{background:"none",border:"none",color:"#CC0000",fontSize:13,fontWeight:600,cursor:"pointer",padding:0,marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>← Back to Today's Paper</button>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:"#1A1A1A"}}>The Daily <span style={{color:"#CC0000"}}>Reckoning</span></div>
          </div>

          <div style={{padding:"24px 20px"}}>

            {/* Verdict + Confidence */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,paddingBottom:14,borderBottom:"2px solid #F0F0F0"}}>
              <span style={{fontSize:12,fontWeight:700,padding:"5px 12px",background:vs.bg,color:vs.color,fontFamily:"'DM Sans',sans-serif"}}>{vs.label}</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:10,color:"#888",fontFamily:"'DM Sans',sans-serif"}}>Confidence</span>
                <div style={{display:"flex",gap:2}}>
                  {[1,2,3,4,5].map(n=>(
                    <div key={n} style={{width:4,height:12,background:n<=conf?(CONF_COLORS[conf]||"#8B4800"):"#E0E0E0"}}/>
                  ))}
                </div>
                <span style={{fontSize:10,color:CONF_COLORS[conf]||"#8B4800",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{CONF_LABELS[conf]||"Medium"}</span>
              </div>
            </div>

            {/* Headline */}
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:900,color:"#1A1A1A",lineHeight:1.1,marginBottom:10}}>{c.headline}</div>
            {c.deck&&<div style={{fontFamily:"'Source Serif 4',serif",fontSize:15,color:"#444",lineHeight:1.55,marginBottom:10}}>{c.deck}</div>}
            <div style={{fontSize:10,color:"#888",letterSpacing:1,textTransform:"uppercase",fontFamily:"'DM Sans',sans-serif",marginBottom:16}}>By Making Accuracy Great Again</div>

            <div className="divider-thin" style={{marginBottom:16}}/>

            {/* Illustration */}
            <div style={{marginBottom:16,border:"0.5px solid #E8E8E0"}} dangerouslySetInnerHTML={{__html:getIllustration(c.headline,c.verdict)}}/>

            {/* Who */}
            <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12,paddingBottom:12,borderBottom:"0.5px solid #E8E8E8"}}>
              <span style={{fontSize:22,flexShrink:0}}>🇺🇸</span>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:"#1A1A1A",fontFamily:"'DM Sans',sans-serif",marginBottom:3}}>{c.who}</div>
                {c.fullDate&&<div style={{fontSize:11,color:"#888",marginBottom:2}}>📅 {c.fullDate}</div>}
                {c.location&&<div style={{fontSize:11,color:"#888"}}>📍 {c.location}</div>}
              </div>
            </div>

            {/* Quote */}
            <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:20,color:"#1A1A1A",lineHeight:1.5,marginBottom:12,paddingBottom:12,borderBottom:"0.5px solid #EEE"}}>
              "{c.quote}"
            </div>

            {/* Context */}
            {c.context&&(
              <div style={{borderLeft:"3px solid #CC0000",paddingLeft:12,marginBottom:16,fontFamily:"'Source Serif 4',serif",fontSize:13,color:"#555",lineHeight:1.6,fontStyle:"italic"}}>{c.context}</div>
            )}

            {/* Body text */}
            {c.bodyText&&(
              <div style={{fontFamily:"'Source Serif 4',serif",fontSize:14,color:"#333",lineHeight:1.75,marginBottom:16}}>{c.bodyText}</div>
            )}

            {/* Reality Check */}
            <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600,marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Reality Check 🔍</div>
            <div className="bubble-grey">
              <div style={{fontFamily:"'Source Serif 4',serif",fontSize:13,color:"#333",lineHeight:1.7}}>{c.explanation}</div>
            </div>

            {/* Our Take */}
            <div style={{fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:600,marginBottom:8,textAlign:"right",fontFamily:"'DM Sans',sans-serif"}}>📣 Our Take</div>
            <div className="bubble-red">
              <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                <span style={{fontSize:14,flexShrink:0}}>📣</span>
                <span style={{fontFamily:"'Source Serif 4',serif",fontStyle:"italic",fontSize:13,color:"white",lineHeight:1.6}}>{c.quip}</span>
              </div>
            </div>

            {/* Source */}
            {(c.sourceUrl||c.sourceName)&&(
              <div style={{display:"flex",alignItems:"center",gap:8,paddingTop:12,borderTop:"0.5px solid #E8E8E8",marginTop:8}}>
                <span style={{fontSize:10,color:"#888",fontWeight:700,letterSpacing:1,fontFamily:"'DM Sans',sans-serif"}}>SOURCE</span>
                {c.sourceUrl
                  ? <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:"#CC0000",fontWeight:600,textDecoration:"none",fontFamily:"'DM Sans',sans-serif"}}>{c.sourceName||c.sourceUrl} →</a>
                  : <span style={{fontSize:12,color:"#CC0000",fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>{c.sourceName}</span>
                }
              </div>
            )}

            <button onClick={()=>setArticle(null)} style={{marginTop:24,width:"100%",background:"#F5F0E8",border:"1px solid #CCC",padding:14,fontSize:13,fontWeight:600,cursor:"pointer",color:"#555",fontFamily:"'DM Sans',sans-serif"}}>
              ← Back to Today's Paper
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING ──
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#F5F0E8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,fontFamily:"'DM Sans',sans-serif",padding:40}}>
      <style>{css}</style>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:48,fontWeight:900,color:"#1A1A1A",textAlign:"center",lineHeight:1}}>The Daily<br/><span style={{color:"#CC0000"}}>Reckoning</span></div>
      {building&&<div style={{fontFamily:"'Source Serif 4',serif",fontStyle:"italic",fontSize:15,color:"#666",textAlign:"center",maxWidth:300,lineHeight:1.6,animation:"pulse 2s ease infinite"}}>{BUILD_MSGS[msgIdx]}</div>}
      {building&&<div style={{fontSize:11,color:"#999",textAlign:"center"}}>Building today's edition. Takes about 30 seconds.</div>}
      <div style={{width:36,height:36,border:"2px solid #DDD",borderTopColor:"#CC0000",borderRadius:"50%",animation:"spin .75s linear infinite"}}/>
    </div>
  );

  // ── NO PAPER ──
  if (!paper) return (
    <div style={{minHeight:"100vh",background:"#F5F0E8",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'DM Sans',sans-serif",padding:40}}>
      <style>{css}</style>
      <div style={{fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:900,color:"#1A1A1A"}}>The Daily <span style={{color:"#CC0000"}}>Reckoning</span></div>
      <div style={{fontFamily:"'Source Serif 4',serif",fontStyle:"italic",fontSize:14,color:"#666"}}>Today's edition not yet published.</div>
      <button onClick={buildPaper} style={{background:"#CC0000",color:"white",border:"none",padding:"14px 28px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
        Publish Today's Edition
      </button>
    </div>
  );

  const lead = paper.leadStory;
  const sidebar = paper.sidebarStory;
  const columns = paper.columns||[];
  const leadVs = V[lead?.verdict]||V.UNVERIFIED;
  const sideVs = V[sidebar?.verdict]||V.UNVERIFIED;
  const gCol = gradeColor(paper.overallGrade);

  return (
    <div style={{background:"#F5F0E8",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif"}}>
      <style>{css}</style>
      <Head>
        <title>The Daily Reckoning — {paper.editionDate}</title>
        <meta name="description" content="Daily US fact-check newspaper. Because someone has to."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>

      <div style={{maxWidth:680,margin:"0 auto",background:"#FDFCF8",borderLeft:"0.5px solid #DDD",borderRight:"0.5px solid #DDD",minHeight:"100vh",animation:"fadeIn .4s ease both"}}>

        {/* TOP BAR */}
        <div style={{background:"#1A1A1A",padding:"5px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{fontSize:9,letterSpacing:2,color:"#666",textTransform:"uppercase"}}>Est. 2026</div>
          <div style={{fontSize:9,letterSpacing:2,color:"#666",textTransform:"uppercase"}}>Non-Partisan · Daily · US Edition</div>
          <div style={{fontSize:9,letterSpacing:2,color:"#666",textTransform:"uppercase"}}>maga.news</div>
        </div>

        {/* MASTHEAD */}
        <div style={{padding:"18px 20px 12px",textAlign:"center",borderBottom:"3px solid #1A1A1A"}}>
          <div style={{fontSize:10,letterSpacing:5,color:"#999",textTransform:"uppercase",marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>Making Accuracy Great Again</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:window?.innerWidth<400?48:64,fontWeight:900,color:"#1A1A1A",lineHeight:0.95,letterSpacing:-2,marginBottom:8}}>THE DAILY<br/><span style={{color:"#CC0000"}}>RECKONING</span></div>
          <div style={{fontFamily:"'Source Serif 4',serif",fontStyle:"italic",fontSize:12,color:"#888",marginBottom:12}}>"Because someone has to."</div>
          <div className="divider-double"/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",fontFamily:"'DM Sans',sans-serif"}}>
            <div style={{fontSize:10,color:"#666"}}>{paper.editionDate}</div>
            <div style={{fontSize:10,color:"#CC0000",fontWeight:700,letterSpacing:0.5}}>TODAY'S GRADE: {paper.overallGrade} · {paper.overallScore}/100</div>
            <div style={{fontSize:10,color:"#666"}}>US Edition</div>
          </div>
          <div className="divider"/>
        </div>

        {/* MAIN STORY + SIDEBAR */}
        <div style={{padding:"20px",display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:20,borderBottom:"1px solid #1A1A1A"}}>

          {/* LEAD STORY */}
          <div style={{borderRight:"0.5px solid #CCC",paddingRight:20}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:700,marginBottom:8}}>Today's Most Notable Claim · 🇺🇸 US & Allies</div>
            <div className="article-link" onClick={()=>setArticle(lead)}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:"#1A1A1A",lineHeight:1.1,marginBottom:8}}>{lead.headline}</div>
              {lead.deck&&<div style={{fontFamily:"'Source Serif 4',serif",fontSize:13,color:"#444",lineHeight:1.55,marginBottom:6}}>{lead.deck}</div>}
            </div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#888",letterSpacing:1,textTransform:"uppercase",marginBottom:12}}>By Making Accuracy Great Again · {lead.fullDate||paper.editionDate}</div>
            <div className="divider-thin" style={{marginBottom:12}}/>

            {/* Illustration */}
            <div style={{marginBottom:14,border:"0.5px solid #E8E8E0"}} dangerouslySetInnerHTML={{__html:getIllustration(lead.headline,lead.verdict)}}/>

            {/* Context strip */}
            {lead.context&&(
              <div style={{borderLeft:"3px solid #CC0000",paddingLeft:10,marginBottom:12,fontFamily:"'Source Serif 4',serif",fontStyle:"italic",fontSize:12,color:"#666",lineHeight:1.5}}>{lead.context}</div>
            )}

            {/* Pull quote */}
            <div style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:17,color:"#1A1A1A",lineHeight:1.45,borderLeft:"3px solid #1A1A1A",paddingLeft:14,marginBottom:12}}>"{lead.quote}"</div>

            {/* Body */}
            {lead.bodyText&&(
              <div style={{fontFamily:"'Source Serif 4',serif",fontSize:13,color:"#333",lineHeight:1.75,marginBottom:12}}>{lead.bodyText}</div>
            )}

            {/* Verdict */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,padding:"3px 10px",background:leadVs.bg,color:leadVs.color}}>{leadVs.label}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:"#888"}}>Confidence: {["","░","▒","▓","█","██"][lead.confidenceScore||3]}</span>
            </div>

            {/* Our Take */}
            <div style={{background:"#1A1A1A",padding:"10px 12px",borderLeft:"3px solid #CC0000",marginBottom:10}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,letterSpacing:2,color:"#CC0000",textTransform:"uppercase",marginBottom:4}}>📣 Our Take</div>
              <div style={{fontFamily:"'Source Serif 4',serif",fontStyle:"italic",fontSize:12,color:"rgba(255,255,255,.85)",lineHeight:1.5}}>{lead.quip}</div>
            </div>

            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#CC0000",fontWeight:600,cursor:"pointer"}} onClick={()=>setArticle(lead)}>Read full fact-check →</div>
          </div>

          {/* SIDEBAR */}
          <div>
            {/* Score box */}
            <div style={{background:"#1A1A1A",padding:"14px",marginBottom:14,textAlign:"center"}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,letterSpacing:3,color:"rgba(255,255,255,.4)",textTransform:"uppercase",marginBottom:6}}>Today's Honesty Score</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:52,fontWeight:900,color:gCol,lineHeight:1}}>{paper.overallGrade}</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"rgba(255,255,255,.35)",marginTop:2}}>{paper.overallScore} / 100</div>
              {paper.overallQuip&&<div style={{marginTop:8,fontFamily:"'Source Serif 4',serif",fontStyle:"italic",fontSize:11,color:"rgba(255,255,255,.55)",lineHeight:1.5}}>{paper.overallQuip}</div>}
            </div>

            {/* Second story */}
            {sidebar&&(
              <div style={{borderTop:"1px solid #1A1A1A",paddingTop:12,cursor:"pointer"}} onClick={()=>setArticle(sidebar)}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:700,marginBottom:6}}>Also Today</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#1A1A1A",lineHeight:1.2,marginBottom:8}}>{sidebar.headline}</div>
                <div className="divider-thin" style={{marginBottom:8}}/>
                {sidebar.quote&&<div style={{fontFamily:"'Source Serif 4',serif",fontStyle:"italic",fontSize:12,color:"#555",lineHeight:1.5,marginBottom:8}}>"{sidebar.quote.slice(0,100)}{sidebar.quote.length>100?"…":""}"</div>}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:700,padding:"2px 8px",background:(V[sidebar.verdict]||V.UNVERIFIED).bg,color:(V[sidebar.verdict]||V.UNVERIFIED).color}}>{(V[sidebar.verdict]||V.UNVERIFIED).label}</span>
                </div>
                {sidebar.quip&&<div style={{fontFamily:"'Source Serif 4',serif",fontStyle:"italic",fontSize:11,color:"#888",borderLeft:"2px solid #CC0000",paddingLeft:8,lineHeight:1.4}}>{sidebar.quip}</div>}
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#CC0000",fontWeight:600,marginTop:8}}>Read more →</div>
              </div>
            )}
          </div>
        </div>

        {/* MORE FROM TODAY */}
        {columns.length>0&&(
          <>
            <div style={{background:"#1A1A1A",padding:"6px 20px",textAlign:"center"}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,letterSpacing:4,color:"rgba(255,255,255,.4)",textTransform:"uppercase"}}>More From Today's Edition</div>
            </div>
            <div className="divider"/>
            <div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(columns.length,3)},1fr)`}}>
              {columns.slice(0,3).map((col,i)=>{
                const cvs = V[col.verdict]||V.UNVERIFIED;
                return (
                  <div key={i} style={{padding:16,borderRight:i<columns.length-1&&i<2?"0.5px solid #CCC":"none",cursor:"pointer"}} onClick={()=>setArticle(col)}>
                    <div style={{marginBottom:10,border:"0.5px solid #E8E8E0"}} dangerouslySetInnerHTML={{__html:getIllustration(col.headline,col.verdict)}}/>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#1A1A1A",lineHeight:1.2,marginBottom:8}}>{col.headline}</div>
                    <div className="divider-thin" style={{marginBottom:8}}/>
                    {col.bodyText&&<div style={{fontFamily:"'Source Serif 4',serif",fontSize:12,color:"#444",lineHeight:1.6,marginBottom:8}}>{col.bodyText}</div>}
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,fontWeight:700,padding:"2px 7px",background:cvs.bg,color:cvs.color}}>{cvs.label}</span>
                    </div>
                    {col.quip&&<div style={{fontFamily:"'Source Serif 4',serif",fontStyle:"italic",fontSize:11,color:"#888",borderLeft:"2px solid #CC0000",paddingLeft:8,lineHeight:1.4}}>{col.quip}</div>}
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:"#CC0000",fontWeight:600,marginTop:8}}>Read more →</div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* FOOTER */}
        <div className="divider"/>
        <div style={{background:"#1A1A1A",padding:"18px 20px",textAlign:"center"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,color:"white",marginBottom:4}}>The Daily <span style={{color:"#CC0000"}}>Reckoning</span></div>
          <div style={{fontFamily:"'Source Serif 4',serif",fontStyle:"italic",fontSize:11,color:"rgba(255,255,255,.45)",marginBottom:14}}>"Because someone has to."</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap",marginBottom:10}}>
            <button onClick={()=>{const u="https://maga.news";if(navigator.share){navigator.share({title:"The Daily Reckoning",url:u});}else{navigator.clipboard.writeText(u);}}} style={{background:"#CC0000",color:"white",border:"none",padding:"9px 18px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              🔗 Share Today's Paper
            </button>
            <Link href="/history" style={{background:"#2A2A2A",color:"white",border:"0.5px solid #444",padding:"9px 18px",fontSize:12,fontWeight:600,textDecoration:"none",display:"inline-block",fontFamily:"'DM Sans',sans-serif"}}>
              📊 Score History
            </Link>
            <button onClick={buildPaper} style={{background:"#2A2A2A",color:"white",border:"0.5px solid #444",padding:"9px 18px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              🔄 Refresh
            </button>
          </div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"rgba(255,255,255,.2)",letterSpacing:1}}>Updates daily · Cached 24hrs · Non-partisan</div>
        </div>

      </div>
    </div>
  );
}
