"use strict";
// TODO
//production/development mode, concat and minify async defer script injection
//execute definers when their dependencies have been met
//some resources/js/nonmodule files might have to be loaded in a certain order

// cyclic dependancies!! Possible, but module that requires module that directly or indirectly requires the first module cannot use any public api of the first module. 

//datastructures:
// definer = {
//   id : unique string made from: this.resource.url + this.tag
//   tag: "string", 
//   load: array of files,
//   require: array of files, to inserted into factory
//   factory; module code/dat

//   resource: resource this is defined in
//   dependencies: list of dependencies whose resources have to be loaded and
//                  its appropriate (tag) definer executed
//                 before this definer's callback can be executed
//   requirers: list of definers that need this definer
// }

// resource = {
//   url: relative or absolute path
//   loader: "data, css or js"
//   status: new, requested, loaded, callbacks_executed
//   blocks : boolean
//   definers: definers defined in this resource    
// }

// dependency = {
//   resource: ...
//   tag: ...
//   met: boolean, has resourceLoaded been called if it is css or data,
//                        has the callback been executed if it is a definer, tagged or not
// }



//Bootstrap
(function(global) 
 {   var 
     VERSION = '0.2',
     DATE = '11/9/12',
     default_config = {
       //-----globalHook
       //name of the global function that modularizes a file by defining other files to load and taking a callback that
       //definers the functionality of the module.
       globalHook : 'define',
       
       //-----global namespace
       //All objects created by the callbacks are added to the object 
       //global.globalNamespace.url
       // So for instance if a module is defined in javascript/dir1/dir2/dir3/module1.js 
       // (relative to the html file that loaded bootstrap.js, this file)
       //,assuming global=window and namespace=module and pathPrefix=javascript
       //and path_substitution[myapp]='dir1/dir2' then the object created will be:
       //window.module.myapp.dir3.module1, which can be required with myapp.dir3.module1
       globalNamespace : 'module',
       
       //----resource namespace
       resourceNamespace: 'resources',
       
       //-----global loadpathPrefix
       //load all files relative to this path
       pathPrefix : "javascript/",
       
       //-----------path_substitutions 
       //a way to map namespaces to directories. This way you can refer to modules defined in 
       //separate rootfolders by prefixing the object name with its subsitution
       path_substitutions: {
	 myapp : 'path/to/package.js'
       },
       
       //-----mainjs     
       //First javascript file to load.
       mainjs: 'myapp',

       //-----head or body
       scriptInsertionLocation : 'head',
       
       //-----timeOut 
       //in seconds  
       timeOut : 5,
       
       //----verbose
       verbose : true,
       
       //-----allDone 
       // Gets called when all files are loaded and all callbacks executed
       allDone : onFinished 

     },
     
     //----initHook [string]
     //the init function is added to the globalHook under this name
     //falsy will result in not anything being added, and will start
     //the  bootstrap process by itself, otherwise calling globalHook[initHook]()
     //will do this.  
     initHook = null,
     
     //config vars    
     globalNamespace, pathPrefix ,mainjs, scriptInsertionLocation, 
     globalHook, timeOut, verbose, insertionLocation, allDone,
     path_subsitutions,
     
     //internal vars
     resources, definers, dependencies, 
     definers_called, requests_pending, 
     
     
     l;
     
    function init(config) {
       if (!config) config = default_config;
       
       globalHook = config.globalHook || default_config.globalHook,
       globalNamespace = config.globalNamespace || default_config.globalNamespace,
       pathPrefix = config.pathPrefix || default_config.pathPrefix,
       mainjs = config.mainjs || default_config.mainjs,
       scriptInsertionLocation = config.scriptInsertionLocation || default_config.scriptInsertionLocation,
       timeOut = config.timeOut || default_config.timeOut,
       allDone = config.allDone || default_config.allDone,
       verbose = config.verbose == undefined ? default_config.verbose : config.verbose, 
       insertionLocation = document.getElementsByTagName(scriptInsertionLocation === 'head' ? 'head': 'body')[0],
       
       resources = {},
       definers = {},
       definers_called = [],
       requests_pending = 0;
       l = verbose ? log : function() {};
       
       if (global[globalHook]) l("Warning: globalHook '" + globalHook + "' already exists");

       global[globalHook]= define;
       
       if (initHook && !global[globalHook][initHook] ) {
	 global[globalHook][initHook] = init;
	 l("Finished the bootstrap script, start loading the scripts with " + 
	   globalHook + ".init({...config...})");
       }
       else {
	 timestamp("Loading first javascript file: " + mainjs + ".js");
	 requestResource(parseDependencyId(mainjs),null);
       }
       //make sure every path ends with a slash 
       for (p in path_substitutions) 
	 if (path_substitutions[p][path_substitutions[p].length-1] !== '/')
	   path_substitutions[p] += '/'; 
       if (pathPrefix[pathPrefix.length-1] !== '/') pathPrefix += '/';
       setTimeout(timedOut, timeOut*1000);
     };
     
     function timedOut() {
       for (e in requestedUrls)
	 if (requestedUrls[e] === 'requested') {
	   throw "Error: bootstrap timed out, not all resources requested " + 
	     "have been returned within the timeOut time frame";
	   break; 
	 }
     }
     
     //----------------helper functions
     //testing for array
     var isArray = function (value) {
       return Object.prototype.toString.call(value) === "[object Array]";
       // return value &&
       //     typeof value === 'object' &&
       //     typeof value.length === 'number' &&
       //     typeof value.splice === 'function' &&
       //     !(value.propertyIsEnumerable('length'));
     };
     
     //when given a path of a/b/c and a ns of base, object base.a.b.c is returned, creating
     //the objects that don't exist yet
     function getNamespaceObject(ns, path, value) {
       // console.log(ns, path, value);
       if (path) {
	 var parts = path.split('/');
	 for (var i = 0; i < parts.length; i++) {
	   if (parts[i]) {
	     if (value && i==parts.length-1) 
	       ns[parts[i]] = value; 
	     else if (ns[parts[i]] === undefined) {
	       ns[parts[i]] = Object.create(null);
	     }
	     ns = ns[parts[i]];
	   }
	 }
       };
       // return value;
       return ns;
     }
     
     function dirifyPath(path) {
      if (path) path = path.replace(/\./g, '/');
       return path; //.replace(/-/g, '/');
     }
  
     //This inserts a script or css element into the dom, which causes an 
     //async load of the file, or does an xhr request for a file.  For both
     //resourceLoaded is given a callback.
     function requestResource(res, requirer) {
       if (res.url) {
	 if (res.loader && res.loader !== 'js') { 
	   log("loading non js resource ", res);
	   // 'load': function (resourceId, require, callback, config) {
	   if (res.loader !== 'css') res.loader = 'data';
	   requests_pending += 1;
	   res.status = 'requested';
	   loaders[res.loader].load(
	     res.url, 
	     { toUrl: function (url) { return url; }},
	     function (result) { 
	       resourceLoaded(res, requirer);
	       
	       var namespaceObject = getNamespaceObject(global, dirifyPath(globalNamespace));
	       getNamespaceObject(namespaceObject, res.url, result);
	       log(result);  },
	     {/*config*/}
	   );
	 }
	 else { //insert javascript
	   var script_element = document.createElement('script');
	   script_element.src = res.url;
	   script_element.onloadDone = false;
	   script_element.onload = function() {
	     script_element.onloadDone=true;
	     resourceLoaded(res, requirer);
	   };
	   // IE 6 & 7
	   script_element.onreadystatechange = function() {
	     if (script_element.readyState == 'loaded' && !script_element.onloadDone) {
	       script_element.onloadDone = true;
	       resourceLoaded(res, requirer);
	     }
	   };
	   requests_pending += 1;
	   res.status = 'requested';
	   insertionLocation.appendChild(script_element);
	   l(timestamp() + ': inserting script tag for: '+ res.url);
	 }
       } 
       else throw "Cannot load empty url. Have you defined app?";
     }

     //the only global to leak out of this closure, under a name set in the configuration 
     //these functions get executed right after a js file has been loaded by the browser
     //we collect the arguments to these calls here.
     function define(definer) { definers_called.push(definer); }
     
     //called immediately by the browser after script is loaded and then executed
     function resourceLoaded(res, reqdefiner) {
       timestamp( "finished loading: " + res.url);
       requests_pending -= 1;
       res.status = 'loaded';
       res.definers = definers_called;
       definers_called=[]; //reset for the next script to come in
       
       res.definers.forEach(
	 function(definer) {
	   definer.id = res.url + definer.tag; 
	   definer.resource = res;
	   definer.requirers = [];
	   if (definers[definer.id]) timestamp("Warning: redefining " + definer.id); 
	   definers[definer.id]=definer;
	   // put this definer before its reqdefiner
	   // adust the exOrdering of all definers with a exOrdering higher
	   // or equal to the reqdefinerexOrder by 1 upwards
	   definer.exOrder = 
	     (function() {
	     	var exOrder = reqdefiner ? reqdefiner.exOrder : 0;
	     	Object.keys(definers).forEach(function(id) {
	     					if (definers[url].exOrder >= exOrder) {
	     					  definers[url].exOrder += 1;
	     					}
	     				      });
	     	return exOrder;
	      })();
	   resolveDeps(definer);
	   timestamp('new definer added to defined: ' + definer.id + ' ' + definer.exOrder);
	 } );
       //as long as there are still requests pending don't finalize
       if (requests_pending === 0) finalize(); 
     }
     
     function resolveDeps(definer) {
       timestamp('resolving deps for ' + definer.id, definer.required);
       var dep;
       definer.dependencies = [];
       function getDep(depId) {
	 dep = parseDependencyId(depId);
	 definer.dependencies.push(dep);
	 if (dep.resource.status === 'new')  
	   requestResource(dep.resource, definer);
	 else timestamp(res.url + ' has already been requested');
       };
       definer.load.forEach(processDep);
       definer.require.forEach(processDep);
     } 
     
     function parseDependencyId(id) {
       var blocks = false, url, loader,
       tag = "", resource;
       
       var isUri = false;
       
       if (id[id.length-1] === '|') {  blocks  = true;
				       id = id.substring(0, id.length-1);  }
       var lastHash = id.lastIndexOf('#');
       if (lastHash > -1) { tag = id.substring(lastHash+1);
			    id = id.substring(0, lastHash);  }
       var splitId = id.split("!");
       if (splitId.length > 1 && 
	   (splitId[0] === 'js' || splitId[0] === 'css' || splitId[0] === 'data')) {  
	 loader = splitId[0];
	 id = id.substring(id.indexOf('!') + 1);  }
       else { var lastDot = id.lastIndexOf('.');
	      var lastSlash =  id.lastIndexOf('/');
	      if (lastDot>lastSlash) loader = id.substring(lastDot+1);  }
       if (id.indexOf(':') > -1) isUri = true;
       var firstSlash = id.indexOf('/');
       if (firstSlash > -1) {
	 var p = path_subsitutions[id.substring(0,firstSlash)];
	 if (p) id = p + id.substring(firstSlash+1);
       }
       url = isUri ? id : pathPrefix + id;
       if (!loader)  {
	 if (!isUri) { loader = 'js';
		       url += '.js';  }
	 else loader = 'data';  }
       if (!resources[loader + url]) { resource = {
					 url: url,
					 loader: loader,
					 status: 'new',
					 blocks: blocks };
				       resources[loader + url] = resource; }
       else { resource = resources[loader + url];
	      resource.blocks = blocks; }
       return {  resource: resource,
		 tag: tag,
		 met: false  };
     } 
     
    function finalize() {
      log("Finished loading, finalizing:");
      Object.keys(resources).forEach(
	function (res) {
	  res.definers.forEach( //array
	    function (resdef) {
	      resdef.dependencies.forEach( //array
		function (dep) {
		  dep.resource.definers.forEach(  //array
		    function (def) {
		      if (def.tag === dep.tag)
			def.requirers.push(resdef);
		    }); 
		});
	    });
	});
      Object.keys(definers).forEach(
	function (def) {
	  console.log(def.resource.url," is needed in ", 
		      def.requirers.map(function(req) { return req.id;}));
	  def.requirers.forEach( //array
	    function (req) {
	      if ( req.exOrder >  def.exOrder) 
		log("Warning! Cyclic dependency: The objects imported from " + d +
		    " will be undefined in " + r.url);
	    });
	});
      execute();
      allDone();
    } 
     
     
     function execute() {
       timestamp('Executing callbacks:');
       var defarray = [];
       var namespaceObject = getNamespaceObject(global, dirifyPath(globalNamespace));
       for (var d in definers) defarray.push(definers[d]);
       defarray.sort(function compare (a, b) {
		       return a.exOrder > b.exOrder ? 1 : -1;
		     });
       defarray.forEach(
	 function(d) {
	   l(d.id+'\t'+ d.exOrder);
	   if (typeof d.factory === 'function') {
	     var self = getNamespaceObject(namespaceObject, d.id);
	     var depobjs = []; 
	     d.depIds.forEach(function (dep) {
				if (depobjs.push(getNamespaceObject(namespaceObject, dep)) == undefined) 
				  log('Warning: ' + dep + ' is undefined');
			      });
	     var ret = d.factory.apply(self, depobjs);
	     if (ret) getNamespaceObject(namespaceObject, d.id, ret);
	   }
	   else getNamespaceObject(namespaceObject, d.id, d.factory);
	 });
       
       allDone();
     }
     
     function onFinished() {
       console.log(checkDeps);
       l("file\treliantOn\trequiredby\texOrdering"); 
       var defarray = [];
       for (var d in definers) defarray.push(definers[d]);
       defarray.sort(function compare (a, b) {
		       return a.exOrder > b.exOrder ? 1 : -1;
		     });
       defarray.forEach(
	 function(d) {
	   l(d.id+  '\t'+ d.exOrder);});
     }
     
     
     //---------------------loaders--------------------------- 
     var loaders = {
       
       /** MIT License (c) copyright B Cavalier & J Hann */

       /**
	* curl text! loader loader
	*
	* Licensed under the MIT License at:
	* 		http://www.opensource.org/licenses/mit-license.php
	*/

       /**
	* TODO: load xdomain text, too
	* 
	*/

       data : (function () {

		 var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];

		 function xhr () {
		   if (typeof XMLHttpRequest !== "undefined") {
		     // rewrite the getXhr method to always return the native implementation
		     xhr = function () { return new XMLHttpRequest(); };
		   }
		   else {
		     // keep trying progIds until we find the correct one, then rewrite the getXhr method
		     // to always return that one.
		     var noXhr = xhr = function () {
		       throw new Error("getXhr(): XMLHttpRequest not available");
		     };
		     while (progIds.length > 0 && xhr === noXhr) (function (id) {
								    try {
								      new ActiveXObject(id);
								      xhr = function () { return new ActiveXObject(id); };
								    }
								    catch (ex) {}
								  }(progIds.shift()));
		   }
		   return xhr();
		 }

		 function fetchText (url, callback, errback) {
		   var x = xhr();
		   x.open('GET', url, true);
		   x.onreadystatechange = function (e) {
		     if (x.readyState === 4) {
		       if (x.status < 400) {
			 callback(x.responseText);
		       }
		       else {
			 errback(new Error('fetchText() failed. status: ' + x.statusText));
		       }
		     }
		   };
		   x.send(null);
		 }

		 function error (ex) {
		   throw ex;
		 }

		 return {

		   //		'normalize': function (resourceId, toAbsId) {
		   //			// remove options
		   //			return resourceId ? toAbsId(resourceId.split("!")[0]) : resourceId;
		   //		},

		   load: function (resourceName, req, callback, config) {
		     // remove suffixes (future)
		     // hook up callbacks
		     var cb = callback.resolve || callback,
		     eb = callback.reject || error;
		     // get the text
		     fetchText(req['toUrl'](resourceName), cb, eb);
		   },

		   'loader-builder': './builder/text'

		 };

	       })(global)
       
       /** MIT License (c) copyright B Cavalier & J Hann */

       /**
	* curl link! loader
	*
	* Licensed under the MIT License at:
	* 		http://www.opensource.org/licenses/mit-license.php
	*
	*/
       ,css : (function () {
		 /*
		  * curl link! loader
		  * This loader will load css files as <link> elements.  It does not wait for
		  * css file to finish loading / evaluating before executing dependent modules.
		  * This loader also does not handle IE's 31-stylesheet limit.
		  * If you need any of the above behavior, use curl's css! loader instead.
		  *
		  * All this loader does is insert <link> elements in a non-blocking manner.
		  *
		  * usage:
		  * 		// load myproj/comp.css and myproj/css2.css
		  *      module(['css!myproj/comp,myproj/css2']);
		  *
		  * Tested in:
		  *      Firefox 1.5, 2.0, 3.0, 3.5, 3.6, and 4.0b6
		  *      Safari 3.0.4, 3.2.1, 5.0
		  *      Chrome 7+
		  *      Opera 9.52, 10.63, and Opera 11.00
		  *      IE 6, 7, and 8
		  *      Netscape 7.2 (WTF? SRSLY!)
		  * Does not work in Safari 2.x :(
		  */


		 var
		 // compressibility shortcuts
		 createElement = 'createElement',
		 // doc will be undefined during a build
		 doc = global.document,
		 // regexp to find url protocol for IE7/8 fix (see fixProtocol)
		 isProtocolRelativeRx = /^\/\//,
		 // find the head element and set it to it's standard property if nec.
		 head;

		 if (doc) {
		   head = doc.head || (doc.head = doc.getElementsByTagName('head')[0]);
		 }

		 function nameWithExt (name, defaultExt) {
		   return name.lastIndexOf('.') <= name.lastIndexOf('/') ?
		     name + '.' + defaultExt : name;
		 }

		 function createLink (doc, href) {
		   var link = doc[createElement]('link');
		   link.rel = "stylesheet";
		   link.type = "text/css";
		   link.href = href;
		   return link;
		 }

		 function fixProtocol (url, protocol) {
		   // IE 7 & 8 can't handle protocol-relative urls:
		   // http://www.stevesouders.com/blog/2010/02/10/5a-missing-schema-double-download/
		   return url.replace(isProtocolRelativeRx, protocol + '//');
		 }

		 return {

		   //		'normalize': function (resourceId, toAbsId) {
		   //			// remove options
		   //			return resourceId ? toAbsId(resourceId.split("!")[0]) : resourceId;
		   //		},

		   'load': function (resourceId, require, callback, config) {
		     var url, link, fix;

		     url = require['toUrl'](nameWithExt(resourceId, 'css'));
		     fix = 'fixSchemalessUrls' in config ? config['fixSchemalessUrls'] : doc.location.protocol;
		     url = fix ? fixProtocol(url, fix) : url;
		     link = createLink(doc, url);
		     head.appendChild(link);
		     log(link);
		     callback(link.sheet || link.styleSheet);

		   }

		 };

	       })(global)
     };  

     //executing code:
     if (typeof bootstrap !== "undefined") init(bootstrap);
     else init(default_config);

 })(this);



