"use strict";
function timestamp() {
    if (arguments.length>0) console.log(new Date() - bootstart  + ": " + arguments[0]);
   return new Date() - bootstart; 
}
var bootstart = new Date();
// TODO
// asynchronous with resources, load files at the same time, not one after the other 
// concat and minify
// you can use objects to check if it is already there, not files
// examine dom for inserted src scripts, novel idea!! iso using stack[] 

//packages
//factories/resource loading/text,html loading
//parallel loading
//async defer script injection
//exe time versus load time
//cdn non amd loading
//script order, which is callbacking?
//production/development mode
//simulate script loading lag...


// cyclic dependancies!! Possible, but module that requires module that directly or indirectly requires the first module cannot use any public api of the first module while in its initial invocation, it has to export its own api first. When the first module executes it to exports its api, more trouble... You just get potential errors...
// commonjs/requirejs format
// use import statement? As an option perhaps import vars into definer that refer to members of the import
// multiple instances, yes, with globalHook='bootstrap' then do bootstrap.config({ app: 'app', kickoff:true});
     
    //The browser loads files asyncronously, but doesn't execute them till this script finishes. 
    //Javascript is single threaded. We use the definer that bootstrap passes in not only to eventually run
    //it and give the app functionality, but also to store info we would like to pass it at that time
    //such as a reference to a public object to attach its public methods to and references to objects it 
    //would like references to (we load them if they don't exist yet), Also its execution order (rank) is 
    //stored as an member of this function. So our objects we need for our app are initially just
//functions stored on a stack, given to us by the bootstrap() in every script. We have to wait
    //till we have the whole dependency tree before we can execute any of them. CallbackRank is where we are
    //going to insert this new script in the execution order ladder. It is the rank of the function that needs
    //it, so that it will always execute before its parent function. This is all we need to do so that
    //the execution order is right, as long as there are no cyclic dependencies. We will check for those 
    //and warn about them. 
    //The first script as set in the config is the only script we know about
    //so far so it will be the only one in the stack and have a ranking of 0, meaning it will execute first.
    //This ranking will change if there are dependencies of course, as we will be inserting other 
    //functions in its place, moving the other functions down the ranking.

