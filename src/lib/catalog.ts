import {asset} from './backend';
import seed from './catalog-seed.json';
import openFilms from './open-films.json';
export type Title = {
  id: number; title: string; year: string; type: string; rating: number; overview: string;
  genre: string; genres: string[]; runtime: string; durationMinutes: number;
  poster: string; backdrop: string; sourceUrl?: string; videoUrl?: string; licenseUrl?: string; attribution?: string; trailer?: string;
};
export const catalog: Title[] = [...seed, ...openFilms].map(item => ({...item, ...(item.id === 693134 ? {trailer:'ncwsW3qxQlo'} : {})}));
export const mediaKey = (item: Title) => `${item.type}-${item.id}`;
catalog.forEach(item=>{if(item.videoUrl?.startsWith("/"))item.videoUrl=asset(item.videoUrl);});
export const byKey = new Map(catalog.map(item => [mediaKey(item), item]));
export function image(url: string, size = 'w500') { if(url.startsWith('/'))return asset(url);return url.replace(/\/t\/p\/(original|w\d+)\//, `/t/p/${size}/`); }
export const genres = [...new Set(catalog.map(item => item.genre))].sort((a,b) => a.localeCompare(b,'pt-BR'));
