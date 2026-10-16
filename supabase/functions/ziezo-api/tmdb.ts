
import { normalizeTitle, type RecordData, type TitleDetails, type Video, type Person, type Season, type Episode } from './shared/data.ts';
import type { Title } from './shared/types.ts';
type CacheRow={payload:string;updated_at:number};
const memory=new Map<string,{value:unknown;until:number}>();
const inflight=new Map<string,Promise<unknown>>();
export class TMDBError extends Error { constructor(public status:number,message:string){super(message);} }
export async function tmdb<T>(path:string,params:Record<string,string>={},ttl=3600000):Promise<T>{
  const token=Deno.env.get('TMDB_READ_ACCESS_TOKEN');
  if(!token)throw new TMDBError(503,'A conexão com o TMDB ainda não está disponível.');
  const query=new URLSearchParams({language:'pt-BR',...params});
  const key=path+'?'+query.toString(), now=Date.now(), local=memory.get(key);
  if(local&&local.until>now)return local.value as T;
  if(inflight.has(key))return inflight.get(key) as Promise<T>;
  const task=(async()=>{
    let stale:CacheRow|null=null;
    try{
      const response=await fetch('https://api.themoviedb.org/3/'+key,{headers:{Authorization:`Bearer ${token}`,accept:'application/json'},signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw new TMDBError(response.status===404?404:response.status===429?429:502,response.status===404?'Título não encontrado.':response.status===429?'Muitas consultas. Tente novamente em instantes.':'O TMDB não respondeu. Tente novamente.');
      const data=await response.json() as T;
      if(memory.size>=150)memory.delete(memory.keys().next().value!);
      memory.set(key,{value:data,until:now+ttl});
      return data;
    }catch(error){if(stale&&now-stale.updated_at<86400000)return JSON.parse(stale.payload) as T;throw error instanceof TMDBError?error:new TMDBError(502,'Não foi possível consultar o TMDB. Tente novamente.');}
  })().finally(()=>inflight.delete(key));
  inflight.set(key,task);return task;
}
type Page={results:RecordData[];page:number;total_pages:number;total_results:number};
export async function browseTMDB(mode:string,query:string,page:number,type:string){
  const path=query?'search/multi':mode==='trending'?'trending/all/week':`${type}/${mode}`;
  const data=await tmdb<Page>(path,{page:String(page),include_adult:'false',...(query?{query}:{}),...(type==='movie'?{region:'BR'}:{})},query?15*60000:3600000);
  const items=data.results.filter(d=>!d.adult&&(d.media_type===undefined||['movie','tv'].includes(d.media_type))).map(d=>normalizeTitle(d,d.media_type||type));
  return {items,page:data.page,totalPages:Math.min(data.total_pages,500),totalResults:data.total_results};
}
export async function getDetails(type:string,id:number):Promise<TitleDetails>{
  type Raw=RecordData&{credits?:{cast?:{id:number;name:string;character:string;profile_path:string|null}[];crew?:{id:number;name:string;job:string;profile_path:string|null}[]};videos?:{results?:{official:boolean;site:string;type:string;key:string;name:string}[]};images?:{backdrops?:{file_path:string}[];posters?:{file_path:string}[]};seasons?:Season[];recommendations?:Page;'watch/providers'?:{results?:{BR?:TitleDetails['providers']}};status?:string;tagline?:string};
  const data=await tmdb<Raw>(`${type}/${id}`,{append_to_response:'credits,videos,images,recommendations,watch/providers',include_image_language:'pt,en,null'},6*3600000);
  if(data.adult)throw new TMDBError(404,'Título não disponível.');
  let videos:Video[]=(data.videos?.results||[]).filter(v=>v.official&&v.site==='YouTube'&&/^[\w-]{11}$/.test(v.key)).map(v=>({key:v.key,name:v.name,type:v.type}));
  if(!videos.length){const fallback=await tmdb<Raw['videos']>(`${type}/${id}/videos`,{language:'en-US'},6*3600000);videos=(fallback?.results||[]).filter(v=>v.official&&v.site==='YouTube'&&/^[\w-]{11}$/.test(v.key)).map(v=>({key:v.key,name:v.name,type:v.type}));}
  const item=normalizeTitle(data,type);item.trailer=videos.find(v=>v.type==='Trailer')?.key;
  const person=(p:{id:number;name:string;profile_path:string|null},role:string):Person=>({id:p.id,name:p.name,role,photo:p.profile_path?`https://image.tmdb.org/t/p/w185${p.profile_path}`:null});
  const details={item,cast:(data.credits?.cast||[]).slice(0,24).map(p=>person(p,p.character)),crew:(data.credits?.crew||[]).filter(p=>['Director','Writer','Screenplay','Executive Producer','Creator'].includes(p.job)).slice(0,16).map(p=>person(p,p.job)),videos,images:[...(data.images?.backdrops||[]),...(data.images?.posters||[])].slice(0,12).map(p=>`https://image.tmdb.org/t/p/w780${p.file_path}`),seasons:data.seasons||[],recommendations:(data.recommendations?.results||[]).filter(d=>!d.adult).slice(0,12).map(d=>normalizeTitle(d,type)),providers:data['watch/providers']?.results?.BR||{},status:data.status||'',votes:data.vote_count||0,tagline:data.tagline||'',updatedAt:new Date().toISOString()};
  return details;
}
export async function getSeason(id:number,season:number){return tmdb<{name:string;episodes:Episode[]}>(`tv/${id}/season/${season}`,{},3600000);}

