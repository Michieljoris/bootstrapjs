"use strict";
// TODO
//execute definers when their dependencies have been met


//Notes:
//1. To load non-module files in a certain order, concatenate them into one js file, insert them directly
// in the html file with script source statements, or inject or load them in a module marking them with
// a | after the url to indicate that they should block till they are loaded (and executed!) 

//2. Cyclic dependancies!! Possible, but a module that requires another module that directly or 
// indirectly requires the first module cannot use any public api of the first module upon invocation
// of the callback, since the callback of the first module has not been called yet at that moment. 
// However after this has happened (the callback of the first module) the second module can use it again.

//3. To concatenate all the files together you would have to insert statements between the concatenated files,
//such as: setfolderpath(pathToFolderFileUsedToBeIn), so that when the defines get executed bootstrapjs knows
//in what namespace to put the defined factories, ofcourse all the load directives would become superfluous 
//because they don't have to be loaded anymore by bootstrap. The inject directive becomes just an instruction 
//what objects to insert, not what files to load anymore. You can concatenate them in any order, bootstrap would 
//still control the order of the execution of the callbacks, though you might might want to put the non bootstrap ffiles first. You could set it up so that just before bootstrap executes the callbacks, it would check whether all
//the dependency objects are there, and if not it would again try to download them.

//datastructures:
// definer = {
//   id : unique string made from: this.resource.url + this.tag
//   tag: "string", 
//   load: array of files,
//   inject: array of files, to inserted into factory
//   factory; module code/dat

