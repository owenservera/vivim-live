import { useState } from "react";

const fmt = (n) => n >= 1e9 ? `$${(n/1e9).toFixed(1)}B` : `$${(n/1e6).toFixed(0)}M`;
const fmtM = (n) => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : `${(n/1e3).toFixed(0)}K`;

const VECTORS = [
  {
    id: "context_tax",
    label: "The AI Context Tax",
    color: "#534AB7",
    bg: "#EEEDFE",
    border: "#AFA9EC",
    tagline: "Time wasted rebuilding context, globally, every day",
    description: "Every knowledge worker using AI tools spends an average of 45 min/week rebuilding context — re-explaining their stack, preferences, project history. At global scale, this is an economic hemorrhage. VIVIM eliminates it.",
    methodology: "Bottom-up from knowledge worker time cost",
    inputs: [
      { key: "workers", label: "Global AI-augmented knowledge workers", unit: "M people", default: 400, min: 100, max: 800, step: 50 },
      { key: "hoursPerWeek", label: "Hours/week lost to context rebuilding", unit: "hrs", default: 0.75, min: 0.25, max: 2, step: 0.25 },
      { key: "hourlyRate", label: "Avg. hourly knowledge worker cost", unit: "$/hr", default: 45, min: 25, max: 80, step: 5 },
      { key: "captureRate", label: "% VIVIM could capture at $12/mo", unit: "%", default: 3, min: 0.5, max: 10, step: 0.5 },
    ],
    calc: (v) => {
      const totalLossMYr = v.workers * 1e6 * v.hoursPerWeek * 52 * v.hourlyRate;
      const vivimRevenue = v.workers * 1e6 * (v.captureRate/100) * 12 * 12;
      return {
        headline: fmt(vivimRevenue),
        sublabel: "Addressable annual revenue",
        supporting: `$${(totalLossMYr/1e12).toFixed(1)}T annual productivity loss globally · ${fmtM(v.workers*1e6*(v.captureRate/100))} paying users`,
        tam: totalLossMYr,
        sam: vivimRevenue * 5,
        som: vivimRevenue,
      };
    },
  },
  {
    id: "data_sovereignty",
    label: "AI Data Portability Rights",
    color: "#0F6E56",
    bg: "#E1F5EE",
    border: "#5DCAA5",
    tagline: "Regulatory tailwinds are creating a mandatory market",
    description: "GDPR Article 20, the EU AI Act, and emerging US state laws (CCPA, proposed ADPPA) are creating legal obligations for AI data portability. VIVIM is the infrastructure that makes compliance possible — and monetizable.",
    methodology: "Top-down from regulatory compliance spend",
    inputs: [
      { key: "euUsers", label: "EU-based AI platform users", unit: "M", default: 180, min: 80, max: 300, step: 20 },
      { key: "usUsers", label: "US-based AI platform users (CCPA states)", unit: "M", default: 220, min: 100, max: 400, step: 20 },
      { key: "complianceARPU", label: "Annual compliance-driven ARPU", unit: "$/yr", default: 48, min: 24, max: 120, step: 12 },
      { key: "enterpriseMult", label: "Enterprise premium multiplier", unit: "x", default: 8, min: 3, max: 20, step: 1 },
    ],
    calc: (v) => {
      const consumerTAM = (v.euUsers + v.usUsers) * 1e6 * v.complianceARPU;
      const enterpriseTAM = consumerTAM * 0.15 * v.enterpriseMult;
      const total = consumerTAM + enterpriseTAM;
      return {
        headline: fmt(total),
        sublabel: "Compliance-driven TAM",
        supporting: `Consumer: ${fmt(consumerTAM)} · Enterprise uplift: ${fmt(enterpriseTAM)}`,
        tam: total,
        sam: total * 0.3,
        som: total * 0.05,
      };
    },
  },
  {
    id: "vector_displacement",
    label: "Vector DB Displacement",
    color: "#854F0B",
    bg: "#FAEEDA",
    border: "#EF9F27",
    tagline: "Enterprises are spending billions solving the wrong problem",
    description: "The $13B vector database market exists because enterprises lack a purpose-built AI memory layer. They're using Pinecone, Weaviate, and Chroma as workarounds. VIVIM is purpose-built for this — semantically richer, privacy-native, and user-owned. Not a vector DB, but the reason people buy one.",
    methodology: "Displacement from adjacent infrastructure spend",
    inputs: [
      { key: "vectorDBMarket", label: "Vector DB market size 2026", unit: "$B", default: 4.2, min: 2, max: 8, step: 0.2 },
      { key: "cagr", label: "Market CAGR", unit: "%", default: 23, min: 15, max: 35, step: 1 },
      { key: "displacementRate", label: "% VIVIM can displace by yr 5", unit: "%", default: 15, min: 5, max: 30, step: 1 },
      { key: "premiumMult", label: "VIVIM premium vs. raw vector DB", unit: "x", default: 1.4, min: 1, max: 2.5, step: 0.1 },
    ],
    calc: (v) => {
      const yr5Market = v.vectorDBMarket * 1e9 * Math.pow(1 + v.cagr/100, 5);
      const displaced = yr5Market * (v.displacementRate/100) * v.premiumMult;
      return {
        headline: fmt(displaced),
        sublabel: "Yr 5 displacement revenue",
        supporting: `Vector DB market yr 5: ${fmt(yr5Market)} · At ${v.displacementRate}% displacement + ${v.premiumMult}x premium`,
        tam: yr5Market,
        sam: yr5Market * 0.4,
        som: displaced,
      };
    },
  },
  {
    id: "ai_native_identity",
    label: "AI-Native Identity Layer",
    color: "#993556",
    bg: "#FBEAF0",
    border: "#ED93B1",
    tagline: "Every AI agent needs an identity substrate. VIVIM is that layer.",
    description: "As agentic AI explodes, each AI agent needs persistent identity, memory, and context — not just for users, but for the agents themselves. VIVIM's DID + ACU architecture becomes the identity and memory substrate for the agentic internet. Think: Auth0, but for AI agents.",
    methodology: "Analogy-based from identity infrastructure markets",
    inputs: [
      { key: "aiApps", label: "AI-native apps needing memory by 2027", unit: "K apps", default: 850, min: 200, max: 2000, step: 50 },
      { key: "agentsPerApp", label: "Avg. agents/users per app", unit: "", default: 5000, min: 500, max: 50000, step: 500 },
      { key: "revenuePerAgent", label: "Revenue per agent-memory-year", unit: "$", default: 1.2, min: 0.5, max: 5, step: 0.1 },
      { key: "sdkTake", label: "SDK licensing take rate", unit: "%", default: 8, min: 2, max: 20, step: 1 },
    ],
    calc: (v) => {
      const totalAgents = v.aiApps * 1000 * v.agentsPerApp;
      const rawMarket = totalAgents * v.revenuePerAgent;
      const vivimTake = rawMarket * (v.sdkTake/100);
      return {
        headline: fmt(vivimTake),
        sublabel: "SDK + infra revenue",
        supporting: `${fmtM(totalAgents)} total agents/users · $${fmt(rawMarket)} gross memory infrastructure market`,
        tam: rawMarket,
        sam: rawMarket * 0.2,
        som: vivimTake,
      };
    },
  },
];

