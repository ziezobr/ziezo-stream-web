export type EmbedEpisode={season:number;episode:number;name?:string};
export const PLAYER_SANDBOX='allow-scripts allow-same-origin allow-presentation';
export function embedUrl(type:string,id:number,episode?:EmbedEpisode){
  if(!['movie','tv'].includes(type)||!Number.isSafeInteger(id)||id<=0||id>2147483647)throw new Error('Título inválido para o player.');
  if(episode&&(type!=='tv'||!Number.isInteger(episode.season)||episode.season<0||episode.season>1000||!Number.isInteger(episode.episode)||episode.episode<1||episode.episode>10000))throw new Error('Episódio inválido.');
  return `https://myembed.biz/${type==='tv'?'serie':'filme'}/${id}${episode?`/${episode.season}/${episode.episode}`:''}`;
}
export type ImagePreset='original'|'balanced'|'cinema'|'bright';
export const imagePresets:Record<ImagePreset,{label:string;filter:string;mobileFilter:string}>={
  original:{label:'Original',filter:'none',mobileFilter:'none'},
  balanced:{label:'ZIEZO · igual ao antigo',filter:'contrast(1.075) saturate(1.08) brightness(1.018)',mobileFilter:'contrast(1.055) saturate(1.055) brightness(1.015)'},
  cinema:{label:'Cinema',filter:'contrast(1.12) saturate(1.06) brightness(1.025)',mobileFilter:'contrast(1.09) saturate(1.055) brightness(1.02)'},
  bright:{label:'Cenas escuras',filter:'contrast(1.025) saturate(1.04) brightness(1.15)',mobileFilter:'contrast(1.025) saturate(1.04) brightness(1.12)'},
};
