const {app, dialog, Menu}=require('electron');
const {autoUpdater}=require('electron-updater');
function setupUpdater(getWindow){
 if(!app.isPackaged||process.platform!=='win32')return;
 autoUpdater.autoDownload=true;
 autoUpdater.autoInstallOnAppQuit=false;
 autoUpdater.allowPrerelease=false;
 autoUpdater.allowDowngrade=false;
 let checking=false,manual=false,ready=false,prompting=false;
 const show=options=>{const win=getWindow();return win&&!win.isDestroyed()?dialog.showMessageBox(win,options):dialog.showMessageBox(options);};
 async function installPrompt(){
  if(prompting)return;
  prompting=true;
  try{const {response}=await show({type:'info',title:'Atualização do ZIEZO STREAM',message:'Uma nova versão está pronta.',detail:'Reinicie quando terminar de assistir. Sua conta e biblioteca serão mantidas.',buttons:['Reiniciar e atualizar','Mais tarde'],defaultId:1,cancelId:1});if(response===0)autoUpdater.quitAndInstall(false,true);}finally{prompting=false;}
 }
 async function check(user=false){
  if(ready){if(user)await installPrompt();return;}
  if(checking){if(user)await show({type:'info',message:'Uma atualização está sendo verificada ou baixada.'});return;}
  checking=true;manual=user;
  try{await autoUpdater.checkForUpdates();}catch{/* error event handles feedback */}finally{checking=false;manual=false;}
 }
 autoUpdater.on('error',error=>{console.warn('Atualização indisponível:',error.message);if(manual)void show({type:'warning',message:'Não foi possível verificar a atualização.',detail:'Tente novamente mais tarde. O aplicativo continua disponível.'});});
 autoUpdater.on('update-not-available',()=>{if(manual)void show({type:'info',message:`Você está na versão mais recente (${app.getVersion()}).`});});
 autoUpdater.on('update-downloaded',()=>{ready=true;void installPrompt();});
 Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'Aplicativo',submenu:[{label:'Verificar atualizações',click:()=>void check(true)},{type:'separator'},{role:'quit',label:'Sair'}]},{label:'Exibir',submenu:[{role:'reload',label:'Atualizar site'},{role:'togglefullscreen',label:'Tela cheia'}]}]));
 setTimeout(()=>void check(),15000).unref();
 setInterval(()=>void check(),4*60*60*1000).unref();
}
module.exports={setupUpdater};
