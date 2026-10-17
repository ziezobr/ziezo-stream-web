export const AD_INTERVAL_MS=50*60*1000;
export const AD_STORAGE_KEY='ziezo-ad-frequency-v1';
export function isAdDue(firstSeen,lastRequest,now){
 if(!Number.isFinite(firstSeen)||firstSeen<0||!Number.isFinite(now)||now<firstSeen)return false;
 const baseline=lastRequest==null?firstSeen:lastRequest;
 return Number.isFinite(baseline)&&baseline>=firstSeen&&now>=baseline&&now-baseline>=AD_INTERVAL_MS;
}
export function claimAd(storage,now){
 try{
  const raw=storage.getItem(AD_STORAGE_KEY);
  if(!raw){storage.setItem(AD_STORAGE_KEY,JSON.stringify({firstSeen:now,lastRequest:null}));return false;}
  const state=JSON.parse(raw);
  if(!isAdDue(state.firstSeen,state.lastRequest,now))return false;
  storage.setItem(AD_STORAGE_KEY,JSON.stringify({firstSeen:state.firstSeen,lastRequest:now}));
  return true;
 }catch{return false;}
}
