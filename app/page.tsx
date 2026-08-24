"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Job = {
  id: number;
  company: string;
  title: string;
  city: string;
  salary: string;
  experience: string;
  education: string;
  date: string;
  added: string;
  source: string;
  sourceUrl: string;
  status: "热招" | "活跃" | "观察" | "失效" | "自动发现";
  category: "产品" | "技术" | "运营";
  scope: string[];
  summary: string;
  signal: string;
};

type RoleFamily =
  | "企业内部法务 AI"
  | "法律科技产品"
  | "解决方案与交付"
  | "法律知识工程与评测"
  | "技术研发与 FDE"
  | "AI 原生法务"
  | "市场信号";

type VerificationState = "自动发现" | "在招" | "待复核" | "已关闭" | "市场信号";
type AudienceFit = "法律背景友好" | "交叉背景优先" | "技术背景优先";
type SourceTier = "企业官方" | "主流招聘平台" | "职业社交平台" | "公开转载";

type EnrichedJob = Job & {
  roleFamily: RoleFamily;
  verificationState: VerificationState;
  verifiedAt: string;
  employerType: string;
  audienceFit: AudienceFit;
  sourceTier: SourceTier;
  relation: "法律垂类" | "相邻赛道" | "市场信号";
  careerLevel: "校招 / 初级" | "中级" | "高级 / 专家" | "未公开";
};

type AutoFeed = {
  generatedAt: string;
  queryCount: number;
  itemCount: number;
  items: Job[];
};

const SNAPSHOT_DATE = "2026-08-24";
const ROLE_FAMILIES: RoleFamily[] = [
  "企业内部法务 AI",
  "法律科技产品",
  "解决方案与交付",
  "法律知识工程与评测",
  "技术研发与 FDE",
  "AI 原生法务",
];