//Bootstrap
(function() 
 {   bootstrap.VERSION = '0.2';
     bootstrap.DATE = '11/9/12';
     var default_config = {
	 //-----globalHook
	 //name of the global function that modularizes a file by defining other files to load and taking a callback that
	 //defines the functionality of the module.
	 globalHook : 'module',
	 
	 //-----app     
	 //First javascript file to load. This filename gets prefixed with loadpathPrefix
	 app: 'myapp',
	 
	 //---kickoff
	 //if true the script defined by app gets loaded straight after this script has 
	 //finished runnning, in any case, the globalHook will have a memberfunction called kickoff you can call to start
	 //the process.
	 kickoff : true,
	 
	 //------global
	 // The base object  
	 //the globalHook also becomes a member of this object
	 global : window,
	 
	 //-----loadpathPrefix
	 //load all files relative to this path
	 loadpathPrefix : "javascript/",
	 
	 //-----namespace
	 //All objects created by the callbacks are added to the object 
	 //global.namespace.pathToDefinitionFileFromLoadpathPrefix. 
	 // So for instance if a module is defined in javascript/dir1/dir2/module1.js 
	 // (relative to the html file that loaded bootstrap.js, this file)
	 //,assuming global:window and namespace:com.phaedo and loadpathPrefix:javascript
	 // then the object created will be:
	 //window.com.phaedo.dir1.dir2.module1
	 namespace : 'app',

	 //-----head or body
	 scriptInsertionLocation : 'head',
	 
	 //-----timeOut 
	 //in seconds, for script loading, defaults to 10
	 timeOut : 10, //not implemented
	 
	 //----verbose
	 verbose : true,
	 
	 //-----allDone 
	 // Gets called when all files are loaded and all callbacks executed
	 allDone : allDone 

     };
     
     var
     global, namespace, loadpathPrefix, bootstrapfilename, scriptInsertionLocation, 
     globalHook, kickoffnow, timeOut, verbose, 
     insertionLocation, url, stack, parent, stackPosition, callback, deps, l;
     
     
    function init(config) {
	if (!config) config = default_config;
	
	global= config.global || default_config.global,
	namespace = config.namespace || default_config.namespace,
	loadpathPrefix = config.loadpathPrefix || default_config.loadpathPrefix,
	bootstrapfilename = config.app || default_config.app,
	scriptInsertionLocation = config.scriptInsertionLocation || default_config.scriptInsertionLocation,
	globalHook = config.globalHook || default_config.globalHook,
	timeOut = config.timeOut || default_config.timeOut,
	allDone = config.allDone || default_config.allDone,
	verbose = config.verbose == undefined ? default_config.verbose : config.verbose, 
	kickoffnow = config.kickoff == undefined ? default_config.kickoff : config.kickoff;
	insertionLocation = document.getElementsByTagName(scriptInsertionLocation === 'head' ? 'head': 'body')[0],
	url = bootstrapfilename,
	stack = [],
	parent = undefined,
	stackPosition = [], 
	callback = undefined,
	deps = [],
	l = verbose ? log : function() {};
	
	if (global[globalHook]) l("Warning: globalHook '" + globalHook + "' already exists");

	global[globalHook]= bootstrap;
	
	if (kickoffnow && bootstrapfilename) {
	    timestamp("Loading first javascript file: " + bootstrapfilename + ".js");
	    kickoff();
	}
	else l("Finished the bootstrap script, start loading the scripts with " + 
	       globalHook + ".kickoff()");
    };
    
    //-----------------shims 
    // array.forEach
    if (!Array.prototype.forEach) {
	Array.prototype.forEach = function(fun /*, thisp*/) 
	{
	    var len = this.length;
	    if (typeof fun != "function") {
		throw new TypeError();
	    }

	    var thisp = arguments[1];
	    for (var i = 0; i < len; i++) {
		if (i in this) {
		    fun.call(thisp, this[i], i, this);
		}
	    }
	};
    }
    //array.map   
    if (!Array.prototype.map) {
	Array.prototype.map = function(fun /*, thisp*/) {
	    var len = this.length;
	    if (typeof fun != "function") {
		throw new TypeError();
	    }

	    var res = new Array(len);
	    var thisp = arguments[1];
	    for (var i = 0; i < len; i++) {
		if (i in this) {
		    res[i] = fun.call(thisp, this[i], i, this);
		}
	    }

	    return res;
	};
    }

    //----------------helper functions
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
			ns[parts[i]] = {};
		    }
		    ns = ns[parts[i]];
		}
	    }
	};
	// return value;
	return ns;
    }
     
     function allDone() {
	l("file\trequiredby\tranking"); 
	for (var e in stack) {
	    var parenturl = stack[e].parent && stack[e].parent.url;
	    l(stack[e].url+ '\t'+ parenturl+ '\t'+ stack[e].rank);
	}
    }
     
     function dirifyPath(path) {
    	 if (path) path = path.replace(/\./g, '/');
    	 return path; //.replace(/-/g, '/');
     }
     
     function kickoff() {
	 loadScript(url);
     }
     
     //This inserts a script element into the dom, which causes an async load of the file
     function loadScript(path) {
	 l(timestamp() + ': inserting script tag for: '+ path);
	 function makeScriptElement(path) {
	     var script_element = document.createElement('script');
	     // script_element.type = 'text/javascript';
	     script_element.src = loadpathPrefix + path;
	     script_element.onloadDone = false;
	     return script_element;
	 }
	 if (path) {
	     var script_element = makeScriptElement(path + ".js");
	     script_element.onload = function() {
		 script_element.onloadDone=true;
		 scriptLoaded(path);
	     };
	     // IE 6 & 7
	     script_element.onreadystatechange = function() {
		 if (script_element.readyState == 'loaded' && !script_element.onloadDone) {
		     script_element.onloadDone = true;
		     scriptLoaded(path);
		 }
	     };
	     insertionLocation.appendChild(script_element);

	 }
	 else log("Cannot load empty path. Have you defined app?");
    }

    //called after script is loaded and executed
    function scriptLoaded(script) {
	l(timestamp() + ": finished loading and running script: " + script);
	// resolveDeps(definer);
	// if (noload) load(); 
    }

     //------------------main functions   
     //The whole logic is in 3 function: bootstrap, resolveDeps and execute
     
     //the only global to leak out of this closure, under a name set in the configuration 
     function bootstrap() {
	 timestamp("Executing bootstrap"  );
	 var definer = {
	     callback: arguments[1] || arguments[0],
	     url: url,
	     parent: parent,
	     deps:   arguments[1] && arguments[0],
	     depsCounter: 0,
	     rank: function() {
		 var parentRank = parent && parent.rank;
		 stack.forEach(function(el) {
				   if (el.rank >= parentRank) {
				       el.rank += 1;
				   }
			       });
		 return parentRank || 0;
	     } ()
	 };
	 stack.push(definer);
	 stackPosition[url] = stack.length - 1;
	 resolveDeps(definer);
     }
     

     function resolveDeps(definer) {
	 if (definer.deps instanceof Array && definer.depsCounter < definer.deps.length) {
	     while (definer.depsCounter < definer.deps.length) {
		 var dep = definer.deps[definer.depsCounter];
		 var depDefiner = stack[stackPosition[dep]];
		 definer.depsCounter += 1;
		 if (depDefiner) {
		     if (depDefiner.rank > definer.rank) {
			 console.log("ERROR: cyclic dependency. ");
			 console.log(url + " cyclically depends on " + depDefiner.url);
		     }
		 }
		 else {
		     url = dep;
		     parent = definer;
		     // callback = undefined;
		     // deps = [];
		     loadScript(url);
		     return;
		 }
	     }
	 }
	if (definer.parent) {
	    resolveDeps(definer.parent);
	    return;
	}
	execute();
	allDone();
    }

    function execute() {
	var namespaceObject = getNamespaceObject(global, dirifyPath(namespace));
	stack.sort(function(a, b) {
		       return a.rank - b.rank;
		   });
	stack.forEach(function(def)
		      {
			  if (typeof def.callback === 'function') {
			      var self = getNamespaceObject(namespaceObject, def.url);
			      def.deps = def.deps || [];
			      // console.log(def.deps);
			      var depobjs = []; 
			      def.deps.forEach(function (d) {
						 depobjs.push(getNamespaceObject(namespaceObject, d));
					     });
			      console.log(depobjs);
			      var ret = def.callback.apply(self, depobjs);
			      if (ret) getNamespaceObject(namespaceObject, def.url, ret);
			  }
		      });
    }

    //executing code:
    init();
     
     bootstrap.kickoff = kickoff;
     bootstrap.config = init;
     bootstrap.default_config = default_config;
})();


