"use strict";

function l() {
    for (var i=0; i< arguments.length; i++) {
	var arg= arguments[i];
	// if (typeof  arg == "string") console.log(arg);
	// else if (typeof arg == 'object') for (j in arg) console.log(j + "=" + arg[j]);
	// else
	    console.log(arg);
    }
}

function pp() {
    for (var i=0; i< arguments.length; i++) {
	var arg= arguments[i];
	if (typeof  arg == "string") {console.log(arg);} 
	else if (typeof arg == 'object') for (j in arg) console.log(" " + j + ":" + arg[j]);
	else console.log(arg);
    }
}

function printObject(o) {
  var out = '';
  for (var p in o) {
    out += p + ': ' + o[p] + '\n';
  }
  l(out);
}
// printObject(document);
(function() {

  l("in bootstrap now");
  var VERSION = '0.1';
  var DATE = '11/10/11';
  //configuration******************************
  var namespaceRootObject = window,
  namespacePrefix = 'com.phaedo',
  global = window,
  timeOut = 10,
  //in seconds, for script loading
  initialScriptFullName = 'myapp',
  //if object full name doesn't start with a protocol such as http
  //it gets prefixed with a relative path. The browser will load for instance com.phaedo.myapp
  //from ./com/phaedo/myapp . The ./ dir is the dir where the html file is located that 
  //loads this script.
  relativePathRoot = '',
  //head or body
  scriptInsertionLocation = 'head',
  globalLoadFunctionName = 'load',
  provideGlobalImportFunction = false,
  globalImportFunctionName = 'require';
  //end configuration**************************
  var insertionLocation = document.getElementsByTagName(scriptInsertionLocation === 'head' ? 'head': 'body')[0],
  url = relativePathRoot + initialScriptFullName,
  namespaceObject,
  stack = [],
  parent,
  stackPosition = [],
  callback,
  deps = [];
  //shims **********************************
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

  //helper functions************************************
  function getNamespaceObject(ns, path) {
    var parts = path.split('/');
    for (var i = 0; i < parts.length; i++) {
      if (ns[parts[i]] === undefined) {
        ns[parts[i]] = {};
        break;
      }
      ns = ns[parts[i]];
    }
    return ns;
  }

  function normalizePath(path) {
    path = path.replace(/\./g, '/');
    return path.replace(/-/g, '/');
  }

  namespacePrefix = normalizePath(namespacePrefix);
  namespaceObject = getNamespaceObject(namespaceRootObject, namespacePrefix);

  function loadScript(path) {
    l('loading :', path);
    function makeScriptElement(path) {
      var script_element = document.createElement('script');
      script_element.type = 'text/javascript';
      script_element.src = path;
      return script_element;
    }
    var script_element = makeScriptElement(path + ".js");
    // instead of these callbacks, maybe pass an end() function to the the object definition
    // and require it to be called at the end of the file or function block??? It reduces dependency 
    // on the browser and it enables multiple loads per file perhaps. It is more error prone though. It
    // is easy to forget to insert, or to call before exiting the function. I think you
    // would get the package system then. One package per file. 
    // most browsers
    script_element.onload = function() {
      scriptLoaded();
    };
    // IE 6 & 7
    script_element.onreadystatechange = function() {
      if (this.readyState == 'complete') {
        scriptLoaded();
      }
    };
    insertionLocation.appendChild(script_element);

  }

  //main functions************************
  function load() {
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
   }

  //called after script is loaded and executed
  function scriptLoaded() {
    l("Finished loading and running script: " + url);
    resolveDeps(definer);
  }

  function resolveDeps(definer) {
    if (definer.deps instanceof Array && definer.depsCounter < definer.deps.length) {
      while (definer.depsCounter < definer.deps.length) {
        var dep = definer.deps[definer.depsCounter];
        dep = normalizePath(dep);
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
          callback = undefined;
          deps = [];
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
    scriptsReady();
  }

  function execute() {
    stack.sort(function(a, b) {
      return a.rank - b.rank;
    });
    stack.forEach(function(d) {
      if (typeof d.callback === 'function') {
        var self = getNamespaceObject(namespaceObject, d.url);
        d.deps = d.deps || [];
        // bind(getNamespaceObject, namespaceObject);

        // var deps = d.deps.map(getNamespaceObject);
        d.callback(self, deps);
      }
    });
  }

  function scriptsReady() {
    for (var e in stack) {
      var parenturl = stack[e].parent && stack[e].parent.url;
      l(stack[e].url, ' ', parenturl, ' ', stack[e].rank);
    }
  }

  l('finished the bootscript, now calling load with the startscriptname to load it into the dom');
  if (!global[globalLoadFunctionName]) {
    global.load = load;
    url = normalizePath(url);
    loadScript(url);
  }
  else {
    console.log(globalLoadFunctionName, ' as a global variable already exists. Stopping script.');
  }
  //The loadscript loads the script into the dom, we would love to give it some parameters, such as
  //the name of the script, so that when it runs it knows about it self. Instead we set a variable 
  //scriptBeingLoadFullName so that when the loaded script call the load() function in this closure the load()
  //function knows who called it. It's like passing a parameter but in a roundabout way..
  //Also the browser loads this file asyncronously, but doesn't execute it till this script finishes. 
  //Javascript is single threaded. We use the definer that load passes in not only to eventually run
  //it and give the app functionality, but also to store info we would like to pass it at that time
  //such as a reference to a public object to attach its public methods to and references to objects it 
  //would like references to (we load them if they don't exist yet), Also its execution order (rank) is 
  //stored as an member of this function. So our objects we need for our app are initially just
  //functions stored on a stack, given to us by the load() in every script. We have to wait
  //till we have the whole dependency tree before we can execute any of them. CallbackRank is where we are
  //going to insert this new script in the execution order ladder. It is the rank of the function that needs
  //it, so that it will always execute before its parent function. This is all we need to do so that
  //the execution order is right, as long as there are no cyclic dependencies. We will check for those 
  //and warn about them. 
  //The first script is the only script we know about
  //so far so it will be the only one in the stack and have a ranking of 0, meaning it will execute first.
  //This ranking will change if there are dependencies of course, as we will be inserting other 
  //function in its place, more the other function down the ranking.
})();

