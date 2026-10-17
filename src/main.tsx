import React,{useState,useRef,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import Cinema from './cinema';
import {AuthProvider,useAuth} from './auth';
import {AuthPanel} from './components/auth-panel';
import './base.css';
import './modern.css';
import './tv.css';
function AuthDialog({recovery,onClose}:{recovery:boolean;onClose:()=>void}){
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{const before=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow='hidden';ref.current?.querySelector<HTMLInputElement>('input')?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();onClose();}if(e.key==='Tab'){const controls=Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),a[href]')||[]),first=controls[0],last=controls[controls.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);before?.focus();};},[onClose]);
  return <div className="auth-overlay" ref={ref} role="dialog" aria-modal="true" aria-label="Acessar conta ZIEZO"><button className="auth-close" aria-label="Fechar acesso" onClick={onClose}>×</button><AuthPanel recovery={recovery} onDone={onClose}/></div>;
}
function App(){const {user,recovery,closeRecovery}=useAuth();const [authOpen,setAuthOpen]=useState(false);const close=React.useCallback(()=>{setAuthOpen(false);closeRecovery();},[closeRecovery]);return <><Cinema user={user} onAuthRequest={()=>setAuthOpen(true)}/>{(authOpen||recovery)&&<AuthDialog recovery={recovery} onClose={close}/>}</>;}
createRoot(document.getElementById('root')!).render(<React.StrictMode><AuthProvider><App/></AuthProvider></React.StrictMode>);

