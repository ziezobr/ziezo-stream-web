import {createClient} from 'npm:@supabase/supabase-js@2.118.0';
import {browseTMDB,getDetails,getSeason,TMDBError} from './tmdb.ts';
import {seed as catalog} from './shared/seed.ts';
const origins=new Set(['https://ziezobr.github.io','http://127.0.0.1:5174','http://localhost:5174']);
Deno.serve(async(req:Request)=>{
 const origin=req.headers.get('origin')||'';
 const headers={'Access-Control-Allow-Origin':origins.has(origin)?origin:'https://ziezobr.github.io','Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin','Cache-Control':'private, no-store'};
 const json=(body:unknown,status=200)=>Response.json(body,{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{headers,status:204});
 if(req.method!=='POST')return json({error:'Método inválido.'},405);
 try{
  const jwt=req.headers.get('Authorization')?.replace(/^Bearer /i,'');
  if(!jwt)return json({error:'Entre para continuar.'},401);
  const client=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!,{auth:{persistSession:false}});
  const {data,error}=await client.auth.getUser(jwt);
  if(error||!data.user)return json({error:'Sessão inválida.'},401);
  const input=await req.json();
  if(input.path==='catalog')return json({connected:true,items:catalog});
  if(input.path!=='tmdb')return json({error:'Rota não encontrada.'},404);
  const p=input.query||{},action=p.action||'browse',type=p.type||'movie';
  if(!['movie','tv'].includes(type))throw new TMDBError(400,'Tipo inválido.');
  if(action==='details'||action==='season'){
   const id=Number(p.id),season=Number(p.season);
   if(!Number.isSafeInteger(id)||id<=0||id>2147483647)throw new TMDBError(400,'Título inválido.');
   if(action==='season'){if(type!=='tv'||!Number.isInteger(season)||season<0||season>1000)throw new TMDBError(400,'Temporada inválida.');return json(await getSeason(id,season));}
   return json(await getDetails(type,id));
  }
  if(action!=='browse')throw new TMDBError(400,'Consulta inválida.');
  const mode=p.mode||'trending',page=Number(p.page||1),query=String(p.query||'').trim();
  if(!['trending','popular','top_rated','now_playing','upcoming','on_the_air','airing_today'].includes(mode)||!Number.isInteger(page)||page<1||page>500||query.length>150)throw new TMDBError(400,'Consulta inválida.');
  return json(await browseTMDB(mode,query,page,type));
 }catch(e){return json({error:e instanceof TMDBError?e.message:'Não foi possível concluir a consulta.'},e instanceof TMDBError?e.status:502);}
});

