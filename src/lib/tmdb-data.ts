import type { Title } from './catalog';
export type RecordData = { id:number; media_type?:string; title?:string; name?:string; overview?:string; vote_average?:number; vote_count?:number; release_date?:string; first_air_date?:string; runtime?:number; episode_run_time?:number[]; genre_ids?:number[]; genres?:{id:number;name:string}[]; poster_path?:string; backdrop_path?:string; adult?:boolean };
const genreNames:Record<number,string>={28:'Ação',12:'Aventura',16:'Animação',35:'Comédia',80:'Crime',99:'Documentário',18:'Drama',10751:'Família',14:'Fantasia',36:'História',27:'Terror',10402:'Música',9648:'Mistério',10749:'Romance',878:'Ficção científica',10770:'Cinema TV',53:'Suspense',10752:'Guerra',37:'Faroeste',10759:'Ação e aventura',10762:'Infantil',10763:'Notícias',10764:'Reality',10765:'Ficção científica e fantasia',10766:'Novela',10767:'Talk show',10768:'Guerra e política'};
export function normalizeTitle(data:RecordData,type:string):Title {
  const genres=data.genres?.map(g=>g.name)||data.genre_ids?.map(id=>genreNames[id]).filter(Boolean)||[];
  const duration=data.runtime||data.episode_run_time?.[0]||0;
  return {id:data.id,type,title:data.title||data.name||'Sem título',year:(data.release_date||data.first_air_date||'').slice(0,4),rating:data.vote_average||0,overview:data.overview||'Sinopse ainda não disponível em português.',genres,genre:genres[0]||'Outros',runtime:duration?`${duration>=60?`${Math.floor(duration/60)}h `:''}${duration%60}min`:'Duração não informada',durationMinutes:duration,poster:data.poster_path?`https://image.tmdb.org/t/p/w500${data.poster_path}`:'/icon.svg',backdrop:data.backdrop_path?`https://image.tmdb.org/t/p/original${data.backdrop_path}`:data.poster_path?`https://image.tmdb.org/t/p/w780${data.poster_path}`:'/icon.svg',sourceUrl:`https://www.themoviedb.org/${type}/${data.id}`};
}
export type Person={id:number;name:string;role:string;photo:string|null};
export type Video={key:string;name:string;type:string};
export type Season={season_number:number;name:string;episode_count:number;air_date:string|null};
export type Episode={id:number;episode_number:number;name:string;overview:string;air_date:string|null;runtime:number|null;still_path:string|null;vote_average:number};
export type TitleDetails={item:Title;cast:Person[];crew:Person[];videos:Video[];images:string[];seasons:Season[];recommendations:Title[];providers:{link?:string;flatrate?:Provider[];rent?:Provider[];buy?:Provider[];free?:Provider[];ads?:Provider[]};status:string;votes:number;tagline:string;updatedAt:string};
export type Provider={provider_id:number;provider_name:string;logo_path:string};
