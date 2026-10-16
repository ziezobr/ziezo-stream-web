import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const films={
 'big-buck-bunny.webm':'6b192df80df8ce1ba7261f231ed8bb854dba33fa955c65295164e0026899a208',
 'tears-of-steel.webm':'3f16b3fb0aee2aabed39ba72cddc9c600b724203fe1f4215c0b4fa7873bcff0f'
};
await mkdir('public/videos',{recursive:true});
for(const [name,hash] of Object.entries(films)){
 const path='public/videos/'+name;
 let bytes;try{bytes=await readFile(path);}catch{}
 const digest=data=>createHash('sha256').update(data).digest('hex');
 if(bytes&&digest(bytes)===hash)continue;
 const response=await fetch('https://ziezo-stream-cinema.renzorfx.chatgpt.site/videos/'+name,{signal:AbortSignal.timeout(90000)});
 if(!response.ok)throw Error('Não foi possível obter o filme aberto '+name);
 bytes=Buffer.from(await response.arrayBuffer());
 if(digest(bytes)!==hash)throw Error('Integridade do filme inválida: '+name);
 await writeFile(path,bytes);
 console.log('Filme aberto verificado: '+name);
}
