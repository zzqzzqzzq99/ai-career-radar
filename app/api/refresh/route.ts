type LiveJob = {
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
  status: "热招";
  category: "产品" | "技术" | "运营";
  scope: string[];
  summary: string;
  signal: string;
};

const queries = [
  "法务AI",
  "法律AI产品经理",
  "法律大模型",
  "法务数字化AI",
];

const cleanText = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const match = (input: string, pattern: RegExp) =>
  cleanText(input.match(pattern)?.[1] ?? "");

const hash = (value: string) => {
  let result = 0;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(result) + 10000;
};

const inferCategory = (title: string): LiveJob["category"] => {
  if (/算法|大模型|研发|工程师|标注|数据/.test(title)) return "技术";
  if (/产品|经理|负责人/.test(title)) return "产品";
  return "运营";
};

const inferScope = (title: string) => {
  const candidates = [
    ["大模型", /大模型|LLM/i],
    ["合同", /合同/],
    ["合规", /合规/],
    ["Agent", /Agent|智能体/i],
    ["法律数据", /标注|数据/],
    ["产品规划", /产品|经理/],
  ] as const;
  const scopes = candidates
    .filter(([, pattern]) => pattern.test(title))
    .map(([label]) => label);
  return scopes.length ? scopes.slice(0, 3) : ["法律 AI", "公开招聘"];
};

const parseJobs = (html: string, now: Date): LiveJob[] => {
  const blocks = html.split(
    /<div class="joblist-box__item clearfix[^"]*">/i,
  );
  const monthDay = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .replace("/", "-");

  return blocks
    .slice(1, 16)
    .map((block) => {
      const sourceUrl =
        block.match(
          /<a href="(https?:\/\/(?:www\.)?zhaopin\.com\/jobdetail\/[^"]+)"/i,
        )?.[1] ?? "";
      const title = match(
        block,
        /class="jobinfo__name"[^>]*>([\s\S]*?)<\/a>/i,
      );
      const company = match(
        block,
        /class="companyinfo__name[^"]*"[^>]*>([\s\S]*?)<\/a>/i,
      );
      const salary = match(
        block,
        /class="jobinfo__salary"[^>]*>([\s\S]*?)<\/p>/i,
      );
      const location = match(
        block,
        /jobinfo__other-info-location-image[^>]*>[\s\S]*?<span>([\s\S]*?)<\/span>/i,
      );
      const otherInfo = Array.from(
        block.matchAll(
          /<div class="jobinfo__other-info-item">\s*([^<]+?)\s*<\/div>/gi,
        ),
      ).map((item) => cleanText(item[1]));

      if (!sourceUrl || !title || !company) return null;

      const category = inferCategory(title);
      return {
        id: hash(sourceUrl),
        company,
        title,
        city: location || "地点见原页面",
        salary: salary || "薪资未公开",
        experience: otherInfo[0] || "经验见原页面",
        education: otherInfo[1] || "学历见原页面",
        date: `${monthDay} 实时发现`,
        added: monthDay,
        source: "智联实时搜索",
        sourceUrl: sourceUrl.replace(/^http:/, "https:"),
        status: "热招" as const,
        category,
        scope: inferScope(title),
        summary: `实时搜索发现：${company}正在招聘“${title}”，页面展示地点为${location || "未注明"}，薪资为${salary || "未公开"}。`,
        signal:
          "该条目由网页端即时查询公开招聘结果生成，尚未进入定时发布的长期样本；详情和当前招聘状态请以原始页面为准。",
      };
    })
    .filter((job): job is LiveJob => job !== null);
};

export async function GET() {
  const now = new Date();
  try {
    const responses = await Promise.all(
      queries.map(async (query) => {
        const url = `https://www.zhaopin.com/sou/?kw=${encodeURIComponent(query)}`;
        const response = await fetch(url, {
          cache: "no-store",
          headers: {
            Accept: "text/html,application/xhtml+xml",
            "User-Agent": "Mozilla/5.0 Legal-AI-Talent-Radar/1.0",
          },
        });
        if (!response.ok) return "";
        const bytes = await response.arrayBuffer();
        return new TextDecoder("utf-8").decode(bytes);
      }),
    );

    const seen = new Set<string>();
    const jobs = responses
      .flatMap((html) => parseJobs(html, now))
      .filter((job) => {
        const key = job.sourceUrl.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        const legal = "法务|法律|合规|合同";
        const ai = "AI|大模型|智能体|Agent|RAG|数字化|科技|数据库|知识服务";
        return new RegExp(
          `(?:${legal}).*(?:${ai})|(?:${ai}).*(?:${legal})`,
          "i",
        ).test(job.title);
      })
      .slice(0, 20);

    return Response.json(
      {
        ok: true,
        checkedAt: new Intl.DateTimeFormat("zh-CN", {
          timeZone: "Asia/Shanghai",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
          .format(now)
          .replace(/\//g, "-"),
        scannedSources: responses.filter(Boolean).length,
        items: jobs,
      },
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      },
    );
  } catch {
    return Response.json(
      {
        ok: false,
        message: "公开招聘源暂时无法访问，请稍后重试。",
        items: [],
      },
      {
        status: 502,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
