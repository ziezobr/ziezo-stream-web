import {asset} from '@/lib/backend';
export function Brand({compact=false}:{compact?:boolean}){return <span className={`real-brand ${compact?'real-brand-compact':''}`}><span className="real-brand-mark"><img src={asset('ziezo-logo.png')} alt=""/></span>{!compact&&<span className="real-brand-type">ZIEZO<span>STREAM</span></span>}</span>;}
