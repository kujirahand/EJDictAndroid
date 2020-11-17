package com.kujirahand.jsWaffle.utils;

import android.content.Context;
import android.os.AsyncTask;

import com.kujirahand.jsWaffle.WaffleActivity;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintStream;
import java.net.HttpURLConnection;
import java.net.URL;

// ref) https://www.programing-style.com/android/android-api/android-httpurlconnection-file-download/
// ref) https://developer.android.com/reference/android/os/AsyncTask.html?hl=ja

public final class HTTPTask extends AsyncTask<URL, Integer, Long> {

    public String JSCallbackOk = "";
    public String JSCallbackNg = "";
    public String JSMethod = "string";
    public String JSFilename = "";
    public FileOutputStream JSFileStream = null;
    public String JSonStr = "";
    public int Tag = 0;
    public String HTTPMethod = "GET";
    public int BUFFER_SIZE = 1024;

    @Override
    protected Long doInBackground(URL... urls) {
        HttpURLConnection con = null;
        WaffleActivity ctx = WaffleActivity.getInstance();
        Long totalBytes = 0L;
        try {
            BufferedReader br = null;
            InputStream is = null;
            InputStreamReader isr = null;
            final StringBuffer sb = new StringBuffer("");
            int count = urls.length;
            for (int i = 0; i < count; i++) {
                // アクセス先URL
                final URL url = urls[i];
                ctx.log("URL=" + url.toString());
                // コネクション取得
                con = (HttpURLConnection) url.openConnection();
                ctx.log("openConnection");
                con.setRequestMethod(this.HTTPMethod);
                if (this.HTTPMethod.toLowerCase() == "post") {
                    con.setDoOutput(true);
                }
                con.setInstanceFollowRedirects(true);
                // input
                if (JSonStr != "") {
                    final boolean autoFlash = true;
                    OutputStream os = con.getOutputStream();
                    PrintStream ps = new PrintStream(os, autoFlash, "UTF-8");
                    ps.print(JSonStr);
                    ps.close();
                }
                con.connect();
                ctx.log("connect");
                // HTTPレスポンスコード
                final int status = con.getResponseCode();
                if (status == HttpURLConnection.HTTP_OK) {
                    ctx.log("HTTP_OK");
                    is = con.getInputStream();
                    if (JSMethod == "string") {
                        isr = new InputStreamReader(is, "UTF-8");
                        br = new BufferedReader(isr);
                        String line = null;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                        }
                        totalBytes += sb.length();
                        ctx.callJsEventWithArg(this.JSCallbackOk, sb.toString(), this.Tag);
                    } else if (JSMethod == "file") {
                        byte[] buffer = new byte[BUFFER_SIZE];
                        FileOutputStream fos = JSFileStream;
                        BufferedInputStream bufferedInputStream = new BufferedInputStream(is, BUFFER_SIZE);
                        int len;
                        while ((len = bufferedInputStream.read(buffer)) != -1) {
                            fos.write(buffer, 0, len);
                            totalBytes += len;
                        }
                        totalBytes += sb.length();
                        ctx.callJsEventWithArg(this.JSCallbackOk, JSFilename, this.Tag);
                    } else if (JSMethod == "post") {
                        isr = new InputStreamReader(is, "UTF-8");
                        br = new BufferedReader(isr);
                        String line = null;
                        while ((line = br.readLine()) != null) {
                            sb.append(line);
                        }
                        totalBytes += sb.length();
                        ctx.callJsEventWithArg(this.JSCallbackOk, sb.toString(), this.Tag);
                    }
                } else {
                    // status error
                    ctx.callJsEventWithArg(
                            JSCallbackNg,
                            "HTTP Error:" + String.valueOf(status),
                            Tag);
                }
            }
        } catch (SecurityException e0) {
            e0.printStackTrace();
            ctx.callJsEventWithArg(JSCallbackNg,"Security Error:" + e0.getMessage(), Tag);
        } catch (IOException e1) {
            e1.printStackTrace();
            ctx.callJsEventWithArg(JSCallbackNg,"IO Error:" + e1.getMessage(), Tag);
        } finally {
            if (con != null) {
                // コネクションを切断
                con.disconnect();
            }
        }
        return totalBytes;
    }
}
