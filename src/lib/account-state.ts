import {supabase} from './backend';
type Profile={id:string;name:string;avatar:string;kids:number};
type Entry={profileId:string;mediaKey:string;kind:string;position:number;duration:number;updatedAt:number};
type State={profiles:Profile[];library:Entry[];titles:unknown[]};
export async function accountState(method:string,body:Record<string,unknown>={}){
 if(!supabase)return Response.json({error:'Conexão indisponível.'},{status:503});
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return Response.json({error:'Entre na sua conta.'},{status:401});
 try{
  for(let retry=0;retry<4;retry++){
   const {data,error}=await supabase.from('ziezo_account_state').select('payload,revision').eq('user_id',user.id).maybeSingle();
   if(error)throw error;
   if(!data){const initial:State={profiles:[{id:user.id,name:String(user.user_metadata?.display_name||'Meu perfil').slice(0,24),avatar:'lime',kids:0}],library:[],titles:[]};const inserted=await supabase.from('ziezo_account_state').insert({user_id:user.id,payload:initial,revision:0});if(inserted.error&&inserted.error.code!=='23505')throw inserted.error;continue;}
   const state=data.payload as State;
   if(method==='GET')return Response.json(state);
   const profile=state.profiles.find(p=>p.id===body.profileId),action=String(body.action||''),key=String(body.mediaKey||'');
   if(action==='profile.create'){
    if(state.profiles.length>=5)throw Error('Você pode criar até cinco perfis.');
    state.profiles.push({id:crypto.randomUUID(),name:String(body.name||'Perfil').trim().slice(0,24),avatar:String(body.avatar||'blue'),kids:body.kids?1:0});
   }else{
    if(!profile)throw Error('Perfil não encontrado.');
    if(action==='profile.update'){profile.name=String(body.name||'Perfil').trim().slice(0,24);profile.avatar=String(body.avatar||'lime');profile.kids=body.kids?1:0;}
    else if(action==='profile.delete'){if(profile.id===user.id)throw Error('O perfil principal não pode ser removido.');state.profiles=state.profiles.filter(p=>p.id!==profile.id);state.library=state.library.filter(e=>e.profileId!==profile.id);}
    else{
     if(!/^(movie|tv)-[1-9]\d*$/.test(key))throw Error('Título inválido.');
     const kind=action.startsWith('list.')?'list':'history';
     state.library=state.library.filter(e=>!(e.profileId===profile.id&&e.mediaKey===key&&e.kind===kind));
     if(action==='list.add'||action==='history.progress'){
      const position=Math.max(0,Number(body.position)||0),duration=Math.max(0,Number(body.duration)||0);
      if(kind==='list'||(duration>0&&position/duration<.96))state.library.push({profileId:profile.id,mediaKey:key,kind,position,duration,updatedAt:Date.now()});
     }else if(!['list.remove','history.remove'].includes(action))throw Error('Ação inválida.');
    }
   }
   state.library=state.library.slice(-1000);
   const updated=await supabase.from('ziezo_account_state').update({payload:state,revision:data.revision+1}).eq('user_id',user.id).eq('revision',data.revision).select('revision');
   if(updated.error)throw updated.error;
   if(updated.data.length)return Response.json({success:true});
  }
  throw Error('Sua biblioteca mudou. Tente novamente.');
 }catch(error){return Response.json({error:error instanceof Error?error.message:'Não foi possível salvar a biblioteca.'},{status:400});}
}
