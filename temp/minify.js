"use strict";(function(a){function y(b){if(!b)b=d;j=b.globalHook||d.globalHook;if(a[j])x.warn("Warning: globalHook '"+j+"' already exists");a[j]=C;f=b.globalNamespace||d.globalNamespace;if(!f)f={};g=b.pathPrefix||d.pathPrefix;h=b.mainjs||d.mainjs;i=b.scriptInsertionLocation||d.scriptInsertionLocation;k=b.timeOut||d.timeOut;n=b.allDone||d.allDone;l=b.verbose==undefined?d.verbose:b.verbose;m=document.getElementsByTagName(i==="head"?"head":"body")[0];o=b.path_substitutions||d.path_substitutions;p=b.executeOnDependenciesMet||d.executeOnDependenciesMet;q=b.execute||d.execute;for(var c in o)if(o[c][o[c].length-1]!=="/")o[c]+="/";if(g[g.length-1]!=="/")g+="/";r={};s={};t=[];u=0;v=false;w=[];x={};var A=function(){};x.error=x.warn=x.info=x.debug=function(){};x.dir=function(){console.dir.apply(console,arguments)};switch(l){case"debug":x.debug=function(){console.debug.apply(console,arguments)};case"info":x.info=function(){console.info.apply(console,arguments)};case"warn":x.warn=function(){console.warn.apply(console,arguments)};case"error":x.error=function(){console.error.apply(console,arguments)};case"none":break;default:x.error("Unknown verbose level")}if(e&&!a[j][e]){a[j][e]=y;x.info("Finished the bootstrap script, start loading the scripts with "+j+".init({...config...})")}else{x.info("Loading first javascript file: "+h+".js");B({resource:F(h).resource,requiere:null})}setTimeout(z,k*1e3)}function z(){var a=[];for(var b in r)if(r[b].status==="new"||r[b].status==="requested"){a.push(r[b])}if(a.length>0){x.error("Timed out:");a.forEach(function(a){x.error("  "+a.url)})}}function A(a,b,c){if(b){var d=b.split("/");for(var e=0;e<d.length;e++){if(d[e]){if(c&&e==d.length-1)a[d[e]]=c;else if(a[d[e]]===undefined){a[d[e]]={}}a=a[d[e]]}}}return a}function B(b){var c=b.resource;var d=b.requirer;if(c.blocks)v=true;if(c.loader&&c.loader!=="js"){x.info("loading non js resource ",c.url);if(c.loader!=="css")c.loader="data";u+=1;c.status="requested";K[c.loader].load(c.url,{toUrl:function(a){return a}},function(b){if(c.loader==="data"){var e=A(a,f);if(c.isAbs){e[c.url]=b}else A(e,c.namespace,b)}D(c,d)},{})}else{var e=document.createElement("script");e.src=c.url;e.onloadDone=false;e.defer=true;e.onload=function(){e.onloadDone=true;D(c,d)};u+=1;c.status="requested";m.appendChild(e);x.info("Inserting script tag for: "+c.url)}}function C(a){t.push(a)}function D(a,b){if(v)v=false;x.info("finished loading: "+a.url);u-=1;a.status="loaded";a.definers=t;t=[];a.definers.forEach(function(c){c.resource=a;if(!c.tag)c.tag="";if(!c.load)c.load=[];if(!c.require)c.require=[];c.id=a.url+"#"+c.tag;c.requirers=[];if(s[c.id])x.info("Warning: redefining "+c.id);c.exOrder=function(){var a=b?b.exOrder:0;Object.keys(s).forEach(function(b){if(s[b].exOrder>=a){s[b].exOrder+=1}});return a}();s[c.id]=c;E(c);x.info("New definer added to definers: "+c.id+" "+c.exOrder)});while(w.length>0&&!v)B(w.pop());if(u===0)G()}function E(a){function b(b){var c=F(b);a.dependencies.push(c);if(c.resource.status==="new"){var d={resource:c.resource,requirer:a};if(v)w.push(d);else B(d)}else x.info(c.resource.url+" is requested one more!!")}x.info("resolving deps for "+a.id,a.load,a.require);a.dependencies=[];a.load.forEach(b);a.require.forEach(b)}function F(a){if(!a)x.warn("Empty dependency...");var b=false,c,d,e="",f,h=false,i,j="";if(a.indexOf(":")>-1)h=true;if(a[a.length-1]==="|"){b=true;a=a.substring(0,a.length-1)}var k=a.lastIndexOf("#");if(k>-1){e=a.substring(k+1);a=a.substring(0,k)}var l=a.split("!");if(l.length>1&&(l[0]==="js"||l[0]==="css"||l[0]==="data")){d=l[0];a=a.substring(a.indexOf("!")+1)}else{var m=a.lastIndexOf(".");var n=a.lastIndexOf("/");if(m>n)d=a.substring(m+1)}if(!d){if(!h){d="js";j=".js"}else d="data"}i=a;if(i[i.length-1]!=="/")i+="/";if(!h){var p=a.indexOf("/");if(p>-1){var q=o[a.substring(0,p)];if(q)a=q+a.substring(p+1)}c=g+a+j}else c=a;if(!r[d+"!"+c]){f={url:c,namespace:i,isAbs:h,loader:d,status:"new",blocks:b};r[d+"!"+c]=f}else{f=r[d+"!"+c];f.blocks=b}return{resource:f,tag:e,met:false}}function G(){x.info("Finished loading, finalizing:");Object.keys(r).forEach(function(a){r[a].definers.forEach(function(a){a.dependencies.forEach(function(b){b.resource.definers.forEach(function(c){if(c.tag===b.tag)c.requirers.push(a)})})})});Object.keys(s).forEach(function(a){a=s[a];x.info(a.resource.url," is needed in ",a.requirers.map(function(a){return a.id}));a.requirers.forEach(function(b){if(b.exOrder<a.exOrder)x.warn("Warning! Cyclic dependency: The objects imported from "+a.id+" might be undefined in "+b.id)})});q(I)}function H(a){a.call()}function I(){x.info("Executing callbacks:");var b=[];var c=A(a,f);for(var d in s)b.push(s[d]);b.sort(function(a,b){return a.exOrder>b.exOrder?1:-1});b.forEach(function(a){x.info(a.id+"	"+a.exOrder);if(typeof a.factory==="function"){var b=A(c,a.resource.namespace+a.tag);var e=[];a.dependencies.forEach(function(a){var b=a.resource.namespace+a.tag;if(e.push(A(c,b))==undefined)x.warn("Warning: "+a+" is undefined")});var f=a.factory.apply(b,e);if(f)A(c,a.resource.namespace+a.tag,f)}else A(c,a.resource.namespace+a.tag,d.factory)});n()}function J(){x.debug("file	reliantOn	requiredby	exOrdering");var a=[];for(var b in s)a.push(s[b]);a.sort(function(b,c){return b.exOrder>c.exOrder?1:-1});a.forEach(function(a){x.info(a.id+"	"+a.exOrder)})}var b="0.3",c="19/9/12",d={globalHook:"define",globalNamespace:"module",pathPrefix:"javascript/",path_substitutions:{myapp:"path/to/package.js"},mainjs:"myapp",executeOnDependenciesMet:true,scriptInsertionLocation:"head",timeOut:1,verbose:"debug",execute:H,allDone:J},e=null,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x;var K={data:function(){function b(){if(typeof XMLHttpRequest!=="undefined"){b=function(){return new XMLHttpRequest}}else{var c=b=function(){throw new Error("getXhr(): XMLHttpRequest not available")};while(a.length>0&&b===c)(function(a){try{new ActiveXObject(a);b=function(){return new ActiveXObject(a)}}catch(c){}})(a.shift())}return b()}function c(a,c,d){var e=b();e.open("GET",a,true);e.onreadystatechange=function(a){if(e.readyState===4){if(e.status<400){c(e.responseText)}else{d(new Error("fetchText() failed. status: "+e.statusText))}}};e.send(null)}function d(a){throw a}var a=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"];return{load:function(a,b,e,f){var g=e.resolve||e,h=e.reject||d;c(b["toUrl"](a),g,h)},"loader-builder":"./builder/text"}}(a),css:function(){function f(a,b){return a.lastIndexOf(".")<=a.lastIndexOf("/")?a+"."+b:a}function g(a,c){var d=a[b]("link");d.rel="stylesheet";d.type="text/css";d.href=c;return d}function h(a,b){return a.replace(d,b+"//")}var b="createElement",c=a.document,d=/^\/\//,e;if(c){e=c.head||(c.head=c.getElementsByTagName("head")[0])}return{load:function(a,b,d,i){var j,k,l;j=b["toUrl"](f(a,"css"));l="fixSchemalessUrls"in i?i["fixSchemalessUrls"]:c.location.protocol;j=l?h(j,l):j;k=g(c,j);e.appendChild(k);d(k.sheet||k.styleSheet)}}}(a)};if(typeof bootstrap!=="undefined")y(bootstrap);else y(d)})(this),b,b
