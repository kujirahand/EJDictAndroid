/* TODO
 *   履歴機能
 *   頻出単語に重み付けして優先度の高い結果から表示する
 */

// path
// var db_savedir = "/sdcard/Android/data/com.kujirahand.ejdict";
var db_savedir = droid.getStoragePath();
var db_limit = 10;
var db_version = 202011171130; // 辞書を変えたら、このバージョンを上げること
var db_savefile = db_savedir + "/ejdict-" + db_version + ".sqlite3";
var ad_url = "http://d.aoikujira.com/android-app/ejdict-ad.php";
// global
var db = null;


function check_db_extract() {
	var version = droid.pref_get("ejdict_version", 0);
	droid.log("db_version=" + version);
	if (!droid.fileExists(db_savefile)) {
	    console.log("Initialize Database:" + db_savefile);
		$("searchForm").hide();
		$("info").innerHTML = ""+
			"<p style='padding:10px;'>"+
			"★現在、データベースを初期化しています。<br/>"+
			"★この作業は初回起動のみ行われます。<br/>" + 
			"</p>";
		setTimeout(function(){
			droid.mkdir(db_savedir);
			droid.copyAssetsFile("www/data/ejdict.sqlite3", db_savefile);
			setTimeout(function(){
				$("info").innerHTML = "";
				$("searchForm").show();
				open_database();
				droid.pref_set("ejdict_version", db_version);
			},100);
		}, 100);
	} else {
		open_database();
	}
}

function open_database() {
	db = droid.openDatabase(db_savefile);
	if (db == null) {
		alert("データベースが開けません。SDカードの状態を確認してください。");
		if (droid.fileExists(db_savefile)) {
			// DBがあるのに開けない ... すなわちDBが壊れている
			droid.deleteFile(db_savefile);
		}
		droid.quit();
	}
}

function search(key, offset, onResult) {
	droid.log("search=" + key);
	key = key.replace(/\'/g, "''");
	
	var q = "";
	var c = key.charAt(0);
	
	if (c == "!" || c == "！") {
		key = key.substr(1);
		if (key.match(/^[a-zA-Z0-9\s\-\.]+$/)) {
			q = "SELECT * FROM items WHERE word LIKE '" + key + "%'";
		} else {
			q = "SELECT * FROM items WHERE mean LIKE '%『" + key + "』%' ORDER BY level DESC";
		}
	}
	else if (key.match(/^[a-zA-Z0-9\s\-\.]+$/)) { // all englisth?
		q = "SELECT * FROM items WHERE word LIKE '" + key + "%' ORDER BY level DESC";
	} else { // other
		q = "SELECT * FROM items WHERE mean LIKE '%" + key + "%' ORDER BY level DESC";
	}
	q += " LIMIT " + (db_limit+1) + " OFFSET " + (offset);
	droid.executeSql(db, q, onResult, function(){
		alert("検索に失敗しました。");
	});
}

