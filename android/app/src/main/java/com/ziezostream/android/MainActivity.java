package com.ziezostream.android;

import android.app.Activity;
import android.app.UiModeManager;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.*;
import android.widget.*;

public class MainActivity extends Activity {
 private static final String HOME="https://ziezobr.github.io/ziezo-stream-web/";
 private WebView web;
 private FrameLayout root;
 private View fullscreen;
 private WebChromeClient.CustomViewCallback fullscreenCallback;
 private String home;
 private boolean internal(Uri u){
  if(!"https".equals(u.getScheme()))return false;
  String h=u.getHost(); if(h==null)return false;
  return (h.equals("ziezobr.github.io")&&u.getPath()!=null&&u.getPath().startsWith("/ziezo-stream-web/"))||h.equals("embedcanaisdetv.xyz")||h.endsWith(".playerembcanais.com")||h.equals("myembed.biz");
 }
 private void browse(Uri u){if("https".equals(u.getScheme()))try{startActivity(new Intent(Intent.ACTION_VIEW,u));}catch(Exception e){Toast.makeText(this,"Não há navegador disponível.",Toast.LENGTH_SHORT).show();}}
 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  boolean tv=((UiModeManager)getSystemService(UI_MODE_SERVICE)).getCurrentModeType()==Configuration.UI_MODE_TYPE_TELEVISION;
  home=HOME+(tv?"?tv=on":"");
  root=new FrameLayout(this);root.setFitsSystemWindows(true);root.setBackgroundColor(Color.rgb(8,9,11));
  LinearLayout layout=new LinearLayout(this);layout.setOrientation(LinearLayout.VERTICAL);
  LinearLayout bar=new LinearLayout(this);bar.setBackgroundColor(Color.rgb(17,21,26));
  Button back=new Button(this);back.setText("Voltar");back.setOnClickListener(v->goBack());bar.addView(back);
  Button start=new Button(this);start.setText("ZIEZO · Início");start.setOnClickListener(v->web.loadUrl(home));bar.addView(start);
  Button reload=new Button(this);reload.setText("Recarregar");reload.setOnClickListener(v->web.reload());bar.addView(reload);
  layout.addView(bar);web=new WebView(this);web.setBackgroundColor(Color.BLACK);
  WebSettings s=web.getSettings();s.setUserAgentString(s.getUserAgentString()+" ZiezoAndroid/2.1.0");s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(false);s.setAllowContentAccess(false);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);s.setMediaPlaybackRequiresUserGesture(true);s.setSupportMultipleWindows(false);s.setJavaScriptCanOpenWindowsAutomatically(false);
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest r){if(!r.isForMainFrame())return false;if(internal(r.getUrl()))return false;browse(r.getUrl());return true;}
   @Override public void onReceivedError(WebView view,WebResourceRequest r,WebResourceError e){if(r.isForMainFrame())Toast.makeText(MainActivity.this,"Não foi possível carregar. Confira a internet e toque em Recarregar.",Toast.LENGTH_LONG).show();}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public void onShowCustomView(View v,CustomViewCallback cb){if(fullscreen!=null){cb.onCustomViewHidden();return;}fullscreen=v;fullscreenCallback=cb;layout.setVisibility(View.GONE);root.addView(v,new FrameLayout.LayoutParams(-1,-1));getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON|WindowManager.LayoutParams.FLAG_FULLSCREEN);root.setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY|View.SYSTEM_UI_FLAG_HIDE_NAVIGATION|View.SYSTEM_UI_FLAG_FULLSCREEN);}
   @Override public void onHideCustomView(){hideFullscreen();}
   @Override public void onPermissionRequest(PermissionRequest request){request.deny();}
  });
  layout.addView(web,new LinearLayout.LayoutParams(-1,0,1));root.addView(layout,new FrameLayout.LayoutParams(-1,-1));setContentView(root);
  if(state==null||web.restoreState(state)==null)web.loadUrl(home);
 }
 private void hideFullscreen(){if(fullscreen==null)return;root.removeView(fullscreen);fullscreen=null;root.getChildAt(0).setVisibility(View.VISIBLE);root.setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON|WindowManager.LayoutParams.FLAG_FULLSCREEN);if(fullscreenCallback!=null){fullscreenCallback.onCustomViewHidden();fullscreenCallback=null;}}
 private void goBack(){if(fullscreen!=null)hideFullscreen();else if(web.canGoBack())web.goBack();else super.onBackPressed();}
 @Override public void onBackPressed(){goBack();}
 @Override protected void onSaveInstanceState(Bundle out){web.saveState(out);super.onSaveInstanceState(out);}
 @Override protected void onPause(){web.onPause();super.onPause();}
 @Override protected void onResume(){super.onResume();if(web!=null)web.onResume();}
 @Override protected void onDestroy(){if(web!=null){web.stopLoading();web.destroy();}super.onDestroy();}
}


