'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Search, Play, Plus, Check, ChevronRight, ChevronLeft, X, Bell, Download, Film, Home, Bookmark, UserRound, SlidersHorizontal, ArrowUpRight, Monitor, Pencil, Trash2, LoaderCircle, ArrowLeft, Tv, Sparkles, Heart } from 'lucide-react';
import { catalog as initialCatalog, mediaKey, image, type Title } from '@/lib/catalog';
import { TMDBBrowse, TMDBDetails } from './tmdb-ui';
import {NotchNav} from './components/adaptive-notch';
import {Brand} from './components/brand';
import {CatalogAd} from './components/catalog-ad';
import {Downloads} from './components/downloads';
import {prefersTV} from './lib/tv-device.mjs';
import {asset,apiFetch,supabase} from './lib/backend';
import type {Account} from './auth';
import EmbedPlayer from './embed-player';
import {LiveTV} from './components/live-tv';
import type { EmbedEpisode } from '@/lib/embed-player';

type Profile = { id: string; name: string; avatar: string; kids: number };
type Entry = { profileId: string; mediaKey: string; kind: string; position: number; duration: number; updatedAt: number;source?:'embed';episode?:EmbedEpisode };
type State = { profiles: Profile[]; library: Entry[]; titles?: Title[] };
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type View = 'home' | 'movies' | 'series' | 'live' | 'list' | 'search' | 'downloads';
const navigation: [View,string][] = [['home','Início'],['series','Séries'],['movies','Filmes'],['live','TV ao vivo'],['list','Minha Lista'],['downloads','Downloads']];
const heroIds = [693134,100088,94997];
const fold = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const family = (item: Title) => ['Animação','Família'].some(genre => item.genres.includes(genre)) || item.id===10378;
const clock = (seconds: number) => `${Math.floor(seconds/60)}:${String(Math.floor(seconds%60)).padStart(2,'0')}`;

function Modal({title,onClose,children,wide=false}: {title:string;onClose:()=>void;children:ReactNode;wide?:boolean}) {
  const surface=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null, overflow=document.body.style.overflow;
    document.body.style.overflow='hidden'; surface.current?.focus();
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();onClose();}
      if(event.key==='Tab'){
        const items=Array.from(surface.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,video,iframe')||[]);
        const first=items[0],last=items[items.length-1];
        if(event.shiftKey&&(document.activeElement===first||document.activeElement===surface.current)){event.preventDefault();last?.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
      }
    };
    document.addEventListener('keydown',onKey);
    return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',onKey);previous?.focus();};
  },[onClose]);
  return <div className="modal-shade" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className={`modal ${wide?'modal-wide':''}`} role="dialog" aria-modal="true" aria-label={title} ref={surface} tabIndex={-1}><button className="icon-button modal-close" aria-label={`Fechar ${title}`} onClick={onClose}><X/></button>{children}</div></div>;
}

function Cover({item,landscape=false,priority=false}: {item:Title;landscape?:boolean;priority?:boolean}) {
  return <img src={image(landscape?item.backdrop:item.poster,landscape?'w780':'w500')} alt={landscape?'':item.title} loading={priority?'eager':'lazy'} decoding="async" onError={e=>{e.currentTarget.style.opacity='0';}} />;
}

function Rail({title,subtitle,children,ranked=false}: {title:string;subtitle?:string;children:ReactNode;ranked?:boolean}) {
  const rail=useRef<HTMLDivElement>(null);
  return <section className={`section ${ranked?'ranked-section':''}`}><div className="section-head"><div>{subtitle&&<p className="eyebrow">{subtitle}</p>}<h2>{title}</h2></div><div className="rail-arrows"><button className="icon-button" aria-label={`Voltar em ${title}`} onClick={()=>rail.current?.scrollBy({left:-(rail.current.clientWidth*.8),behavior:'smooth'})}><ChevronLeft/></button><button className="icon-button" aria-label={`Avançar em ${title}`} onClick={()=>rail.current?.scrollBy({left:rail.current.clientWidth*.8,behavior:'smooth'})}><ChevronRight/></button></div></div><div ref={rail} className="rail" onKeyDown={e=>{if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&e.target instanceof HTMLElement){const controls=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('.cover-button'));const index=controls.indexOf(e.target);if(index>=0){e.preventDefault();controls[index+(e.key==='ArrowRight'?1:-1)]?.focus();}}}}>{children}</div></section>;
}

