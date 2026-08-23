import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the legal AI job dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>法律 AI 追踪｜招聘情报看板<\/title>/i);
  assert.match(html, /企业正在为怎样的/);
  assert.match(html, /全库条目/);
  assert.match(html, /公开信息研究样例/);
  assert.match(html, /岗位状态请以原始招聘页面为准/);
  assert.doesNotMatch(html, /Your site is taking shape|vinext-starter/i);
});

test("keeps source links and collection boundaries explicit", async () => {
  const [page, refreshRoute, layout, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/refresh/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  const jobsBlock = page.match(/const jobs: Job\[\] = \[([\s\S]*?)\n\];/);
  assert.ok(jobsBlock, "expected an embedded job dataset");

  const jobCount = (jobsBlock[1].match(/\n  \{\n    id:/g) ?? []).length;
  const sourceCount = (jobsBlock[1].match(/sourceUrl:/g) ?? []).length;
  assert.ok(jobCount >= 20, "expected a meaningful public sample");
  assert.equal(sourceCount, jobCount, "every record must retain a source URL");
  assert.doesNotMatch(jobsBlock[1], /sourceUrl:\s*["']http:\/\//i);

  assert.match(page, /不绕过登录或反爬限制/);
  assert.match(page, /岗位状态请以原始招聘页面为准/);
  assert.match(refreshRoute, /https:\/\/www\.zhaopin\.com\/sou\//);
  assert.doesNotMatch(refreshRoute, /\bCookie\b|\bAuthorization\b/);
  assert.match(layout, /NEXT_PUBLIC_SITE_URL/);
  assert.doesNotMatch(layout, /x-forwarded-host|requestHeaders/);

  const manifest = JSON.parse(packageJson);
  assert.equal(manifest.name, "legal-ai-job-tracker");
  assert.equal(manifest.license, "MIT");
});
