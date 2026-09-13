"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import research from "./public-opportunities.json";

type LiveJob = { title: string; url: string; company: string; location: string; kind: string; eligibility: string };
type Feed = { generatedAt?: string; items?: LiveJob[] };
type DomesticJob = { id: number; title: string; sourceUrl: string; company: string; city: string; source: string; salary?: string; experience?: string };
type DomesticFeed = { generatedAt?: string; items?: DomesticJob[] };
type Stage = "未跟进" | "待研究" | "准备投递" | "已投递" | "面试中" | "结束";
type Opportunity = { id: string; company: string; title: string; url: string; location: string; kind: string; eligibility: string; fit: string; gap: string; evidence: string; next: string; source: "研究记录" | "自动发现" };

const stageOptions: Stage[] = ["未跟进", "待研究", "准备投递", "已投递", "面试中", "结束"];
const targetPattern = /legal|法律|法务|合规|合同|AI product|AI 产品|solution|解决方案|implementation|实施|workflow|工作流|evaluation|评测|trainer|训练|quality|质量|customer success|客户成功|founder/i;
const technicalPattern = /engineer|developer|算法|工程师|开发|full stack|backend|frontend|NLP/i;

function score(record: Opportunity, audience: string) {
  const text = `${record.title} ${record.fit} ${record.evidence}`;
  let value = targetPattern.test(text) ? 4 : 0;
  if (/legal|法律|法务|合规|合同/i.test(text)) value += audience === "法律与AI应用" ? 5 : 2;
  if (/solution|解决方案|implementation|实施|workflow|工作流|product|产品|evaluation|评测|quality|质量/i.test(text)) value += 3;
  if (["大陆可远程", "大陆办公"].includes(record.eligibility)) value += 3;
  if (record.kind === "全职") value += 2;
  if (technicalPattern.test(record.title) && audience !== "技术开发") value -= 4;
  if (record.eligibility === "不适用") value -= 20;
  return value;
}

function readStages(): Record<string, Stage> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("career-radar-stages") || "{}"); } catch { return {}; }
}

