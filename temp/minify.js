var f=this;
function h(a){a||(a=i);j=a.l||i.l;k=a.m||i.m;l=a.o||i.o;m=a.n||i.n;n=a.q||i.q;o=a.r||i.r;p=a.j||i.j;q=void 0==a.i?i.i:a.i;r=document.getElementsByTagName("head"===n?"head":"body")[0];s=a.p||i.p;t={};u={};v=[];w=0;x={};k||(k=x);y={};y.error=y.warn=y.info=y.debug=function(){};y.dir=function(){console.dir.apply(console,arguments)};switch(q){case "debug":y.debug=function(){console.debug.apply(console,arguments)};case "info":y.info=function(){console.info.apply(console,arguments)};case "warn":y.warn=function(){console.warn.apply(console,
arguments)};case "error":y.error=function(){console.error.apply(console,arguments)};case "none":break;default:y.error("Unknown verbose level")}f[j]&&y.warn("Warning: globalHook '"+j+"' already exists");f[j]=z;A&&!f[j][A]?(f[j][A]=h,y.info("Finished the bootstrap script, start loading the scripts with "+j+".init({...config...})")):(y.info("Loading first javascript file: "+m+".js"),B(C(m).b,null));for(var d in s)"/"!==s[d][s[d].length-1]&&(s[d]+="/");"/"!==l[l.length-1]&&(l+="/");setTimeout(D,1E3*o)}
function D(){var a=[],d;for(d in t)("new"===t[d].status||"requested"===t[d].status)&&a.push(t[d]);0<a.length&&(y.error("Timed out:"),a.forEach(function(a){y.error("  "+a.url)}))}function E(a,d,b){if(d)for(var d=d.split("/"),g=0;g<d.length;g++)d[g]&&(b&&g==d.length-1?a[d[g]]=b:void 0===a[d[g]]&&(a[d[g]]=Object.create(null)),a=a[d[g]]);return a}
function B(a,d){if(a.url)if(a.c&&"js"!==a.c)y.info("loading non js resource ",a.url),"css"!==a.c&&(a.c="data"),w+=1,a.status="requested",F[a.c].load(a.url,{D:function(a){return a}},function(b){H(a,d);if(a.c==="data"){var e=E(f,k);a.t?e[a.url]=b:E(e,a.url,b)}},{});else{var b=document.createElement("script");b.src=a.url;b.f=!1;b.onload=function(){b.f=!0;H(a,d)};b.onreadystatechange=function(){"loaded"==b.readyState&&!b.f&&(b.f=!0,H(a,d))};w+=1;a.status="requested";r.appendChild(b);y.info("inserting script tag for: "+
a.url)}else throw"Cannot load empty url. Have you defined app?";}function z(a){v.push(a)}
function H(a,d){y.info("finished loading: "+a.url);w-=1;a.status="loaded";a.e=v;v=[];a.e.forEach(function(c){function b(a){g=C(a);c.k.push(g);"new"===g.b.status?B(g.b,c):y.info(res.url+" has already been requested")}c.b=a;c.d||(c.d="");c.load||(c.load=[]);c.g||(c.g=[]);c.id=a.url+c.d;c.h=[];u[c.id]&&y.info("Warning: redefining "+c.id);u[c.id]=c;var e=d?d.a:0;Object.keys(u).forEach(function(a){if(u[a].a>=e)u[a].a=u[a].a+1});c.a=e;y.info("resolving deps for "+c.id,c.load,c.g);var g;c.k=[];c.load.forEach(b);
c.g.forEach(b);y.info("new definer added to defined: "+c.id+" "+c.a)});if(0===w){y.info("Finished loading, finalizing:");Object.keys(t).forEach(function(a){t[a].e.forEach(function(a){a.k.forEach(function(c){c.b.e.forEach(function(b){b.d===c.d&&b.h.push(a)})})})});y.dir(u);y.dir(t);Object.keys(u).forEach(function(a){a=u[a];y.info(a.b.url," is needed in ",a.h.map(function(a){return a.id}));a.h.forEach(function(b){b.a>a.a&&y.warn("Warning! Cyclic dependency: The objects imported from "+a.id+" will be undefined in "+
b.id)})});y.info("Executing callbacks:");var b=[],g=E(f,k),e;for(e in u)b.push(u[e]);b.sort(function(a,b){return a.a>b.a?1:-1});b.forEach(function(a){y.info(a.id+"\t"+a.a);if("function"===typeof a.factory){var a=E(g,a.b.url+"/"+a.d),b=[];e.v.forEach(function(a){void 0==b.push(E(g,a))&&y.warn("Warning: "+a+" is undefined")});(a=e.factory.apply(a,b))&&E(g,e.id,a)}else E(g,e.id,e.factory)});p();p()}}
function C(a){var d=!1,b,g="",e,c=!1;"|"===a[a.length-1]&&(d=!0,a=a.substring(0,a.length-1));e=a.lastIndexOf("#");-1<e&&(g=a.substring(e+1),a=a.substring(0,e));e=a.split("!");1<e.length&&("js"===e[0]||"css"===e[0]||"data"===e[0])?(b=e[0],a=a.substring(a.indexOf("!")+1)):(e=a.lastIndexOf("."),e>a.lastIndexOf("/")&&(b=a.substring(e+1)));-1<a.indexOf(":")&&(c=!0);e=a.indexOf("/");if(-1<e){var G=s[a.substring(0,e)];G&&(a=G+a.substring(e+1))}a=c?a:l+a;b||(c?b="data":(b="js",a+=".js"));t[b+a]?(e=t[b+a],
e.s=d):(e={url:a,c:b,status:"new",s:d},t[b+a]=e);return{b:e,d:g,t:c,z:!1}}var i={l:"define",m:"module",o:"javascript/",p:{A:"path/to/package.js"},n:"myapp",q:"head",r:1,i:"debug",j:function(){y.debug(checkDeps);y.debug("file\treliantOn\trequiredby\texOrdering");var a=[],d;for(d in u)a.push(u[d]);a.sort(function(a,d){return a.a>d.a?1:-1});a.forEach(function(a){y.w(a.id+"\t"+a.a)})}},A=null,k,l,m,n,j,o,q,r,p,s,t,u,v,w,x,y;
function I(){if("undefined"!==typeof XMLHttpRequest)I=function(){return new XMLHttpRequest};else for(var a=I=function(){throw Error("getXhr(): XMLHttpRequest not available");};0<J.length&&I===a;)(function(a){try{new ActiveXObject(a),I=function(){return new ActiveXObject(a)}}catch(b){}})(J.shift());return I()}function K(a){throw a;}var J=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"],L=f.document,M=/^\/\//,N;L&&(N=L.head||(L.head=L.getElementsByTagName("head")[0]));
var F={data:{load:function(a,d,b){var g=b.C||b,e=b.B||K,a=d.toUrl(a),c=I();c.open("GET",a,true);c.onreadystatechange=function(){c.readyState===4&&(c.status<400?g(c.responseText):e(Error("fetchText() failed. status: "+c.statusText)))};c.send(null)},"loader-builder":"./builder/text"},u:{load:function(a,d,b,g){a=d.toUrl(a.lastIndexOf(".")<=a.lastIndexOf("/")?a+".css":a);g=a=(g="fixSchemalessUrls"in g?g.fixSchemalessUrls:L.location.protocol)?a.replace(M,g+"//"):a;a=L.createElement("link");a.rel="stylesheet";
a.type="text/css";a.href=g;N.appendChild(a);b(a.sheet||a.styleSheet)}}};"undefined"!==typeof bootstrap?h(bootstrap):h(i);
©2009 Google - Terms of Service - Privacy Policy - Google Home























