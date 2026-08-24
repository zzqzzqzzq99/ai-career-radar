import { readFile, writeFile } from "node:fs/promises";

const outputUrl = new URL("../public/jobs-auto.json", import.meta.url);
const queries = [
  "法务AI",
  "法律大模型",
  "法律知识工程师",
  "法律AI产品经理",
  "法务数字化AI",
  "法律AI解决方案",
  "法律科技客户成功",
  "AI法务管培生",
  "合同智能CLM",
  "法律模型评测",
  "企业智能体法务",
  "法律AI实施顾问",
];

const legalPattern = /(法律|法务|合规|合同|律所|律师|legal|clm)/i;
const aiPattern = /(ai|人工智能|大模型|智能体|agent|llm|rag|数字化|数智化|科技|知识工程|评测)/i;
const noisePattern = /(销售|业务拓展|案源|电销|客服|邀约|招生|课程顾问|兼职|讲师|教研)/i;

function cleanText(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function match(input, pattern) {
  return cleanText(input.match(pattern)?.[1] ?? "");
}

function canonicalUrl(value) {
  try {
    const url = new URL(value.replace(/^http:/, "https:"));
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|spm|from|source|track|ref)/i.test(key)) url.searchParams.delete(key);
    }
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return value.trim();
  }
}

function stableId(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return 100000 + (hash >>> 0) % 800000000;
}

function inferScope(text) {
  const groups = [
    ["Agent", /(agent|智能体|工作流)/i],
    ["合同 / CLM", /(合同|clm)/i],
    ["知识库 / RAG", /(知识库|rag|知识图谱)/i],
    ["合规风控", /(合规|风控|风险)/i],
    ["模型评测", /(评测|标注|训练|rubric|数据质量)/i],
    ["解决方案", /(解决方案|售前|实施|客户成功|交付)/i],
  ];
  const matches = groups.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  return matches.length ? matches.slice(0, 3) : ["法律 AI"];
}

function inferCategory(text) {
  if (/(工程师|算法|开发|评测|标注|训练)/i.test(text)) return "技术";
  if (/(客户成功|运营|培训|实施|交付|顾问)/i.test(text)) return "运营";
  return "产品";
}

function parseJobs(html, now) {
  const blocks = html.split(/<div class="joblist-box__item clearfix[^"]*">/i);
  const isoDate = now.toISOString().slice(0, 10);
  const shortDate = isoDate.slice(5);

  return blocks.slice(1, 31).flatMap((block) => {
    const sourceUrl = canonicalUrl(
      block.match(/<a href="(https?:\/\/(?:www\.)?zhaopin\.com\/jobdetail\/[^"]+)"/i)?.[1] ?? "",
    );
    const title = match(block, /class="jobinfo__name"[^>]*>([\s\S]*?)<\/a>/i);
    const company = match(block, /class="companyinfo__name[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
    const salary = match(block, /class="jobinfo__salary"[^>]*>([\s\S]*?)<\/p>/i);
    const city = match(
      block,
      /jobinfo__other-info-location-image[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/i,
    );
    const otherInfo = Array.from(
      block.matchAll(/<div class="jobinfo__other-info-item">\s*([^<]+?)\s*<\/div>/gi),
    ).map((item) => cleanText(item[1]));
    const text = title;

    if (!sourceUrl || !title || !company) return [];
    if (!legalPattern.test(text) || !aiPattern.test(text) || noisePattern.test(title)) return [];

    return [{
      id: stableId(sourceUrl),
      company,
      title,
      city: city || "地点未注明",
      salary: salary || "薪资未公开",
      experience: otherInfo[0] || "经验未提取",
      education: otherInfo[1] || "学历未提取",
      date: `${isoDate} 自动发现`,
      added: shortDate,
      source: "智联招聘 · 自动检索",
      sourceUrl,
      status: "自动发现",
      category: inferCategory(text),
      scope: inferScope(text),
      summary: `定时检索发现：${company}正在发布“${title}”，页面展示地点为${city || "未注明"}，薪资为${salary || "未公开"}。`,
      signal: "由定时检索自动发现并直接发布；请打开原始招聘页面自行判断岗位状态、职责和投递价值。",
    }];
  });
}

async function fetchQuery(query, now) {
  const url = new URL("https://www.zhaopin.com/sou/");
  url.searchParams.set("kw", query);
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 Legal-AI-Talent-Radar/0.3",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(25000),
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return parseJobs(await response.text(), now);
}

async function readPrevious() {
  try {
    return JSON.parse(await readFile(outputUrl, "utf8"));
  } catch {
    return { generatedAt: null, queryCount: queries.length, itemCount: 0, items: [] };
  }
}

const now = new Date();
const previous = await readPrevious();
const settled = await Promise.allSettled(queries.map((query) => fetchQuery(query, now)));
const successfulQueries = settled.filter((result) => result.status === "fulfilled").length;
const discovered = settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
const unique = new Map();

for (const item of discovered) {
  if (!unique.has(item.sourceUrl)) unique.set(item.sourceUrl, item);
}

const currentItems = [...unique.values()].slice(0, 60);
const items = successfulQueries === 0 || (currentItems.length === 0 && previous.items?.length)
  ? previous.items
  : currentItems;
const payload = {
  generatedAt: now.toISOString(),
  queryCount: queries.length,
  successfulQueries,
  itemCount: items.length,
  items,
};

await writeFile(outputUrl, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
process.stdout.write(
  `Legal AI auto refresh: ${successfulQueries}/${queries.length} queries, ${items.length} published items.\n`,
);