export default function Cinema({user,onAuthRequest}:{user:Account|null;onAuthRequest:()=>void}) {
  const [catalog,setCatalog]=useState<Title[]>(initialCatalog);
  const [trending,setTrending]=useState<Title[]>([]);
  useEffect(()=>{
    if(!user)return;
    const controller=new AbortController();
    const update=()=>{if(document.visibilityState!=='visible')return;apiFetch('/api/tmdb?mode=trending',{signal:controller.signal,cache:'no-store'}).then(r=>r.ok?r.json() as Promise<{items:Title[]}>:null).then(data=>{if(data?.items)setTrending(data.items);}).catch(()=>{});};
    update();const timer=setInterval(update,15*60000);window.addEventListener('focus',update);
    return()=>{controller.abort();clearInterval(timer);window.removeEventListener('focus',update);};
  },[user?.name]);
  const resolveTitle=useCallback((item:Title)=>{setSelected(current=>current&&mediaKey(current)===mediaKey(item)?{...current,...item}:current);setCatalog(old=>[...new Map([...old,item].map(i=>[mediaKey(i),i])).values()]);},[]);
  const byKey=useMemo(()=>new Map(catalog.map(item=>[mediaKey(item),item])),[catalog]);
  const genres=useMemo(()=>[...new Set(catalog.map(item=>item.genre))].sort((a,b)=>a.localeCompare(b,'pt-BR')),[catalog]);
  useEffect(()=>{
    if(!user)return;
    const controller=new AbortController();
    const refreshCatalog=()=>{apiFetch('/api/catalog',{signal:controller.signal,cache:'no-store'}).then(r=>r.ok?r.json() as Promise<{connected:boolean;items:Title[]}>:null).then(data=>{if(data?.connected&&Array.isArray(data.items))setCatalog(old=>[...new Map([...old,...data.items].map(i=>[mediaKey(i),i])).values()]);}).catch(()=>{});};
    refreshCatalog();const timer=setInterval(refreshCatalog,3600000);
    return()=>{controller.abort();clearInterval(timer);};
  },[user?.name]);
  const [view,setView]=useState<View>('home');
  const [state,setState]=useState<State>({profiles:[],library:[]});
  const [activeId,setActiveId]=useState('');
  const [loaded,setLoaded]=useState(false);
  const [stateError,setStateError]=useState('');
  const [heroIndex,setHeroIndex]=useState(0);
  const [selected,setSelected]=useState<Title|null>(null);
  const [player,setPlayer]=useState<{item:Title;trailer:boolean}|null>(null);
  const [embed,setEmbed]=useState<{item:Title;episode?:EmbedEpisode}|null>(null);
  const closeEmbed=useCallback(()=>setEmbed(null),[]);
  const [dialog,setDialog]=useState<'profiles'|'account'|'install'|'news'|'about'|null>(null);
  const [query,setQuery]=useState('');
  const [genre,setGenre]=useState('all');
  const [sort,setSort]=useState('editorial');
  const [toast,setToast]=useState('');
  const [pending,setPending]=useState(false);
  const [profileForm,setProfileForm]=useState<{id?:string;name:string;avatar:string;kids:boolean}|null>(null);
  const [formError,setFormError]=useState('');
  const [confirmDelete,setConfirmDelete]=useState(false);
  const [tvMode,setTvMode]=useState(()=>{let saved=null;try{saved=localStorage.getItem('ziezo-tv-v2');}catch{}return prefersTV(navigator.userAgent,location.search,saved);});
  const [installPrompt,setInstallPrompt]=useState<InstallEvent|null>(null);
  const [installed,setInstalled]=useState(false);
  const [videoError,setVideoError]=useState(false);
  const searchInput=useRef<HTMLInputElement>(null);
  const video=useRef<HTMLVideoElement>(null);
  const progressSaved=useRef(0);
  const profile=state.profiles.find(p=>p.id===activeId)||state.profiles[0];
  const profileRef=useRef(''); profileRef.current=profile?.id||'';
  const entries=state.library.filter(entry=>entry.profileId===profile?.id);
  const saved=new Set(entries.filter(entry=>entry.kind==='list').map(entry=>entry.mediaKey));
  const available=useMemo(()=>catalog.filter(item=>!profile?.kids||family(item)),[catalog,profile?.kids]);
  const heroes=heroIds.map(id=>available.find(item=>item.id===id)).filter((item):item is Title=>!!item);
  const hero=heroes[heroIndex%heroes.length]||available[0]||catalog[0];
  const notify=useCallback((message:string)=>setToast(message),[]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),4000);return()=>clearTimeout(timer);},[toast]);
  const refresh=useCallback(async()=>{
    if(!user){setState({profiles:[],library:[]});setLoaded(true);return;}
    try{
      const response=await apiFetch('/api/state',{cache:'no-store'}),data=await response.json() as State & {error?:string};
      if(!response.ok)throw Error(data.error||'Não foi possível abrir sua biblioteca.');
      setState(data);if(data.titles?.length)setCatalog(old=>[...new Map([...old,...data.titles!].map(i=>[mediaKey(i),i])).values()]);setStateError('');setLoaded(true);
    }catch(error){setStateError(error instanceof Error?error.message:'Biblioteca indisponível.');setLoaded(true);}
  },[user]);
  useEffect(()=>{void refresh();try{setActiveId(localStorage.getItem('ziezo-active-profile-v2')||'');}catch{}},[refresh]);
  useEffect(()=>{if(!profile)return;try{localStorage.setItem('ziezo-active-profile-v2',profile.id);}catch{}},[profile]);
  useEffect(()=>{if(view==='search')searchInput.current?.focus();},[view]);
  useEffect(()=>{
    if(!tvMode)return;
    const initial=()=>{if(document.activeElement===document.body)document.querySelector<HTMLElement>('.tv-header button')?.focus();};initial();
    const move=(event:KeyboardEvent)=>{
      if(event.defaultPrevented)return;
      if(event.keyCode===10009||event.keyCode===461){if(document.querySelector('[role=dialog]')){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));event.preventDefault();}return;}
      if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
      const current=document.activeElement as HTMLElement|null;
      if(!current||current.matches('input,select,textarea,video')||current.closest('.player-shell'))return;
      const scope=document.querySelector('[role=dialog]')||document.querySelector('.cinema');
      const rect=current.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
      const candidates=Array.from(scope?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),iframe')||[]).filter(item=>item!==current&&item.getClientRects().length&&getComputedStyle(item).visibility!=='hidden');
      const horizontal=event.key==='ArrowLeft'||event.key==='ArrowRight',direction=event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1;
      const closest=candidates.map(item=>{const r=item.getBoundingClientRect(),dx=r.left+r.width/2-cx,dy=r.top+r.height/2-cy;return{item,forward:(horizontal?dx:dy)*direction,cross:Math.abs(horizontal?dy:dx)};}).filter(item=>item.forward>8).sort((a,b)=>(a.forward+a.cross*3)-(b.forward+b.cross*3))[0];
      if(closest){event.preventDefault();closest.item.focus();closest.item.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});}
    };
    document.addEventListener('keydown',move);return()=>document.removeEventListener('keydown',move);
  },[tvMode]);
  useEffect(()=>{
    setInstalled(window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone));
    const before=(e:Event)=>{e.preventDefault();setInstallPrompt(e as InstallEvent);};
    const done=()=>{setInstalled(true);setInstallPrompt(null);setDialog(null);notify('ZIEZO adicionada ao seu aparelho.');};
    window.addEventListener('beforeinstallprompt',before);window.addEventListener('appinstalled',done);
    if('serviceWorker'in navigator&&window.isSecureContext&&location.hostname!=='localhost')void navigator.serviceWorker.register(asset('sw.js'),{scope:import.meta.env.BASE_URL}).catch(()=>{});
    return()=>{window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',done);};
  },[notify]);
  const action=async(data:Record<string,unknown>,reload=true)=>{
    if(!user){setDialog('account');return false;}
    try{
      const response=await apiFetch('/api/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profileId:profileRef.current,...data})});
      const result=await response.json() as {error?:string};if(!response.ok)throw Error(result.error||'Não foi possível salvar.');
      if(reload)await refresh();return true;
    }catch(error){notify(error instanceof Error?error.message:'Não foi possível salvar.');return false;}
  };
  const toggleList=async(item:Title)=>{
    if(pending)return;setPending(true);const exists=saved.has(mediaKey(item));
    if(await action({action:exists?'list.remove':'list.add',mediaKey:mediaKey(item),title:item}))notify(exists?'Título removido da Minha Lista.':'Adicionado à sua lista. Boa escolha.');setPending(false);
  };
  const openEmbed=(item:Title,episode?:EmbedEpisode)=>{setEmbed({item,episode});if(user)void action({action:'history.open',mediaKey:mediaKey(item),title:item,episode});};
  const go=(next:View)=>{setView(next);setGenre('all');setDialog(null);window.scrollTo({top:0,behavior:'smooth'});};
  const closeDialog=useCallback(()=>{setDialog(null);setProfileForm(null);setFormError('');setConfirmDelete(false);},[]);
  const closeDetails=useCallback(()=>setSelected(null),[]);
  const play=(item:Title,trailer=false)=>{setVideoError(false);progressSaved.current=0;setPlayer({item,trailer});};
  const saveProgress=async(force=false)=>{
    const el=video.current;if(!el||!player||player.trailer||!user||!Number.isFinite(el.duration)||el.currentTime<1)return;
    if(!force&&Date.now()-progressSaved.current<15000)return;
    progressSaved.current=Date.now();
    await action({action:'history.progress',mediaKey:mediaKey(player.item),position:el.currentTime,duration:el.duration},false);
  };
  const closePlayer=useCallback(()=>{void saveProgress(true).then(()=>refresh());video.current?.pause();setPlayer(null);},[player,refresh]);
  const card=(item:Title,rank?:number,landscape=false)=>{
    const isSaved=saved.has(mediaKey(item));
    return <article className={`title-card ${rank?'ranked-card':''} ${landscape?'landscape-card':''}`} key={mediaKey(item)}>
      {rank&&<span className="rank-number" aria-hidden="true">{rank}</span>}
      <div className="cover-wrap"><button className="cover-button" aria-label={`Ver detalhes de ${item.title}`} onClick={()=>setSelected(item)}><Cover item={item} landscape={landscape}/><span className="cover-shade"/>{item.videoUrl&&<span className="card-tag">CINEMA ABERTO</span>}<span className="card-play"><Play size={20} fill="currentColor"/></span></button><button className={`save-button ${isSaved?'is-saved':''}`} disabled={pending} aria-label={`${isSaved?'Remover':'Adicionar'} ${item.title} ${isSaved?'da':'à'} Minha Lista`} onClick={()=>void toggleList(item)}>{isSaved?<Check size={17}/>:<Plus size={17}/>}</button></div>
      <div className="card-copy"><h3>{item.title}</h3><p>{item.year}<span>·</span>{item.type==='tv'?'Série':item.genre}</p></div>
    </article>;
  };
  const results=available.filter(item=>{
    if(view==='movies'&&item.type!=='movie')return false;if(view==='series'&&item.type!=='tv')return false;
    if(view==='list'&&!saved.has(mediaKey(item)))return false;
    if(view==='search'&&query.trim()&&!fold(`${item.title} ${item.genre} ${item.overview}`).includes(fold(query.trim())))return false;
    return genre==='all'||item.genre===genre;
  }).sort((a,b)=>sort==='rating'?b.rating-a.rating:sort==='year'?Number(b.year)-Number(a.year):sort==='name'?a.title.localeCompare(b.title,'pt-BR'):0);
  const changeProfile=async()=>{
    if(!profileForm||pending)return;setPending(true);setFormError('');
    if(!profileForm.name.trim()){setFormError('Digite um nome para o perfil.');setPending(false);return;}
    if(await action({action:profileForm.id?'profile.update':'profile.create',profileId:profileForm.id||profile?.id,...profileForm}))setProfileForm(null);
    setPending(false);
  };
  const history=entries.filter(entry=>entry.kind==='history'&&byKey.has(entry.mediaKey)).sort((a,b)=>b.updatedAt-a.updatedAt);

  return <div className={`cinema ${tvMode?'tv-mode':''}`}>
    <a className="skip-link" href="#main">Pular para o conteúdo</a>
    {tvMode?<header className="tv-header"><button className="wordmark" aria-label="ZIEZO STREAM — início" onClick={()=>go('home')}><Brand/></button><nav aria-label="Navegação da TV">{navigation.map(([id,label])=><button key={id} aria-current={view===id?'page':undefined} onClick={()=>go(id)}>{label}</button>)}</nav><button onClick={()=>go('search')}>Buscar</button><button onClick={()=>user?setDialog('profiles'):onAuthRequest()}>{user?'Perfis':'Entrar'}</button></header>:<NotchNav className="ziezo-modern-nav" items={navigation.map(([id,label])=>({id,label,icon:id==='home'?Home:id==='movies'?Film:id==='series'?Tv:id==='live'?Tv:id==='downloads'?Download:Bookmark}))} activeId={view} onActiveChange={id=>go(id as View)} logo={<button className="wordmark" aria-label="ZIEZO STREAM — início" onClick={()=>go('home')}><Brand/></button>} rightContent={<div className="modern-actions"><button className="icon-button" aria-label="Buscar filmes e séries" onClick={()=>go('search')}><Search size={19}/></button>{user?<button className={`avatar avatar-${profile?.avatar||'lime'}`} aria-label="Trocar perfil" onClick={()=>{setDialog('profiles');setProfileForm(null);}}>{profile?.name?.[0]?.toUpperCase()||user.name[0]}</button>:<button className="nav-login" onClick={onAuthRequest}>Entrar <ArrowUpRight size={14}/></button>}</div>}/>} 

    <main id="main">
      {view==='home'?<>
        <section className="hero" aria-label={`Em destaque: ${hero.title}`} key={hero.id}>
          <img className="hero-image" src={image(hero.backdrop,'w1280')} alt="" fetchPriority="high"/>
          <div className="hero-gradient"/>
          <div className="hero-copy"><div className="hero-kicker"><span/> ZIEZO EM DESTAQUE <b>ESCOLHA DA SEMANA</b></div>
            {hero.id===693134?<h1 className="dune-title">DUNA<span>PARTE DOIS</span></h1>:<h1 className="hero-title">{hero.title}</h1>}
            <div className="meta"><span className="match"><Sparkles size={13}/> {hero.rating.toFixed(1)} no TMDB</span><span>{hero.year}</span><span className="age-tag">PT-BR</span><span>{hero.runtime}</span><span className="quality-tag">{hero.type==='tv'?'SÉRIE':'FILME'}</span></div>
            <p className="hero-description">{hero.id===693134?'Entre o amor e o destino de um universo, uma escolha pode mudar tudo. Volte a Arrakis nesta jornada épica.':hero.overview}</p>
            <div className="hero-actions"><button className="primary" onClick={()=>hero.videoUrl?play(hero):openEmbed(hero)}><Play size={19} fill="currentColor"/>{hero.videoUrl?'Assistir agora':'Abrir player'}</button><button className="secondary" onClick={()=>setSelected(hero)}>Mais informações</button><button className="icon-button circle-button" aria-label="Adicionar destaque à Minha Lista" disabled={pending} onClick={()=>void toggleList(hero)}>{saved.has(mediaKey(hero))?<Check/>:<Plus/>}</button></div>
          </div>
          <div className="hero-bottom"><span className="hero-caption"><span/> HISTÓRIAS QUE FICAM COM VOCÊ.</span><div className="hero-pagination"><span className="slide-counter">0{heroIndex%Math.max(heroes.length,1)+1} <i>/ 0{Math.max(heroes.length,1)}</i></span>{heroes.map((item,index)=><button key={item.id} className={hero.id===item.id?'selected':''} onClick={()=>setHeroIndex(index)} aria-label={`Mostrar ${item.title}`} aria-pressed={hero.id===item.id}/>)}<button className="icon-button" aria-label="Próximo destaque" onClick={()=>setHeroIndex(i=>(i+1)%Math.max(heroes.length,1))}><ChevronRight/></button></div></div>
        </section>
        <div className="home-content">
          <div className="discovery-bar"><span><Sparkles size={15}/> A próxima grande história está aqui.</span><button onClick={()=>go('movies')}>Explore o catálogo <ArrowUpRight size={15}/></button></div>
          {stateError&&<div className="state-error" role="status">{stateError}<button onClick={()=>void refresh()}>Tentar novamente</button></div>}
          {history.length>0&&<Rail title="Continue de onde parou" subtitle={`SÓ SEU, ${profile?.name||''}`}>{history.map(entry=>{const item=byKey.get(entry.mediaKey)!;return <article className="continue-card" key={entry.mediaKey}><button className="cover-button" onClick={()=>entry.source==='embed'?openEmbed(item,entry.episode):play(item)} aria-label={`Continuar ${item.title}`}><Cover item={item} landscape/><span className="card-play always"><Play fill="currentColor" size={20}/></span>{entry.duration>0&&<span className="progress-track"><i style={{width:`${Math.min(100,entry.position/entry.duration*100)}%`}}/></span>}</button><div className="continue-copy"><h3>{item.title}</h3><span>{entry.source==='embed'?(entry.episode?`Retomar T${entry.episode.season} · E${entry.episode.episode}`:'Abrir novamente'):`${clock(entry.position)} de ${clock(entry.duration)}`}</span><button className="icon-button" aria-label={`Remover ${item.title} do histórico`} onClick={()=>void action({action:'history.remove',mediaKey:entry.mediaKey})}><X size={15}/></button></div></article>;})}</Rail>}
          <Rail title="Uma boa história não espera" subtitle="SEU PRÓXIMO FAVORITO">{available.slice(0,12).map(item=>card(item))}</Rail>
          <CatalogAd blocked={Boolean(player||embed||dialog||selected||profile?.kids)}/>
          {trending.some(i=>!profile?.kids||family(i))&&<Rail title="Em alta nesta semana" subtitle="DIRETO DO TMDB">{trending.filter(i=>!profile?.kids||family(i)).map(item=>card(item))}</Rail>}
          <Rail title="Os mais bem avaliados" subtitle="10 HISTÓRIAS IMPERDÍVEIS" ranked>{[...available].sort((a,b)=>b.rating-a.rating).slice(0,10).map((item,index)=>card(item,index+1))}</Rail>
          <section className="editorial-banner"><Cover item={catalog.find(item=>item.id===100088)||catalog[2]} landscape/><div className="editorial-shade"/><div className="editorial-copy"><p className="eyebrow">CONEXÕES QUE RESISTEM A TUDO</p><h2>O mundo muda.<br/>As grandes histórias ficam.</h2><p>Séries para mergulhar, se surpreender e ficar só mais um episódio.</p><button className="secondary" onClick={()=>go('series')}>Descobrir séries <ChevronRight size={16}/></button></div><span className="editorial-label">THE LAST OF US</span></section>
          <Rail title="Séries que viram assunto" subtitle="VALE A MARATONA">{available.filter(item=>item.type==='tv').slice(0,12).map(item=>card(item,undefined,true))}</Rail>
          <section className="section"><div className="section-head"><div><p className="eyebrow">QUAL É O SEU CLIMA?</p><h2>Encontre seu próximo universo</h2></div></div><div className="genre-tiles">{[{label:'Universos extraordinários',genre:'Ficção científica',item:catalog[0]},{label:'Histórias que marcam',genre:'Drama',item:catalog[2]},{label:'Adrenalina em cena',genre:'Ação',item:catalog.find(i=>i.genre==='Ação')||catalog[1]},{label:'Um pouco de suspense',genre:'Crime',item:catalog[1]}].map(tile=><button className="genre-tile" key={tile.genre} onClick={()=>{go('movies');setGenre(tile.genre);}}><Cover item={tile.item} landscape/><span>{tile.label}<ArrowUpRight size={22}/></span></button>)}</div></section>
          <Rail title="Cinema aberto. Dê o play." subtitle="FILMES COMPLETOS COM LICENÇA ABERTA">{available.filter(item=>item.videoUrl).map(item=>card(item,undefined,true))}</Rail>
          <section className="install-strip"><div className="install-mark"><img src={asset('icons/icon-192.png')} alt="Logo ZIEZO" width="56" height="56"/></div><div><h2>Sua próxima sessão vai com você.</h2><p>Adicione a ZIEZO à tela inicial. No celular, tablet ou computador.</p></div><button className="secondary" onClick={()=>setDialog('install')}>{installed?'Aplicativo instalado':'Instalar ZIEZO'} <ArrowUpRight size={16}/></button></section>
        </div>
      </>:view==='live'?<LiveTV kids={Boolean(profile?.kids)}/>:view==='downloads'?<Downloads/>:<section className="browse-page">
        <p className="eyebrow">SEU UNIVERSO ZIEZO</p><h1>{view==='search'?'O que vamos assistir?':navigation.find(([id])=>id===view)?.[1]}</h1>
        {view==='search'?<div className="search-field"><Search/><input ref={searchInput} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Busque filmes e séries em todo o TMDB..." aria-label="Buscar no catálogo"/>{query&&<button className="icon-button" aria-label="Limpar busca" onClick={()=>setQuery('')}><X/></button>}</div>:<p className="browse-intro">{view==='list'?'Todas as histórias que você guardou para depois.':'Escolhas para todos os momentos. Encontre a sua próxima história.'}</p>}
        {['search','movies','series'].includes(view)?<TMDBBrowse key={view} view={view} query={query} kids={Boolean(profile?.kids)} onSelect={setSelected} onSave={item=>void toggleList(item)} saved={saved} user={Boolean(user)} onAuthRequest={onAuthRequest}/>:view==='list'&&!user?<div className="empty-state"><Bookmark size={40}/><h2>Sua lista, do seu jeito.</h2><p>Entre para guardar seus favoritos e acessá-los em qualquer aparelho.</p><button className="primary" onClick={()=>{closeDialog();onAuthRequest();}}>Entrar na ZIEZO <ArrowUpRight size={17}/></button></div>:<><div className="browse-filters"><span>{results.length} {results.length===1?'título':'títulos'}{view==='search'&&query?` para “${query}”`:''}</span><div><label><SlidersHorizontal size={15}/><select aria-label="Filtrar por gênero" value={genre} onChange={e=>setGenre(e.target.value)}><option value="all">Todos os gêneros</option>{genres.map(g=><option key={g}>{g}</option>)}</select></label><select aria-label="Ordenar títulos" value={sort} onChange={e=>setSort(e.target.value)}><option value="editorial">Seleção ZIEZO</option><option value="rating">Melhor avaliação</option><option value="year">Mais recentes</option><option value="name">De A a Z</option></select></div></div>{!loaded&&view==='list'?<div className="empty-state"><LoaderCircle className="spin"/>Abrindo sua lista...</div>:results.length?<div className="catalog-grid">{results.map(item=>card(item))}</div>:<div className="empty-state"><Search size={38}/><h2>{view==='list'?'Toda boa lista começa com uma história.':'Nenhuma história por aqui ainda.'}</h2><p>{view==='list'?'Toque no + de qualquer título para guardar seus favoritos.':'Tente outro título ou escolha um gênero diferente.'}</p><button className="secondary" onClick={()=>{setQuery('');setGenre('all');if(view==='list')go('home');}}>Explorar o catálogo</button></div>}</>}
      </section>}
    </main>
    <footer className="site-footer"><button className="wordmark footer-brand" onClick={()=>go('home')}><Brand/></button><p>Para quem vive boas histórias.</p><div><button onClick={()=>setDialog('about')}>Sobre a ZIEZO</button><a href="https://ziezobr.github.io/privacidade.html">Privacidade e publicidade</a><button onClick={()=>go('downloads')}>Downloads</button><button onClick={()=>setDialog('account')}>Minha conta</button><button onClick={()=>{setTvMode(!tvMode);try{localStorage.setItem('ziezo-tv-v2',!tvMode?'on':'off');}catch{}notify(!tvMode?'Modo TV ativado. Use as setas para navegar.':'Modo TV desativado.');}}><Monitor size={14}/>{tvMode?'Desativar modo TV':'Modo TV'}</button></div><small>© {new Date().getFullYear()} ZIEZO STREAM · Metadados e imagens: TMDB. Sem vínculo com HBO ou Warner Bros.</small></footer>
    <nav className="mobile-nav" aria-label="Navegação no celular">{([{id:'home',label:'Início',icon:Home},{id:'movies',label:'Filmes',icon:Film},{id:'search',label:'Buscar',icon:Search},{id:'live',label:'Ao vivo',icon:Tv},{id:'list',label:'Minha Lista',icon:Bookmark}] as const).map(item=><button key={item.id} className={view===item.id?'active':''} onClick={()=>go(item.id)}><item.icon size={20}/><span>{item.label}</span></button>)}<button onClick={()=>setDialog('profiles')}><UserRound size={20}/><span>Perfis</span></button></nav>
    {toast&&<div className="toast" role="status"><Check size={17}/>{toast}</div>}

    {selected&&!player&&!embed&&<Modal title={selected.title} onClose={closeDetails} wide><div className="detail-hero"><Cover item={selected} landscape priority/><div className="detail-shade"/><div className="detail-heading"><p className="eyebrow">{selected.videoUrl?'CINEMA ABERTO':'SELEÇÃO ZIEZO'}</p><h2>{selected.title}</h2><div className="meta"><span className="match">★ {selected.rating.toFixed(1)}</span><span>{selected.year}</span><span>{selected.runtime}</span><span>{selected.type==='tv'?'Série':'Filme'}</span></div></div></div><div className="detail-content"><div className="detail-actions">{!selected.videoUrl&&<button className="primary" onClick={()=>openEmbed(selected)}><Play size={18} fill="currentColor"/>Abrir player</button>}{selected.videoUrl?<button className="primary" onClick={()=>play(selected)}><Play size={18} fill="currentColor"/>Assistir agora</button>:selected.trailer?<button className="primary" onClick={()=>play(selected,true)}><Play size={18} fill="currentColor"/>Ver trailer</button>:<a className="primary" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selected.title+' trailer oficial')}`} target="_blank" rel="noopener noreferrer"><Play size={18}/>Buscar trailer <ArrowUpRight size={14}/></a>}<button className="secondary" disabled={pending} onClick={()=>void toggleList(selected)}>{saved.has(mediaKey(selected))?<Check size={18}/>:<Plus size={18}/>}Minha Lista</button></div><p className="synopsis">{selected.overview}</p><dl className="title-facts"><div><dt>Gênero</dt><dd>{selected.genres.join(', ')}</dd></div><div><dt>Ano</dt><dd>{selected.year}</dd></div><div><dt>Formato</dt><dd>{selected.type==='tv'?'Série · duração por episódio aproximada':'Filme'}</dd></div></dl>{selected.videoUrl?<p className="availability">{selected.attribution} · <a href={selected.licenseUrl} target="_blank" rel="noopener noreferrer">Licença CC BY 3.0</a></p>:<p className="availability">Reprodução externa via EmbedMovies, sujeita à disponibilidade do provedor. <a href={`${selected.sourceUrl}/watch`} target="_blank" rel="noopener noreferrer">Confira onde assistir <ArrowUpRight size={13}/></a></p>}{!selected.videoUrl&&<TMDBDetails item={selected} onResolved={resolveTitle} onSelect={setSelected} onPlay={item=>play(item,true)} onEpisode={openEmbed} kids={Boolean(profile?.kids)}/>}<h3 className="more-heading">Mais da seleção ZIEZO</h3><div className="related-grid">{available.filter(i=>i.id!==selected.id&&i.type===selected.type).slice(0,4).map(item=><button key={item.id} onClick={()=>setSelected(item)}><Cover item={item}/><span>{item.title}</span></button>)}</div></div></Modal>}
    {embed&&<Modal title={`Player de ${embed.item.title}`} onClose={closeEmbed} wide><EmbedPlayer item={embed.item} episode={embed.episode}/></Modal>}
    {player&&<Modal title={`Reproduzir ${player.item.title}`} onClose={closePlayer} wide><div className="player-shell"><div className="player-title"><span className="eyebrow">{player.trailer?'TRAILER OFICIAL':'CINEMA ABERTO'}</span><h2>{player.item.title}</h2></div>{player.trailer?<><iframe title={`Trailer oficial de ${player.item.title}`} src={`https://www.youtube-nocookie.com/embed/${player.item.trailer}?autoplay=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/><p className="player-note">Se o trailer não abrir, <a href={`https://www.youtube.com/watch?v=${player.item.trailer}`} target="_blank" rel="noopener noreferrer">assista no canal oficial do YouTube</a>.</p></>:<><video ref={video} src={player.item.videoUrl} poster={image(player.item.backdrop,'w1280')} controls autoPlay playsInline preload="metadata" onCanPlay={()=>setVideoError(false)} onLoadedMetadata={()=>{setVideoError(false);const entry=history.find(e=>e.mediaKey===mediaKey(player.item));if(entry&&video.current)video.current.currentTime=entry.position;}} onTimeUpdate={()=>void saveProgress()} onPause={()=>void saveProgress(true)} onEnded={()=>void saveProgress(true)} onError={(event)=>{console.error("ZIEZO media failure",event.currentTarget.error?.code,event.currentTarget.error?.message);setVideoError(true);}}/>{videoError&&<p className="player-error" role="alert">O provedor não conseguiu carregar este formato neste navegador. <a href={player.item.videoUrl} target="_blank" rel="noopener noreferrer">Tentar abrir o vídeo diretamente</a>.</p>}<p className="player-note">{player.item.attribution} · <a href={player.item.licenseUrl} target="_blank" rel="noopener noreferrer">CC BY 3.0</a>{user?' · Seu progresso é salvo pelo tempo real do vídeo.':' · Entre na sua conta para salvar seu progresso.'}</p></>}</div></Modal>}
    {dialog&&<Modal title={dialog==='profiles'?'Quem está assistindo?':dialog==='install'?'Instalar ZIEZO':dialog==='news'?'Novidades':dialog==='account'?'Sua conta':'Sobre a ZIEZO'} onClose={closeDialog}>
      {dialog==='profiles'&&<div className="utility-content"><span className="eyebrow">SEU UNIVERSO, SEU JEITO</span><h2>{profileForm?'Um perfil com a sua cara.':'Quem está assistindo?'}</h2>{!user?<><p>Entre para criar perfis separados, cada um com sua lista e seu histórico.</p><button className="primary" onClick={()=>{closeDialog();onAuthRequest();}}>Entrar na ZIEZO <ArrowUpRight size={17}/></button></>:profileForm?<form onSubmit={e=>{e.preventDefault();void changeProfile();}}><div className="avatar-options">{['lime','blue','rose','violet','orange'].map(color=><button type="button" key={color} className={`avatar avatar-${color} ${profileForm.avatar===color?'chosen':''}`} aria-label={`Avatar ${color}`} aria-pressed={profileForm.avatar===color} onClick={()=>setProfileForm({...profileForm,avatar:color})}>{profileForm.name[0]?.toUpperCase()||'Z'}</button>)}</div><label className="form-label">Nome do perfil<input value={profileForm.name} maxLength={24} autoFocus onChange={e=>setProfileForm({...profileForm,name:e.target.value})} placeholder="Como você quer ser chamado?" required/></label><label className="checkbox-label"><input type="checkbox" checked={profileForm.kids} onChange={e=>setProfileForm({...profileForm,kids:e.target.checked})}/><span>Perfil infantil<small>Mostra apenas a seleção de animação e família.</small></span></label>{formError&&<p role="alert">{formError}</p>}<div className="form-actions"><button className="primary" disabled={pending}>{pending?<LoaderCircle className="spin" size={18}/>:<Check size={18}/>}Salvar perfil</button><button type="button" className="secondary" onClick={()=>{setProfileForm(null);setConfirmDelete(false);}}>Cancelar</button></div>{profileForm.id&&profileForm.id!==state.profiles[0]?.id&&<button type="button" className="danger-button" disabled={pending} onClick={async()=>{if(!confirmDelete){setConfirmDelete(true);return;}setPending(true);if(await action({action:'profile.delete',profileId:profileForm.id})){setProfileForm(null);setConfirmDelete(false);setActiveId(state.profiles[0]?.id||'');}setPending(false);}}><Trash2 size={15}/>{confirmDelete?'Confirmar exclusão do perfil e seus dados':'Excluir perfil'}</button>}</form>:<><div className="profile-grid">{state.profiles.map(p=><div className="profile-choice" key={p.id}><button onClick={()=>{setActiveId(p.id);setGenre('all');setHeroIndex(0);setSelected(null);closeDialog();setView('home');notify(`Bem-vindo, ${p.name}.`);}}><span className={`avatar avatar-${p.avatar}`}>{p.name[0]?.toUpperCase()}</span><strong>{p.name}</strong>{Boolean(p.kids)&&<small>INFANTIL</small>}{p.id===profile?.id&&<span className="current-profile">ATUAL</span>}</button><button className="profile-edit" aria-label={`Editar perfil ${p.name}`} onClick={()=>setProfileForm({...p,kids:Boolean(p.kids)})}><Pencil size={14}/></button></div>)}{state.profiles.length<5&&<button className="add-profile" onClick={()=>setProfileForm({name:'',avatar:'blue',kids:false})}><span><Plus size={30}/></span>Adicionar perfil</button>}</div>{stateError&&<p role="alert">{stateError}<button className="text-button" onClick={()=>void refresh()}>Tentar novamente</button></p>}<button className="text-button" onClick={()=>setDialog('account')}>Gerenciar minha conta <ChevronRight size={15}/></button></> }</div>}
      {dialog==='account'&&<div className="utility-content"><span className="eyebrow">ESPAÇO ZIEZO</span><h2>{user?`Olá, ${user.name.split(' ')[0]}.`:'Boas histórias merecem companhia.'}</h2><p>{user?'Sua conta está conectada. Cada perfil tem uma lista e um histórico exclusivos, salvos na sua conta.':'Entre na sua conta ZIEZO para criar perfis, guardar favoritos e continuar de onde parou em outros aparelhos.'}</p>{user?<><button className="primary" onClick={()=>setDialog('profiles')}><UserRound size={18}/>Gerenciar perfis</button><button className="text-button" onClick={()=>void supabase?.auth.signOut().then(({error})=>{if(error)notify("Não foi possível sair. Tente novamente.");else{closeDialog();setState({profiles:[],library:[]});setActiveId("");notify("Você saiu da sua conta.");}})}>Sair da conta</button></>:<button className="primary" onClick={()=>{closeDialog();onAuthRequest();}}>Entrar na ZIEZO <ArrowUpRight size={17}/></button>}<div className="account-features"><span><Bookmark/>Sua lista</span><span><Play/>Seu histórico</span><span><UserRound/>Até 5 perfis</span></div></div>}
      {dialog==='install'&&<div className="utility-content"><span className="eyebrow">LEVE A ZIEZO COM VOCÊ</span><h2>Sua tela. Seu cinema.</h2><p>Um atalho para todas as suas histórias, sem ocupar espaço com o catálogo.</p><div className="install-method"><span>01</span><div><h3>iPhone e iPad</h3><p>Abra este endereço no Safari, toque em Compartilhar e escolha Adicionar à Tela de Início. Se aparecer, ative Abrir como App da Web e toque em Adicionar.</p></div></div><div className="install-method"><span>02</span><div><h3>Windows · versão 2.1</h3><p>Atualizações automáticas no PC de 64 bits. Instale a versão 2.1 uma vez; as próximas versões serão baixadas pelo aplicativo.</p><a className="primary" href="https://github.com/ziezobr/ziezo-stream-web/releases/download/v2.1.0/ZIEZO-STREAM-Setup-2.1.0.exe" target="_blank" rel="noopener noreferrer"><Download size={17}/>Baixar ZIEZO 2.1 para Windows</a></div></div><div className="install-method"><span>03</span><div><h3>Android · APK 2.1</h3><p>Android 8 ou superior, celulares, tablets e Android TV. Na LG webOS, use o site no navegador.</p><a className="primary" href={asset('downloads/ZIEZO-STREAM-Android-2.1.0.apk')} target="_blank" rel="noopener noreferrer"><Download size={17}/>Baixar APK Android</a><p>No Chrome ou Edge, abra o menu e escolha Instalar aplicativo ou Adicionar à tela inicial.</p>{installPrompt&&<button className="primary" onClick={async()=>{try{await installPrompt.prompt();await installPrompt.userChoice;setInstallPrompt(null);}catch{notify('Use a opção Instalar aplicativo no menu do navegador.');}}}><Download size={17}/>Instalar agora</button>}</div></div><small>É preciso ter internet para entrar, carregar o catálogo e assistir. O app não baixa filmes automaticamente.</small></div>}
      {dialog==='news'&&<div className="utility-content"><span className="eyebrow">NA NOSSA CURADORIA</span><h2>Vale a sua próxima sessão.</h2><p>Uma seleção para sair do óbvio, sem pressa para os créditos.</p><div className="news-list">{catalog.slice(0,4).map(item=><button key={item.id} onClick={()=>{closeDialog();setSelected(item);}}><Cover item={item}/><span><small>{item.type==='tv'?'PARA MARATONAR':'SESSÃO DE CINEMA'}</small><strong>{item.title}</strong><p>{item.genre} · {item.year}</p></span><ChevronRight/></button>)}</div></div>}
      {dialog==='about'&&<div className="utility-content"><span className="eyebrow">HISTÓRIAS QUE FICAM</span><h2>O seu jeito de descobrir cinema.</h2><p>A ZIEZO reúne descobertas, trailers e filmes de licença aberta em uma experiência feita para quem gosta de boas histórias.</p><p>Os títulos do catálogo permitem abrir o player externo EmbedMovies, além de consultar trailers e serviços oficiais. A disponibilidade do vídeo depende do provedor. Cinema Aberto identifica os filmes de licença aberta hospedados na ZIEZO.</p><img src="/tmdb-logo.svg" alt="TMDB" width="100" style={{marginTop:24,marginBottom:12}}/><p>This product uses the TMDB API but is not endorsed or certified by TMDB. Disponibilidade de streaming por JustWatch.</p><p>Esta é uma nova versão, com uma nova base de perfis e dados. Não há vínculo com HBO ou Warner Bros.</p><a className="text-button" href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">Metadados e imagens do TMDB <ArrowUpRight size={15}/></a></div>}
    </Modal>}
  </div>;
}





