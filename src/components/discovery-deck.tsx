import {ArrowUpRight,Film,Tv,Radio} from 'lucide-react';
import {SpotlightCard} from './spotlight-card';

export function DiscoveryDeck({onNavigate}:{onNavigate:(view:'movies'|'series'|'live')=>void}){
  const items=[
    {view:'movies' as const,icon:Film,label:'UMA NOVA SESSÃO',title:'Encontre seu filme',text:'Grandes histórias para o seu momento.'},
    {view:'series' as const,icon:Tv,label:'SÓ MAIS UM EPISÓDIO',title:'Sua próxima maratona',text:'Descubra séries que prendem você.'},
    {view:'live' as const,icon:Radio,label:'ACONTECENDO AGORA',title:'Entre no ao vivo',text:'Seus canais, em um só lugar.'},
  ];
  return <section className="discovery-deck" aria-label="Explore a ZIEZO">{items.map(item=><SpotlightCard key={item.view}><button onClick={()=>onNavigate(item.view)}><span className="discovery-icon"><item.icon size={22} aria-hidden="true"/></span><span className="discovery-deck-copy"><small>{item.label}</small><strong>{item.title}</strong><span>{item.text}</span></span><ArrowUpRight size={19} className="discovery-arrow" aria-hidden="true"/></button></SpotlightCard>)}</section>;
}
