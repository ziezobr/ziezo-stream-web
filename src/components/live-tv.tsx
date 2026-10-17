import {useEffect,useRef,useState} from 'react';
import {Search,Tv,Play,RefreshCw,Maximize,Minimize} from 'lucide-react';
import channels from '../lib/live-channels.json';
import {prefersTV} from '../lib/tv-device.mjs';

export function LiveTV({kids}:{kids:boolean}){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('Todos'),[active,setActive]=useState<typeof channels[number]|null>(null),[reload,setReload]=useState(0),[loaded,setLoaded]=useState(false);
 const tv=(()=>{let saved=null;try{saved=localStorage.getItem('ziezo-tv-v2');}catch{}return prefersTV(navigator.userAgent,location.search,saved);})();
 const screen=useRef<HTMLDivElement>(null);
 const [fullscreen,setFullscreen]=useState(false),[screenError,setScreenError]=useState('');
 useEffect(()=>{const sync=()=>setFullscreen(document.fullscreenElement===screen.current);document.addEventListener('fullscreenchange',sync);return()=>document.removeEventListener('fullscreenchange',sync);},[]);
 const toggleFullscreen=async()=>{setScreenError('');try{if(document.fullscreenElement)await document.exitFullscreen();else if(screen.current?.requestFullscreen)await screen.current.requestFullscreen();else setScreenError('Use o botão de tela cheia dentro do player neste navegador.');}catch{setScreenError('Não foi possível abrir a tela cheia. Tente o botão dentro do player.');}};
 useEffect(()=>{setActive(null);},[kids]);
 useEffect(()=>{setLoaded(false);},[active,reload]);
 const available=channels.filter(c=>!kids||c.category==='Infantil');
 const categories=['Todos',...new Set(available.map(c=>c.category))];
 const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const filtered=available.filter(c=>(category==='Todos'||c.category===category)&&normalize(c.name).includes(normalize(query)));
 return <section className="browse-page live-tv"><p className="eyebrow">AGORA NA ZIEZO</p><h1>TV ao vivo</h1><p className="browse-intro">Escolha um canal e acompanhe a programação ao vivo.</p>{tv&&<p className="tv-device-info">Modo TV · Use as setas e OK no controle remoto.</p>}
  
 {active&&<section className="live-player" aria-label={`Assistindo ${active.name}`}><div className="section-head"><div><span className="live-badge">AO VIVO</span><h2>{active.name}</h2></div><div><button className="secondary" onClick={()=>setReload(n=>n+1)} aria-label="Recarregar canal"><RefreshCw size={16}/></button><button className="secondary" onClick={()=>setActive(null)}>Fechar player</button></div></div>{tv&&<div className="tv-player-help"><p>Use OK para abrir o vídeo. Se aparecer um anúncio, feche-o no player. Se não iniciar nesta TV, tente abrir diretamente no provedor.</p><a href={active.embedUrl}>Abrir player diretamente</a><button className="secondary" onClick={()=>document.querySelector<HTMLIFrameElement>('.live-screen iframe')?.focus()}>Controlar vídeo</button></div>}<div className="live-screen" ref={screen}><button className="live-fullscreen" onClick={()=>void toggleFullscreen()} aria-label={fullscreen?'Sair da tela cheia':'Abrir tela cheia'}>{fullscreen?<Minimize size={18}/>:<Maximize size={18}/>}<span>{fullscreen?'Sair':'Tela cheia'}</span></button>{!loaded&&<p role="status">Abrindo o player externo…</p>}<iframe key={`${active.id}-${reload}`} src={`${active.embedUrl}`} title={`${active.name} ao vivo`} allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-presentation" onLoad={()=>setLoaded(true)}/></div><small>{screenError&&<span role="alert">{screenError} </span>}Player externo Embed Canais. A disponibilidade e os anúncios do provedor podem variar. Se não iniciar, tente recarregar ou escolher outro canal.</small></section>}
 <div className="search-field"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar canal…" aria-label="Buscar canal ao vivo"/></div><div className="live-categories" aria-label="Categorias de canais">{categories.map(c=><button key={c} className={category===c?'primary':'secondary'} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><p className="live-count">{filtered.length} canais disponíveis no catálogo do provedor</p><div className="live-grid">{filtered.map(c=><button className={`live-channel ${active?.id===c.id?'selected':''}`} key={c.id} onClick={()=>{setActive(c);setReload(0);window.scrollTo({top:0,behavior:'smooth'});}} aria-pressed={active?.id===c.id}><div className="live-logo">{c.logo?<img src={c.logo} alt="" loading="lazy" onError={e=>{e.currentTarget.style.display='none';}}/>:<Tv/>}</div><strong>{c.name}</strong><span>{c.category}</span><span className="live-watch"><Play size={14}/>Assistir</span></button>)}</div>{!filtered.length&&<p role="status">Nenhum canal encontrado. Tente outro nome ou categoria.</p>}</section>;
}






