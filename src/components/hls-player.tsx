import {useEffect,useRef,useState} from 'react';
import Hls from 'hls.js';
import {Maximize,RefreshCw,X} from 'lucide-react';
export function HlsPlayer({onOpen}:{onOpen:()=>void}){
 const [input,setInput]=useState(''),[url,setUrl]=useState(''),[error,setError]=useState(''),[status,setStatus]=useState(''),[retry,setRetry]=useState(0);
 const video=useRef<HTMLVideoElement>(null),surface=useRef<HTMLDivElement>(null),hls=useRef<Hls|null>(null);
 const [levels,setLevels]=useState<{height:number;bitrate:number}[]>([]),[quality,setQuality]=useState('-1');
 useEffect(()=>{
  const el=video.current;if(!url||!el)return;
  setStatus('Carregando transmissão…');setError('');setLevels([]);setQuality('-1');
  let disposed=false;
  const timeout=setTimeout(()=>{if(!disposed&&el.readyState<2)setStatus('A transmissão está demorando. Confira a fonte ou tente novamente.');},20000);
  if(el.canPlayType('application/vnd.apple.mpegurl'))el.src=url;
  else if(Hls.isSupported()){
   const engine=new Hls({maxBufferLength:30,backBufferLength:30});hls.current=engine;
   engine.on(Hls.Events.MANIFEST_PARSED,()=>{if(!disposed){setLevels(engine.levels.map(l=>({height:l.height,bitrate:l.bitrate})));setStatus('Pronto. Toque em reproduzir.');}});
   engine.on(Hls.Events.ERROR,(_event,data)=>{if(data.fatal&&!disposed){setError(data.type===Hls.ErrorTypes.NETWORK_ERROR?'Não foi possível acessar a transmissão. A fonte pode estar fora do ar, expirada ou não permitir reprodução neste site.':'Este vídeo não é compatível ou a transmissão está com erro.');setStatus('');engine.destroy();if(hls.current===engine)hls.current=null;}});
   engine.loadSource(url);engine.attachMedia(el);
  }else{setError('Este navegador não suporta transmissões HLS. Tente Chrome, Edge ou Safari atualizado.');setStatus('');}
  return()=>{disposed=true;clearTimeout(timeout);hls.current?.destroy();hls.current=null;el.pause();el.removeAttribute('src');el.load();};
 },[url,retry]);
 const open=()=>{try{const parsed=new URL(input.trim());if(parsed.protocol!=='https:'||parsed.username||parsed.password)throw new Error();setError('');setUrl(parsed.href);setRetry(n=>n+1);onOpen();}catch{setError('Informe um link HTTPS válido da transmissão M3U8, sem usuário ou senha no endereço.');}};
 return <section className="direct-tv"><h2>Player ZIEZO</h2><p>Abra uma transmissão HLS pelo link M3U8. O endereço é usado apenas nesta sessão e não é salvo na sua conta.</p><form className="direct-tv-form" onSubmit={e=>{e.preventDefault();open();}}><label className="form-label">Link da transmissão<input type="url" value={input} onChange={e=>setInput(e.target.value)} placeholder="https://servidor.exemplo/canal.m3u8" autoComplete="off" required/></label><button className="primary" type="submit">Abrir transmissão</button></form>
 {url&&<><div className="direct-tv-controls"><button className="secondary" onClick={()=>setRetry(n=>n+1)}><RefreshCw size={16}/>Tentar novamente</button>{levels.length>1&&<label>Qualidade <select value={quality} onChange={e=>{setQuality(e.target.value);if(hls.current)hls.current.currentLevel=Number(e.target.value);}}><option value="-1">Automática</option>{levels.map((l,i)=><option key={i} value={i}>{l.height?`${l.height}p`:`${Math.round(l.bitrate/1000)} kbps`}</option>)}</select></label>}<button className="secondary" onClick={()=>{setUrl('');setStatus('');setError('');}}><X size={16}/>Fechar</button></div><div ref={surface} className="live-screen direct-tv-screen"><video ref={video} controls playsInline preload="metadata" aria-label="Transmissão no player ZIEZO" onPlaying={()=>{setStatus('');setError('');}} onCanPlay={()=>setStatus('Pronto. Toque em reproduzir.')} onWaiting={()=>setStatus('Carregando vídeo…')} onError={()=>{if(!hls.current){setError('Não foi possível reproduzir esta fonte. Confira o link e a disponibilidade.');setStatus('');}}}/><button className="live-fullscreen" aria-label="Tela cheia do player ZIEZO" onClick={()=>{const el=video.current as (HTMLVideoElement&{webkitEnterFullscreen?:()=>void})|null; if(document.fullscreenElement)void document.exitFullscreen();else if(surface.current?.requestFullscreen)void surface.current.requestFullscreen().catch(()=>setError('Use a tela cheia nos controles do vídeo.'));else if(el?.webkitEnterFullscreen)el.webkitEnterFullscreen();}}><Maximize size={18}/>Tela cheia</button></div>{status&&<p role="status">{status}</p>}</>}{error&&<p role="alert">{error}</p>}<small>A fonte precisa estar disponível e permitir acesso pelo navegador. Este player não inclui uma assinatura nem fornece canais.</small></section>;
}
