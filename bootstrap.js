"use strict";
// TODO
// -make a minimal version (strip out console, executeLater/executeASAP and more?)
// -make a node or picolisp script that concatenates all files and puts the right calls between files
// --> as a first step make a list of the files that will be concatenated together.. You would need the
// executeLater mode, and disable the loadResource mechanism.  
// -Maybe load js files in stages? Or all together? Or before the html load? Or after?
//- replace executelater/asap with dom ready events or other events, to be inserted into the dependency lists?
//- make the loaders plugins external to this file and comply the amd spec a bit more, advantage is that this file becomes smaller, more custom loaders could be added easily, and also used as standalone loaders in the modules. 
// Disadvantage is that there are more network requests, one for every loader, and that the bootstrap code
// would have to be modified for this to accomodate loading dependencies for loading dependencies..
//-have an amd! loader, it would conform to the amd spec for defining modules, so that for example we can load underscore.
//-concatenate and uglify and offer for download a bundled compressed production mode bootstrap in the browser, maybe by entering a command in the console? Or by setting a config option
// 
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
//because they don't have to be loadedjanymore by bootstrap. The inject directive becomes just an instruction 
//what objects to insert, not what files to load anymore. You can concatenate them in any order, bootstrap would 
//still control the order of the execution of the callbacks, though you might might want to put the non bootstrap ffiles first. You could set it up so that just before bootstrap executes the callbacks, it would check wther all
//the dependency objects are there, and if not it would again try to download them.

//4 I talk interchangeably about defines and modules throughout this source code, however
// these can be configured to be named anything you want, by setting the appropriate config variable.

//datastructures:
// resource = {
//   id: loader!url
//   url: relative or absolute path
//   loader: "data, css or js, or bootstrap"
//   status: new, requested, loaded, callbacks_executed
//   blocks : boolean
//   definers: definers defined in this resource    
//   namespace: where to store this resource 
// }

// dependency = {
//   id: resource.id#tag
//   resource: file this dependency would like to load
//   tag: subid if there more than one id per file, no tag is an empty string tag
//   definer: definer that is referred by by the resource#tag combo
//   met: boolean, has resourceLoaded been called if it is css or data,
//                 has the callback been executed if it is a definer
//   requirers: array of definers that asks for this dependency
//   dependencies: array of dependencies whose resources have to be loaded and
//                 its appropriate (tag) definer executed
//                 before this dependency's callback can be executed
//   isBonus: the definer was found in a file but was not the definer
//             that the dependency was after
// }

// definer = {
//   tag: "string", 
//   load: array of files,
//   inject: array of files, to inserted into factory
//   factory; module code/dat

//------------- internal attributes---------------------
//   dependency: the dependency that wants this definer
// }


