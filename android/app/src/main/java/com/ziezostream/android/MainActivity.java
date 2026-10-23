package com.ziezostream.android;

import android.app.Activity;
import android.annotation.SuppressLint;
import android.app.DownloadManager;
import android.database.Cursor;
import android.app.UiModeManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import org.json.JSONObject;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;

public class MainActivity extends Activity {
 private static final String HOME="https://ziezobr.github.io/ziezo-stream-web/";
 private static final String UPDATE_MANIFEST=HOME+"downloads/android-latest.json";
 private static final int VERSION_CODE=20303;
 private static final int FILE_CHOOSER_REQUEST=9417;
 private WebView web; private FrameLayout root; private LinearLayout layout; private View fullscreen;
 private WebChromeClient.CustomViewCallback fullscreenCallback; private ValueCallback<Uri[]> fileChooserCallback; private String home,pendingUpdateUrl; private long pendingDownloadId=-1; private boolean receiverRegistered=false,bannerShown=false;

 private boolean resumed=false,installOpened=false;
 private TextView updateText; private Button updateButton;
 private final android.os.Handler updateHandler=new android.os.Handler(android.os.Looper.getMainLooper());
 private final Runnable updatePoll=new Runnable(){@Override public void run(){checkDownload();if(resumed&&pendingDownloadId!=-1)updateHandler.postDelayed(this,1500);}};
 private final BroadcastReceiver downloadReceiver=new BroadcastReceiver(){@Override public void onReceive(Context context,Intent intent){if(intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID,-1)==pendingDownloadId)checkDownload();}};
 private void updateStatus(String text,boolean enabled,String label){if(updateText!=null)updateText.setText(text);if(updateButton!=null){updateButton.setEnabled(enabled);updateButton.setText(label);}}
 private void checkDownload(){
  if(pendingDownloadId==-1)return;
  DownloadManager manager=(DownloadManager)getSystemService(DOWNLOAD_SERVICE);
  try(Cursor cursor=manager.query(new DownloadManager.Query().setFilterById(pendingDownloadId))){
   if(cursor==null||!cursor.moveToFirst()){resetDownload();return;}
   int status=cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
   if(status==DownloadManager.STATUS_FAILED){resetDownload();updateStatus("Falha ao obter atualiza��o. Toque para tentar novamente.",true,"Tentar novamente");return;}
   if(status==DownloadManager.STATUS_SUCCESSFUL){
    updateStatus("Atualiza��o pronta. Confirme a instala��o do Android.",true,"Instalar agora");
    if(!resumed||installOpened||!getPackageManager().canRequestPackageInstalls())return;
    Uri apk=manager.getUriForDownloadedFile(pendingDownloadId);if(apk==null){resetDownload();return;}
    Intent install=new Intent(Intent.ACTION_INSTALL_PACKAGE).setDataAndType(apk,"application/vnd.android.package-archive").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION).putExtra(Intent.EXTRA_RETURN_RESULT,true);
    try{installOpened=true;startActivityForResult(install,9418);}catch(Exception error){installOpened=true;updateStatus("N�o foi poss�vel abrir o instalador. Toque para tentar novamente.",true,"Instalar agora");}
   }else{
    long total=cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_TOTAL_SIZE_BYTES));
    long done=cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR));
    updateStatus(total>0?"Preparando atualiza��o � "+(done*100/total)+"%":"Preparando atualiza��o�",false,"Aguarde");
   }
  }catch(Exception error){updateStatus("N�o foi poss�vel verificar a atualiza��o.",true,"Tentar novamente");}
 }
 private void resetDownload(){pendingDownloadId=-1;getPreferences(MODE_PRIVATE).edit().remove("updateDownload").apply();}
 private boolean internal(Uri uri){if("ziezo".equals(uri.getScheme()))return true;if(!"https".equals(uri.getScheme()))return false;String host=uri.getHost();if(host==null)return false;return (host.equals("ziezobr.github.io")&&uri.getPath()!=null&&uri.getPath().startsWith("/ziezo-stream-web/"))||host.equals("embedcanaisdetv.xyz")||host.endsWith(".playerembcanais.com")||host.equals("myembed.biz")||host.equals("embedtv.cc")||host.endsWith(".embedtv.cc");}
 private void browse(Uri uri){if("https".equals(uri.getScheme()))try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception error){Toast.makeText(this,"Não há navegador disponível.",Toast.LENGTH_SHORT).show();}}
 private Uri appReturn(Uri uri){if(!"https".equals(uri.getScheme())||!"ziezobr.github.io".equals(uri.getHost()))return null;String path=uri.getPath();if(path==null||!path.startsWith("/ziezo-stream-web/"))return null;if(uri.getQueryParameter("code")!=null||uri.getFragment()!=null&&uri.getFragment().contains("access_token="))return Uri.parse("ziezo://auth/callback").buildUpon().encodedQuery(uri.getEncodedQuery()).encodedFragment(uri.getEncodedFragment()).build();return null;}
 private Button toolbarButton(String label){Button button=new Button(this);button.setText(label);button.setTextColor(Color.WHITE);button.setTextSize(12);button.setAllCaps(false);button.setGravity(Gravity.CENTER);button.setPadding(5,0,5,0);button.setBackgroundColor(Color.rgb(25,29,35));button.setLayoutParams(new LinearLayout.LayoutParams(0,48,1));return button;}
 @SuppressLint("UnspecifiedRegisterReceiverFlag") @Override public void onCreate(Bundle state){super.onCreate(state);boolean tv=((UiModeManager)getSystemService(UI_MODE_SERVICE)).getCurrentModeType()==Configuration.UI_MODE_TYPE_TELEVISION;home=HOME+(tv?"?tv=on":"");root=new FrameLayout(this);root.setFitsSystemWindows(true);root.setBackgroundColor(Color.rgb(8,9,11));layout=new LinearLayout(this);layout.setOrientation(LinearLayout.VERTICAL);LinearLayout bar=new LinearLayout(this);bar.setPadding(5,4,5,4);bar.setGravity(Gravity.CENTER_VERTICAL);bar.setBackgroundColor(Color.rgb(17,21,26));Button back=toolbarButton("Voltar");back.setOnClickListener(view->goBack());bar.addView(back);Button start=toolbarButton("ZIEZO · Início");start.setOnClickListener(view->web.loadUrl(home));bar.addView(start);Button reload=toolbarButton("Recarregar");reload.setOnClickListener(view->web.reload());bar.addView(reload);layout.addView(bar,new LinearLayout.LayoutParams(-1,56));web=new WebView(this);web.setBackgroundColor(Color.BLACK);WebSettings settings=web.getSettings();settings.setUserAgentString(settings.getUserAgentString()+" ZiezoAndroid/2.3.3");settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);settings.setDatabaseEnabled(true);settings.setCacheMode(WebSettings.LOAD_DEFAULT);settings.setAllowFileAccess(false);settings.setAllowContentAccess(false);settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);settings.setMediaPlaybackRequiresUserGesture(true);settings.setSupportMultipleWindows(false);settings.setJavaScriptCanOpenWindowsAutomatically(false);web.addJavascriptInterface(new AndroidBridge(),"ZiezoAndroid");
  web.setWebViewClient(new WebViewClient(){private boolean handle(Uri uri){Uri callback=appReturn(uri);if(callback!=null){Intent intent=new Intent(Intent.ACTION_VIEW,callback);intent.setPackage(getPackageName());startActivity(intent);return true;}if(internal(uri))return false;browse(uri);return true;}@Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){return handle(request.getUrl());}@Override public boolean shouldOverrideUrlLoading(WebView view,String url){return handle(Uri.parse(url));}@Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){if(request.isForMainFrame())Toast.makeText(MainActivity.this,"Não foi possível carregar. Confira a internet e toque em Recarregar.",Toast.LENGTH_LONG).show();}});
  web.setWebChromeClient(new WebChromeClient(){@Override public void onShowCustomView(View view,CustomViewCallback callback){if(fullscreen!=null){callback.onCustomViewHidden();return;}fullscreen=view;fullscreenCallback=callback;layout.setVisibility(View.GONE);root.addView(view,new FrameLayout.LayoutParams(-1,-1));setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON|WindowManager.LayoutParams.FLAG_FULLSCREEN);root.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_FULLSCREEN);}@Override public void onHideCustomView(){hideFullscreen();}@Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){if(fileChooserCallback!=null)fileChooserCallback.onReceiveValue(null);fileChooserCallback=callback;try{Intent picker=params.createIntent();picker.setType("image/*");picker.putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"image/jpeg","image/png","image/webp"});startActivityForResult(picker,FILE_CHOOSER_REQUEST);return true;}catch(Exception error){fileChooserCallback=null;Toast.makeText(MainActivity.this,"Não foi possível abrir a galeria.",Toast.LENGTH_LONG).show();return false;}}@Override public void onPermissionRequest(PermissionRequest request){request.deny();}});
  layout.addView(web,new LinearLayout.LayoutParams(-1,0,1));root.addView(layout,new FrameLayout.LayoutParams(-1,-1));setContentView(root);if(getPreferences(MODE_PRIVATE).getInt("installedVersion",0)!=VERSION_CODE)getPreferences(MODE_PRIVATE).edit().remove("updateDownload").remove("updateUrl").putInt("installedVersion",VERSION_CODE).apply();pendingDownloadId=getPreferences(MODE_PRIVATE).getLong("updateDownload",-1);pendingUpdateUrl=getPreferences(MODE_PRIVATE).getString("updateUrl",null);IntentFilter filter=new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE);if(Build.VERSION.SDK_INT>=33)registerReceiver(downloadReceiver,filter,Context.RECEIVER_NOT_EXPORTED);else registerReceiver(downloadReceiver,filter);receiverRegistered=true;if(state==null||web.restoreState(state)==null)web.loadUrl(home);checkForUpdate();}
 private class AndroidBridge {@JavascriptInterface public void landscape(){runOnUiThread(()->{setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);});}}
 private void checkForUpdate(){new Thread(()->{HttpURLConnection connection=null;try{connection=(HttpURLConnection)new URL(UPDATE_MANIFEST+"?t="+System.currentTimeMillis()).openConnection();connection.setConnectTimeout(7000);connection.setReadTimeout(7000);connection.setUseCaches(false);InputStream input=connection.getInputStream();ByteArrayOutputStream output=new ByteArrayOutputStream();byte[] chunk=new byte[2048];int read;while((read=input.read(chunk))!=-1)output.write(chunk,0,read);String body=output.toString("UTF-8");JSONObject data=new JSONObject(body);int code=data.getInt("versionCode");String name=data.getString("versionName"),url=data.getString("apkUrl");Uri apk=Uri.parse(url);String host=apk.getHost();if(code>VERSION_CODE&&"https".equals(apk.getScheme())&&(host!=null&&(host.equals("ziezobr.github.io")||host.equals("github.com"))))runOnUiThread(()->showUpdateBanner(name,url));}catch(Exception ignored){}finally{if(connection!=null)connection.disconnect();}}).start();}
 private void showUpdateBanner(String version,String url){if(bannerShown)return;bannerShown=true;LinearLayout banner=new LinearLayout(this);banner.setGravity(Gravity.CENTER_VERTICAL);banner.setPadding(16,10,10,10);banner.setBackgroundColor(Color.rgb(210,255,113));TextView text=new TextView(this);updateText=text;text.setText("Nova versão "+version+" disponível");text.setTextColor(Color.rgb(18,27,13));text.setTypeface(Typeface.DEFAULT,Typeface.BOLD);text.setTextSize(13);banner.addView(text,new LinearLayout.LayoutParams(0,-2,1));Button update=new Button(this);updateButton=update;updateButton=update;update.setText("Atualizar agora");update.setTextSize(12);update.setAllCaps(false);update.setOnClickListener(view->prepareUpdate(url));banner.addView(update,new LinearLayout.LayoutParams(-2,44));layout.addView(banner,1,new LinearLayout.LayoutParams(-1,-2));}
 private void prepareUpdate(String url){pendingUpdateUrl=url;getPreferences(MODE_PRIVATE).edit().putString("updateUrl",url).apply();if(Build.VERSION.SDK_INT>=26&&!getPackageManager().canRequestPackageInstalls()){Toast.makeText(this,"Permita instalar atualizações da ZIEZO.",Toast.LENGTH_LONG).show();startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,Uri.parse("package:"+getPackageName())));return;}if(pendingDownloadId!=-1){installOpened=false;checkDownload();}else downloadUpdate(url);}
 private void downloadUpdate(String url){if(url==null||pendingDownloadId!=-1)return;try{DownloadManager.Request request=new DownloadManager.Request(Uri.parse(url)).setTitle("Atualização ZIEZO STREAM").setDescription("Baixando a nova versão").setMimeType("application/vnd.android.package-archive").setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED).setDestinationInExternalFilesDir(this,android.os.Environment.DIRECTORY_DOWNLOADS,"ZIEZO-STREAM-update-"+System.currentTimeMillis()+".apk");pendingDownloadId=((DownloadManager)getSystemService(DOWNLOAD_SERVICE)).enqueue(request);getPreferences(MODE_PRIVATE).edit().putLong("updateDownload",pendingDownloadId).apply();installOpened=false;updateHandler.removeCallbacks(updatePoll);updateHandler.post(updatePoll);Toast.makeText(this,"Baixando atualização…",Toast.LENGTH_LONG).show();}catch(Exception error){pendingDownloadId=-1;Toast.makeText(this,"Não foi possível iniciar a atualização.",Toast.LENGTH_LONG).show();}}
 @Override protected void onActivityResult(int requestCode,int resultCode,Intent data){super.onActivityResult(requestCode,resultCode,data);if(requestCode==9418){updateStatus("Instala��o n�o conclu�da. Toque para continuar.",true,"Instalar agora");return;}if(requestCode!=FILE_CHOOSER_REQUEST||fileChooserCallback==null)return;Uri[] result=WebChromeClient.FileChooserParams.parseResult(resultCode,data);fileChooserCallback.onReceiveValue(result);fileChooserCallback=null;}
 @Override protected void onNewIntent(Intent intent){super.onNewIntent(intent);setIntent(intent);Uri uri=intent.getData();if(uri!=null&&"ziezo".equals(uri.getScheme())&&"auth".equals(uri.getHost())&&web!=null){String callback=uri.toString().replaceFirst("^ziezo://auth/callback","https://ziezobr.github.io/ziezo-stream-web/");web.loadUrl(callback);}}
 private void hideFullscreen(){if(fullscreen==null)return;root.removeView(fullscreen);fullscreen=null;layout.setVisibility(View.VISIBLE);setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);root.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON|WindowManager.LayoutParams.FLAG_FULLSCREEN);if(fullscreenCallback!=null){fullscreenCallback.onCustomViewHidden();fullscreenCallback=null;}}
 private void goBack(){if(fullscreen!=null)hideFullscreen();else if(web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override public void onBackPressed(){goBack();}
 @Override protected void onSaveInstanceState(Bundle out){web.saveState(out);super.onSaveInstanceState(out);}
 @Override protected void onPause(){resumed=false;updateHandler.removeCallbacks(updatePoll);web.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();resumed=true;if(web!=null)web.onResume();if(pendingUpdateUrl!=null&&(Build.VERSION.SDK_INT<26||getPackageManager().canRequestPackageInstalls()))downloadUpdate(pendingUpdateUrl);updateHandler.removeCallbacks(updatePoll);if(pendingDownloadId!=-1)updateHandler.post(updatePoll);}
 @Override protected void onDestroy(){if(receiverRegistered)unregisterReceiver(downloadReceiver);if(web!=null){web.stopLoading();web.removeJavascriptInterface("ZiezoAndroid");web.destroy();}super.onDestroy();}
}



