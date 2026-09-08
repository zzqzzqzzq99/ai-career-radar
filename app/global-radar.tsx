"use client";
import { useState } from "react";
import initial from "./public-opportunities.json";

export default function GlobalRadar() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("全部");
  const [kind, setKind] = useState("全部");
  const [eligibility, setEligibility] = useState("可探索");
  const [audience, setAudience] = useState("法律人转AI");
  const [message, setMessage] = useState("");
  const [live, setLive] = useState<{title:string;url:string;company:string;location:string;kind:string}[]>([]);
  const [feedDate,setFeedDate] = useState("");
  const [saved, setSaved] = useState<string[]>(()=>{
    if (typeof window === "undefined") return [];
    try {return JSON.parse(localStorage.getItem("global-radar-saved")||"[]");}catch{return [];}
  });
  async function refresh(){
    try {const base=location.pathname.includes("/ai-career-radar")?"/ai-career-radar/":"/";
      const r=await fetch(`${base}jobs-global-auto.json?t=${Date.now()}`,{cache:"no-store"});
      if(!r.ok) throw new Error(); const data=await r.json();setLive(data.items||[]);setFeedDate(data.generatedAt||"");setMessage("已载入已保存的检索结果；不会触发全网搜索。");
    } catch {setMessage("自动来源暂不可用，下方研究清单仍可使用。");}
  }
  function bookmark(id:string){const next=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];setSaved(next);try{localStorage.setItem("global-radar-saved",JSON.stringify(next));}catch{setMessage("浏览器未允许保存，本次收藏仅在页面内有效。");}}
  const visible=initial.filter(j=>(audience==="全部"||j.audiences.includes(audience))&&(region==="全部"||j.region===region)&&(kind==="全部"||j.kind===kind)&&(eligibility==="全部"||(eligibility==="可探索"?j.eligibility!=="不适用":j.eligibility===eligibility))&&JSON.stringify(j).toLowerCase().includes(query.toLowerCase()));
  async function copyBrief(j:typeof initial[number]){
    const text=`请研究这个岗位：${j.title}，${j.company}，${j.url}。我的背景类型是“${audience}”。请先读取最新原始JD，核对地区、合同类型、经验、语言、工时与薪酬；区分事实和推断。先向我询问必要的履历信息，再给出匹配证据、缺口和应询问的问题。不要虚构履历，不要代为投递。当前公开记录：${j.evidence}；${j.gap}`;
    try{await navigator.clipboard.writeText(text);setMessage("已复制研究任务，可交给你的AI继续核对最新JD。");}catch{setMessage("复制失败，请从原始来源手动复制链接。");}
  }
  return <section className="global-radar" aria-labelledby="global-heading">
    <div className="global-top"><div><p className="eyebrow">AI CAREER RADAR · PUBLIC SOURCES</p><h1 id="global-heading">从原行业出发，寻找 AI 工作</h1><p>面向法律人和其他转行者，先核对工作地点与硬门槛，再比较岗位内容和职业价值。</p></div><a href="#domestic-history">法律AI历史库 ↓</a></div>
    <div className="global-tools">
      <label>搜索<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="公司、岗位、能力"/></label>
      <label>我的背景<select value={audience} onChange={e=>setAudience(e.target.value)}>{["法律人转AI","其他行业转AI","已有AI经验","全部"].map(v=><option key={v}>{v}</option>)}</select></label>
      <label>机构<select value={region} onChange={e=>setRegion(e.target.value)}>{["全部","境外企业","国内企业"].map(v=><option key={v}>{v}</option>)}</select></label>
      <label>合作形式<select value={kind} onChange={e=>setKind(e.target.value)}>{["全部","全职","项目制","人才库","机构观察"].map(v=><option key={v}>{v}</option>)}</select></label>
      <label>大陆适用性<select value={eligibility} onChange={e=>setEligibility(e.target.value)}>{["可探索","大陆可远程","大陆办公","待确认","不适用","全部"].map(v=><option key={v}>{v}</option>)}</select></label>
    </div>
    <p className="global-note">研究日期 2026-09-07 · {visible.length} 条结果 · 这是基于公开信息的职业线索；人才库和机构入口不计为确定空缺。</p>
    <div className="global-cards">{visible.map(j=><article key={j.id}>
      <div className="global-meta"><span>{j.company}</span><span>{j.kind} · {j.eligibility}</span></div>
      <h2><a href={j.url} target="_blank" rel="noreferrer">{j.title} ↗</a></h2><p>{j.fit}</p>
      <p><b>门槛与缺口：</b>{j.gap}</p><details><summary>查看证据与下一步</summary><p>{j.evidence}</p><p>{j.next}</p><p>报酬：{j.pay}；来源核对：{j.checked}；{j.stage}</p></details>
      <div className="global-card-actions"><button onClick={()=>bookmark(j.id)} aria-pressed={saved.includes(j.id)}>{saved.includes(j.id)?"已收藏":"收藏"}</button><button onClick={()=>copyBrief(j)}>复制 AI 研究任务</button></div>
    </article>)}</div>
    {!visible.length&&<p>没有符合全部条件的记录，可放宽合作形式或查看待确认项。</p>}
    <details className="global-live"><summary>官方招聘源自动发现</summary><p>定时程序读取 Welo Data、RWS 和 BJAK 的公开招聘接口。这里只展示线索；自动规则不会确认大陆签约资格或冒充AI评分。</p><button onClick={refresh}>载入最新结果 ↻</button><span> {feedDate?`最近成功采集：${new Date(feedDate).toLocaleString("zh-CN")}`:"尚未载入"}</span>{live.map(j=><p key={j.url}><a href={j.url} target="_blank" rel="noreferrer">{j.company} · {j.title} ↗</a> — {j.location} · {j.kind}</p>)}</details>
    <p role="status">{message}</p>
  </section>;
}
