import test from 'node:test';
import assert from 'node:assert/strict';
import {extract} from '../scripts/refresh-global.mjs';
test('retains China remote roles but does not certify eligibility',()=>{
 const result=extract({company:'Example',type:'ashby'},{jobs:[{title:'AI Product',location:'China',isRemote:true,jobUrl:'https://example.com/job'},{title:'AI Product',location:'US',isRemote:true,jobUrl:'https://example.com/us'},{title:'AI Product',location:'China',isRemote:false,jobUrl:'https://example.com/onsite'}]});
 assert.equal(result.length,1);assert.equal(result[0].eligibility,'待逐岗核对正文与地区资格');
});
test('rejects malformed source responses instead of silently erasing records',()=>{assert.throws(()=>extract({company:'x',type:'ashby'},{}));});
test('does not include unrelated worldwide language jobs',()=>{assert.deepEqual(extract({company:'x',type:'lever'},[{text:'AI Trainer French',workplaceType:'remote',hostedUrl:'https://example.com/job',categories:{location:'Worldwide'}}]),[]);});
test('does not treat a Chinese-language title as permission to work from China',()=>{assert.deepEqual(extract({company:'x',type:'lever'},[{text:'AI Trainer Chinese',workplaceType:'remote',hostedUrl:'https://example.com/job',categories:{location:'United States'}}]),[]);});
