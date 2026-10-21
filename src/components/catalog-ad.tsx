import {useEffect,useRef,useState} from 'react';
import {claimAd} from '@/lib/ad-policy.mjs';
const CLIENT='ca-pub-9523043610392807',SLOT='3166345030';
// Enable only after site approval AND deployment of the certified consent setup.
const enabled=import.meta.env.VITE_ADSENSE_APPROVED==='true'&&import.meta.env.VITE_ADSENSE_CONSENT_READY==='true';
let requestedThisDocument=false;
let script:Promise<void>|null=null;
function loadGoogle(){
 if(script)return script;
 script=new Promise<void>((resolve,reject)=>{const tag=document.createElement('script');tag.async=true;tag.crossOrigin='anonymous';tag.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+CLIENT;tag.onload=()=>resolve();tag.onerror=()=>reject(Error('Publicidade indisponível.'));document.head.appendChild(tag);});
 return script;
}
export function CatalogAd({blocked}:{blocked:boolean}){
 const anchor=useRef<HTMLDivElement>(null),unit=useRef<HTMLModElement>(null),inView=useRef(false),alive=useRef(true),blockedRef=useRef(blocked);
 blockedRef.current=blocked;
 const [show,setShow]=useState(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{
  if(!enabled||blocked||requestedThisDocument||/Electron\/|ZiezoAndroid\//.test(navigator.userAgent)||!navigator.locks)return;
  const element=anchor.current;if(!element)return;
  const observer=new IntersectionObserver(([entry])=>{inView.current=entry.isIntersecting;});observer.observe(element);
  let disposed=false;
  const check=()=>{
   if(disposed||!inView.current||document.visibilityState!=='visible'||document.fullscreenElement||document.querySelector('.auth-overlay')||requestedThisDocument)return;
   void navigator.locks.request('ziezo-ad-frequency',()=>{
    if(disposed||blockedRef.current||requestedThisDocument||!inView.current||!claimAd(localStorage,Date.now()))return;
    requestedThisDocument=true;setShow(true);
   }).catch(()=>{});
  };
  check();const timer=setInterval(check,30000);document.addEventListener('visibilitychange',check);
  return()=>{disposed=true;observer.disconnect();clearInterval(timer);document.removeEventListener('visibilitychange',check);};
 },[blocked]);
 useEffect(()=>{
  if(!show)return;
  let disposed=false;
  void loadGoogle().then(()=>{
   if(disposed||blockedRef.current||!alive.current||!unit.current?.isConnected)return;
   const w=window as Window&{adsbygoogle?:Record<string,unknown>[]};(w.adsbygoogle=w.adsbygoogle||[]).push({});
  }).catch(()=>{if(!disposed&&alive.current)setShow(false);});
  return()=>{disposed=true;};
 },[show]);
 if(!enabled)return null;
 return <div ref={anchor} className="catalog-ad-anchor" hidden={blocked}>{show&&<section className="catalog-ad" aria-label="Publicidade"><span>PUBLICIDADE</span><ins ref={unit} className="adsbygoogle" style={{display:'block'}} data-ad-client={CLIENT} data-ad-slot={SLOT} data-ad-format="horizontal" data-full-width-responsive="true"/></section>}</div>;
}

