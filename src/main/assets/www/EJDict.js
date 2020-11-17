//
// EJDict.js のメインファイル
//
window.onload = function () {
	init();
};

var isbusy = false;
var offset = 0;
var now_key = "";
var anim_timer = 0;
var isOffline = false;
var history_a = [];
var MAX_HISTORY = 14;
var sysLang = "" + navigator.language + "";
if (sysLang == "ja-JP" || sysLang == "JP") {
    sysLang = "ja";
} else {
    sysLang = "en";
}
console.log("language=" + sysLang + "@");


function init() {
	hideAd();
	check_db_extract();
	droid.setMenuItem(
		0, true, "New", "ic_menu_search", menu_new
	);
	droid.setMenuItem(
		1, true, "Black Skin", "ic_menu_info_details", menu_black
	);
	droid.setMenuItem(
		2, true, "White Skin", "ic_menu_info_details", menu_white
	);
	droid.setMenuItem(
		3, true, "Hint", "ic_menu_info_details", menu_about
	);
	$('key').focus();
    droid.setKeyboardVisible(true);

	// 履歴機能
	var s = droid.pref_get("history","");
	if (s != null) {
		history_a = s.split("\n");
	}
	$("history").hide();
	// スキン機能
	var skinName = droid.pref_get("skin", "black");
	droid.log("skin=" + skinName);
	setSkin(skinName);
	// イベント
	setEvent();
	
	// 説明書きを英語で表示
	if (sysLang != "ja") {
		//alert("english");
		$("res").innerHTML = 
			"<div class='mean'>Please input the word in the text box at the top.</div>" +
			"<div class='mean'>" +
			"This is a very good and simple English-Japanese Dictionary.</div>" + 
			"<div class='mean'><ul style='margin-left:24px;'>" +
			"<li>Offline OK! (no internet connection needed)<br>" +
			"<li>Japanese-English search function also available." +
			"</ul></div>"+
			"<div class='mean'>Please select Color, <a href='#' onclick='menu_black()'>BLACK SKIN</a> or "+
			"<a href='#' onclick='menu_white()'>WHITE SKIN</div>" +
			"";
		$("apptitle").innerHTML = "EJDict Light";
	}
}

function rm_history() {
	history_a = [];
	droid.pref_set("history", "");
	$("key").focus();
}

function search_text(word) {
	$('key').value = word;
	setTimeout(function(){
		find();
	},100);
}

