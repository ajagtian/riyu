//© Riyusaki
(function(){
var url_time_map={};
var url_title_map={};
var tab_focus_on={};
var pornTags = /xxx|porn|xx|fuck/i;
var tabs=require("sdk/tabs");
var prefs=require('sdk/simple-prefs').prefs;
var {Cc, Ci} = require("chrome");
var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
var cookieService = Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieService);
var app_mother="54.191.81.102:8001";
var app_uri=ios.newURI("http://riyusaki.com",null,null);
var browserWindows = require("sdk/windows").browserWindows;
let request = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest); 
var cookieKey="randomID=";
if(prefs._ryski === "_"){
    userID = parseInt(Math.random()*1000000+1).toString();
    console.log("new user");
    console.log("id generated="+userID);
    prefs._ryski=userID;
    cookieService.setCookieString(app_uri, null, cookieKey+userID, null);
}
else{
    console.log("returning user");
    userID=prefs._ryski;
    console.log("id="+userID);
    cookieService.setCookieString(app_uri, null, cookieKey+userID, null);
}
publish={
    do:function(u,t,ti){
        url="http://54.191.81.102:8000/update/"+userID;
        console.log(url);
        request.open("POST", url, true);        
        request.onreadystatechange = function(){
            if(request.readyState==4 && request.status==400){
                console.log("response:-"+request.responseText);
            }
        }
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");        
        request.send("u="+u+"&t="+t+"&ti="+ti);
    }
}
riyusaki = {
    init:function(){
        tabs.on("ready",riyusaki.startLogger);
        tabs.on("activate",riyusaki.continueLogger);
        tabs.on("deactivate",riyusaki.discontinueLogger);
        tabs.on("close",riyusaki.endLogger);
        browserWindows.on("close", riyusaki.beforeDestroy);
    },
    startLogger:function(tab){
        if(tab.url.contains(app_mother)&&cookieService.getCookieString(app_uri,null)==null){
            console.log("cookie is set");
            cookieService.setCookieString(app_uri, null, cookieKey+userID, null);
        }
        if(tab.title.match(pornTags)){
            console.log("ready-"+tab.title);
            tab_focus_on[tab.url]=new Date().getTime();
            if(url_time_map[tab.url] === undefined){
                url_time_map[tab.url]=0;
            }
            url_title_map[tab.url]=tab.title;
        }
    },
    continueLogger:function(tab){
        if(tab.url.contains(app_mother)&&cookieService.getCookieString(app_uri,null)==null){
            console.log("cookie is set");
            cookieService.setCookieString(app_uri, null, cookieKey+userID, null);
        }
        if(tab.title.match(pornTags)){
            console.log("continue-"+tab.title);
            tab_focus_on[tab.url]=new Date().getTime();
            if(url_time_map[tab.url] === undefined){
                url_time_map[tab.url]=0;
            }
            console.log(tab_focus_on[tab.url]);
            url_title_map[tab.url]=tab.title;
        }
    },
    discontinueLogger:function(tab){
        if(tab.title.match(pornTags)){
            url_time_map[tab.url]+=parseInt(((new Date().getTime())-tab_focus_on[tab.url])/1000);
            console.log("discontinue-"+tab.title);
            console.log(url_time_map[tab.url]);
        }
    },
    endLogger:function(tab){
        console.log("tab close")
        if(tab.title.match(pornTags)){
            url_time_map[tab.url]+=parseInt(((new Date().getTime())-tab_focus_on[tab.url])/1000);
            console.log("close-"+tab.title);
            console.log(url_time_map[tab.url]);
            publish.do(tab.url,url_time_map[tab.url],url_title_map[tab.url]);
            delete url_time_map[tab.url];
            delete tab_focus_on[tab.url];
            delete url_title_map[tab.url];
        }
    },
    beforeDestroy:function(){
        console.log("window close");
        for (var url in url_time_map) {
            publish.do(url,url_time_map[url],url_title_map[url]);
        }
        delete url_time_map;
        delete url_title_map;
        delete tab_focus_on;
    }
}
riyusaki.init();
exports.onUnload = function (reason) {
    delete url_time_map;
    delete tab_focus_on;
    Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager).removeAll();
};
})();