const BAR_COLORS = ["#534AB7","#0F6E56","#854F0B","#993556"];

export default function TAMModel() {
  const [active, setActive] = useState(0);
  const [vals, setVals] = useState(() => Object.fromEntries(VECTORS.map(v => [v.id, Object.fromEntries(v.inputs.map(i => [i.key, i.default]))])));

  const v = VECTORS[active];
  const curVals = vals[v.id];
  const result = v.calc(curVals);

  const allResults = VECTORS.map(vec => vec.calc(vals[vec.id]));
  const combined = {
    tam: allResults.reduce((a,r) => a + r.tam, 0),
    sam: allResults.reduce((a,r) => a + r.sam, 0),
    som: allResults.reduce((a,r) => a + r.som, 0),
  };

  const update = (key, val) => setVals(prev => ({ ...prev, [v.id]: { ...prev[v.id], [key]: val } }));

  const maxTAM = Math.max(...allResults.map(r => r.tam));

  return (
    <div style={{padding:"1.5rem 0", fontFamily:"var(--font-sans)"}}>

      {/* Header */}
      <div style={{marginBottom:"1.5rem"}}>
        <p style={{fontSize:13,color:"var(--color-text-tertiary)",margin:"0 0 4px",letterSpacing:".05em",textTransform:"uppercase",fontWeight:500}}>Market sizing</p>
        <h2 style={{fontSize:22,fontWeight:500,margin:"0 0 6px",color:"var(--color-text-primary)"}}>VIVIM total addressable market</h2>
        <p style={{fontSize:14,color:"var(--color-text-secondary)",margin:0,lineHeight:1.6}}>Four independent vectors, each independently defensible. Adjust assumptions to stress-test the model.</p>
      </div>

      {/* Combined summary */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:"1.5rem"}}>
        {[["TAM","Total addressable market",combined.tam],["SAM","Serviceable addressable market",combined.sam],["SOM","Serviceable obtainable market",combined.som]].map(([label,sub,val])=>(
          <div key={label} style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 16px"}}>
            <p style={{fontSize:11,fontWeight:500,letterSpacing:".05em",textTransform:"uppercase",color:"var(--color-text-tertiary)",margin:"0 0 4px"}}>{label}</p>
            <p style={{fontSize:22,fontWeight:500,margin:"0 0 2px",color:"var(--color-text-primary)"}}>{fmt(val)}</p>
            <p style={{fontSize:11,color:"var(--color-text-tertiary)",margin:0}}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Vector selector */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:"1.25rem"}}>
        {VECTORS.map((vec,i)=>{
          const r = allResults[i];
          const isActive = active===i;
          return (
            <button key={vec.id} onClick={()=>setActive(i)} style={{background: isActive ? vec.bg : "var(--color-background-primary)", border: isActive ? `1.5px solid ${vec.border}` : "0.5px solid var(--color-border-tertiary)", borderRadius:"var(--border-radius-md)", padding:"10px 14px", cursor:"pointer", textAlign:"left", transition:"all .15s"}}>
              <p style={{fontSize:12,fontWeight:500,color: isActive ? vec.color : "var(--color-text-secondary)",margin:"0 0 2px"}}>{vec.label}</p>
              <p style={{fontSize:18,fontWeight:500,color: isActive ? vec.color : "var(--color-text-primary)",margin:"0 0 1px"}}>{fmt(r.som)}</p>
              <p style={{fontSize:11,color:"var(--color-text-tertiary)",margin:0}}>SOM</p>
            </button>
          );
        })}
      </div>

      {/* Active vector detail */}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",overflow:"hidden",marginBottom:"1.25rem"}}>
        <div style={{background:v.bg,padding:"1rem 1.25rem",borderBottom:`0.5px solid ${v.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
            <div>
              <p style={{fontSize:13,fontWeight:500,color:v.color,margin:"0 0 2px"}}>{v.label}</p>
              <p style={{fontSize:15,fontWeight:500,color:"var(--color-text-primary)",margin:"0 0 4px"}}>{v.tagline}</p>
              <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:0,lineHeight:1.5,maxWidth:520}}>{v.description}</p>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <p style={{fontSize:28,fontWeight:500,color:v.color,margin:"0 0 2px"}}>{result.headline}</p>
              <p style={{fontSize:12,color:"var(--color-text-secondary)",margin:0}}>{result.sublabel}</p>
            </div>
          </div>
          <p style={{fontSize:12,color:"var(--color-text-tertiary)",margin:"8px 0 0"}}>{result.supporting}</p>
        </div>

        <div style={{padding:"1rem 1.25rem"}}>
          <p style={{fontSize:11,fontWeight:500,letterSpacing:".05em",textTransform:"uppercase",color:"var(--color-text-tertiary)",margin:"0 0 12px"}}>Adjust assumptions</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 24px"}}>
            {v.inputs.map(inp=>(
              <div key={inp.key}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <label style={{fontSize:12,color:"var(--color-text-secondary)"}}>{inp.label}</label>
                  <span style={{fontSize:12,fontWeight:500,color:v.color}}>{curVals[inp.key]}{inp.unit !== "M people" && inp.unit !== "$B" && inp.unit !== "K apps" && inp.unit !== "M" ? ` ${inp.unit}` : ""}{inp.unit === "%" ? "" : ""}</span>
                </div>
                <input type="range" min={inp.min} max={inp.max} step={inp.step} value={curVals[inp.key]} onChange={e=>update(inp.key, parseFloat(e.target.value))} style={{width:"100%",accentColor:v.color}}/>
              </div>
            ))}
          </div>
          <p style={{fontSize:11,color:"var(--color-text-tertiary)",margin:"12px 0 0"}}>Methodology: {v.methodology}</p>
        </div>
      </div>

      {/* Relative size bars */}
      <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"1rem 1.25rem",marginBottom:"1.25rem"}}>
        <p style={{fontSize:11,fontWeight:500,letterSpacing:".05em",textTransform:"uppercase",color:"var(--color-text-tertiary)",margin:"0 0 12px"}}>TAM relative scale</p>
        {VECTORS.map((vec,i)=>{
          const r = allResults[i];
          const pct = Math.max(6, (r.tam / maxTAM) * 100);
          return (
            <div key={vec.id} style={{marginBottom:10,cursor:"pointer"}} onClick={()=>setActive(i)}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:12,color: active===i ? vec.color : "var(--color-text-secondary)",fontWeight: active===i ? 500 : 400}}>{vec.label}</span>
                <span style={{fontSize:12,color:"var(--color-text-secondary)"}}>{fmt(r.tam)} TAM</span>
              </div>
              <div style={{height:6,background:"var(--color-background-secondary)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:BAR_COLORS[i],borderRadius:3,transition:"width .3s"}}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Narrative */}
      <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",padding:"1rem 1.25rem"}}>
        <p style={{fontSize:11,fontWeight:500,letterSpacing:".05em",textTransform:"uppercase",color:"var(--color-text-tertiary)",margin:"0 0 10px"}}>The investor narrative</p>
        <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 8px",lineHeight:1.7}}>Most TAM models pick one market. VIVIM sits at the intersection of four: the productivity loss from broken AI context, the regulatory mandate for data portability, the enterprise infrastructure spend being wasted on vector DB workarounds, and the emerging identity substrate market for agentic AI.</p>
        <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:0,lineHeight:1.7}}>These aren't competing framings — they're four separate buyer motivations. Individual users pay for recovered productivity. Enterprises pay for compliance. Developers pay to avoid infrastructure. AI platforms pay for the identity layer. VIVIM serves all four with the same architecture.</p>
      </div>

    </div>
  );
}
