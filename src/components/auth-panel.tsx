import {useState,type FormEvent} from 'react';
import {ArrowRight,Eye,EyeOff,LoaderCircle,Mail,ShieldCheck} from 'lucide-react';
import {configured,googleLogin,supabase} from '@/lib/backend';
import {Brand} from './brand';
type Mode='login'|'signup'|'forgot'|'update';
const authError=(message:string)=>{if(/invalid login/i.test(message))return 'E-mail ou senha incorretos.';if(/email not confirmed/i.test(message))return 'Confirme seu e-mail antes de entrar.';if(/already registered/i.test(message))return 'Este e-mail já possui uma conta. Tente entrar ou recuperar a senha.';if(/rate limit|too many/i.test(message))return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';if(/password/i.test(message))return 'Confira a senha e tente novamente. Use pelo menos 8 caracteres.';return 'Não foi possível concluir o acesso. Tente novamente em instantes.';};
export function AuthPanel({onDone,recovery=false}:{onDone?:()=>void;recovery?:boolean}){
  const [mode,setMode]=useState<Mode>(recovery?'update':'login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
  const switchMode=(next:Mode)=>{setMode(next);setError('');setMessage('');setPassword('');};
  const submit=async(event:FormEvent)=>{
    event.preventDefault();setError('');setMessage('');
    if(!supabase){setError('A nova conta Supabase ainda não foi conectada. O login será ativado após a configuração do projeto.');return;}
    if((mode==='signup'||mode==='update')&&password.length<8){setError('Use uma senha com pelo menos 8 caracteres.');return;}
    setBusy(true);
    try{
      const returnUrl=location.origin+import.meta.env.BASE_URL;
      if(mode==='login'){const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;onDone?.();}
      if(mode==='signup'){const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{display_name:name.trim()},emailRedirectTo:returnUrl}});if(error)throw error;if(data.session)onDone?.();else setMessage('Enviamos um link de confirmação para seu e-mail. Confirme para começar sua próxima sessão.');}
      if(mode==='forgot'){const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:returnUrl});if(error)throw error;setMessage('Se houver uma conta com este e-mail, você receberá as instruções para criar uma nova senha.');}
      if(mode==='update'){const {error}=await supabase.auth.updateUser({password});if(error)throw error;setMessage('Senha atualizada. Sua próxima história está esperando.');setPassword('');onDone?.();}
    }catch(e){setError(authError(e instanceof Error?e.message:''));}finally{setBusy(false);}
  };
  const google=async()=>{if(!supabase)return;setBusy(true);setError('');const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+import.meta.env.BASE_URL}});if(error){setError(authError(error.message));setBusy(false);}};
  return <div className="auth-panel"><Brand/><div className="auth-eyebrow">SEU UNIVERSO COMEÇA AQUI</div><h2>{mode==='signup'?'Uma conta. Infinitas histórias.':mode==='forgot'?'Vamos recuperar seu acesso.':mode==='update'?'Uma nova senha para continuar.':'Bom ter você de volta.'}</h2><p className="auth-subtitle">{mode==='login'?'Entre para guardar seus favoritos e continuar de onde parou.':mode==='signup'?'Seu perfil, sua lista e o cinema do seu jeito.':mode==='forgot'?'Informe o e-mail que você usou para criar sua conta.':'Escolha uma senha que você ainda não usou aqui.'}</p>
    {(mode==='login'||mode==='signup')&&<div className="auth-tabs" aria-label="Tipo de acesso"><button type="button" aria-pressed={mode==='login'} onClick={()=>switchMode('login')}>Entrar</button><button type="button" aria-pressed={mode==='signup'} onClick={()=>switchMode('signup')}>Criar conta</button></div>}
    <form onSubmit={e=>void submit(e)}>
      {mode==='signup'&&<label>Como podemos chamar você?<input name="name" value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="Seu nome" maxLength={60} required disabled={busy}/></label>}
      {mode!=='update'&&<label>E-mail<div className="auth-input"><Mail size={17}/><input name="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" placeholder="voce@exemplo.com" required disabled={busy}/></div></label>}
      {mode!=='forgot'&&<label>{mode==='update'?'Nova senha':'Senha'}<div className="auth-input"><input name="password" type={visible?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={mode==='login'?'current-password':'new-password'} placeholder={mode==='login'?'Sua senha':'Pelo menos 8 caracteres'} required minLength={mode==='login'?1:8} maxLength={128} disabled={busy}/><button type="button" aria-label={visible?'Ocultar senha':'Mostrar senha'} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>}
      {mode==='login'&&<button type="button" className="auth-forgot" onClick={()=>switchMode('forgot')}>Esqueci minha senha</button>}
      {error&&<p className="auth-feedback auth-error" role="alert">{error}</p>}{message&&<p className="auth-feedback auth-success" role="status">{message}</p>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy?<LoaderCircle className="spin" size={18}/>:<>{mode==='signup'?'Criar minha conta':mode==='forgot'?'Enviar instruções':mode==='update'?'Atualizar senha':'Entrar na ZIEZO'}<ArrowRight size={18}/></>}</button>
    </form>
    {googleLogin&&(mode==='login'||mode==='signup')&&<><div className="auth-or"><span/>ou continue com<span/></div><button className="auth-google" disabled={busy||!configured} onClick={()=>void google()}><span>G</span>Continuar com Google</button></>}
    {(mode==='forgot'||mode==='update')&&<button className="text-button" onClick={()=>switchMode('login')}>Voltar para entrar</button>}
    <p className="auth-trust"><ShieldCheck size={14}/>Sua conta é protegida pelo Supabase.</p>
  </div>;
}
