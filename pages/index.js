import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";

const V = {
  TRUE:       { bg:"#E8F9ED", color:"#1a7a35", label:"✅ True",       short:"TRUE"  },
  FALSE:      { bg:"#FFF0EF", color:"#CC0000", label:"❌ False",      short:"FALSE" },
  MIXED:      { bg:"#FFF4E5", color:"#8B4800", label:"🤔 Mixed",      short:"MIXED" },
  UNVERIFIED: { bg:"#F5F5F5", color:"#555",    label:"❓ Unverified", short:"UNVERIFIED" },
};

const CONF_LABELS = { 5:"Very High", 4:"High", 3:"Medium", 2:"Low", 1:"Very Low" };
const CONF_COLORS = { 5:"#1a7a35", 4:"#1a7a35", 3:"#8B4800", 2:"#CC0000", 1:"#CC0000" };

const gradeColor = g => {
  if (!g) return "#999";
  const l=g[0];
  if (l==="A") return "#1a7a35";
  if (l==="B") return "#2d7a2d";
  if (l==="C") return "#8B4800";
  if (l==="D") return "#CC3300";
  return "#CC0000";
};

const WorldMap = () => (
  <svg style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:800,height:"100%",opacity:0.045,zIndex:0,pointerEvents:"none"}} viewBox="0 0 1000 900" preserveAspectRatio="xMidYMid meet">
    <path d="M120,60 L180,40 L220,50 L250,80 L260,120 L240,160 L220,200 L200,220 L180,240 L160,260 L140,280 L120,260 L100,240 L90,200 L95,160 L100,120 L110,90 Z" fill="#1A1A1A"/>
    <path d="M200,280 L240,270 L270,290 L280,330 L275,380 L260,420 L240,440 L220,430 L200,400 L190,360 L185,320 L190,290 Z" fill="#1A1A1A"/>
    <path d="M440,60 L480,50 L510,60 L520,80 L510,100 L490,110 L470,120 L450,110 L440,90 Z" fill="#1A1A1A"/>
    <path d="M450,130 L490,120 L520,130 L540,160 L550,200 L545,250 L530,300 L510,330 L490,340 L470,330 L450,300 L440,260 L435,210 L440,170 Z" fill="#1A1A1A"/>
    <path d="M530,40 L620,30 L720,40 L800,60 L840,80 L860,110 L850,140 L820,160 L780,170 L740,160 L700,150 L660,160 L630,150 L600,130 L570,110 L540,90 L525,70 Z" fill="#1A1A1A"/>
    <path d="M760,300 L820,290 L860,300 L880,330 L875,370 L850,390 L810,395 L775,380 L755,350 L750,320 Z" fill="#1A1A1A"/>
    <path d="M260,20 L310,15 L330,30 L320,55 L290,60 L265,50 Z" fill="#1A1A1A"/>
  </svg>
);

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  @keyframes spin { to { transform:rotate(360deg); } }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }
  body { font-family:'DM Sans',-apple-system,sans-serif; background:#F4F4F2; }
  .bubble-grey { background:#EDEDED; border-radius:16px 16px 16px 3px; padding:13px 15px; position:relative; margin-bottom:16px; }
  .bubble-grey::after { content:''; position:absolute; bottom:-8px; left:14px; border-left:8px solid transparent; border-right:3px solid transparent; border-top:9px solid #EDEDED; }
  .bubble-red { background:#CC0000; border-radius:16px 16px 3px 16px; padding:13px 15px; position:relative; margin-bottom:8px; }
  .bubble-red::after { content:''; position:absolute; bottom:-8px; right:14px; border-left:3px solid transparent; border-right:8px solid transparent; border-top:9px solid #CC0000; }
  .claim-row { padding:14px 0; border-bottom:0.5px solid #E8E8E8; cursor:pointer; }
  .claim-row:hover { opacity:0.85; }
  .claim-row:last-child { border-bottom:none; }
`;

export default function Home() {
  const [newspaper, setNewspaper] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [building,  setBuilding]  = useState(false);
  const [article,   setArticle]   = useState(null); // { claim, region }
  const [buildMsg,  setBuildMsg]  = useState("Scanning today's global news…");
  const msgTimer = useRef(null);

  const BUILD_MSGS = [
    "Scanning today's global news…",
    "Fact-checking US & Allied claims…",
    "Cross-referencing Russian statements…",
    "Checking what China is saying…",
    "Analysing Iran & Axis claims…",
    "Reviewing Israeli statements…",
    "Checking Gulf leaders…",
    "Fact-checking the UN…",
    "Calculating global honesty scores…",
    "Building your daily newspaper…",
  ];

  useEffect(() => {
    loadNewspaper();
  }, []);

  async function loadNewspaper() {
    setLoading(true);
    try {
      const res = await fetch("/api/newspaper");
      const data = await res.json();
      if (data.ok && data.data) {
        setNewspaper(data.data);
        setLoading(false);
      } else {
        // No cache — build it
        await buildNewspaper();
      }
    } catch(e) {
      await buildNewspaper();
    }
  }

  async function buildNewspaper() {
    setBuilding(true);
    setLoading(true);
    let i = 0;
    msgTimer.current = setInterval(() => {
      i = (i+1) % BUILD_MSGS.length;
      setBuildMsg(BUILD_MSGS[i]);
    }, 4000);
    try {
      const res = await fetch("/api/newspaper", { method:"POST" });
      const data = await res.json();
      if (data.ok && data.data) {
        setNewspaper(data.data);
      }
    } catch(e) {}
    clearInterval(msgTimer.current);
    setBuilding(false);
    setLoading(false);
  }

  // ── ARTICLE VIEW ──
  if (article) {
    const { claim:c, region:r } = article;
    const vs   = V[c.verdict]||V.UNVERIFIED;
    const conf  = c.confidenceScore||3;
    const confCol   = CONF_COLORS[conf]||"#8B4800";
    const confLabel = CONF_LABELS[conf]||"Medium";
    return (
      <div style={{background:"#F4F4F2",minHeight:"100vh",paddingBottom:60,fontFamily:"'DM Sans',sans-serif",position:"relative",overflow:"hidden"}}>
        <style>{css}</style>
        <Head><title>{c.headline} — Making Accuracy Great Again</title></Head>
        <WorldMap/>
        <div style={{position:"relative",zIndex:1}}>
          {/* Header */}
          <div style={{borderBottom:"3px solid #CC0000",padding:"40px 20px 16px",background:"rgba(255,255,255,0.95)",backdropFilter:"blur(8px)",position:"sticky",top:0,zIndex:10}}>
            <button onClick={()=>setArticle(null)} style={{background:"none",border:"none",color:"#CC0000",fontSize:14,fontWeight:600,cursor:"pointer",padding:0,marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>← Back to Today's Paper</button>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:"#1A1A1A"}}>Making Accuracy <span style={{color:"#CC0000"}}>Great Again</span></div>
          </div>

          <div style={{maxWidth:720,margin:"0 auto",padding:"0 0 40px"}}>
            {/* Region label */}
            <div style={{padding:"8px 20px",background:"#1A1A1A",borderBottom:"2px solid #CC0000",fontSize:11,color:"rgba(255,255,255,.6)",letterSpacing:2,textTransform:"uppercase",fontWeight:600}}>
              {r.flag} {r.label}
            </div>

            <div style={{padding:"20px",background:"rgba(255,255,255,0.9)",backdropFilter:"blur(4px)"}}>

              {/* 1. VERDICT + CONFIDENCE */}
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

              {/* HEADLINE */}
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:28,color:"#1A1A1A",lineHeight:1.2,marginBottom:16}}>{c.headline}</div>

              {/* 2. WHO */}
              <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:12,paddingBottom:12,borderBottom:"0.5px solid #F0F0F0"}}>
                <span style={{fontSize:22,flexShrink:0}}>{r.flag}</span>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:"#1A1A1A",marginBottom:3}}>{c.who}</div>
                  {c.fullDate&&<div style={{fontSize:11,color:"#999",marginBottom:2}}>📅 {c.fullDate}</div>}
                  {c.location&&<div style={{fontSize:11,color:"#999"}}>📍 {c.location}</div>}
                </div>
              </div>

              {/* 3. QUOTE */}
              <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:19,color:"#1A1A1A",lineHeight:1.55,marginBottom:12,paddingBottom:12,borderBottom:"0.5px solid #EEEEEE"}}>
                "{c.quote}"
              </div>

              {/* 4. CONTEXT */}
              {c.context&&(
                <div style={{borderLeft:"3px solid #CC0000",paddingLeft:12,marginBottom:18,fontSize:12,color:"#666",lineHeight:1.6,fontStyle:"italic"}}>{c.context}</div>
              )}

              {/* 5. REALITY CHECK */}
              <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",fontWeight:600,marginBottom:8}}>Reality Check 🔍</div>
              <div className="bubble-grey">
                <div style={{fontSize:13,color:"#333",lineHeight:1.7}}>{c.explanation}</div>
              </div>

              {/* 6. OUR TAKE */}
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
                  {c.relatedClaims.map((rc,j)=>(
                    <div key={j} style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:j<c.relatedClaims.length-1?8:0,paddingBottom:j<c.relatedClaims.length-1?8:0,borderBottom:j<c.relatedClaims.length-1?"0.5px solid #EEEEEE":"none"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,color:"#333",marginBottom:2}}>{rc.claim}</div>
                        <div style={{fontSize:10,color:"#AEAEB2"}}>{rc.date}</div>
                      </div>
                      <span style={{fontSize:10,fontWeight:700,padding:"3px 8px",background:(V[rc.verdict]||V.UNVERIFIED).bg,color:(V[rc.verdict]||V.UNVERIFIED).color,flexShrink:0}}>
                        {(V[rc.verdict]||V.UNVERIFIED).label}
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
              {!c.sourceUrl&&c.sourceName&&(
                <div style={{display:"flex",alignItems:"center",gap:10,paddingTop:10,borderTop:"0.5px solid #F0F0F0"}}>
                  <span style={{fontSize:10,color:"#999",fontWeight:700,letterSpacing:1}}>SOURCE</span>
                  <span style={{fontSize:12,color:"#CC0000",fontWeight:600}}>{c.sourceName}</span>
                </div>
              )}

              <button onClick={()=>setArticle(null)} style={{marginTop:24,width:"100%",background:"#F5F5F5",border:"0.5px solid #E0E0E0",padding:14,fontSize:14,fontWeight:600,cursor:"pointer",color:"#555",fontFamily:"'DM Sans',sans-serif"}}>
                ← Back to Today's Paper
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LOADING / BUILDING ──
  if (loading) return (
    <div style={{minHeight:"100vh",background:"#F4F4F2",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20,fontFamily:"'DM Sans',sans-serif",padding:40}}>
      <style>{css}</style>
      <Head><title>Making Accuracy Great Again</title></Head>
      <div style={{fontSize:48}}>📣</div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#1A1A1A",textAlign:"center"}}>
        {building ? "Building Today's Paper…" : "Loading…"}
      </div>
      {building&&<div style={{fontSize:14,color:"#666",fontStyle:"italic",textAlign:"center",maxWidth:320,lineHeight:1.6,animation:"pulse 2s ease infinite"}}>{buildMsg}</div>}
      {building&&<div style={{fontSize:12,color:"#999",textAlign:"center"}}>Fact-checking all 7 regions — takes about 2 minutes</div>}
      <div style={{width:40,height:40,border:"2px solid #E0E0E0",borderTopColor:"#CC0000",borderRadius:"50%",animation:"spin .75s linear infinite"}}/>
    </div>
  );

  // ── NEWSPAPER HOME ──
  const np = newspaper;
  if (!np) return (
    <div style={{minHeight:"100vh",background:"#F4F4F2",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,fontFamily:"'DM Sans',sans-serif",padding:40}}>
      <style>{css}</style>
      <div style={{fontSize:36}}>📣</div>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:"#1A1A1A"}}>No paper today yet</div>
      <button onClick={buildNewspaper} style={{background:"#CC0000",color:"white",border:"none",padding:"14px 28px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
        Build Today's Paper
      </button>
    </div>
  );

  const gCol = gradeColor(np.globalGrade);

  return (
    <div style={{background:"#F4F4F2",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",position:"relative"}}>
      <style>{css}</style>
      <Head>
        <title>Making Accuracy Great Again — {np.date}</title>
        <meta name="description" content="Daily global fact-check newspaper. Because someone has to."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>
      <WorldMap/>

      <div style={{position:"relative",zIndex:1,maxWidth:720,margin:"0 auto"}}>

        {/* ── MASTHEAD ── */}
        <div style={{borderBottom:"3px solid #CC0000",padding:"28px 20px 16px",background:"rgba(255,255,255,0.95)",backdropFilter:"blur(8px)"}}>
          <div style={{fontSize:9,letterSpacing:5,color:"#999",textTransform:"uppercase",marginBottom:8,textAlign:"center"}}>Est. 2026 · Global Fact Check · Non-Partisan</div>
          <div style={{textAlign:"center",marginBottom:8}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:36,color:"#1A1A1A",lineHeight:1,letterSpacing:-1}}>
              Making Accuracy<br/><span style={{color:"#CC0000"}}>Great Again</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"0.5px solid #E8E8E8",paddingTop:10,marginTop:6}}>
            <div style={{fontSize:11,color:"#999"}}>{np.date}</div>
            <div style={{fontSize:11,color:"#999",fontStyle:"italic",fontFamily:"'DM Serif Display',serif"}}>"Because someone has to."</div>
            <div style={{fontSize:11,color:"#999"}}>📣 maga.news</div>
          </div>
        </div>

        {/* ── GLOBAL SCORE BANNER ── */}
        <div style={{background:"#1A1A1A",padding:"16px 20px",borderBottom:"3px solid #CC0000",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:"rgba(255,255,255,.4)",textTransform:"uppercase",marginBottom:4}}>Today's Global Truth Score</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,.8)",fontStyle:"italic",fontFamily:"'DM Serif Display',serif"}}>
              {np.globalScore>=70 ? "An unusually honest day. Check outside — pigs may be flying." :
               np.globalScore>=50 ? "About average. Which is not a compliment." :
               np.globalScore>=30 ? "Another day, another avalanche of half-truths." :
               "A dark day for accuracy. The truth has left the building."}
            </div>
          </div>
          <div style={{textAlign:"center",flexShrink:0,marginLeft:16}}>
            <div style={{fontFamily:"'DM Serif Display',serif",fontSize:52,color:gCol,lineHeight:1}}>{np.globalGrade}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{np.globalScore}/100</div>
          </div>
        </div>

        {/* ── TODAY'S BIGGEST LIE ── */}
        {np.topClaim&&np.topRegion&&(
          <div style={{background:"rgba(255,255,255,0.92)",borderBottom:"2px solid #1A1A1A",backdropFilter:"blur(4px)"}}>
            <div style={{padding:"12px 20px 0"}}>
              <div style={{fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:700,marginBottom:10}}>━━ Today's Most Notable Claim ━━</div>
            </div>
            <div onClick={()=>setArticle({claim:np.topClaim, region:np.topRegion})} style={{padding:"0 20px 16px",cursor:"pointer"}}>
              <div style={{fontFamily:"'DM Serif Display',serif",fontSize:26,color:"#1A1A1A",lineHeight:1.2,marginBottom:8}}>{np.topClaim.headline}</div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                <span style={{fontSize:12,fontWeight:700,padding:"4px 12px",background:(V[np.topClaim.verdict]||V.UNVERIFIED).bg,color:(V[np.topClaim.verdict]||V.UNVERIFIED).color}}>
                  {(V[np.topClaim.verdict]||V.UNVERIFIED).label}
                </span>
                <span style={{fontSize:11,color:"#999"}}>{np.topRegion.flag} {np.topRegion.label} · {np.topClaim.who?.split(",")[0]}</span>
              </div>
              <div style={{fontFamily:"'DM Serif Display',serif",fontStyle:"italic",fontSize:15,color:"#555",lineHeight:1.5,marginBottom:8}}>"{np.topClaim.quote?.slice(0,120)}{np.topClaim.quote?.length>120?"…":""}"</div>
              <div style={{fontSize:12,color:"#CC0000",fontWeight:600}}>Read full fact-check →</div>
            </div>
          </div>
        )}

        {/* ── REGION SECTIONS ── */}
        {(np.regions||[]).map((region, ri) => {
          if (!region.claims?.length) return null;
          const rCol = gradeColor(region.regionGrade);
          return (
            <div key={region.id} style={{background:"rgba(255,255,255,0.88)",borderBottom:"2px solid #1A1A1A",backdropFilter:"blur(4px)",animation:`fadeUp .3s ${ri*.05}s ease both`}}>

              {/* Region header */}
              <div style={{padding:"12px 20px",borderBottom:"0.5px solid #E8E8E8",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:9,letterSpacing:3,color:"#CC0000",textTransform:"uppercase",fontWeight:700,marginBottom:3}}>━━ {region.flag} {region.label} ━━</div>
                  <div style={{fontSize:11,color:"#999"}}>{region.who}</div>
                </div>
                <div style={{textAlign:"center",flexShrink:0}}>
                  <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,color:rCol,lineHeight:1}}>{region.regionGrade}</div>
                  <div style={{fontSize:9,color:"#CCC"}}>{region.regionScore}/100</div>
                </div>
              </div>

              {/* Region summary */}
              <div style={{padding:"10px 20px",background:"#FAFAFA",borderBottom:"0.5px solid #E8E8E8",fontSize:12,color:"#555",fontStyle:"italic",fontFamily:"'DM Serif Display',serif",lineHeight:1.5}}>
                {region.regionSummary}
              </div>

              {/* Claim headlines */}
              <div style={{padding:"0 20px"}}>
                {(region.claims||[]).map((c,ci)=>{
                  const vs = V[c.verdict]||V.UNVERIFIED;
                  return (
                    <div key={ci} className="claim-row" onClick={()=>setArticle({claim:c,region})}>
                      <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                        <span style={{fontSize:11,fontWeight:700,padding:"3px 8px",background:vs.bg,color:vs.color,flexShrink:0,marginTop:2}}>
                          {vs.short}
                        </span>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:16,color:"#1A1A1A",lineHeight:1.3,marginBottom:4}}>{c.headline}</div>
                          <div style={{fontSize:11,color:"#999"}}>{c.who?.split(",")[0]} · {c.fullDate||c.source}</div>
                        </div>
                        <div style={{fontSize:14,color:"#CC0000",fontWeight:700,flexShrink:0,marginTop:2}}>→</div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}

        {/* ── FOOTER ── */}
        <div style={{padding:"20px",background:"rgba(255,255,255,0.85)",borderTop:"2px solid #1A1A1A",textAlign:"center"}}>
          <div style={{fontSize:9,letterSpacing:3,color:"#999",textTransform:"uppercase",marginBottom:8}}>Making Accuracy Great Again</div>
          <div style={{fontSize:12,color:"#999",fontStyle:"italic",marginBottom:12,fontFamily:"'DM Serif Display',serif"}}>"Because someone has to."</div>
          <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>{const url="https://maga.news";if(navigator.share){navigator.share({title:"Making Accuracy Great Again",url});}else{navigator.clipboard.writeText(url);}}} style={{background:"#CC0000",color:"white",border:"none",padding:"11px 22px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              🔗 Share Today's Paper
            </button>
            <Link href="/history" style={{background:"#F5F5F5",color:"#555",border:"0.5px solid #E0E0E0",padding:"11px 22px",fontSize:13,fontWeight:600,textDecoration:"none",display:"inline-block"}}>
              📊 Score History
            </Link>
            <button onClick={buildNewspaper} style={{background:"#1A1A1A",color:"white",border:"none",padding:"11px 22px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              🔄 Refresh Paper
            </button>
          </div>
          <div style={{fontSize:10,color:"#CCC",marginTop:14}}>Updates daily · Cached for 24 hours · Non-partisan fact-checking</div>
        </div>

      </div>
    </div>
  );
}