export default function GlobalRadar() {
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState("法律与AI应用");
  const [eligibility, setEligibility] = useState("可探索");
  const [source, setSource] = useState("全部来源");
  const [stageFilter, setStageFilter] = useState("全部进度");
  const [live, setLive] = useState<LiveJob[]>([]);
  const [domestic, setDomestic] = useState<DomesticJob[]>([]);
  const [feedDate, setFeedDate] = useState("");
  const [message, setMessage] = useState("正在载入最新公开岗位");
  const [stages, setStages] = useState<Record<string, Stage>>(readStages);

  const loadFeed = useCallback(async () => {
    try {
      const base = window.location.pathname.includes("/ai-career-radar") ? "/ai-career-radar/" : "/";
      const stamp = Date.now();
      const read = async <T,>(file: string) => {
        const response = await fetch(`${base}${file}?t=${stamp}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
        return response.json() as Promise<T>;
      };
      const [globalResult, domesticResult] = await Promise.allSettled([
        read<Feed>("jobs-global-auto.json"),
        read<DomesticFeed>("jobs-auto.json"),
      ]);
      if (globalResult.status === "rejected" && domesticResult.status === "rejected") throw new Error("all feeds failed");
      const globalData = globalResult.status === "fulfilled" ? globalResult.value : {};
      const domesticData = domesticResult.status === "fulfilled" ? domesticResult.value : {};
      const globalItems = Array.isArray(globalData.items) ? globalData.items : [];
      const domesticItems = Array.isArray(domesticData.items) ? domesticData.items : [];
      setLive(globalItems);
      setDomestic(domesticItems);
      const timestamps = [globalData.generatedAt, domesticData.generatedAt].filter(Boolean) as string[];
      setFeedDate(timestamps.sort((a, b) => Date.parse(b) - Date.parse(a))[0] || "");
      setMessage(`已载入 ${domesticItems.length} 条国内、${globalItems.length} 条国际官方源线索`);
    } catch { setMessage("最新自动数据暂时无法载入，人工研究记录仍可使用"); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void loadFeed(), 0); return () => window.clearTimeout(timer); }, [loadFeed]);

  const records = useMemo<Opportunity[]>(() => {
    const studied = research.map(item => ({ id: item.id, company: item.company, title: item.title, url: item.url, location: item.region, kind: item.kind, eligibility: item.eligibility, fit: item.fit, gap: item.gap, evidence: item.evidence, next: item.next, source: "研究记录" as const }));
    const globalAutomatic = live.map(item => ({ id: item.url, company: item.company, title: item.title, url: item.url, location: item.location, kind: item.kind, eligibility: item.eligibility, fit: "企业官方招聘接口发现的公开职位，请结合职责和个人经历判断。", gap: "尚未人工核对经验、语言、薪酬、签约主体与中国大陆工作资格。", evidence: `官方列表地点：${item.location || "未注明"}。`, next: "打开原始职位，先核对硬门槛和地点资格。", source: "自动发现" as const }));
    const domesticAutomatic = domestic.map(item => ({ id: String(item.id), company: item.company, title: item.title, url: item.sourceUrl, location: item.city || "中国大陆", kind: "公开职位", eligibility: "大陆办公", fit: "国内公开招聘页面发现的法律 AI 相关职位，可直接核对职责与申请要求。", gap: "尚未人工核对在招状态、团队实际职责及个人匹配证据。", evidence: `${item.source || "公开招聘页"}标注地点：${item.city || "未注明"}${item.salary ? `，薪资：${item.salary}` : ""}${item.experience ? `，经验：${item.experience}` : ""}。`, next: "打开原始职位，核对在招状态和岗位硬门槛。", source: "自动发现" as const }));
    const seen = new Set<string>();
    return [...studied, ...domesticAutomatic, ...globalAutomatic].filter(item => { if (!item.url) return false; const key = item.url.toLowerCase().replace(/[?#].*$/, ""); if (seen.has(key)) return false; seen.add(key); return true; });
  }, [live, domestic]);

  const visible = useMemo(() => records
    .filter(item => audience === "技术开发" || score(item, audience) > 0)
    .filter(item => eligibility === "全部" || (eligibility === "可探索" ? item.eligibility !== "不适用" : item.eligibility === eligibility))
    .filter(item => source === "全部来源" || item.source === source)
    .filter(item => stageFilter === "全部进度" || (stages[item.id] || "未跟进") === stageFilter)
    .filter(item => JSON.stringify(item).toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => score(b, audience) - score(a, audience)), [records, eligibility, source, stageFilter, stages, query, audience]);

  const displayed = useMemo(() => {
    const perEmployer = new Map<string, number>();
    return visible.filter(item => {
      const count = perEmployer.get(item.company) || 0;
      if (count >= 5) return false;
      perEmployer.set(item.company, count + 1);
      return true;
    }).slice(0, 40);
  }, [visible]);

  function updateStage(id: string, stage: Stage) {
    const next = { ...stages, [id]: stage }; setStages(next);
    try { localStorage.setItem("career-radar-stages", JSON.stringify(next)); } catch { setMessage("浏览器未允许保存，进度只在本次页面有效"); }
  }

  async function copyBrief(item: Opportunity) {
    const text = `请评估这个职位：${item.title}，${item.company}，${item.url}。我的目标背景是“${audience}”。先读取最新原始JD，核对地点资格、合同形式、经验、语言、工时和薪酬；再向我询问必要履历，给出匹配证据、缺口、面试故事和下一步。不要虚构经历。当前线索：${item.evidence} ${item.gap}`;
    try { await navigator.clipboard.writeText(text); setMessage("已复制职位研究任务"); } catch { setMessage("复制失败，请手动复制职位链接"); }
  }

  const activeCount = Object.values(stages).filter(value => ["准备投递", "已投递", "面试中"].includes(value)).length;
  const employerCount = new Set(records.map(item => item.company)).size;

  return <section className="global-radar" aria-labelledby="global-heading">
    <div className="global-top">
      <div><p className="eyebrow">AI CAREER RADAR · 机会收件箱</p><h1 id="global-heading">今天，先看最值得行动的机会</h1><p>最新公开岗位与人工研究记录统一排序。选择你的背景，先排除地点和硬门槛，再决定下一步。</p></div>
      <div className="radar-summary"><strong>{visible.length}</strong><span>当前结果</span><strong>{employerCount}</strong><span>家机构</span><strong>{activeCount}</strong><span>条在推进</span></div>
    </div>
    <div className="global-tools">
      <label className="wide">搜索<input value={query} onChange={event => setQuery(event.target.value)} placeholder="岗位、公司、法律、评测、解决方案……" /></label>
      <label>我的方向<select value={audience} onChange={event => setAudience(event.target.value)}><option>法律与AI应用</option><option>产品与解决方案</option><option>专业领域转AI</option><option>技术开发</option></select></label>
      <label>大陆适用性<select value={eligibility} onChange={event => setEligibility(event.target.value)}>{["可探索", "大陆可远程", "大陆办公", "待确认", "不适用", "全部"].map(value => <option key={value}>{value}</option>)}</select></label>
      <label>信息来源<select value={source} onChange={event => setSource(event.target.value)}><option>全部来源</option><option>研究记录</option><option>自动发现</option></select></label>
      <label>求职进度<select value={stageFilter} onChange={event => setStageFilter(event.target.value)}><option>全部进度</option>{stageOptions.map(value => <option key={value}>{value}</option>)}</select></label>
    </div>
    <div className="feed-line"><span>{message}{feedDate && ` · 更新于 ${new Date(feedDate).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`}</span><button onClick={() => void loadFeed()}>重新载入</button></div>
    <div className="global-cards">{displayed.map((item, index) => <article key={item.id} className={(stages[item.id] || "未跟进") === "面试中" ? "is-active" : ""}>
      <div className="global-meta"><span>{String(index + 1).padStart(2, "0")} · {item.company}</span><span>{item.source} · {item.eligibility}</span></div>
      <h2><a href={item.url} target="_blank" rel="noreferrer">{item.title} ↗</a></h2>
      <p>{item.fit}</p><p className="record-location">{item.location} · {item.kind}</p>
      <p><b>待核对：</b>{item.gap}</p>
      <details><summary>证据与下一步</summary><p>{item.evidence}</p><p>{item.next}</p></details>
      <div className="global-card-actions"><label>进度<select value={stages[item.id] || "未跟进"} onChange={event => updateStage(item.id, event.target.value as Stage)}>{stageOptions.map(value => <option key={value}>{value}</option>)}</select></label><button onClick={() => void copyBrief(item)}>复制 AI 研究任务</button></div>
    </article>)}</div>
    {visible.length > displayed.length && <p className="global-note">为避免单一机构刷屏，每家机构最多展示 5 条；继续缩小关键词或切换方向，可以查看更有针对性的结果。</p>}
    {!visible.length && <div className="empty-state"><strong>没有符合全部条件的机会</strong><p>可以清空关键词，或把大陆适用性改为“全部”。</p></div>}
    <a className="history-link" href="#domestic-history">继续查看法律 AI 历史样本与市场分布 ↓</a>
  </section>;
}