const jobs: Job[] = [
  {
    id: 32,
    company: "阿里巴巴晓天衡宇",
    title: "大模型标注评测工程师（金融 / 法律 / 医疗）：设计专业评测与质量标准",
    city: "杭州",
    salary: "薪资未公开",
    experience: "3年以上",
    education: "本科",
    date: "07-23 更新 · 08-24 核验",
    added: "08-24",
    source: "公开招聘转载",
    sourceUrl: "https://www.mianshima.com/job/3/100025060002",
    status: "热招",
    category: "技术",
    scope: ["模型评测", "Rubric 设计", "数据质量"],
    summary:
      "面向金融、法律和医疗等专业领域建设标注与评测体系，制定专业数据标准，识别 LLM Judge 偏差与验证器漏洞，并推动数据质量闭环。",
    signal:
      "法律专业判断正在被拆解为可执行的评测标准、质量验收和奖励信号，形成法律人进入模型生产链路的新入口。",
  },
  {
    id: 31,
    company: "深圳传音控股",
    title: "AI 产品经理（校招）：参与企业级 Agent 平台、RAG 与评测机制设计",
    city: "深圳",
    salary: "薪资未公开",
    experience: "校园招聘",
    education: "本科",
    date: "06-17 发布 · 08-24 核验",
    added: "08-24",
    source: "校招信息平台",
    sourceUrl:
      "https://www.besthotsearch.com/jobs/c84524bb43d1e658b78e2c01c1624695",
    status: "热招",
    category: "产品",
    scope: ["Agent 平台", "RAG", "效果评测"],
    summary:
      "参与企业级 Agent 的创建、配置、编排、部署和监控，开展企业客户访谈与场景拆解，并设计工具接入、权限、多智能体协作和效果评估机制。",
    signal:
      "这是法律人可关注的相邻赛道：岗位向校招生开放，能力模型与企业法务 AI 工作台高度重合，但不要求既有法律科技履历。",
  },
  {
    id: 30,
    company: "影石创新",
    title: "法务管培生（2027校招）：用 AI 改造合同、检索、争议与合规工作流",
    city: "深圳",
    salary: "薪资未公开",
    experience: "校园招聘",
    education: "硕士",
    date: "07-20 更新 · 08-24 核验",
    added: "08-24",
    source: "校招信息平台",
    sourceUrl: "https://www.shushuqiuzhi.com/position/423362",
    status: "热招",
    category: "运营",
    scope: ["AI 法务提效", "法律检索", "工作流沉淀"],
    summary:
      "在合同、争议解决和多领域合规工作中主动使用通用 AI 工具，完成文书优化、合同筛查、批量整理和智能检索，并沉淀标准化办公方法。",
    signal:
      "岗位名称仍是传统法务，但 AI 实操、Prompt 优化和智能文档处理已成为明确加分项，代表“AI 原生法务”岗位正在出现。",
  },
  {
    id: 29,
    company: "得理法务",
    title: "产品经理：规划法律 SaaS 与 AI 应用并推动客户场景落地",
    city: "深圳",
    salary: "薪资未公开",
    experience: "3年以上",
    education: "本科",
    date: "招聘页持续招募 · 08-24 核验",
    added: "08-24",
    source: "得理官网",
    sourceUrl: "https://www.delilegal.com/recruitment",
    status: "热招",
    category: "产品",
    scope: ["法律 SaaS", "平台产品", "客户场景"],
    summary:
      "负责法律科技平台产品策划与重要模块，理解 AI 应用场景，结合客户需求、用户体验和产品传播推进法律 SaaS 持续迭代。",
    signal:
      "深圳法律科技厂商仍在招聘兼具平台产品、客户表达与法律场景理解的复合人才，是法律背景转产品的直接样本。",
  },
  {
    id: 28,
    company: "得理法务",
    title: "客户成功：推动法律科技产品采用、需求反馈与持续价值",
    city: "深圳",
    salary: "薪资未公开",
    experience: "经验未公开",
    education: "本科",
    date: "招聘页持续招募 · 08-24 核验",
    added: "08-24",
    source: "得理官网",
    sourceUrl: "https://www.delilegal.com/recruitment",
    status: "热招",
    category: "运营",
    scope: ["客户成功", "产品采用", "需求反馈"],
    summary:
      "服务法律科技客户，响应使用问题、推动产品采用并把一线需求反馈给内部团队，要求理解数字化转型趋势并具备组织协调能力。",
    signal:
      "解决方案与客户成功是法律人进入 LegalTech 的低摩擦入口：专业理解和沟通能力可以先创造价值，再逐步补齐产品方法。",
  },
  {
    id: 27,
    company: "华宇元典",
    title: "法律知识工程师（大模型方向）J10890：负责 Prompt 调优与模型校验",
    city: "北京",
    salary: "9–13K",
    experience: "经验不限 · 校园招聘",
    education: "本科",
    date: "06-11 发布 · 08-04 核验",
    added: "08-04",
    source: "智联招聘",
    sourceUrl:
      "https://www.zhaopin.com/jobdetail/CC409922380J40695394502.htm",
    status: "热招",
    category: "技术",
    scope: ["Prompt 调优", "数据优化", "效果验证"],
    summary:
      "调研大模型在法律领域的应用，参与产品规划和 Prompt 调优，并与技术及领域专家协作完成法律 AI 模型的数据分析、研发校验和效果测试。",
    signal:
      "岗位面向法律专业应届人才开放，说明法律科技厂商正把领域专家培养成直接参与提示工程、数据优化和模型评测的法律知识工程师。",
  },
  {
    id: 26,
    company: "君合律师事务所",
    title: "AI 算法工程师：融合法律知识图谱、Graph-RAG 与大模型推理",
    city: "北京",
    salary: "25–45K · 14薪",
    experience: "1–3年",
    education: "博士",
    date: "05-10 发布 · 08-04 核验",
    added: "08-04",
    source: "智联招聘",
    sourceUrl:
      "https://www.zhaopin.com/jobdetail/CC000016950J40754914016.htm",
    status: "热招",
    category: "技术",
    scope: ["知识图谱", "Graph-RAG", "知识推理"],
    summary:
      "构建法律知识图谱，研发信息抽取、语义搜索、智能问答和司法推荐算法，并探索知识图谱与大模型、RAG 和 Graph-RAG 的融合落地。",
    signal:
      "头部律所正在内部招聘博士级算法人才，并把目标从信息检索推进到知识推理，显示律所的法律 AI 建设开始形成自有技术护城河。",
  },
  {
    id: 25,
    company: "金慧科技",
    title: "律师 / 法务—AI 大模型训练师：负责训练数据合规审查与风险评估",
    city: "大连",
    salary: "10–20K",
    experience: "3–5年",
    education: "硕士",
    date: "08-04 发布 · 08-04 核验",
    added: "08-04",
    source: "智联招聘",
    sourceUrl:
      "https://www.zhaopin.com/jobdetail/CC612833320J40866730101.htm",
    status: "热招",
    category: "运营",
    scope: ["训练数据", "合规审查", "风险评估"],
    summary:
      "面向 AI 大模型标注场景开展合规审查，识别训练数据和业务流程中的法律风险并形成应对方案，要求法律职业资格和互联网法务或律师经验。",
    signal:
      "这是法律专业人员直接进入模型训练流程的又一信号：职责不再停留在事后咨询，而是把合规判断前置到数据生产和模型质量环节。",
  },
  {
    id: 24,
    company: "上海术丛智能科技",
    title: "AI 智能体开发工程师：构建合同审查、法律咨询与案件分析 Agent",
    city: "上海",
    salary: "15–20K",
    experience: "3年以上",
    education: "本科",
    date: "发布日期未标明 · 08-04 核验",
    added: "08-04",
    source: "智联招聘",
    sourceUrl:
      "https://www.zhaopin.com/jobdetail/CCL1275642020J40801413010.htm",
    status: "热招",
    category: "技术",
    scope: ["RAG", "多智能体", "事实核查"],
    summary:
      "设计法律 AI 智能体架构与核心模块，覆盖合同审查、法律咨询、案件分析、合规检查和法律意见初稿，并建立事实核查、多智能体验证和评估体系。",
    signal:
      "岗位把 RAG、Agent、事实核查、多智能体验证和生产评估写进同一职责，显示小型技术团队也在按生产级可靠性标准建设法律智能体。",
  },
  {
    id: 23,
    company: "人民法院电子音像出版社",
    title: "法律科技项目经理：交付法律大模型、数据库与知识服务项目",
    city: "北京",
    salary: "15–30K",
    experience: "3–5年",
    education: "本科",
    date: "发布日期未标明 · 08-04 核验",
    added: "08-04",
    source: "智联企业招聘页",
    sourceUrl:
      "https://www.zhaopin.com/companydetail/jobs-CZ570076820/",
    status: "热招",
    category: "产品",
    scope: ["项目交付", "法律数据库", "司法场景"],
    summary:
      "负责法律科技、法律大模型、法律数据库和知识服务项目的全生命周期管理，覆盖范围、计划、资源、实施部署、验收及上线运维。",
    signal:
      "同一招聘页同时出现项目经理、产品经理、解决方案经理和技术研发岗位，反映司法知识服务机构正在形成从售前到产品、研发和交付的完整团队。",
  },
  {
    id: 22,
    company: "威科中国",
    title: "法律 AI 产品培训顾问：连接客户成功、专业内容与产品本地化",
    city: "北京",
    salary: "15–18K · 15薪",
    experience: "3–5年",
    education: "本科",
    date: "07-20 发布 · 08-03 核验",
    added: "08-03",
    source: "智联招聘",
    sourceUrl:
      "https://www.zhaopin.com/jobdetail/CC000193810J40864785101.htm",
    status: "热招",
    category: "运营",
    scope: ["客户成功", "法律数据库", "产品本地化"],
    summary:
      "面向法律行业客户提供产品培训、检索流程和落地方案，沉淀知识库与标准化内容，并把一线需求反馈给产品团队推动本地化迭代。",
    signal:
      "法律 AI 团队开始补齐产品上线后的长期运营链路：岗位不承担销售拓客，却同时负责客户价值、内容资产、内部赋能和产品反馈闭环。",
  },
  {
    id: 21,
    company: "华宇元典",
    title: "法律 AI 产品经理 J10844：从市场研究到原型设计推进产品落地",
    city: "北京",
    salary: "薪资未公开",
    experience: "经验未公开",
    education: "本科",
    date: "08-04 核验",
    added: "08-03",
    source: "LinkedIn",
    sourceUrl:
      "https://cn.linkedin.com/jobs/view/%E6%B3%95%E5%BE%8Bai%E4%BA%A7%E5%93%81%E7%BB%8F%E7%90%86-j10844-at-%E5%8C%97%E4%BA%AC%E5%8D%8E%E5%AE%87%E5%85%83%E5%85%B8%E4%BF%A1%E6%81%AF%E6%9C%8D%E5%8A%A1%E6%9C%89%E9%99%90%E5%85%AC%E5%8F%B8-4420311421",
    status: "热招",
    category: "产品",
    scope: ["市场分析", "客户调研", "原型设计"],
    summary:
      "围绕法律 AI 产品开展市场与竞品分析、客户需求研究、产品规划、需求拆解和原型设计，并协同研发推动版本交付。",
    signal:
      "与同公司的模型测评实习岗位形成互补，说明法律科技厂商正在同时建设前端产品定义与后端可靠性评测能力。",
  },
  {
    id: 20,
    company: "上海星瀚律师事务所",
    title: "法律 AI 创新项目技术负责人：搭建全栈架构与技术团队",
    city: "上海",
    salary: "薪资未公开",
    experience: "3年以上",
    education: "本科",
    date: "08-03 核验",
    added: "08-03",
    source: "LinkedIn",
    sourceUrl:
      "https://cn.linkedin.com/jobs/view/%E6%B3%95%E5%BE%8B-ai-%E5%88%9B%E6%96%B0%E9%A1%B9%E7%9B%AE%E6%8A%80%E6%9C%AF%E8%B4%9F%E8%B4%A3%E4%BA%BA-at-%E4%B8%8A%E6%B5%B7%E6%98%9F%E7%80%9A%E5%BE%8B%E5%B8%88%E4%BA%8B%E5%8A%A1%E6%89%80-ricc-co-4420521257",
    status: "活跃",
    category: "技术",
    scope: ["全栈架构", "技术团队", "场景落地"],
    summary:
      "主导法律 AI 创新产品的技术架构和全栈实现，与产品、运营和业务团队协作，并从零搭建技术团队推进规模化交付。",
    signal:
      "律所首次以技术负责人而非外采项目经理的方式组织法律 AI，显示专业服务机构正在把核心工程能力内生化。",
  },
  {
    id: 19,
    company: "小米",
    title: "大模型领域专家研究员（法务与法律）：建设复杂法律 Agent",
    city: "北京",
    salary: "薪资未公开",
    experience: "专家级",
    education: "硕士优先",
    date: "08-04 核验 · 已停止申请",
    added: "08-03",
    source: "LinkedIn",
    sourceUrl:
      "https://cn.linkedin.com/jobs/view/%E5%A4%A7%E6%A8%A1%E5%9E%8B%E9%A2%86%E5%9F%9F%E4%B8%93%E5%AE%B6%E7%A0%94%E7%A9%B6%E5%91%98%EF%BC%88%E6%B3%95%E5%8A%A1%E4%B8%8E%E6%B3%95%E5%BE%8B%EF%BC%89-at-%E5%B0%8F%E7%B1%B3%E7%A7%91%E6%8A%80-4417828559",
    status: "失效",
    category: "技术",
    scope: ["法律 Agent", "案例推理", "跨境合规"],
    summary:
      "面向法律检索与案例推理、合规审查、合同审阅、公司治理、争议解决、并购和知识产权等复杂任务建设大模型 Agent。",
    signal:
      "企业不再只招聘通用算法工程师配合法务，而是直接寻找兼具法律领域深度与 Agent 研发能力的专家型人才。",
  },
  {
    id: 18,
    company: "字节跳动",
    title: "法务 AI 应用专家：识别高价值场景并推动产品落地与迭代",
    city: "北京",
    salary: "25–50K · 15薪",
    experience: "经验不限",
    education: "本科",
    date: "截止 09-28 · 08-24 核验",
    added: "07-30",
    source: "字节招聘聚合页",
    sourceUrl:
      "https://watchjobs.net/zh/explore/job/BYTEDANCE_7615128609917143349/%E6%B3%95%E5%8A%A1AI%E5%BA%94%E7%94%A8%E4%B8%93%E5%AE%B6-%E5%AD%97%E8%8A%82%E8%B7%B3%E5%8A%A8",
    status: "热招",
    category: "运营",
    scope: ["场景发现", "效果评估", "高质量数据"],
    summary:
      "围绕法务部工作场景识别高价值 AI 应用，制定产品方案并与研发团队协作，持续进行效果评估、迭代调优和行业技术跟踪。",
    signal:
      "这是本轮新增的头部互联网企业岗位。角色名称虽然是“应用专家”，实际同时承担需求发现、产品方案、数据建设与效果评估，更接近驻场式法务 AI FDE。",
  },
  {
    id: 17,
    company: "华宇元典",
    title: "AI 产品经理实习生：参与法律幻觉检测器与脱敏工具测评",
    city: "北京",
    salary: "120–200元 / 天",
    experience: "实习 · 3天/周",
    education: "本科",
    date: "07-30 核验",
    added: "07-30",
    source: "智联招聘",
    sourceUrl:
      "https://www.zhaopin.com/jobdetail/CC409922380J40953059402.htm",
    status: "热招",
    category: "产品",
    scope: ["幻觉检测", "数据脱敏", "模型测评"],
    summary:
      "参与 AI 脱敏工具和法律幻觉检测器的需求、PRD、测试用例与模型测评，重点统计 NER、召回率和误判率等生产指标。",
    signal:
      "本轮新增岗位把“法律幻觉检测器”独立成产品，并明确要求召回率、误判率等指标，说明可靠性正在从抽象原则变成可交付模块。",
  },
  {
    id: 16,
    company: "北京泰信天成",
    title: "法律 AI 产品经理：规划法律大模型 SaaS 与合规产品全生命周期",
    city: "深圳",
    salary: "10–18K",
    experience: "5–10年",
    education: "本科",
    date: "07-30 核验",
    added: "07-30",
    source: "智联招聘",
    sourceUrl:
      "https://www.zhaopin.com/jobdetail/CCL1483845330J40855785705.htm",
    status: "热招",
    category: "产品",
    scope: ["法律 SaaS", "产品规划", "合规设计"],
    summary:
      "面向法律垂直大模型平台进行 B/C 端业务规划、需求分析和全生命周期管理，覆盖法律检索、文书生成、案例分析与流程管理。",
    signal:
      "本轮新增的是法律科技供给方岗位。职责同时覆盖商业模式、平台场景、合规设计和产品上市，反映小型法律 AI 厂商需要更综合的产品负责人。",
  },
  {
    id: 15,
    company: "上海微创软件",
    title: "法律 AI 大模型：负责法律数据标注、问题反馈与专业能力优化",
    city: "上海",
    salary: "薪资未公开",
    experience: "经验不限",
    education: "本科",
    date: "07-30 核验",
    added: "07-30",
    source: "智联招聘",
    sourceUrl:
      "https://www.zhaopin.com/jobdetail/CC000638920J40865287414.htm",
    status: "活跃",
    category: "技术",
    scope: ["法律标注", "模型反馈", "专业评测"],
    summary:
      "要求法学背景和扎实法律知识，承担法律数据处理、标注报告、模型问题反馈与专业能力优化，推动法律大模型输出质量提升。",
    signal:
      "本轮新增岗位补充了产品岗之外的“法律数据与模型反馈”角色，说明法律专业人员开始直接进入模型质量闭环，而不只承担内容审核。",
  },
  {
    id: 14,
    company: "紫光展锐",
    title: "法务 AI 管培生 8232：推动法律工作标准化与智能化",
    city: "上海",
    salary: "薪资未公开",
    experience: "应届硕士",
    education: "硕士",
    date: "07-30 核验",
    added: "07-30",
    source: "公开招聘转载",
    sourceUrl:
      "https://bebee.com/cn/jobs/ai8232--ss-cn-ah3x68",
    status: "活跃",
    category: "运营",
    scope: ["Prompt 库", "合同提取", "数据安全"],
    summary:
      "使用大模型与法律垂直工具处理合同初稿、版本比对、条款提取、法规研究与知识沉淀，并探索法务 AI 工具的小范围试点。",
    signal:
      "这是本轮新发现的初级岗位，与同公司的产品经理、AI 助理构成三级人才梯队，显示企业内部法务 AI 已开始建立人才培养通道。",
  },
  {
    id: 1,
    company: "顺丰科技",
    title: "法务 AI 产品经理：覆盖合同、贸易合规与交易治理 Agent",
    city: "深圳",
    salary: "20–40K · 15薪",
    experience: "3–5年",
    education: "本科",
    date: "07-29",
    added: "07-29",
    source: "BOSS直聘",
    sourceUrl: "https://www.zhipin.com/zhaopin/c628a0d49b1a028a3n1-3968/",
    status: "热招",
    category: "产品",
    scope: ["合同审查", "贸易合规", "Agent"],
    summary:
      "岗位负责合同、法务知识权限、贸易合规与公司交易治理等法务 AI 产品规划，并结合大模型与 Agent 输出产品方案，推动流程优化。",
    signal:
      "范围不止合同审查，已经延伸到贸易合规、交易治理与流程自动化，显示企业内部法务 AI 正从单工具扩展为多模块工作平台。",
  },
  {
    id: 2,
    company: "百度",
    title: "法务产品经理：负责内部法务与合同系统",
    city: "北京",
    salary: "25–45K · 16薪",
    experience: "3–5年",
    education: "本科",
    date: "07-29",
    added: "07-29",
    source: "百度招聘",
    sourceUrl: "https://talent.baidu.com/jobs/list",
    status: "活跃",
    category: "产品",
    scope: ["合同系统", "PRD", "数据分析"],
    summary:
      "规划和建设公司内部法务及合同系统，承担需求分析、产品原型、跨团队交付、数据与用户反馈分析、质量测试和内部培训。",
    signal:
      "岗位重点在内部产品化和持续运营，法务需求、合同系统、数据分析、测试和培训被放在同一岗位闭环负责。",
  },
  {
    id: 3,
    company: "奇瑞汽车",
    title: "法务合规 IT 产品经理：建设合同全生命周期与合规规则库",
    city: "芜湖",
    salary: "25–45K · 15薪",
    experience: "5–10年",
    education: "本科",
    date: "06-04",
    added: "07-29",
    source: "智联招聘",
    sourceUrl: "https://m.zhaopin.com/jobs/CC120922220J40864901410.htm",
    status: "热招",
    category: "产品",
    scope: ["CLM", "义务库", "风险自评"],
    summary:
      "负责法务合规系统建设运营、PRD 与交付、数据闭环和培训推广；要求覆盖合同全生命周期、合规义务库、检查清单与事件处置。",
    signal:
      "这不是单一合同工具，而是合同、合规规则、检查、风险自评、事件处置和系统接口的一体化法务合规 IT 能力。",
  },
  {
    id: 4,
    company: "阿里巴巴",
    title: "法务智能化 AI 产品经理：负责内部法务 AI Native 产品",
    city: "杭州",
    salary: "薪资面议",
    experience: "3年以上",
    education: "本科",
    date: "07-29",
    added: "07-29",
    source: "阿里招聘",
    sourceUrl: "https://talent.alibaba.com/",
    status: "热招",
    category: "产品",
    scope: ["AI Native", "流程重塑", "Owner"],
    summary:
      "岗位作为法务领域 AI Native 产品 Owner，负责法务业务流程 AI 转型方案、产品建设、行业实践研究和内部需求抽象。",
    signal:
      "核心角色是持续负责的产品 Owner：把场景洞察、产品抽象、技术评估和落地推进放在同一个流程转型岗位。",
  },
  {
    id: 5,
    company: "腾讯",
    title: "智能体—法律行业产品专家：建设合同审核、检索与合规智能体",
    city: "深圳",
    salary: "未公开（转载页估算 35–55K）",
    experience: "资深",
    education: "不限",
    date: "07-03 发布 · 08-24 核验",
    added: "07-29",
    source: "公开职位镜像（标注来源：腾讯官网）",
    sourceUrl:
      "https://watchjobs.net/zh/explore/job/TENCENT_2058757448881324032/%E6%99%BA%E8%83%BD%E4%BD%93-%E6%B3%95%E5%BE%8B%E8%A1%8C%E4%B8%9A%E4%BA%A7%E5%93%81%E4%B8%93%E5%AE%B6-%E8%85%BE%E8%AE%AF",
    status: "热招",
    category: "产品",
    scope: ["法律检索", "合规尽调", "CLM"],
    summary:
      "搭建法律智能体专业能力体系，覆盖合同审核、法律检索和合规尽调，并规划行业数据接入与治理方案，推动产品落地。",
    signal:
      "关注的不只是合同审查单点，而是以法律数据治理为底座，覆盖律所、企业法务与合规部门的行业智能体产品体系。",
  },
  {
    id: 6,
    company: "蔚来汽车",
    title: "法务 AI 平台产品经理：重构法务工作流与知识生态",
    city: "上海",
    salary: "薪资面议",
    experience: "3年以上",
    education: "本科",
    date: "07-24",
    added: "07-29",
    source: "JobLeap",
    sourceUrl:
      "https://jobleap.cn/company/672272ad-e9c8-4be1-889e-729363428694",
    status: "活跃",
    category: "产品",
    scope: ["工作流", "知识库", "平台规划"],
    summary:
      "挖掘法务流程痛点并转化为产品需求，规划下一代法务 AI 平台全生命周期，推动功能迭代并构建法务科技生态。",
    signal:
      "“下一代平台”与“重构工作流”说明目标并非给现有系统加问答入口，而是重新设计法务工作的任务编排方式。",
  },
  {
    id: 7,
    company: "腾讯",
    title: "混元大模型后训练算法工程师：面向法务等专业垂域",
    city: "北京 / 深圳 / 上海",
    salary: "30–60K · 15薪",
    experience: "2年以上",
    education: "硕士",
    date: "07-21",
    added: "07-29",
    source: "腾讯招聘",
    sourceUrl: "https://cn.talent.com/view?id=616850176841818040",
    status: "热招",
    category: "技术",
    scope: ["Agentic RAG", "事实核查", "后训练"],
    summary:
      "建设金融、法务、医疗等垂域智能体，利用 Agentic RAG、推理规划、事实核查和多工具协同完成复杂专业任务。",
    signal:
      "法务与金融、医疗并列为混元专业垂域，团队正在补齐从基础检索问答到深度分析、研判和复杂执行的后训练能力。",
  },
  {
    id: 8,
    company: "紫光展锐",
    title: "法务 AI 助理：推进场景挖掘、试点验证与知识资产建设",
    city: "上海",
    salary: "薪资面议",
    experience: "应届 / 初级",
    education: "本科",
    date: "08-04 核验 · 已停止申请",
    added: "07-22",
    source: "LinkedIn",
    sourceUrl:
      "https://cn.linkedin.com/jobs/view/%E6%B3%95%E5%8A%A1ai%E5%8A%A9%E7%90%868222-at-%E7%B4%AB%E5%85%89%E5%B1%95%E9%94%90-4431702053",
    status: "失效",
    category: "运营",
    scope: ["Prompt", "Skill", "轻量 Agent"],
    summary:
      "作为法务部 AI 数字化业务 BP，负责场景试点、Prompt 和 Skill 配置、轻量 Agent、知识库以及跨部门项目落地。",
    signal:
      "岗位偏内部 FDE 和产品运营，说明企业法务正在形成持续迭代能力，而非一次性采购工具；适合观察新型法务数字化角色。",
  },
  {
    id: 9,
    company: "美团",
    title: "法务 AI 产品经理：把合同审核与咨询分流拆成可执行任务流",
    city: "北京",
    salary: "薪资未公开",
    experience: "经验不限",
    education: "不限",
    date: "07-15",
    added: "07-22",
    source: "DataHub",
    sourceUrl:
      "https://datahub.ac.cn/ai-jobs/topics/ai-product-manager-jobs.html",
    status: "热招",
    category: "产品",
    scope: ["任务流", "知识切片", "评测"],
    summary:
      "识别法务高频场景，将合同审核、咨询分流等法律流程拆解为系统任务流，推进文档结构化、引用溯源和评测机制。",
    signal:
      "把错误分级、人工复核和引用溯源写进产品职责，反映头部企业已将可靠性评测作为法律 AI 产品的核心工程。",
  },
  {
    id: 10,
    company: "华宇元典",
    title: "大数据 / AI 产品经理：建设法律科技智能中台",
    city: "北京",
    salary: "薪资面议",
    experience: "3–5年",
    education: "本科",
    date: "07-15",
    added: "07-22",
    source: "企业官网",
    sourceUrl:
      "https://yuandian.ailaw.cn/PositionsOnTheJob/index.aspx?jtype1id=19",
    status: "观察",
    category: "产品",
    scope: ["智能中台", "竞品分析", "法律科技"],
    summary:
      "围绕数据中台与智能中台进行产品规划、需求分析和迭代，结合客户项目、技术变化与法律科技趋势推进研发落地。",
    signal:
      "这是法律科技厂商侧的长期岗位样本，可与企业内部法务 AI 团队对照，观察供给方和需求方能力边界的变化。",
  },
  {
    id: 11,
    company: "紫光展锐",
    title: "法务 AI 产品经理：面向半导体集团的合同、合规与知识场景",
    city: "上海",
    salary: "薪资面议",
    experience: "3年以上",
    education: "硕士",
    date: "07-12",
    added: "07-22",
    source: "LinkedIn",
    sourceUrl:
      "https://cn.linkedin.com/jobs/view/%E6%B3%95%E5%8A%A1ai%E4%BA%A7%E5%93%81%E7%BB%8F%E7%90%868210-at-%E7%B4%AB%E5%85%89%E5%B1%95%E9%94%90-4426305777",
    status: "活跃",
    category: "产品",
    scope: ["RAG", "Agent", "数字化"],
    summary:
      "要求 AI 产品落地、RAG、Agent 工作流和复杂系统设计能力，法学、计算机或 AI 交叉背景以及半导体行业经验优先。",
    signal:
      "同一企业同时招聘产品经理和法务 AI 助理，说明团队正在形成“产品规划 + 场景运营”的双层配置。",
  },
  {
    id: 12,
    company: "大疆",
    title: "中 / 高级法律 AI 产品经理：建设法务知识库与智能问答",
    city: "深圳",
    salary: "薪资面议",
    experience: "中高级",
    education: "本科",
    date: "07-08",
    added: "07-18",
    source: "公开招聘页",
    sourceUrl:
      "https://bebee.com/cn/jobs/ai-mj005954-dji--techmap_cn_83083431",
    status: "活跃",
    category: "产品",
    scope: ["知识库", "智能问答", "法规制度"],
    summary:
      "建设法务知识库和智能问答系统，提升法规、制度、案例、模板的检索复用效率，持续探索和落地可行的法务 AI 场景。",
    signal:
      "知识库并非独立档案工程，而是连接法规、制度、案例和模板的复用底座，目标是支撑持续扩展的法务 AI 应用。",
  },
  {
    id: 13,
    company: "钉钉",
    title: "企业法务 AI 助理产品：合同风险识别与合规咨询",
    city: "杭州",
    salary: "产品动态",
    experience: "非招聘",
    education: "—",
    date: "07-03",
    added: "07-15",
    source: "钉钉官网",
    sourceUrl: "https://www.dingtalk.com/qidian/page-cDDLaPmT.html",
    status: "观察",
    category: "运营",
    scope: ["合同风险", "法律咨询", "产品动态"],
    summary:
      "作为补充市场信号收录：钉钉已将法务 AI 助理纳入企业高频场景，提供合同风险识别、法律咨询与合规支持。",
    signal:
      "招聘信号之外，办公平台产品上架同样能验证需求正在被标准化；这类条目应与真实招聘分开标注，避免误读。",
  },
];