//Bootstrap
(function(global)
 {   var 
     VERSION = '0.3',
     DATE = '19/9/12',
     default_config = {
       //-----hook
       //Name of the global function that modularizes a file by defining other files to load and taking a an optional 
       // callback or other object that defines the functionality of the module. 
       hook: 'define',
       
       //-----namespace
       //All objects created by the callbacks are added to the object global.namespace.url
       // So for instance if a module is defined in javascript/dir1/dir2/dir3/module1.js 
       // (relative to the html file that loaded bootstrap.js, this file)
       //,assuming global=window and namespace=module and pathPrefix=javascript
       //and paths[myapp]='dir1/dir2' then the object created will be:
       //window.module.myapp.dir3.module1, which can be injected with myapp.dir3.module1
       //If this variable is not defined at all objects are assigned to an internal namespace
       //and not accessible outside the module
       namespace: 'module',
       
       //-----global pathPrefix
       //Load files relative to this path
       pathPrefix: "test/",
       
       //-----paths 
       //a way to map namespaces to directories. This way you can refer to modules defined in 
       //separate rootfolders by prefixing the object name with its subsitution
       paths: {
	 // myapp: 'path/to/package.js'
       },
       
       //-----main     
       //First javascript file to load, the bootstrap so to speak
       main: 'myapp#foo',

       //-----scriptInsertionLocation
       //Head or body, or any other element
       scriptInsertionLocation : 'head',
       
       //-----timeOut 
       //in seconds  
       timeOut: 1,
       
       //-----verbose
       //none, error, warn, info, debug 
       verbosity: "debug",
       
       //-----onExecute
       // gets called right before all module callbacks get executed
       // gets as an argument a function that executes these callbacks.
       // useful to implement waiting for domready event for instance:
       // execute: function myExecute(f) {
       //   // Check for browser support of event handling capability
       //   if (window.addEventListener)
       //     window.addEventListener("load", f, false);
       //   else if (window.attachEvent) window.attachEvent("onload", f);
       //   else window.onload = f;
       // },
       //if falsy all callbacks get executed asap
       // onExecute: onExecute_native,
       
       //-----onLoaded 
       // Gets called when all files are loaded and all callbacks executed
       onLoaded: onLoaded_native
     },
     
     //----initHook [string]
     //the init function is added to the hook under this name
     //falsy will result in not anything being added, and will start
     //the  bootstrap process by itself, otherwise calling hook[initHook]()
     //will do this, with an optional config object as argument.  
     initHook = null,
     
     //config vars    
     namespace, pathPrefix ,main, scriptInsertionLocation, 
     hook, timeOut, verbosity, insertionLocation, 
     paths, executeASAP, 
     onExecute, onLoaded,
     
     //internal vars
     resources, definers, dependencies,
     definers_called, requests_pending, 
     blocking, depstack, 
     
     //returns a timestamp in ms without arguments,
     timeStamp = (function () {
			var bootstart = new Date();
			return function () { return new Date() - bootstart;};})(),
     //log with levels  eg: log(W,"bla");
     E=1, W=2, I=3, D=4,
     levels = ['none', 'error', 'warn', 'info', 'debug'];
     
     //------------------------------------------------------------ 
     function log() {
       var args = Array.prototype.slice.call(arguments);
       var level = args[0];
       args[0] = timeStamp();
       if (level <= verbosity) console[levels[level]].apply(console, args);
     }
     
     //------------------------------------------------------------ 
     function init(config) {
       //make sure all config vars have at least some default value
       if (!config) config = default_config;
       
       hook = config.hook || default_config.hook;
       if (global[hook]) log(W,"Warning: hook '" + hook + "' already exists");
       global[hook]= define;
       
       namespace = config.namespace || default_config.namespace;
       //base object to assign our factories to
       namespace = namespace ? makeNamespace(global, namespace) : {};
       
       pathPrefix = config.pathPrefix || default_config.pathPrefix;
       main = config.main || default_config.main;
       scriptInsertionLocation = config.scriptInsertionLocation || default_config.scriptInsertionLocation;
       insertionLocation = document.getElementsByTagName(scriptInsertionLocation)[0];
       timeOut = config.timeOut || default_config.timeOut;
       
       verbosity = config.verbosity == undefined ? default_config.verbosity : config.verbosity;
       verbosity = levels.indexOf(verbosity);
       
       paths = config.paths || default_config.paths;
       onExecute = config.onExecute || default_config.onExecute;
       onLoaded = config.onLoaded || default_config.onLoaded;
       executeASAP = onExecute ? false : true;
       //make sure every path ends with a slash 
       for (var p in paths) 
	 if (paths[p][paths[p].length-1] !== '/')
	   paths[p] += '/'; 
       if (pathPrefix[pathPrefix.length-1] !== '/') pathPrefix += '/';
       
       //initialize internal vars 
       //the first three are objects to keep track of unique instances of their members.
       resources = {};
       definers = {};
       dependencies = {};
       //just to bridge the callback from request to response of js,css and data
       definers_called = [];
       //if there are no more requests, we're finished...
       requests_pending = 0;
       //set to true if a dependency id ends in |
       blocking = false;
       //when blocking any further requests are stacked here, 
       // till the blocking resource responds
       depstack = [];
       
       //start off bootstrap
       if (initHook && !global[hook][initHook] ) {
	 global[hook][initHook] = init;
	 log(I,"Finished the bootstrap script, start loading the scripts with " + 
		hook + ".init({...config...})");
       }
       else {
	 log(I,"Loading first javascript file: " + main + ".js");
	 requestResource(parseDependencyId(main),
	 		 {  exOrder: 0,
	 		    requirers: [],
	 		    dependencies: [main]
	 		 }
	 		);
	 //after timeOut seconds timedOut get called which checks whether all scripts and resources have been loaded
	 //and gives an error messages if they are not.
	 setTimeout(timedOut, timeOut*1000);
       }
     };
     
     //------------------------------------------------------------ 
     //called after timeOut seconds. Checks if all requested resources have actually been loaded.
     function timedOut() {
       var noresponse = [];
       log(D, dependencies);
       for (var d in dependencies)
	 if (dependencies[d].resource.status !== 'loaded') {
	   noresponse.push(dependencies[d].id); 
	 }
       if (noresponse.length > 0) {
	 log(E,"Timed out. Unresolved dependencies:");
	 noresponse.forEach(function(r) {
			      log(E,"  " + r.url); }); } }
     
     //------------------------------------------------------------ 
     //when given a path of a/b/c and a ns of base, object base.a.b.c is returned, creating
     //the objects that don't exist yet, and assigning value to the end of the path (c)
     function makeNamespace(ns, path, value) {
       if (path) {
	 var parts = path.split('/');
	 for (var i = 0; i < parts.length; i++) {
	   if (parts[i]) {
	     if (value && i==parts.length-1) 
	       ns[parts[i]] = value; 
	     else if (ns[parts[i]] === undefined) {
	       // ns[parts[i]] = {}; //Object.create(null);
	       ns[parts[i]] = Object.create(null);
	     }
	     ns = ns[parts[i]]; } } };
       return ns; }
     
     //------------------------------------------------------------ 
     //This inserts a script or css element into the dom, which causes an 
     //async load of the file, or does an xhr request for a file.  For both
     //onload events resourceLoaded is eventually called.
     function requestResource(dependency) {
       var res = dependency.resource;
       //xhr and css tag insertion 
       if (res.loader && res.loader !== 'js' && res.loader !== 'bootstrap') 
       { log(I,"Making xhr request for a non bootstrap resource " + res.url);
	 if (res.loader !== 'css') res.loader = 'data';
	 requests_pending += 1;
	 //call one of the loaders defined at the bottom of this file
	 loaders[res.loader].load(
	   res.url, 
	   { toUrl: function (url) { return url; }},
	   //callback for xhr and css
	   function (result) { 
	     //we only care about the data callback
	     if (res.loader === 'data')  {
	       //pop the data in the namespace tree 
	       if (res.isAbs) namespace[res.url] = result;
	       else makeNamespace(namespace, res.namespace, result);
	     }
	     resourceLoaded(dependency);
	   },
	   {/*config*/}); }
       //insert javascript tag
       else { var script_element = document.createElement('script');
	      script_element.src = res.url;
	      script_element.onloadDone = false;
	      script_element.defer = true;
	      script_element.onload = function() {
		script_element.onloadDone=true;
		resourceLoaded(dependency);
	      };
	      // // IE 6 & 7
	      // script_element.onreadystatechange = function() {
	      //   if (script_element.readyState == 'loaded' && !script_element.onloadDone) {
	      //     script_element.onloadDone = true;
	      //     resourceLoaded(dependency, requirer);
	      //   }
	      // };
	      requests_pending += 1;
	      insertionLocation.appendChild(script_element);
	      log(I, 'Inserting script tag for: '+ res.url);
	      if (res.blocks) log(I,'Blocking any further script injections till this one has run'); }
       res.status = 'requested'; }

     //------------------------------------------------------------ 
     //the only global to leak out of this closure, under a name set in the configuration 
     //these functions get executed right after a js file has been loaded by the browser
     //we collect the arguments to these calls here. To conform more to the AMD specs
     //you would adapt this function, by analyzing the arguments and creating a standard
     //definer object {tag:.., load:.., inject:.., factory:..} to add to definers_called 
     function define(definer) { 
       //fix up this new definer
       if (!definer.tag) definer.tag = "";
       if (!definer.load) definer.load = [];
       if (!definer.inject) definer.inject = [];
       definers_called.push(definer); }
     
     //------------------------------------------------------------ 
     //called immediately by the browser after script is loaded and then executed
     //beginning of thread
     function resourceLoaded(dependency) {
       var res = dependency.resource;
       //bookkeeping
       log(I, "************Processing: " + dependency.id + '*************');
       if (res.blocks && blocking) blocking = false;
       requests_pending-= 1;
       res.status = 'loaded';
       //to prevent files with .js extension to be interpreted as bootstrap files with
       //definers in them we check for the loader type (only dependencies without an extension
       //are interpreted as bootstrap files), otherwise you can't load files that happen to do a
       //define call
       if (res.loader === 'bootstrap')  
       { res.definers =  definers_called;
	 var resolved_dependencies = [];
	 res.definers.forEach(function (def) { 
				var depId = dependency.resource.loader + '!' + 
       				  dependency.resource.url + '#' + def.tag;
				if (!dependencies[depId]) {
				  log(I, 'Bonus definer found: ' + depId);
				  dependencies[depId] = { id: depId, requirers: [],
							  isBonus: true,
							  resource: dependency.resource,
							  tag: def.tag,
							  dependencies: [] }; }
				else resolved_dependencies.push(dependencies[depId]);
				tieInDefiner(dependencies[depId], def); } ); 
	 resolved_dependencies.forEach(function(dep) { processDependency(dep);});
       }
       // else res.definers = []; 
       definers_called=[]; //reset for the next script to come in
       }
     
     //---------------------------------------------------------
     //this will try to resolve any further dependencies this dependency has
     //and try to execute any callback
     //continued from resourceLoaded, or async called from resolveDeps, 
     function processDependency(dependency) {
       log(I, 'processing dependency ' + dependency.id);
       //see what else this dependency is going to need...
       resolveDeps(dependency); 
      //and execute the callback if possible..
       executeNow(dependency);
       //now is the time to make any further requests for resources..
       if (depstack.length > 0) log(I, 'Finally, request queued dependencies'); 
       while (depstack.length > 0 && !blocking) {
	 dependency = depstack.shift();
	 if (dependency.resource.blocks) blocking = true;
	 requestResource(dependency); }
       //as long as there are still requests pending don't finalize
       if (requests_pending === 0) finalize(); }
     //end of thread..
     
     //------------------------------------------------------------ 
     //tie the definer to the dependency if tags match, otherwise make new dependencies, 
     //received as a bonus...
     function tieInDefiner(dependency, definer) {
       //bonus dependency/definer
       dependency.definer = definer; 
       definer.dependency = dependency;
       definer.id = dependency.resource.url + '#' + definer.tag;
       //the following can happen if more than one definer in a file has the
       //the same tag, or no tag.
       if (definers[definer.id]) log(I,"Warning: redefining " + definer.id); 
       log(I,'New definer added to definers: ' + definer.id + ' ' + definer.exOrder);
       definers[definer.id]=definer;  
     } 
     
     function setExeOrder() {
     //do a depth-first search for all paths to the main node, setting exeOrders on the way  
     }
     
     //------------------------------------------------------------ 
     //make more requests for resources, depending on the modules' load and inject arrays
     function resolveDeps(dependency) {
       log(I,'Resolving deps for ' + dependency.id);
       log(I, dependency.definer.load, dependency.definer.inject);
       // log(D, dependency);
       var definer = dependency.definer;
       function processDep(depId) {
	 var dep_dependency = parseDependencyId(depId);
	 dependency.dependencies.push(dep_dependency);
	 dep_dependency.requirers.push(dependency); 
	 if (dep_dependency.resource.status === 'new')   {
           log(I,'queueing ' + dep_dependency.id );
	   depstack.push(dep_dependency);
	   dep_dependency.resource.status = 'queued'; }
	 else {
	 if (dep_dependency.resource.status === 'loaded') {
	   log(I, 'The resource for this dependency has already been loaded: ' + dep_dependency.id  ); 
	   if (dep_dependency.isBonus) {
	     dep_dependency.isBonus = false;
	     //make quasi browser callback, as if we just loaded this new definer
	     //though it had come for free with a previous resourceLoad
	     setTimeout(function() { processDependency(dep_dependency); }, 0);
	     requests_pending++;
	     log(I, 'This is a bonus definer being activated.. ,setting callback'); 
	   }
	 } 
	 else log(I,'this dependency is already queued: ' + dep_dependency.id);  
	 }
       }
       definer.load.forEach(processDep);
       definer.inject.forEach(processDep); } 
     
     //------------------------------------------------------------ 
     function executeNow(dependency) {
       if (!executeASAP) return;
       //function that, if all dependencies are met, executes the callback;
       function exe(dep) {
	 if (dep.definer.factory && typeof dep.definer.factory === 'function')  
	 { 
	   if (dep.dependencies.every(function(e) { return e.met;}))
	   { log(I,'All dependencies have been met for ' + dep.definer.id +
		 ' ,executing the callback');
	     executeCallback(dep);
	     return true; }
	   else { log(I,"There are still dependencies missing for " + dep.definer.id);
		  return false; } }     
	 else return true; } 	 
       
       dependency.met = true;
       if (dependency.resource.loader === 'bootstrap')  {
	 log(I, 'Trying to execute callback of ' + dependency.id);
	 var depdef = dependency.definer; 
	 if (depdef) {
	   if (depdef.factory) {
       	     if (typeof depdef.factory !== 'function')  
	       makeNamespace(namespace, depdef.resource.namespace + def.tag, def.factory);
	     else dependency.met = exe(dependency); } } 
	 else  {
	   log(E,(definer ? "Definer " + definer.id  : main) + 
		  ' has asked for the dependency ' +  dependency.id + ' in the resource ' +
		  dependency.resource.url + ', which has no matching definers.' );
	   dependency.met = false; } }
       var failsafe = 0;
       function backtrace(dep) {
       	 dep.requirers.forEach(
	   function(req) {
	     if (exe(req)) { req.met = true;
       			     if (failsafe++ < 50)  backtrace(req); 
			     else throw('Error: We were in long loop!!!!'); 
			   } }); }
       //if we have a leaf, backtrace as far as you can!!!
       if (dependency.met) {
	 log(I, 'Backtracking..');
	 backtrace(dependency); 
	 log(I, 'Backtracking done');
       }
} 
     
     //------------------------------------------------------------ 
     //make the apropriate connections, check for circular dependencies and execute the callbacks
     function finalize() {
       log(I,"Finished loading, finalizing:");
       Object.keys(definers).forEach(
	 function (def) {
	   def = definers[def];
	   // log(D,'def=' , def);
	   log(I,def.dependency.resource.namespace + "#" + def.tag + " is needed in " +  
	       def.dependency.requirers.map(function(req) { return req.resource.namespace + "#" + req.tag;}));
	   // def.dependency.requirers.forEach( //array
	   //   function (req) {
	   //     // log(D,'req=', req);
	   //     if ( req.exOrder <  def.exOrder) 
	   // 	 log(W,"Warning! Cyclic dependency: The objects imported from " + def.id +
	   // 	     " might be undefined in " + req.id); }); 
});
       //execute the callbacks
       if (!executeASAP) onExecute(executeLater);
       //by default this calls onLoaded_native, but can be reassigned in config
       onLoaded(); } 
     
     //all the callbacks gathered during the loading phase get executed now in the right order,
     //so that their dependencies are all met
     function executeLater() {
       log(I,'Executing callbacks:');
       var sortedDefs = [];
       //sort all definers according to execution order
       for (var d in definers) sortedDefs.push(definers[d]);
       sortedDefs.sort(
	 function (a, b) { return a.exOrder > b.exOrder ? 1 : -1; });
       //execute all definers' callbacks, or assign the factory directy to its namespace
       sortedDefs.forEach(
	 function (def) { 
	   if (typeof def.factory === 'function') executeCallback(def);
	   else makeNamespace(namespace, def.resource.namespace + def.tag, def.factory); }); }

     function executeCallback(dep) {
       var self = makeNamespace(namespace, dep.resource.namespace + dep.tag);
       var depobjs = []; 
       //all these dependencies should exist in the namespace, they should have been made with
       //previous calls to this function
       dep.dependencies.forEach(function (dep) {
				  var path = dep.resource.namespace + dep.tag;
				  // log(D,'path: ', path);
				  if (depobjs.push(makeNamespace(namespace, path)) === undefined) 
				    log(W,'Warning: ' + dep + ' is undefined'); });
       var ret = dep.definer.factory.apply(self, depobjs);
       if (ret) makeNamespace(namespace, dep.resource.namespace + dep.tag, ret); }
     
     //pry dependency id apart, this should use regexp
     //TODO preserve any parameter passing (?a=1&b='bla')
     //format is: (loader!)(protocol:)url(.ext)(?parameters)(#tag)(|)
     //TODO regex is: ([a-zA-Z]+!)([a-zA-Z]+:)[a-zA-Z/]+(\.[a-zA_Z])(?parameters)(#tag)(|) TOD
     function parseDependencyId(id) {
       var originalId = id;
       if (!id) log(W,"Empty dependency...");
       var blocks = false, url, loader,
       tag = "", resource, isAbs = false,
       ns, ext = "";
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
       //first slice off any extension
       var lastDot = id.lastIndexOf('.');
       var lastSlash =  id.lastIndexOf('/');
       if (lastDot>lastSlash) { 
	 ext = id.substring(lastDot);
	 id = id .substring(0, lastDot); }  
       //then slice off any pre exclamation mark string
       var splitId = id.split("!");
       if (splitId.length > 1 
	   && (splitId[0] === 'js' || splitId[0] === 'css' || splitId[0] === 'data')
	  ) { loader = splitId[0];
	      id = id.substring(id.indexOf('!') + 1);  }
       else loader = ext;
       // else {if (ext) loader = id.substring(lastDot+1);  }
       //if neither were present, default to .js for relative paths, data for absolute paths
       if (!loader)  {
	 if (!isAbs) { loader = 'bootstrap';
		       ext = '.js';  }
	 else loader = 'data';  }
       //what's left of the id now is used as the namespace for any objects returned by this resource
       //tag gets added to the namespace if a definer defined in the resource has a tag attr.
       ns = id;
       // if (namespace[namespace.length - 1] !== '/') namespace += '/';
       //Modify relative urls: 
       if (!isAbs) {
         //Create url by path substitution 
	 var firstSlash = id.indexOf('/');
	 if (firstSlash > -1) {
	   var p = paths[id.substring(0,firstSlash)];
	   if (p) id = p + id.substring(firstSlash+1); }
	 // give url a custom prefix
	 url = pathPrefix + id + ext; 
       }
       else url = id;
       
       //return a dependency
       //the dependency is the same as the resource, except when there are is more than one
       //definer in a file, multiple dependencies use the same resource then
       var resourceId = loader + "!" + url;
       var depId = resourceId + "#" + tag;
       
       if (!dependencies[depId]) { 
	 //Find or if not existant yet, create resource data structure
	 if (!resources[resourceId]) { resource = {
					 id: resourceId,
					 url: url,
					 namespace: ns,
					 isAbs: isAbs,
					 loader: loader,
					 status: 'new',
					 blocks: blocks };
				       resources[resourceId] = resource; }
	 //this resource has already requested
	 else { resource = resources[loader + "!" + url];
		resource.blocks = blocks; }
	 dependencies[depId] = { resource: resource,
				 id: depId,
				 tag: tag,
				 met: false,  
				 dependencies: [],
			         requirers: [] }; }
       return dependencies[depId]; } 
     
     //--------------------------------------events---------------------------------------------
     //default callback for execute, it just passes on the call
     function onExecute_native(f) { f.call(); }
     
     //superfluous.., just some printing out of debug data
     function onLoaded_native() {
       console.debug('definers', definers, 'dependencies', dependencies,'resources', resources); }
     
     //---------------------loaders--------------------------- 
     //not my code but useful. Might change this to proper AMD plugins.
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



