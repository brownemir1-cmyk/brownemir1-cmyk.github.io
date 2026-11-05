export const MAX_BODY=200_000;
export const MAX_LINES=5_000;
export const MAX_POEMS=100;
export const MAX_NOTEBOOK=2_000_000;
export function checkText(title:string,body:string){
 if(title.length>500||body.length>MAX_BODY||body.split('\n').length>MAX_LINES)throw new Error('This demo supports titles up to 500 characters and poems up to 200,000 characters / 5,000 lines. Your existing drafts were kept.');
}
export function checkNotebook(poems:{title:string;body:string}[]){
 if(poems.length>MAX_POEMS||JSON.stringify(poems).length>MAX_NOTEBOOK)throw new Error('This notebook is too large for the browser demo (100 poems / 2 MB). Your existing drafts were kept.');
 for(const p of poems)checkText(p.title,p.body);
}