const roleFamilyById: Record<number, RoleFamily> = {
  1: "企业内部法务 AI",
  2: "企业内部法务 AI",
  3: "企业内部法务 AI",
  4: "企业内部法务 AI",
  5: "法律科技产品",
  6: "企业内部法务 AI",
  7: "技术研发与 FDE",
  8: "AI 原生法务",
  9: "企业内部法务 AI",
  10: "法律科技产品",
  11: "企业内部法务 AI",
  12: "企业内部法务 AI",
  13: "市场信号",
  14: "AI 原生法务",
  15: "法律知识工程与评测",
  16: "法律科技产品",
  17: "法律知识工程与评测",
  18: "企业内部法务 AI",
  19: "技术研发与 FDE",
  20: "技术研发与 FDE",
  21: "法律科技产品",
  22: "解决方案与交付",
  23: "解决方案与交付",
  24: "技术研发与 FDE",
  25: "法律知识工程与评测",
  26: "技术研发与 FDE",
  27: "法律知识工程与评测",
  28: "解决方案与交付",
  29: "法律科技产品",
  30: "AI 原生法务",
  31: "技术研发与 FDE",
  32: "法律知识工程与评测",
};

const legalFriendlyIds = new Set([8, 13, 14, 15, 17, 22, 25, 27, 28, 30]);
const technicalIds = new Set([7, 20, 24, 26]);
const entryLevelIds = new Set([8, 14, 15, 17, 27, 30, 31]);
const verifiedTodayIds = new Set([5, 14, 28, 29, 30, 31, 32]);
const closedIds = new Set([8, 19]);

