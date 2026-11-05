import { validatePpx, ppxToPoem, type Ppx, type CloudLink } from './ppx';
import {checkNotebook,MAX_NOTEBOOK} from './limits';
export type Poem = { id:string;title:string;body:string;updated:number;ppx?:Ppx;cloud?:CloudLink };
export const KEY='poetry-processor-mobile-v1';
export const freshPoem=():Poem=>({id:crypto.randomUUID(),title:'Untitled',body:'',updated:Date.now()});
export function readPoems(value:unknown):Poem[] {
 if(!Array.isArray(value)||!value.every(p=>p&&typeof p.id==='string'&&p.id.length&&typeof p.title==='string'&&typeof p.body==='string'&&typeof p.updated==='number'&&Number.isFinite(p.updated)))throw new Error('Choose a valid Poetry Processor backup.');
 if(new Set(value.map(p=>p.id)).size!==value.length)throw new Error('This backup has repeated poem IDs.');
 checkNotebook(value);
 return value.map(p=>({id:p.id,title:p.title,body:p.body,updated:p.updated,...(p.ppx?{ppx:validatePpx(p.ppx)}:{}),...(p.cloud&&typeof p.cloud.id==='string'&&typeof p.cloud.userId==='string'&&typeof p.cloud.documentId==='string'&&Number.isSafeInteger(p.cloud.revision)&&p.cloud.revision>0&&typeof p.cloud.title==='string'&&typeof p.cloud.body==='string'?{cloud:p.cloud}:{})}));
}
export function importPoems(text:string,name:string):Poem[] {
 if(text.length>MAX_NOTEBOOK)throw new Error('This import exceeds the 2 MB demo limit.');
 if(/\.txt$/i.test(name)){const body=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');if(!body.trim())throw new Error('This text file is empty.');const split=body.indexOf('\n\n');return [{...freshPoem(),title:split>0?body.slice(0,split):name.replace(/\.txt$/i,''),body:split>0?body.slice(split+2):body}];}
 const value=JSON.parse(text.replace(/^\uFEFF/,''));if(value?.document_type)return [ppxToPoem(value)];
 const poems=readPoems(Array.isArray(value)?value:value?.format==='poetry-processor-mobile'&&value?.version===1?value.poems:null);if(!poems.length)throw new Error('This backup contains no poems.');return poems;
}
export function mergePoems(current:Poem[],incoming:Poem[]):Poem[]{const result=[...current];for(const p of incoming){if(result.some(x=>x.id===p.id&&x.title===p.title&&x.body===p.body))continue;result.push(result.some(x=>x.id===p.id)?{...p,id:crypto.randomUUID(),cloud:undefined}:p);}checkNotebook(result);return result;}
