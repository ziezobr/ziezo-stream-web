'use client';
import { useEffect,useRef,useState,type CSSProperties } from 'react';
import { ShieldCheck,Sparkles,RotateCcw,Maximize2,Minimize2,LoaderCircle } from 'lucide-react';
import { embedUrl,imagePresets,PLAYER_SANDBOX,type EmbedEpisode,type ImagePreset } from '@/lib/embed-player';
import type { Title } from '@/lib/catalog';
export default function EmbedPlayer({item,episode}:{item:Title;episode?:EmbedEpisode}){
  const [preset,setPreset]=useState<ImagePreset>('balanced'),[reload,setReload]=useState(0),[loaded,setLoaded]=useState(false),[slow,setSlow]=useState(false),[failed,setFailed]=useState(false),[fullscreen,setFullscreen]=useState(false),[message,setMessage]=useState('');
  const shell=useRef<HTMLDivElement>(null);
  useEffect(()=>{try{const saved=localStorage.getItem('ziezo-image-preset-v3');if(saved&&Object.hasOwn(imagePresets,saved))setPreset(saved as ImagePreset);}catch{}},[]);
  useEffect(()=>{setLoaded(false);setFailed(false);setSlow(false);const timer=setTimeout(()=>setSlow(true),20000);return()=>clearTimeout(timer);},[item.id,item.type,episode?.season,episode?.episode,reload]);
  useEffect(()=>{const update=()=>setFullscreen(document.fullscreenElement===shell.current);document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update);},[]);
  const filter=imagePresets[preset];
  const choose=(value:ImagePreset)=>{setPreset(value);try{localStorage.setItem('ziezo-image-preset-v3',value);}catch{}};
  const expand=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(shell.current?.requestFullscreen)await shell.current.requestFullscreen();else setMessage('Neste navegador, use o botão de tela cheia do próprio player.');}catch{setMessage('Use o botão de tela cheia do próprio player neste navegador.');}};
  const suffix=episode?` · T${episode.season} E${episode.episode}${episode.name?` · ${episode.name}`:''}`:'';
  return <div className="embed-cinema" ref={shell}>
    <div className="embed-heading"><div><p className="eyebrow">PLAYER ZIEZO · EMBEDMOVIES</p><h2>{item.title}</h2>{suffix&&<p className="embed-episode-label">{suffix.slice(3)}</p>}</div><div className="embed-tools"><span className="player-protection"><ShieldCheck size={16}/>Pop-ups bloqueados</span><button className="icon-button" aria-label="Recarregar player" onClick={()=>setReload(n=>n+1)}><RotateCcw size={18}/></button><button className="icon-button" aria-label={fullscreen?'Sair da tela cheia':'Tela cheia do player'} onClick={()=>void expand()}>{fullscreen?<Minimize2 size={18}/>:<Maximize2 size={18}/>}</button></div></div>
    <div className="embed-screen" style={{'--ziezo-image-filter':filter.filter,'--ziezo-image-filter-mobile':filter.mobileFilter} as CSSProperties}>
      {!loaded&&!failed&&<div className="embed-loading" role="status"><LoaderCircle className="spin"/><p>{slow?'O provedor está demorando para responder.':'Carregando player externo…'}</p></div>}
      <iframe key={`${item.type}-${item.id}-${episode?.season}-${episode?.episode}-${reload}`} className={`embed-video ${preset!=='original'?'embed-enhanced':''}`} src={embedUrl(item.type,item.id,episode)} title={`Assistir ${item.title}${suffix}`} sandbox={PLAYER_SANDBOX} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" loading="eager" onLoad={()=>setLoaded(true)} onError={()=>{setFailed(true);setLoaded(false);}}/>
    </div>
    <div className="embed-controls"><label><Sparkles size={17}/><span>Melhorar imagem</span><select aria-label="Filtro de qualidade da imagem" value={preset} onChange={e=>choose(e.target.value as ImagePreset)}>{Object.entries(imagePresets).map(([value,p])=><option key={value} value={value}>{p.label}</option>)}</select></label><span className="image-state">{preset==='original'?'Imagem original':'Filtro de imagem ativo'}</span></div>
    {(failed||(!loaded&&slow))&&<div className="embed-feedback" role="alert"><p>{failed?'Não foi possível carregar o player.':'Se a tela continuar vazia, tente recarregar o player.'}</p><button className="secondary" onClick={()=>setReload(n=>n+1)}>Tentar novamente</button></div>}
    {message&&<p className="embed-feedback" role="status">{message}</p>}
    <div className="embed-notes"><p><ShieldCheck size={14}/> Proteção ativa contra novas janelas, downloads e redirecionamentos da página. Anúncios exibidos dentro do player podem continuar aparecendo.</p><p>O filtro ajusta cores, brilho e contraste, como no site antigo. Ele não aumenta a resolução do arquivo. Em tela cheia nativa do provedor, o filtro pode não ser aplicado.</p><p>Vídeo, áudio, legendas, disponibilidade e progresso são controlados pelo EmbedMovies. O carregamento do frame não confirma que há vídeo disponível para este título.</p></div>
  </div>;
}