function inferSourceTier(job: Job): SourceTier {
  if (
    job.source.includes("官网") ||
    ["百度招聘", "阿里招聘"].includes(job.source)
  ) {
    return "企业官方";
  }
  if (job.source.includes("智联") || job.source.includes("BOSS")) {
    return "主流招聘平台";
  }
  if (job.source.includes("LinkedIn")) return "职业社交平台";
  return "公开转载";
}

function inferEmployerType(id: number): string {
  if ([20, 26].includes(id)) return "律所";
  if ([10, 16, 17, 21, 27, 28, 29].includes(id)) return "法律科技厂商";
  if ([22, 23, 24, 25].includes(id)) return "知识服务 / 项目交付";
  if ([5, 7, 32].includes(id)) return "AI 平台 / 科技企业";
  if (id === 13) return "办公平台产品";
  return "企业内部法务端";
}

function inferRoleFamily(job: Job): RoleFamily {
  if (roleFamilyById[job.id]) return roleFamilyById[job.id];
  const text = `${job.title} ${job.summary} ${job.scope.join(" ")}`.toLowerCase();
  if (/知识工程|评测|标注|训练师|rubric|数据质量/.test(text)) {
    return "法律知识工程与评测";
  }
  if (/解决方案|售前|实施|客户成功|培训顾问|交付/.test(text)) {
    return "解决方案与交付";
  }
  if (/算法|开发工程师|rag|llm|fde|技术负责人/.test(text)) {
    return "技术研发与 FDE";
  }
  if (/法务|律师|合规/.test(job.title) && !/产品/.test(job.title)) {
    return "AI 原生法务";
  }
  return "法律科技产品";
}

