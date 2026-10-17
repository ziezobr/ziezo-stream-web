export const AD_INTERVAL_MS:number;
export const AD_STORAGE_KEY:string;
export function isAdDue(firstSeen:number,lastRequest:number|null,now:number):boolean;
export function claimAd(storage:Pick<Storage,'getItem'|'setItem'>,now:number):boolean;