function tohtml(s) {
	s = s.replace(/\&/g,"&amp;");
	s = s.replace(/\</g,"&lt;");
	s = s.replace(/\>/g,"&gt;");
	s = s.replace(/\"/g,"&quot;");
	s = s.replace(/\'/g,"&quot;");
	return s;
}

function setEvent() {
	// 補完機能
	$("key").onfocus = function () {
		// 以前の結果をクリア
		$("res").innerHTML = "";
		hideAd();
		if (history_a.length > 0) {
			var s = "";
			for (var i in history_a) {
				var key = history_a[i];
				if (key == "") continue;
				var key_q = '"' + tohtml(key) + '"';
				s += "<span onclick='search_text("+key_q+")'> [" + tohtml(key) + "] </span> ";
			}
			s += " - <span onclick='rm_history()'>*Clear*</span>";
			$("history").innerHTML = s;
			$("history").show();
		} else {
			$("history").innerHTML = "";
			$("history").hide();
		}
	};
}
function menu_about() {
	location.href = "about.html";
}

function menu_new() {
	$("info").innerHTML = "";
	$("res").innerHTML = "";
	$("key").value = "";
	$("key").focus();
	hideAd();
}

function find() {
	var key = $("key").value;
	key = key.replace(/^\s+/, ""); // trim_l
	key = key.replace(/\s+$/, ""); // trim_r
	if (key == "") return;
	if (isbusy) return;
	isbusy = true;
	offset = 0;
	hideAd(); // 礼儀
	$('history').hide(); // 既に履歴は不要なので
	now_key = key;
	search(key, offset, find_next);
	// anim
	if (anim_timer == 0) {
		setInterval(anim_check, 500);
	}
	// 履歴を追加する
	var idx = history_a.indexOf(key);
	if (idx < 0) {
		history_a.unshift(key);
		while (history_a.length > MAX_HISTORY) {
			history_a.pop();
		}
		droid.pref_set("history", history_a.join("\n"));
	}
	// キーボードを隠す
	droid.setKeyboardVisible(false);
}

function find_next(r){
	var s = "";
	var has_next = false;
	if (r) {
		if (r.length > db_limit) {
			has_next = true;
			r.pop();
		}
		var re_key = new RegExp(now_key, "g");
		for (var i = 0; i < r.length; i++) {
			var o = r[i];
			var word = o["word"];
			var mean = o["mean"];
			var level = o["level"];
			// mean = mean.replace(/\s\/\s/g,"<hr/><br/>");
			// 検索語を強調する
			mean = mean.replace(re_key, function(k) {
				return "<span class='key'>"+k+"</span>";
			});
			// 意味ごとに段落を分ける
			var a = mean.split(/\s\/\s/g);
			//droid.log("i=" + i);
			//droid.log("sp=" + a.length);
			var as = "";
			if (a.length == 0) {
				as = mean;
			}
			else {
				for (var j = 0; j < a.length; j++) {
					as += "<div class='submean'>" + a[j] + "</div>";
				}
			}
			var star = "";
			for (var k = 0; k < level; k++) {
				star += "★";
			}
			star = "<span class='star'>" + star + "</span>";
			s += "<div class='word'>" + word + " " + star + "</div>";
			s += "<div class='mean'>" + as + "</div>";
		}
	}
	if (s == "") {
		s = "<div class='mean'><p>Not found</p>";
		if (sysLang != "ja") {
			s+= "<p><br/>申し訳ありません。単語が登録されていません。</p>";
			if (!isOffline) {
				s += "<br/><p><a href='http://google.co.jp/search?q="+encodeURI(now_key)+"'>→ググってみる(Online Search)</a></p>";
			}
		} else {
			s+= "<p><br/>Sorry, the word is not found...</p>";
			if (!isOffline) {
				s += "<br/><p><a href='http://google.co.jp/search?q="+encodeURI(now_key)+"'>→ Online Search</a></p>";
			}
		}
		s += "</div>";
		hideAd(); // 申し訳ない気持ち
	}
	else {
		if (has_next) {
			var cap = "続きを表示";
			if (sysLang != "ja") {
				cap = "Next";
			}
			droid.log("has_next=true");
			var nexti = offset + db_limit;
			s += "<div id='next" + nexti + "'>" +
				"<div style='text-align:center;'>" +
				"<button class='nextBtn' onclick='find_next_btn(" + nexti + ")'>" + cap + "</button>" +
				"</div></div>";
		}
		// オフラインチェック
		var isOnline = navigator.onLine;
		if (isOnline) {
			showAd();
			isOffline = false;
			droid.log("online");
		} else {
			// ng
			$('ad').hide();
			isOffline = true;
			droid.log("offline");
		}
	}
	var div2 = "next" + offset;
	if ($(div2) == null) {
		$("res").innerHTML = s;
	} else {
		$(div2).innerHTML = s;
	}
	isbusy = false;
}
function hideAd() {
	//droid.showAd(false);
	$('ad').hide();
	// droid.setAdMob(false);
}

function showAd() {
    if (navigator.onLine) {
    	console.log('online - show admob');
    	// droid.setAdMob(true);
    }
	// 遠慮がちに広告を表示させてもらう
	// droid.showAd(true);
	/*
	var skinName = droid.pref_get("skin", "black");
	var key = $('key').value;
	$('adframe').src = ad_url + "?skin=" + skinName + "&key=" + encodeURI(key);
	$('ad').show(); // 感謝!
	*/
	 
	/*
	var url = ad_url + "?key=" + encodeURI(key);
	ajax_get(url, function(text, xhr){
		$('ad').innerHTML = text;
	});
	$('ad').show();
	*/
}
	
function find_next_btn(i) {
	offset = i;
	search(now_key, i, find_next);
}

var anim_index = 0;
function anim_check() {
	if (!isbusy) {
		clearInterval(anim_timer);
		anim_timer = 0;
		anim_index = 0;
		$("info").innerHTML = "";
		return;
	}
	var s = "<img src='loader.gif'> 少々お待ちください ";
	if (anim_index % 3 == 0) {
		s = "<img src='loader.gif'> 少々お待ちください ...";
	} else if (anim_index % 3 == 1) {
		s = "<img src='loader.gif'> 少々お待ちください ......";
	}
	$("info").innerHTML = s;
	anim_index++;
}

function ajax_get(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if ( xhr.readyState == 4 && xhr.status == 200 ) {
			callback(xhr.responseText, xhr);
		}
	};
	xhr.open("GET", url, true);
	xhr.send(null);
}

function menu_black() {
	setSkin("black");
}
function menu_white() {
	setSkin("white");
}

function setSkin(skinName) {
	// save skin name
	droid.pref_set("skin", skinName);
	//
	var css = "ejdict.css";
	if (skinName == "black") {
		css = "ejdict.css";
	}
	else if (skinName == "white") {
		css = "ejdict-white.css";
	}
	//
	$("cssFile").href = css;
}