function inferCareerLevel(job: Job): EnrichedJob["careerLevel"] {
  if (entryLevelIds.has(job.id)) return "校招 / 初级";
  if (/1–3年|2年以上|3–5年/.test(job.experience)) return "中级";
  if (/3年以上|5–10年|中高级|资深|专家/.test(job.experience)) {
    return "高级 / 专家";
  }
  return "未公开";
}

function inferVerifiedAt(job: Job): string {
  if (verifiedTodayIds.has(job.id)) return SNAPSHOT_DATE;
  const fullDate = job.date.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  if (fullDate) return fullDate;
  const dates = [...job.date.matchAll(/(\d{2})-(\d{2})/g)];
  const latest = dates.at(-1);
  return latest ? `2026-${latest[1]}-${latest[2]}` : "未记录";
}

function enrichJob(job: Job): EnrichedJob {
  const roleFamily = inferRoleFamily(job);
  const verificationState: VerificationState =
    job.status === "自动发现"
      ? "自动发现"
      : job.id === 13
      ? "市场信号"
      : closedIds.has(job.id)
        ? "已关闭"
        : verifiedTodayIds.has(job.id)
          ? "在招"
          : "待复核";

  return {
    ...job,
    roleFamily,
    verificationState,
    verifiedAt: inferVerifiedAt(job),
    employerType: job.status === "自动发现" ? "自动发现来源" : inferEmployerType(job.id),
    audienceFit: job.status === "自动发现"
      ? roleFamily === "AI 原生法务" || roleFamily === "解决方案与交付"
        ? "法律背景友好"
        : roleFamily === "技术研发与 FDE"
          ? "技术背景优先"
          : "交叉背景优先"
      : technicalIds.has(job.id)
      ? "技术背景优先"
      : legalFriendlyIds.has(job.id)
        ? "法律背景友好"
        : "交叉背景优先",
    sourceTier: inferSourceTier(job),
    relation: job.id === 13 ? "市场信号" : job.id === 31 ? "相邻赛道" : "法律垂类",
    careerLevel: inferCareerLevel(job),
  };
}

