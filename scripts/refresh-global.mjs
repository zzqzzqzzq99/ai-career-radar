import {readFile,writeFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const out=new URL('../public/jobs-global-auto.json',import.meta.url);
const sources=[
  {company:'Welo Data',type:'lever',url:'https://api.lever.co/v0/postings/weloglobal?mode=json'},
  {company:'RWS',type:'lever',url:'https://api.lever.co/v0/postings/rws?mode=json'},
  {company:'BJAK',type:'ashby',url:'https://api.ashbyhq.com/posting-api/job-board/bjakcareer'}
];
export function extract(source,data){
  const rows=source.type==='ashby'?data.jobs:data;
  if(!Array.isArray(rows))throw new Error('Unexpected response shape');
  return rows.flatMap(j=>{
    const title=j.title||j.text||'';
    const location=source.type==='ashby'?j.location:[j.categories?.location,...(j.categories?.allLocations||[])].filter(Boolean).join(' / ');
    const remote=source.type==='ashby'?j.isRemote:j.workplaceType==='remote';
    if(!remote||!/\bChina\b/i.test(location))return [];
    if(!/AI|legal|founder|CEO Office|product|solution|operation|quality|trainer/i.test(`${title} ${j.categories?.department||''}`))return [];
    const url=j.jobUrl||j.hostedUrl;
    if(!url||!/^https:\/\//.test(url))return [];
    return [{company:source.company,title,location,kind:j.employmentType||j.categories?.commitment||'未注明',url,eligibility:'待逐岗核对正文与地区资格'}];
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  let previous={items:[],sources:[],generatedAt:null};try{previous=JSON.parse(await readFile(out,'utf8'));}catch{}
  const checkedAt=new Date().toISOString();
  const settled=await Promise.allSettled(sources.map(async s=>{
    const r=await fetch(s.url,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw new Error(`HTTP ${r.status}`);
    return extract(s,await r.json());
  }));
  const statuses=sources.map((s,i)=>({company:s.company,url:s.url,checkedAt,ok:settled[i].status==='fulfilled'}));
  const items=settled.flatMap((r,i)=>r.status==='fulfilled'?r.value:(previous.items||[]).filter(j=>j.company===sources[i].company));
  const success=settled.some(r=>r.status==='fulfilled');
  const payload={generatedAt:success?checkedAt:previous.generatedAt,lastAttemptAt:checkedAt,sources:statuses,items:[...new Map(items.map(j=>[j.url,j])).values()]};
  await writeFile(out,JSON.stringify(payload,null,2)+'\n');
  console.log(`International sources: ${statuses.filter(s=>s.ok).length}/${sources.length}; ${payload.items.length} candidate records`);
}
