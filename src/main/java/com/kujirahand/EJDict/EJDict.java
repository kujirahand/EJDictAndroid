package com.kujirahand.EJDict;


import android.content.Context;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Handler;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.webkit.WebView;
import android.widget.LinearLayout;

import com.kujirahand.jsWaffle.WaffleActivity;
import com.kujirahand.jsWaffle.model.WaffleFlags;

public class EJDict extends WaffleActivity {

    protected void buildMainView() {
        super.buildMainView();
    }




    /** Set jsWaffle Setting flags */
    @Override
    protected void onSetWaffleFlags(WaffleFlags flags) {
    	super.onSetWaffleFlags(flags);
    	// set flags
    	flags.mainHtmlUrl = "file:///android_asset/www/index.html";
    	flags.keepScreenNotSleep = false;
    	flags.useFullScreen = false;
    	flags.useVerticalScrollBar = false;
    	flags.setWidth(320);
    }

    @Override
    public void showPage(String uri) {
    	super.showPage(uri);
    	
    }
    
    /** Please add the custom plug-in if it is necessary. */
    @Override
    protected void onAddPlugins() {
    	super.onAddPlugins();
    }
    
    /*
    public static boolean isConnected(Context context){
        ConnectivityManager cm = (ConnectivityManager)context.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo ni = cm.getActiveNetworkInfo();
        if( ni != null ){
        	boolean b = cm.getActiveNetworkInfo().isConnected();
        	WaffleActivity.mainInstance.log("network=" + b);
        	return b;
        }
        return false;
    }
    */
    
    @Override
    protected void onResume() {
    	super.onResume();

    	// focus to webview
    	final EJDict self = this;
    	self.webview.requestFocus(View.FOCUS_DOWN);
    }

}