export default function Home() {
  const [tab, setTab] = useState<"日报" | "库检索" | "趋势">("库检索");
  const [autoJobs, setAutoJobs] = useState<Job[]>([]);
  const [autoUpdatedAt, setAutoUpdatedAt] = useState<string | null>(null);
  const [autoNote, setAutoNote] = useState("正在载入自动数据");
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState("全部岗位族");
  const [city, setCity] = useState("全国");
  const [status, setStatus] = useState("全部状态");
  const [careerLevel, setCareerLevel] = useState("全部经验");
  const [audienceFit, setAudienceFit] = useState("全部背景");
  const [sourceTier, setSourceTier] = useState("全部来源");
  const [selected, setSelected] = useState<EnrichedJob | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showMethod, setShowMethod] = useState(false);

  const loadAutoFeed = useCallback(async (force = false) => {
    setRefreshing(true);
    if (force) setAutoNote("正在重新载入最近一次自动结果");
    try {
      const url = new URL("jobs-auto.json", window.location.href);
      url.searchParams.set("t", String(Date.now()));
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = (await response.json()) as AutoFeed;
      setAutoJobs(Array.isArray(payload.items) ? payload.items : []);
      setAutoUpdatedAt(payload.generatedAt || null);
      setAutoNote(
        payload.items?.length
          ? `自动发现 ${payload.items.length} 条，点击来源自行判断`
          : "本轮未发现新条目",
      );
    } catch {
      setAutoNote("自动数据暂时未载入，可稍后重试");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAutoFeed();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadAutoFeed]);

  const records = useMemo(() => {
    const seen = new Set<string>();
    return [...autoJobs, ...jobs]
      .filter((job) => {
        const key = job.sourceUrl.toLowerCase().replace(/[?#].*$/, "").replace(/\/$/, "");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(enrichJob);
  }, [autoJobs]);

  const sourceStats = useMemo(() => {
    const tones: Record<SourceTier, string> = {
      企业官方: "dark",
      主流招聘平台: "gold",
      职业社交平台: "blue",
      公开转载: "soft",
    };
    return (["企业官方", "主流招聘平台", "职业社交平台", "公开转载"] as SourceTier[])
      .map((name) => ({
        name,
        count: records.filter((job) => job.sourceTier === name).length,
        tone: tones[name],
      }))
      .filter((item) => item.count > 0);
  }, [records]);

  const capabilityStats = useMemo(() => {
    const groups = [
      ["Agent / 工作流", ["agent", "智能体", "工作流", "任务流"]],
      ["合同 / CLM", ["合同", "clm"]],
      ["知识库 / RAG", ["知识库", "rag", "知识图谱"]],
      ["合规风控", ["合规", "风控", "风险"]],
      ["评测与复核", ["评测", "复核", "核查", "校验", "验证"]],
    ] as const;
    return groups.map(([name, terms]) => ({
      name,
      count: records.filter((job) => {
        const text = `${job.title} ${job.summary} ${job.scope.join(" ")}`.toLowerCase();
        return terms.some((term) => text.includes(term));
      }).length,
    }));
  }, [records]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return records.filter((job) => {
      const haystack = [
        job.company,
        job.title,
        job.city,
        job.source,
        job.summary,
        job.signal,
        job.roleFamily,
        job.employerType,
        job.audienceFit,
        job.sourceTier,
        ...job.scope,
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!keyword || haystack.includes(keyword)) &&
        (family === "全部岗位族" || job.roleFamily === family) &&
        (city === "全国" || job.city.includes(city)) &&
        (status === "全部状态" || job.verificationState === status) &&
        (careerLevel === "全部经验" || job.careerLevel === careerLevel) &&
        (audienceFit === "全部背景" || job.audienceFit === audienceFit) &&
        (sourceTier === "全部来源" || job.sourceTier === sourceTier)
      );
    });
  }, [records, query, family, city, status, careerLevel, audienceFit, sourceTier]);

  const toggleBookmark = (id: number) => {
    setBookmarks((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const companyCount = new Set(
    records.filter((job) => job.relation !== "市场信号").map((job) => job.company),
  ).size;
  const recruitingCount = records.filter(
    (job) => ["自动发现", "在招"].includes(job.verificationState),
  ).length;
  const shenzhenCount = records.filter(
    (job) => job.city.includes("深圳") && job.verificationState !== "已关闭",
  ).length;
  const automaticDailyJobs = records.filter(
    (job) => job.verificationState === "自动发现",
  );
  const dailyJobs = automaticDailyJobs.length
    ? automaticDailyJobs
    : records.filter(
        (job) => job.verifiedAt === SNAPSHOT_DATE && job.verificationState === "在招",
      );

  const autoUpdatedLabel = autoUpdatedAt
    ? new Date(autoUpdatedAt).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "等待首次载入";

  return (
    <main>
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <div>
            <div className="brand-line">
              <strong>法律 AI 追踪</strong>
              <span className="edition">LEGAL INTELLIGENCE · 2026</span>
            </div>
            <p>从公开招聘信号，看企业法务 AI 正在如何落地</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="updated">
            <i /> 自动更新 {autoUpdatedLabel} · {autoNote}
          </span>
          <button
            className={`icon-button refresh-button ${refreshing ? "refreshing" : ""}`}
            aria-label="重新载入最新自动数据"
            title="重新载入最近一次定时检索结果"
            onClick={() => void loadAutoFeed(true)}
            disabled={refreshing}
          >
            <span aria-hidden="true">↻</span>
            <b>{refreshing ? "载入中" : "刷新"}</b>
          </button>
          <button
            className="method-button"
            onClick={() => setShowMethod(true)}
          >
            数据口径
          </button>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">LEGAL × AI · TALENT SIGNALS</span>
          <h1>
            企业正在为怎样的
            <br />
            <em>法务 AI 能力</em>买单？
          </h1>
          <p>
            追踪企业官网与公开招聘来源，将法律垂类和相邻 AI 岗位整理为
            可检索、可回溯、标注核验时间的市场情报。
          </p>
        </div>
        <div className="metric-panel" aria-label="核心统计">
          <div className="primary-metric">
            <span>自动发现 / 已核验在招</span>
            <strong>{recruitingCount}</strong>
            <small>条</small>
          </div>
          <div className="metric-row">
            <div>
              <strong>{companyCount}</strong>
              <span>企业 / 机构</span>
            </div>
            <div>
              <strong>{ROLE_FAMILIES.length}</strong>
              <span>岗位族</span>
            </div>
            <div>
              <strong>{shenzhenCount}</strong>
              <span>深圳信号</span>
            </div>
          </div>
        </div>
        <div className="signal-card">
          <span className="signal-index">本期判断 01</span>
          <p>
            岗位正在分化为六条路径：内部应用、产品、交付、知识评测、
            <strong>技术 FDE 与 AI 原生法务</strong>。
          </p>
        </div>
      </section>

      <nav className="tabs" aria-label="看板视图">
        {(["日报", "库检索", "趋势"] as const).map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item}
            {item === "库检索" && <span>{records.length}</span>}
          </button>
        ))}
        <div className="tab-note">
          {tab === "日报"
            ? `${dailyJobs.length} 条本期已核验信号`
            : tab === "趋势"
              ? "基于当前公开样本"
              : "全库可检索条目"}
        </div>
      </nav>

      {tab === "趋势" ? (
        <TrendView jobs={records} onSearch={() => setTab("库检索")} />
      ) : tab === "日报" ? (
        <DailyView
          jobs={dailyJobs.slice(0, 3)}
          onOpen={setSelected}
          onSearch={() => setTab("库检索")}
        />
      ) : (
        <>
          <section className="filters" aria-label="筛选招聘情报">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索机构、岗位、能力关键词，例如 Agent / 合同审核"
                aria-label="搜索"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="清空搜索">
                  ×
                </button>
              )}
            </label>
            <label>
              <span>地区</span>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option>全国</option>
                <option>深圳</option>
                <option>北京</option>
                <option>上海</option>
                <option>杭州</option>
                <option>芜湖</option>
                <option>大连</option>
              </select>
            </label>
            <label>
              <span>岗位族</span>
              <select value={family} onChange={(e) => setFamily(e.target.value)}>
                <option>全部岗位族</option>
                {ROLE_FAMILIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
                <option>市场信号</option>
              </select>
            </label>
            <label>
              <span>状态</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option>全部状态</option>
                <option>自动发现</option>
                <option>在招</option>
                <option>待复核</option>
                <option>已关闭</option>
                <option>市场信号</option>
              </select>
            </label>
            <label>
              <span>经验</span>
              <select
                value={careerLevel}
                onChange={(e) => setCareerLevel(e.target.value)}
              >
                <option>全部经验</option>
                <option>校招 / 初级</option>
                <option>中级</option>
                <option>高级 / 专家</option>
                <option>未公开</option>
              </select>
            </label>
            <label>
              <span>转型</span>
              <select
                value={audienceFit}
                onChange={(e) => setAudienceFit(e.target.value)}
              >
                <option>全部背景</option>
                <option>法律背景友好</option>
                <option>交叉背景优先</option>
                <option>技术背景优先</option>
              </select>
            </label>
            <label>
              <span>来源</span>
              <select
                value={sourceTier}
                onChange={(e) => setSourceTier(e.target.value)}
              >
                <option>全部来源</option>
                <option>企业官方</option>
                <option>主流招聘平台</option>
                <option>职业社交平台</option>
                <option>公开转载</option>
              </select>
            </label>
          </section>

          <section className="content-grid">
            <div className="results">
              <div className="results-head">
                <div>
                  <span>数据库 / ALL RECORDS</span>
                  <h2>全库条目</h2>
                </div>
                <p>
                  找到 <strong>{filtered.length}</strong> 条
                  {bookmarks.length > 0 && ` · 已收藏 ${bookmarks.length} 条`}
                </p>
              </div>

              <div className="job-list">
                {filtered.map((job, index) => (
                  <article className="job-row" key={job.id}>
                    <div className="job-number">
                      <strong>{String(index + 1).padStart(2, "0")}</strong>
                      <span>{job.added}</span>
                    </div>
                    <div className="job-content">
                      <div className="tags">
                        <span className="tag-country">国内</span>
                        <span className="tag-category">{job.roleFamily}</span>
                        <span className={`tag-status ${job.verificationState}`}>
                          {job.verificationState}
                        </span>
                        <span className="tag-new">
                          {job.added === "08-24" ? "本期新增" : job.relation}
                        </span>
                      </div>
                      <button
                        className="job-title"
                        onClick={() => setSelected(job)}
                      >
                        <b>{job.company}</b>
                        <span>{job.title}</span>
                      </button>
                      <div className="job-meta">
                        <a
                          href={job.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {job.source} ↗
                        </a>
                        <i />
                        <span>{job.city}</span>
                        <i />
                        <span>{job.salary}</span>
                        <i />
                        <span>{job.careerLevel}</span>
                        <i />
                        <span>{job.audienceFit}</span>
                        <i />
                        <span>{job.sourceTier}</span>
                        <i />
                        <span>最近核验 {job.verifiedAt}</span>
                      </div>
                      <p className="summary">{job.summary}</p>
                      <div className="scope-list">
                        {job.scope.map((item) => (
                          <span key={item}># {item}</span>
                        ))}
                      </div>
                      <div className="why">
                        <strong>值得看</strong>
                        <p>{job.signal}</p>
                      </div>
                    </div>
                    <button
                      className={`bookmark ${
                        bookmarks.includes(job.id) ? "saved" : ""
                      }`}
                      onClick={() => toggleBookmark(job.id)}
                      aria-label={
                        bookmarks.includes(job.id) ? "取消收藏" : "收藏"
                      }
                      title={bookmarks.includes(job.id) ? "取消收藏" : "收藏"}
                    >
                      {bookmarks.includes(job.id) ? "★" : "☆"}
                    </button>
                  </article>
                ))}
                {filtered.length === 0 && (
                  <div className="empty-state">
                    <strong>没有找到匹配条目</strong>
                    <p>试试减少关键词或放宽地区、类型筛选。</p>
                    <button
                      onClick={() => {
                        setQuery("");
                        setCity("全国");
                        setFamily("全部岗位族");
                        setStatus("全部状态");
                        setCareerLevel("全部经验");
                        setAudienceFit("全部背景");
                        setSourceTier("全部来源");
                      }}
                    >
                      清除全部筛选
                    </button>
                  </div>
                )}
              </div>
            </div>

            <aside>
              <div className="aside-block">
                <div className="aside-title">
                  <span>数据构成</span>
                  <small>SOURCE MIX</small>
                </div>
                <div className="source-bars">
                  {sourceStats.map((item) => (
                    <div key={item.name}>
                      <p>
                        <span>{item.name}</span>
                        <strong>{item.count}</strong>
                      </p>
                      <i>
                        <b
                          className={item.tone}
                          style={{
                            width: `${(item.count / Math.max(...sourceStats.map((source) => source.count))) * 100}%`,
                          }}
                        />
                      </i>
                    </div>
                  ))}
                </div>
              </div>

              <div className="aside-block keyword-block">
                <div className="aside-title">
                  <span>高频能力词</span>
                  <small>TOP SKILLS</small>
                </div>
                {capabilityStats.map(({ name, count }, index) => (
                  <button
                    key={name}
                    onClick={() =>
                      setQuery(name.split(" / ")[0].split("与")[0])
                    }
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <b>{name}</b>
                    <em>{count}</em>
                  </button>
                ))}
              </div>

              <div className="aside-block method-card">
                <span>研究说明</span>
                <h3>这不是招聘搬运</h3>
                <p>
                  现阶段由维护者人工发现、去重和核验。每条记录保留来源层级与最近核验时间；无法确认仍在招聘时统一标记为“待复核”。
                </p>
                <button onClick={() => setShowMethod(true)}>
                  查看采集方法 →
                </button>
              </div>
            </aside>
          </section>
        </>
      )}

      <footer>
        <div>
          <span className="brand-mark" />
          <strong>法律 AI 追踪</strong>
        </div>
        <p>
          每日两次自动检索并发布 · 系统提供来源链接，岗位真实性和有效性由访问者自行判断
        </p>
        <span>© 2026 LEGAL AI INTELLIGENCE</span>
      </footer>

      {selected && (
        <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
          <section
            className="detail-panel"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="岗位详情"
          >
            <button
              className="close-button"
              onClick={() => setSelected(null)}
              aria-label="关闭"
            >
              ×
            </button>
            <span className="detail-kicker">
              RECORD {String(selected.id).padStart(2, "0")} · {selected.roleFamily}
            </span>
            <h2>{selected.company}</h2>
            <h3>{selected.title}</h3>
            <div className="detail-facts">
              <div>
                <span>地点</span>
                <strong>{selected.city}</strong>
              </div>
              <div>
                <span>机构类型</span>
                <strong>{selected.employerType}</strong>
              </div>
              <div>
                <span>核验状态</span>
                <strong>{selected.verificationState}</strong>
              </div>
              <div>
                <span>最近核验</span>
                <strong>{selected.verifiedAt}</strong>
              </div>
            </div>
            <div className="detail-section">
              <span>门槛与来源</span>
              <p>
                {selected.salary} · {selected.experience} · {selected.education} ·
                {selected.audienceFit} · {selected.sourceTier}
              </p>
            </div>
            <div className="detail-section">
              <span>岗位摘要</span>
              <p>{selected.summary}</p>
            </div>
            <div className="detail-section highlight">
              <span>研究判断</span>
              <p>{selected.signal}</p>
            </div>
            <div className="detail-scope">
              {selected.scope.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <a
              className="source-link"
              href={selected.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              查看原始来源 · {selected.source} ↗
            </a>
          </section>
        </div>
      )}

      {showMethod && (
        <div className="modal-backdrop" onMouseDown={() => setShowMethod(false)}>
          <section
            className="method-panel"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="数据采集方法"
          >
            <button
              className="close-button"
              onClick={() => setShowMethod(false)}
              aria-label="关闭"
            >
              ×
            </button>
            <span className="detail-kicker">METHODOLOGY · V1.1</span>
            <h2>这类看板是怎么做出来的？</h2>
            <ol className="method-steps">
              <li>
                <span>01</span>
                <div>
                  <strong>建立关键词组合</strong>
                  <p>
                    同时检索法律 AI、法务数智化、CLM、法律知识工程、模型评测、
                    企业智能体、解决方案、实施顾问与客户成功，并对重点企业做反向检索。
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <strong>优先抓取可验证来源</strong>
                  <p>
                    企业招聘官网优先，其次是主流招聘平台、职业社交网站与搜索快照；不绕过登录或反爬限制。
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <strong>结构化与去重</strong>
                  <p>
                    统一公司、岗位、城市、薪资、发布日期、职责、技能词和来源链接；以“公司
                    + 岗位 + 地点”识别重复。
                  </p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <strong>自动筛选与直接发布</strong>
                  <p>
                    定时任务按法律与 AI 双重关键词筛选、按链接去重并生成摘要；新结果直接标记为“自动发现”，不等待维护者人工确认。
                  </p>
                </div>
              </li>
            </ol>
            <div className="method-warning">
              <strong>当前运行方式</strong>
              <p>
                GitHub Actions 每天约 08:00 与 20:00（北京时间）执行公开搜索、更新数据并重新发布页面；GitHub
                的任务队列可能造成少量延迟。右上角刷新按钮只重新载入最近一次自动结果，不会在浏览器里临时启动搜索。
              </p>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function DailyView({
  jobs: dailyJobs,
  onOpen,
  onSearch,
}: {
  jobs: EnrichedJob[];
  onOpen: (job: EnrichedJob) => void;
  onSearch: () => void;
}) {
  const batchDate = dailyJobs[0]?.verifiedAt ?? SNAPSHOT_DATE;
  const [year = "2026", month = "08", day = "24"] = batchDate.split("-");
  const weekday = new Date(`${batchDate}T00:00:00+08:00`).toLocaleDateString(
    "zh-CN",
    { weekday: "long", timeZone: "Asia/Shanghai" },
  );

  return (
    <section className="daily-view">
      <div className="daily-date">
        <span>{year}</span>
        <strong>{month}.{day}</strong>
        <p>{weekday} · 自动批次</p>
      </div>
      <div className="daily-main">
        <span className="eyebrow">TODAY&apos;S BRIEFING</span>
        <h2>本期自动招聘情报</h2>
        <p className="daily-lead">
          系统每天两次检索法律 AI、法务数智化、Legal Engineer、模型评测、
          解决方案与企业智能体等关键词。以下条目未经维护者逐条确认，请直接打开来源判断是否适合投递。
        </p>
        <div className="daily-cards">
          {dailyJobs.map((job, index) => (
            <button key={job.id} onClick={() => onOpen(job)}>
              <span>0{index + 1}</span>
              <div>
                <small>{job.company}</small>
                <strong>{job.title}</strong>
                <p>{job.signal}</p>
              </div>
              <em>↗</em>
            </button>
          ))}
        </div>
        <button className="text-link" onClick={onSearch}>
          查看全部数据库 →
        </button>
      </div>
      <aside className="daily-aside">
        <span>一句话趋势</span>
        <blockquote>
          “法律 AI 的生产门槛，正在从接入模型，升级为合规数据、可验证推理与完整项目交付。”
        </blockquote>
        <small>基于当前 {jobs.length} 条公开记录的归纳判断</small>
      </aside>
    </section>
  );
}

function TrendView({
  jobs: trendJobs,
  onSearch,
}: {
  jobs: EnrichedJob[];
  onSearch: () => void;
}) {
  const roleRecords = trendJobs.filter(
    (job) => job.relation !== "市场信号" && job.verificationState !== "已关闭",
  );
  const roleDistribution = ROLE_FAMILIES.map((name) => {
    const count = roleRecords.filter((job) => job.roleFamily === name).length;
    return {
      name,
      count,
      value: roleRecords.length ? Math.round((count / roleRecords.length) * 100) : 0,
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <section className="trend-view">
      <div className="trend-head">
        <div>
          <span className="eyebrow">CURRENT SAMPLE ANALYSIS</span>
          <h2>法律 AI 岗位正在分化为六条路径</h2>
        </div>
        <button className="method-button" onClick={onSearch}>
          返回条目库
        </button>
      </div>
      <div className="trend-grid">
        <div className="chart-card">
          <span>六类岗位族样本占比</span>
          <div className="horizontal-chart">
            {roleDistribution.map(({ name, value, count }) => (
              <div key={name}>
                <p>
                  <span>{name}</span>
                  <strong>{count} · {value}%</strong>
                </p>
                <i>
                  <b style={{ width: `${value}%` }} />
                </i>
              </div>
            ))}
          </div>
        </div>
        <div className="shift-card">
          <span>能力迁移</span>
          <div className="shift-line old">
            <small>过去</small>
            <strong>合同审查</strong>
            <em>单点工具</em>
          </div>
          <div className="shift-arrow">↓</div>
          <div className="shift-line now">
            <small>现在</small>
            <strong>流程编排</strong>
            <em>专业 Agent</em>
          </div>
          <div className="shift-arrow">↓</div>
          <div className="shift-line next">
            <small>下一步</small>
            <strong>可靠执行</strong>
            <em>可追溯平台</em>
          </div>
        </div>
        <div className="trend-note">
          <span>研究结论 / 01</span>
          <h3>产品只是入口之一，不再等同于整个市场</h3>
          <p>
            企业内部应用、LegalTech 产品、解决方案交付、知识工程评测、技术 FDE
            和 AI 原生法务对应不同门槛。按岗位族检索，比只搜“法律 AI 产品经理”更完整。
          </p>
        </div>
        <div className="trend-note gold">
          <span>研究结论 / 02</span>
          <h3>法律背景正在模型生产与采用两端创造价值</h3>
          <p>
            一端是 Rubric、标注、事实核查和模型评测，另一端是需求访谈、产品采用、
            培训和客户成功。两端都需要把专业判断转化为组织可复用的方法。
          </p>
        </div>
      </div>
    </section>
  );
}
