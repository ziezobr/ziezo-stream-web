import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import type {Session} from '@supabase/supabase-js';
import {supabase} from './lib/backend';
export type Account={id:string;name:string;email:string};
const AuthContext=createContext<{user:Account|null;loading:boolean;recovery:boolean;closeRecovery:()=>void}>({user:null,loading:true,recovery:false,closeRecovery:()=>{}});
export function AuthProvider({children}:{children:ReactNode}){
  const [session,setSession]=useState<Session|null>(null),[loading,setLoading]=useState(true),[recovery,setRecovery]=useState(false);
  useEffect(()=>{
    if(!supabase){setLoading(false);return;}
    let alive=true;
    void supabase.auth.getSession().then(({data})=>{if(alive){setSession(data.session);setLoading(false);}}).catch(()=>{if(alive)setLoading(false);});
    const {data}=supabase.auth.onAuthStateChange((event,next)=>{setSession(next);setLoading(false);if(event==='PASSWORD_RECOVERY')setRecovery(true);});
    return()=>{alive=false;data.subscription.unsubscribe();};
  },[]);
  const user=useMemo(()=>session?{id:session.user.id,email:session.user.email||'',name:String(session.user.user_metadata?.display_name||session.user.user_metadata?.full_name||session.user.email?.split('@')[0]||'Meu perfil')}:null,[session]);
  return <AuthContext.Provider value={{user,loading,recovery,closeRecovery:()=>setRecovery(false)}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
