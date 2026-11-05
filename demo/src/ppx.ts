import type { Poem } from './notebook';
import {checkText,MAX_NOTEBOOK} from './limits';
export type Ppx = {format_version:string;document_type:string;metadata:Record<string,unknown>;style:Record<string,unknown>;single_poem:{content:string;title:string;form?:string|null};custom_fields:Record<string,unknown>;[key:string]:unknown};
export type CloudLink = {id:string;documentId:string;userId:string;revision:number;title:string;body:string};
export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function validatePpx(value:unknown):Ppx {
 if(!value||typeof value!=='object')throw new Error('This is not a Poetry Processor document.');
 const p=value as Ppx;
 if(p.document_type!=='single_poem')throw new Error('Mobile currently opens individual poems only. Open manuscripts on PC.');
 if(p.format_version!=='1.0'||!p.single_poem||typeof p.single_poem.content!=='string'||typeof p.single_poem.title!=='string')throw new Error('Unsupported or damaged .poem file.');
 checkText(p.single_poem.title,p.single_poem.content);
 if(JSON.stringify(p).length>MAX_NOTEBOOK)throw new Error('The document exceeds the 2 MB demo limit.');
 for(const key of ['metadata','style','custom_fields'] as const) if(!p[key]||typeof p[key]!=='object'||Array.isArray(p[key]))throw new Error('Unsupported or damaged .poem file.');
 if(p.custom_fields.writing_mode==='Blackout'||p.custom_fields.writing_mode==='Experimental'||p.custom_fields.visual_layout)throw new Error('Open Blackout and Experimental poems on PC to preserve their layout.');
 return structuredClone(p);
}
function adjustedFormats(value:unknown,oldText:string,newText:string):unknown[] {
 if(!Array.isArray(value))return [];
 if(oldText===newText)return structuredClone(value);
 let start=0;while(start<oldText.length&&start<newText.length&&oldText[start]===newText[start])start++;
 let end=oldText.length,newEnd=newText.length;while(end>start&&newEnd>start&&oldText[end-1]===newText[newEnd-1]){end--;newEnd--;}
 const delta=newText.length-oldText.length;
 return value.flatMap(run=>{
  if(!run||typeof run.start!=='number'||typeof run.length!=='number')return [];
  if(run.start+run.length<=start)return [structuredClone(run)];
  if(run.start>=end)return [{...structuredClone(run),start:run.start+delta}];
  const result=[];if(run.start<start)result.push({...structuredClone(run),length:start-run.start});
  if(run.start+run.length>end)result.push({...structuredClone(run),start:newEnd,length:run.start+run.length-end});return result;
 });
}
export function poemToPpx(poem:Poem):Ppx {
 const date=new Date(poem.updated).toISOString();
 const p=poem.ppx?validatePpx(poem.ppx):{format_version:'1.0',document_type:'single_poem',metadata:{created:date,author:'',tags:[],description:'',status:'',form:''},style:{font_family:'Times New Roman',font_size:12,text_color:'#ffffff',background_color:'#1e1e1e',margin_preset:'Letter (1in)',margin_pixels:36},single_poem:{content:'',title:'',form:null},manuscript:null,project_state:{},submissions:[],custom_fields:{writing_mode:'Standard'}};
 p.custom_fields.inline_formats=adjustedFormats(p.custom_fields.inline_formats,p.single_poem.content,poem.body);
 p.single_poem={...p.single_poem,title:poem.title,content:poem.body};p.metadata={...p.metadata,title:poem.title,modified:date,word_count:(poem.body.trim().match(/\S+/g)||[]).length,line_count:poem.body?poem.body.split('\n').length:0};
 if(poem.cloud)p.custom_fields.cloud_link={document_id:poem.cloud.documentId,revisions:{[poem.cloud.userId]:poem.cloud.revision}};
 return p;
}
export function ppxToPoem(value:unknown):Poem {
 const p=validatePpx(value);return {id:crypto.randomUUID(),title:p.single_poem.title||String(p.metadata.title||'Untitled'),body:p.single_poem.content,updated:Date.now(),ppx:p};
}
export async function readPoemFile(file:Blob):Promise<Ppx> {
 if(file.size>MAX_NOTEBOOK)throw new Error('Choose a poem file smaller than 2 MB.');
 const bytes=new Uint8Array(await file.arrayBuffer());const source=new Blob([bytes]).stream();
 const stream=bytes[0]===0x1f&&bytes[1]===0x8b?source.pipeThrough(new DecompressionStream('gzip')):source;
 const reader=stream.getReader();const chunks:Uint8Array[]=[];let total=0;
 for(;;){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>MAX_NOTEBOOK){await reader.cancel();throw new Error('The expanded poem exceeds the 2 MB demo limit.');}chunks.push(value);}
 return validatePpx(JSON.parse(await new Blob(chunks as BlobPart[]).text()));
}
export async function poemFile(poem:Poem):Promise<Blob> {
 const raw=new Blob([JSON.stringify(poemToPpx(poem),null,2)],{type:'application/json'});
 return new Response(raw.stream().pipeThrough(new CompressionStream('gzip'))).blob();
}
export async function cloudId(owner:string,documentId:string):Promise<string> {
 if(!uuidPattern.test(owner)||!uuidPattern.test(documentId))throw new Error('Invalid cloud document identity.');
 const namespace=Uint8Array.from(owner.replaceAll('-','').match(/../g)!.map(x=>parseInt(x,16)));const name=new TextEncoder().encode(documentId);
 const bytes=new Uint8Array(namespace.length+name.length);bytes.set(namespace);bytes.set(name,16);
 const digest=new Uint8Array(await crypto.subtle.digest('SHA-1',bytes));digest[6]=(digest[6]&15)|80;digest[8]=(digest[8]&63)|128;
 const hex=Array.from(digest.slice(0,16),x=>x.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

