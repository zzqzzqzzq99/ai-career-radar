"use client";

import { useMemo, useState } from "react";

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
  status: "热招" | "活跃" | "观察" | "失效";
  category: "产品" | "技术" | "运营";
  scope: string[];
  summary: string;
  signal: string;
};

const jobs: Job[] = [
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
    date: "07-30 核验",
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
    source: "LinkedIn",
    sourceUrl:
      "https://cn.linkedin.com/jobs/view/%E6%B3%95%E5%8A%A1ai%E7%AE%A1%E5%9F%B9%E7%94%9F8232-at-%E7%B4%AB%E5%85%89%E5%B1%95%E9%94%90-4437178166",
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
    salary: "AI估算 35–55K",
    experience: "资深",
    education: "不限",
    date: "07-29",
    added: "07-29",
    source: "腾讯招聘",
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

const sourceStats = [
  { name: "企业招聘与聚合", count: 6, tone: "dark" },
  { name: "招聘平台", count: 13, tone: "gold" },
  { name: "职业社交平台", count: 6, tone: "blue" },
  { name: "行业聚合页", count: 2, tone: "soft" },
];

export default function Home() {
  const [tab, setTab] = useState<"日报" | "库检索" | "趋势">("库检索");
  const [records, setRecords] = useState<Job[]>(jobs);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部岗位");
  const [city, setCity] = useState("全国");
  const [status, setStatus] = useState("全部状态");
  const [selected, setSelected] = useState<Job | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showMethod, setShowMethod] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshNote, setRefreshNote] = useState("本轮新增 5 条 · 更新 0 条 · 失效 2 条");
  const [lastUpdated, setLastUpdated] = useState("08-04 14:17");

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
        ...job.scope,
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!keyword || haystack.includes(keyword)) &&
        (category === "全部岗位" || job.category === category) &&
        (city === "全国" || job.city.includes(city)) &&
        (status === "全部状态" || job.status === status)
      );
    });
  }, [records, query, category, city, status]);

  const toggleBookmark = (id: number) => {
    setBookmarks((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const refreshNow = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshNote("正在搜索公开招聘源…");
    try {
      const response = await fetch(`/api/refresh?t=${Date.now()}`, {
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        ok: boolean;
        checkedAt?: string;
        message?: string;
        items?: Job[];
      };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "刷新失败");
      }
      const incoming = payload.items ?? [];
      const urls = new Set(
        records.map((item) =>
          item.sourceUrl.toLowerCase().replace(/\/$/, ""),
        ),
      );
      const fresh = incoming.filter((item) => {
        const key = item.sourceUrl.toLowerCase().replace(/\/$/, "");
        if (urls.has(key)) return false;
        urls.add(key);
        return true;
      });
      const addedCount = fresh.length;
      setRecords((current) => [...fresh, ...current]);
      setLastUpdated(payload.checkedAt ?? "刚刚");
      setRefreshNote(
        addedCount > 0
          ? `实时新增 ${addedCount} 条，已置顶`
          : `已扫描最新结果，本次无新增`,
      );
    } catch (error) {
      setRefreshNote(
        error instanceof Error ? error.message : "刷新失败，请稍后重试",
      );
    } finally {
      setRefreshing(false);
    }
  };

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
            <i /> 数据更新于 {lastUpdated} · {refreshNote}
          </span>
          <button
            className={`icon-button ${refreshing ? "refreshing" : ""}`}
            aria-label={refreshing ? "正在刷新数据" : "立即刷新数据"}
            title={refreshing ? "正在搜索公开招聘源" : "立即实时刷新"}
            onClick={refreshNow}
            disabled={refreshing}
          >
            <span aria-hidden="true">↻</span>
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
            追踪企业招聘官网、主流招聘平台与职业社交网站，
            把分散岗位整理成可检索、可验证、可持续观察的市场情报。
          </p>
        </div>
        <div className="metric-panel" aria-label="核心统计">
          <div className="primary-metric">
            <span>本期有效信号</span>
            <strong>{records.filter((job) => job.status !== "失效").length}</strong>
            <small>条</small>
          </div>
          <div className="metric-row">
            <div>
              <strong>19</strong>
              <span>企业</span>
            </div>
            <div>
              <strong>23</strong>
              <span>在招岗位</span>
            </div>
            <div>
              <strong>56%</strong>
              <span>产品类</span>
            </div>
          </div>
        </div>
        <div className="signal-card">
          <span className="signal-index">本周判断 01</span>
          <p>
            最新需求正在把法律专家直接嵌入
            <strong>训练数据、事实核查与智能体评估闭环</strong>。
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
            ? "今日新增 3 条重点信号"
            : tab === "趋势"
              ? "近 30 日样本分析"
              : "全库可检索条目"}
        </div>
      </nav>

      {tab === "趋势" ? (
        <TrendView onSearch={() => setTab("库检索")} />
      ) : tab === "日报" ? (
        <DailyView
          jobs={records.slice(0, 3)}
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
                <option>北京</option>
                <option>上海</option>
                <option>深圳</option>
                <option>杭州</option>
                <option>芜湖</option>
              </select>
            </label>
            <label>
              <span>类型</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>全部岗位</option>
                <option>产品</option>
                <option>技术</option>
                <option>运营</option>
              </select>
            </label>
            <label>
              <span>热度</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>全部状态</option>
                <option>热招</option>
                <option>活跃</option>
                <option>观察</option>
                <option>失效</option>
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
                        <span className="tag-category">{job.category}</span>
                        <span className={`tag-status ${job.status}`}>
                          {job.status}
                        </span>
                        <span className="tag-new">新入库</span>
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
                        <span>{job.experience}</span>
                        <i />
                        <span>{job.education}</span>
                        <i />
                        <span>页面 {job.date}</span>
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
                        setCategory("全部岗位");
                        setStatus("全部状态");
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
                          style={{ width: `${(item.count / 13) * 100}%` }}
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
                {[
                  ["Agent / 工作流", 11],
                  ["合同管理", 10],
                  ["知识库 / RAG", 9],
                  ["合规风控", 10],
                  ["评测与复核", 8],
                ].map(([name, count], index) => (
                  <button
                    key={String(name)}
                    onClick={() =>
                      setQuery(String(name).split(" / ")[0].split("与")[0])
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
                  同一职位跨平台自动去重，保留可访问来源，再按统一规则提炼能力信号。发布日期、发现日期与核验时间分开记录。
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
          公开信息研究样例 · 数据仅用于行业观察，岗位状态请以原始招聘页面为准
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
              RECORD {String(selected.id).padStart(2, "0")} · {selected.category}
            </span>
            <h2>{selected.company}</h2>
            <h3>{selected.title}</h3>
            <div className="detail-facts">
              <div>
                <span>地点</span>
                <strong>{selected.city}</strong>
              </div>
              <div>
                <span>薪资</span>
                <strong>{selected.salary}</strong>
              </div>
              <div>
                <span>经验</span>
                <strong>{selected.experience}</strong>
              </div>
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
            <span className="detail-kicker">METHODOLOGY · V1.0</span>
            <h2>这类看板是怎么做出来的？</h2>
            <ol className="method-steps">
              <li>
                <span>01</span>
                <div>
                  <strong>建立关键词组合</strong>
                  <p>
                    公司名 × 法务 / 法律 / 合规 × AI / 大模型 / Agent /
                    产品经理，通过搜索引擎发现公开页面。
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
                  <strong>自动核验与信号研判</strong>
                  <p>
                    区分网页发布日期、发现日期和最后核验时间；自动检测重复、失效链接与疑似过期岗位，并生成带来源的研判摘要。
                  </p>
                </div>
              </li>
            </ol>
            <div className="method-warning">
              <strong>建议的最小可行方案</strong>
              <p>
                系统每天 08:00 与 14:00 自动执行搜索、去重、状态核验、摘要和发布。招聘网站条款、robots.txt
                与个人信息保护要求仍优先于“抓得更多”。
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
  jobs: Job[];
  onOpen: (job: Job) => void;
  onSearch: () => void;
}) {
  return (
    <section className="daily-view">
      <div className="daily-date">
        <span>2026</span>
        <strong>08.04</strong>
        <p>星期二 · 第 05 期</p>
      </div>
      <div className="daily-main">
        <span className="eyebrow">TODAY&apos;S BRIEFING</span>
        <h2>今日法务 AI 招聘情报</h2>
        <p className="daily-lead">
          今天新增信号集中在法律知识工程、知识图谱推理、训练数据合规和智能体可靠性。
          法律专家正在更早进入模型生产链路，头部律所也开始直接招聘博士级算法人才建设自有技术能力。
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
        <small>基于本期 {jobs.length} 条公开信号的归纳判断</small>
      </aside>
    </section>
  );
}

function TrendView({ onSearch }: { onSearch: () => void }) {
  return (
    <section className="trend-view">
      <div className="trend-head">
        <div>
          <span className="eyebrow">30-DAY SIGNAL ANALYSIS</span>
          <h2>能力需求正在向“平台化”集中</h2>
        </div>
        <button className="method-button" onClick={onSearch}>
          返回条目库
        </button>
      </div>
      <div className="trend-grid">
        <div className="chart-card">
          <span>岗位核心能力提及率</span>
          <div className="horizontal-chart">
            {[
              ["Agent / 工作流", 68],
              ["合同管理", 60],
              ["知识库 / RAG", 52],
              ["合规风控", 56],
              ["评测与复核", 36],
            ].map(([name, value]) => (
              <div key={String(name)}>
                <p>
                  <span>{name}</span>
                  <strong>{value}%</strong>
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
          <h3>产品经理仍是最密集的岗位类型</h3>
          <p>
            样本中的产品岗不只写 PRD，更需要理解法务流程、数据治理、模型边界和跨部门落地。
            复合型“法律 × 产品 × AI”能力正在成为核心门槛。
          </p>
        </div>
        <div className="trend-note gold">
          <span>研究结论 / 02</span>
          <h3>评测、复核与引用溯源开始进入职责</h3>
          <p>
            法律场景容错率低。事实核查、错误分级、人工复核和证据溯源被明确写入职位，
            标志着行业从 Demo 能力进入生产级可靠性建设。
          </p>
        </div>
      </div>
    </section>
  );
}
