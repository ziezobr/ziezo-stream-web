import {createClient} from '@supabase/supabase-js';
import {accountState} from './account-state';
export const asset=(path:string)=>import.meta.env.BASE_URL+path.replace(/^\//,'');
const url=import.meta.env.VITE_SUPABASE_URL||'';
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||'';
export const configured=Boolean(url&&key);
export const googleLogin=import.meta.env.VITE_GOOGLE_LOGIN==='true';
export const supabase=configured?createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}}):null;
export async function apiFetch(path:string,options:RequestInit={}){
  if(path==='/api/state')return accountState(options.method||'GET',typeof options.body==='string'?JSON.parse(options.body):{});
  if(!supabase)return Response.json({error:'A nova conta Supabase ainda está sendo conectada.'},{status:503});
  const {data:{session}}=await supabase.auth.getSession();
  if(!session)return Response.json({error:'Entre na sua conta para continuar.'},{status:401});
  const parsed=new URL(path,'https://ziezo.local');
  return fetch(url+'/functions/v1/ziezo-api',{method:'POST',signal:options.signal,headers:{apikey:key,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'},body:JSON.stringify({path:parsed.pathname.replace('/api/',''),method:options.method||'GET',query:Object.fromEntries(parsed.searchParams),body:typeof options.body==='string'?JSON.parse(options.body):undefined})});
}
