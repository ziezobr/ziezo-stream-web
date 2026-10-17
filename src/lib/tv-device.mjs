export function isTVDevice(userAgent=''){
 return /web[o0]s|smart[ -]?tv|netcast|tizen|hbbtv|viera|bravia|googletv|google tv|android tv|appletv|aft[a-z0-9]+|large screen.*webappmanager/i.test(userAgent);
}
export function prefersTV(userAgent,search='',saved=null){
 if(/(?:[?&])tv=on(?:&|$)/.test(search))return true;
 if(/(?:[?&])tv=off(?:&|$)/.test(search))return false;
 if(saved==='on')return true;
 if(saved==='off')return false;
 return isTVDevice(userAgent);
}