//   resource: resource this is defined in
//   dependencies: array of dependencies whose resources have to be loaded and
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
//   namespace: where to store this resource 
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
     VERSION = '0.3',
     DATE = '19/9/12',
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
       //window.module.myapp.dir3.module1, which can be injected with myapp.dir3.module1
       //if this variable is not defined at all objects assigned to an internal namespace
       globalNamespace : 'module',
       
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
       
       //----execute_on_dependencies_met 
       //whether to execute callbacks as soon as their dependencies are met, or to 
       //wait till all files are loaded
       executeOnDependenciesMet: true, //not implemented

       //-----head or body
       scriptInsertionLocation : 'head',
       
       //-----timeOut 
       //in seconds  
       timeOut : 1,
       
       //----verbose
       //none, error, warn, info, debug 
       verbose : "debug",
       
       //--execute
       // callback that gets as an argument a function that executes all the callbacks.
      // useful to implement waiting for domready event for instance:
       // execute: function myExecute(f) {
       //   // Check for browser support of event handling capability
       //   if (window.addEventListener)
       //     window.addEventListener("load", f, false);
       //   else if (window.attachEvent) window.attachEvent("onload", f);
       //   else window.onload = f;
       // },
       execute: native_execute,
        
       //-----allDone 
       // Gets called when all files are loaded and all callbacks executed
       allDone : onFinished

     },
     
     //----initHook [string]
     //the init function is added to the globalHook under this name
     //falsy will result in not anything being added, and will start
     //the  bootstrap process by itself, otherwise calling globalHook[initHook]()
     //will do this, with an optional config object as argument.  
     initHook = null,
     
     //config vars    
     globalNamespace, pathPrefix ,mainjs, scriptInsertionLocation, 
     globalHook, timeOut, verbose, insertionLocation, allDone,
     path_substitutions, executeNow, execute,
     
     //internal vars
     resources, definers,
     definers_called, requests_pending, 
     blocking, reqstack,
     
     c; //log variable, like console, but with verbosity level control
     
     function init(config) {
       //make sure all config vars have at least some default value
       if (!config) config = default_config;
       
       globalHook = config.globalHook || default_config.globalHook;
       if (global[globalHook]) c.warn("Warning: globalHook '" + globalHook + "' already exists");
       global[globalHook]= define;
       
       globalNamespace = config.globalNamespace || default_config.globalNamespace;
       if (!globalNamespace) globalNamespace = {};
       
       pathPrefix = config.pathPrefix || default_config.pathPrefix;
       mainjs = config.mainjs || default_config.mainjs;
       scriptInsertionLocation = config.scriptInsertionLocation || default_config.scriptInsertionLocation;
       timeOut = config.timeOut || default_config.timeOut;
       allDone = config.allDone || default_config.allDone;
       verbose = config.verbose == undefined ? default_config.verbose : config.verbose;
       insertionLocation = document.getElementsByTagName(scriptInsertionLocation === 'head' ? 'head': 'body')[0];
       path_substitutions = config.path_substitutions || default_config.path_substitutions;
       executeNow = config.executeOnDependenciesMet || default_config.executeOnDependenciesMet; 
       execute = config.execute || default_config.execute;
       
       //make sure every path ends with a slash 
       for (var p in path_substitutions) 
	 if (path_substitutions[p][path_substitutions[p].length-1] !== '/')
	   path_substitutions[p] += '/'; 
       if (pathPrefix[pathPrefix.length-1] !== '/') pathPrefix += '/';
       
       //initialize internal vars 
       resources = {};
       definers = {};
       definers_called = [];
       requests_pending = 0;
       blocking = false;
       reqstack = [];
       
       //custom console 
       c = {};
       var emptyFun = function () {};
       c.error = c.warn = c.info = c.debug = function() {};
       c.dir = function () { console.dir.apply(console, arguments); };

       switch (verbose) {
       case "debug" : c.debug = function () { console.debug.apply(console, arguments); };
       case "info" : c.info = function () { console.info.apply(console, arguments); };
       case "warn" : c.warn = function () { console.warn.apply(console, arguments); };
       case "error" :c.error = function () { console.error.apply(console, arguments); };
       case "none" : break;
       default: c.error("Unknown verbose level");
       }
       
       //start off bootstrap
       if (initHook && !global[globalHook][initHook] ) {
	 global[globalHook][initHook] = init;
	 c.info("Finished the bootstrap script, start loading the scripts with " + 
		globalHook + ".init({...config...})");
       }
       else {
	 c.info("Loading first javascript file: " + mainjs + ".js");
	 requestResource({ resource: parseDependencyId(mainjs).resource, requiere:null });
       }
       //after timeOut seconds timedOut get called which checks whether all scripts and resources have been loaded
       //and gives an error messages if they are not.
       setTimeout(timedOut, timeOut*1000);
     };
     
     //called after timeOut seconds. Checks if all requested resources have actually been loaded.
     function timedOut() {
       var noresponse = [];
       for (var r in resources)
	 if (resources[r].status === 'new' || resources[r].status === 'requested') {
	   noresponse.push(resources[r]); 
	 }
       if (noresponse.length > 0) {
	 c.error("Timed out:");
	 noresponse.forEach(function(r) {
			      c.error("  " + r.url);
			    });
       } 
     }
     
     //when given a path of a/b/c and a ns of base, object base.a.b.c is returned, creating
     //the objects that don't exist yet, and assigning value to the end of the path (c)
     function getNamespaceObject(ns, path, value) {
       if (path) {
	 var parts = path.split('/');
	 for (var i = 0; i < parts.length; i++) {
	   if (parts[i]) {
	     if (value && i==parts.length-1) 
	       ns[parts[i]] = value; 
	     else if (ns[parts[i]] === undefined) {
	       ns[parts[i]] = {}; //Object.create(null);
	     }
	     ns = ns[parts[i]];
	   }
	 }
       };
       return ns;
     }
     
     //This inserts a script or css element into the dom, which causes an 
     //async load of the file, or does an xhr request for a file.  For both
     //resourceLoaded is given as callback.
     function requestResource(request) {
       var res = request.resource;
       var requirer = request.requirer;
       if (res.blocks) blocking = true;
       //xhr and css tag insertion 
       if (res.loader && res.loader !== 'js') { 
	 c.info("loading non js resource ", res.url);
	 if (res.loader !== 'css') res.loader = 'data';
	 requests_pending += 1;
	 res.status = 'requested';
	 //call one of the loaders defined at the bottom of this file
	 loaders[res.loader].load(
	   res.url, 
	   { toUrl: function (url) { return url; }},
	   //callback for xhr and css
	   function (result) { 
	     //we only care about the data callback
	     if (res.loader === 'data')  {
	       //pop the data in the namespace tree 
	       var namespaceObject = getNamespaceObject(global, globalNamespace);
	       if (res.isAbs) {
		 namespaceObject[res.url] = result;
	       }
	       else getNamespaceObject(namespaceObject, res.namespace, result);
	     }
	     resourceLoaded(res, requirer);
	   },
	   {/*config*/}
	 );
       }
       //insert javascript tag
       else { 
	 var script_element = document.createElement('script');
	 script_element.src = res.url;
	 script_element.onloadDone = false;
	 script_element.defer = true;
	 script_element.onload = function() {
	   script_element.onloadDone=true;
	   resourceLoaded(res, requirer);
	 };
	 // // IE 6 & 7
	 // script_element.onreadystatechange = function() {
	 //   if (script_element.readyState == 'loaded' && !script_element.onloadDone) {
	 //     script_element.onloadDone = true;
	 //     resourceLoaded(res, requirer);
	 //   }
	 // };
	 requests_pending += 1;
	 res.status = 'requested';
	 insertionLocation.appendChild(script_element);
	 c.info( 'Inserting script tag for: '+ res.url);
       }
     }

     //the only global to leak out of this closure, under a name set in the configuration 
     //these functions get executed right after a js file has been loaded by the browser
     //we collect the arguments to these calls here.
     function define(definer) { definers_called.push(definer); }
     
     //called immediately by the browser after script is loaded and then executed
     function resourceLoaded(res, reqdefiner) {
       //bookkeeping
       if (blocking) blocking = false;
       c.info( "finished loading: " + res.url);
       requests_pending -= 1;
       res.status = 'loaded';
       res.definers = definers_called;
       definers_called=[]; //reset for the next script to come in
       //add definers called from the script just loaded to the definers object, under
       //the name definer.res.url#definer.tag
       res.definers.forEach(
	 function(definer) {
	   definer.resource = res;
	   if (!definer.tag) definer.tag = "";
	   if (!definer.load) definer.load = [];
	   if (!definer.inject) definer.inject = [];
	   // definer.id = definer.tag ? res.url + "#" + definer.tag : res.url; 
	   definer.id = res.url + "#" + definer.tag;
	   definer.requirers = [];
	   if (definers[definer.id]) c.info("Warning: redefining " + definer.id); 
	   // put this definer before its reqdefiner
	   // adust the exOrdering of all definers with a exOrdering higher
	   // or equal to the reqdefinerexOrder by 1 upwards
	   definer.exOrder = 
	     (function() {
	     	var exOrder = reqdefiner ? reqdefiner.exOrder : 0;
	     	Object.keys(definers).forEach(function(id) {
	     					if (definers[id].exOrder >= exOrder) {
	     					  definers[id].exOrder += 1;
	     					}
	     				      });
	     	return exOrder;
	      })();
	   //one more for the collection
	   definers[definer.id]=definer;
	   //and see what else this definer is going to need...
	   resolveDeps(definer);
	   c.info('New definer added to definers: ' + definer.id + ' ' + definer.exOrder);
	 } );
       //carry out any pending requests that might have stacked up while a resource was purposefully blocking
       while (reqstack.length > 0 && !blocking)
	 requestResource(reqstack.pop());
       //as long as there are still requests pending don't finalize
       if (requests_pending === 0) finalize(); 
     }
     
     //make more requests for resources, depending on the modules load and inject arrays
     function resolveDeps(definer) {
       c.info('resolving deps for ' + definer.id, definer.load, definer.inject);
       definer.dependencies = [];
       function processDep(depId) {
	 var dep = parseDependencyId(depId);
	 definer.dependencies.push(dep);
	 if (dep.resource.status === 'new')   {
	   var request = { resource:dep.resource, requirer: definer };
	   if (blocking) reqstack.push(request);
	   else requestResource(request);
	 }
	   
	 else c.info(dep.resource.url + ' is requested one more!!');
       };
       definer.load.forEach(processDep);
       definer.inject.forEach(processDep);
     } 
     
     //pry dependency id apart  
     function parseDependencyId(id) {
       if (!id) c.warn("Empty dependency...");
       var blocks = false, url, loader,
       tag = "", resource, isAbs = false,
       namespace, ext = "";
       //the presence of : would suggest an absolute path, as in http://bla.
       if (id.indexOf(':') > -1) isAbs = true;
       //any id finishing with a | indicates it should block executing of javascript, till
       //it's loaded and has run itself.
       if (id[id.length-1] === '|') {  blocks  = true;
				       id = id.substring(0, id.length-1);  }
       //get the tag of the end of the id
       var lastHash = id.lastIndexOf('#');
       if (lastHash > -1) { tag = id.substring(lastHash+1);
			    id = id.substring(0, lastHash);  }
       //deduce loader from either prefix or .ext
       var splitId = id.split("!");
       if (splitId.length > 1 && 
	   (splitId[0] === 'js' || splitId[0] === 'css' || splitId[0] === 'data')) {  
	 loader = splitId[0];
	 id = id.substring(id.indexOf('!') + 1);  }
       else { var lastDot = id.lastIndexOf('.');
	      var lastSlash =  id.lastIndexOf('/');
	      if (lastDot>lastSlash) loader = id.substring(lastDot+1);  }
       //if neither were present, default to .js for relative paths, data for absolute paths
       if (!loader)  {
	 if (!isAbs) { loader = 'js';
		       ext = '.js';  }
	 else loader = 'data';  }
       //what's left of the id now is used as the namespace for any objects returned by this resource
       //tag gets added to the namespace if a definer defined in the resource has a tag attr.
       namespace = id;
       if (namespace[namespace.length - 1] !== '/') namespace += '/';
       //Modify relative urls: 
       if (!isAbs) {
         //Create url by path substitution 
	 var firstSlash = id.indexOf('/');
	 if (firstSlash > -1) {
	   var p = path_substitutions[id.substring(0,firstSlash)];
	   if (p) id = p + id.substring(firstSlash+1);
	   // give url a custom prefix
	 }
	 url = pathPrefix + id + ext; 
       }
       else url = id;
       //Create resource data structure
       if (!resources[loader + "!" + url]) { resource = {
					       url: url,
					       namespace: namespace,
					       isAbs: isAbs,
					       loader: loader,
					       status: 'new',
					       blocks: blocks };
					     resources[loader + "!" + url] = resource; }
       else { resource = resources[loader + "!" + url];
	      resource.blocks = blocks; }
       //return a dependency
       return {  resource: resource,
		 tag: tag,
		 met: false  };
     } 
     
     //make the apropriate connections, check for circular dependencies and execute the callbacks
     function finalize() {
       c.info("Finished loading, finalizing:");
       //connect it all up
       Object.keys(resources).forEach(
	 function (res) {
	   resources[res].definers.forEach( //array
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
       // c.dir(definers);
       // c.dir(resources);
       //check for dependencies
       Object.keys(definers).forEach(
	 function (def) {
	   def = definers[def];
	   // c.debug('def=' , def);
	   c.info(def.resource.url," is needed in ", 
		  def.requirers.map(function(req) { return req.id;}));
	   def.requirers.forEach( //array
	     function (req) {
	       // c.debug('req=', req);
	       if ( req.exOrder <  def.exOrder) 
		 c.warn("Warning! Cyclic dependency: The objects imported from " + def.id +
			" might be undefined in " + req.id);
	     });
	 });
       //execute the callbacks
       execute(execute_callbacks);
     } 
     
     //default callback for execute, it just passes on the call
     function native_execute(f) {
       f.call();
     }
    
     //all the callbacks gathered during the loading phase get executed now in the right order,
     //so that their dependencies are all met
     function execute_callbacks() {
       c.info('Executing callbacks:');
       var sortedDefs = [];
       //base object to assign our factories to
       var namespaceObject = getNamespaceObject(global, globalNamespace);
       //sort all definers according to execution order
       for (var d in definers) sortedDefs.push(definers[d]);
       sortedDefs.sort(function (a, b) {
			 return a.exOrder > b.exOrder ? 1 : -1;
		       });
       //execute all definers' callbacks, or assign the factory directy to its namespace
       sortedDefs.forEach(
	 function(def) {
	   c.info(def.id+'\t'+ def.exOrder);
	   if (typeof def.factory === 'function') {
	     var self = getNamespaceObject(namespaceObject, def.resource.namespace + def.tag);
	     var depobjs = []; 
	     //all these dependencies should exist in the namespace..
	     def.dependencies.forEach(function (dep) {
					var path = dep.resource.namespace + dep.tag;
					// c.debug('path: ', path);
					if (depobjs.push(getNamespaceObject(namespaceObject, path)) == undefined) 
					  c.warn('Warning: ' + dep + ' is undefined');
				      });
	     var ret = def.factory.apply(self, depobjs);
	     if (ret) getNamespaceObject(namespaceObject, def.resource.namespace + def.tag, ret);
	   }
	   else getNamespaceObject(namespaceObject, def.resource.namespace+ def.tag, d.factory);
	 });
       //by default this calls onFinished, but can be reassigned in config
       allDone();
     }
     
     //superfluous.., just some printing out of debug data 
     function onFinished() {
       c.debug("file\treliantOn\trequiredby\texOrdering"); 
       var sortedDefs = [];
       for (var d in definers) sortedDefs.push(definers[d]);
       sortedDefs.sort(function compare (a, b) {
			 return a.exOrder > b.exOrder ? 1 : -1;
		       });
       sortedDefs.forEach(
	 function(d) {
	   c.info(d.id+  '\t'+ d.exOrder);});
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
		     // log(link);
		     callback(link.sheet || link.styleSheet);

		   }

		 };

	       })(global)
     };  

     //executing code:
     if (typeof bootstrap !== "undefined") init(bootstrap);
     else init(default_config);

 })(this);



