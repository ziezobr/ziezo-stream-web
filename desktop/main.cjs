const {app,BrowserWindow,session,shell}=require('electron');
const path=require('node:path');
const APP_URL='https://ziezobr.github.io/ziezo-stream-web/';
const isApp=url=>{try{const u=new URL(url);return u.origin==='https://ziezobr.github.io'&&u.pathname.startsWith('/ziezo-stream-web/');}catch{return false;}};
let window;
function createWindow(){
 window=new BrowserWindow({width:1440,height:900,minWidth:800,minHeight:600,title:'ZIEZO STREAM',backgroundColor:'#08090b',icon:path.join(__dirname,'assets/icon.png'),autoHideMenuBar:true,show:false,webPreferences:{contextIsolation:true,nodeIntegration:false,sandbox:true,webSecurity:true,spellcheck:false}});
 window.once('ready-to-show',()=>window.show());
 window.webContents.setWindowOpenHandler(({url})=>{if(isApp(url))void window.loadURL(url);else if(url.startsWith('https://github.com/ziezobr/ziezo-stream-web/releases')||url.startsWith('https://www.themoviedb.org/')||url.startsWith('https://creativecommons.org/'))void shell.openExternal(url);return {action:'deny'};});
 window.webContents.on('will-navigate',(event,url)=>{if(!isApp(url)&&!url.startsWith('file:'))event.preventDefault();});
 window.webContents.on('will-attach-webview',event=>event.preventDefault());
 window.webContents.on('did-fail-load',(_event,code,_description,_url,main)=>{if(main&&code!==-3)void window.loadFile(path.join(__dirname,'offline.html'));});
 void window.loadURL(APP_URL);
}
if(!app.requestSingleInstanceLock())app.quit();else{
 app.setAppUserModelId('com.ziezostream.desktop');
 app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.focus();}});
 app.whenReady().then(()=>{session.defaultSession.setPermissionRequestHandler((_web,permission,callback)=>callback(['fullscreen','mediaKeySystem'].includes(permission)));createWindow();require('./updater.cjs').setupUpdater(()=>window);app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)createWindow();});});
 app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
}

