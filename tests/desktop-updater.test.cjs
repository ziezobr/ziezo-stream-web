const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const {EventEmitter}=require('node:events');
test('updater downloads but only restarts after an explicit choice',async()=>{
 const updater=new EventEmitter();let installed=0,checks=0;updater.checkForUpdates=async()=>{checks++;};updater.quitAndInstall=()=>installed++;
 let choice=1,menu;const timers=[];
 const context={module:{exports:{}},console,process:{platform:'win32'},setTimeout:fn=>{timers.push(fn);return{unref(){}};},setInterval:()=>({unref(){}}),require:name=>name==='electron-updater'?{autoUpdater:updater}:{app:{isPackaged:true,getVersion:()=> '2.1.0'},dialog:{showMessageBox:async()=>({response:choice})},Menu:{buildFromTemplate:x=>x,setApplicationMenu:x=>menu=x}}};
 vm.runInNewContext(fs.readFileSync('desktop/updater.cjs','utf8'),context);
 context.module.exports.setupUpdater(()=>null);
 assert.equal(updater.autoDownload,true);assert.equal(updater.autoInstallOnAppQuit,false);assert.equal(updater.allowDowngrade,false);
 await timers[0]();await new Promise(r=>setImmediate(r));assert.equal(checks,1);
 updater.emit('update-downloaded');await new Promise(r=>setImmediate(r));assert.equal(installed,0);
 choice=0;await menu[0].submenu[0].click();await new Promise(r=>setImmediate(r));assert.equal(installed,1);
});
