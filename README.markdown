
DO NOT USE IN DEVELOPMENT!!!!!
============
Still testing..
Need to add a lot more tests.


Bootstrapjs
=========

This is a resource loader similar to [requirejs], [curl],
[bdLoader] and many more. It is not compliant to the [AMD]
specification at the moment, simply because it would be less flexible, though it could be and might be made
compliant in the future.

Features:

* Automatic dependency resolution
* Circular dependency detection
* Loading of non-bootstrap js files 
* Loading of non-js files (css, html, txt etc)
* Loading of absolute urls (eg inject jQuery or underscore)
* Dependency injection into the module's callback
* Assign any resource to an injected variable, or just download it
* Any resource can be set to block downloading of subsequent dependencies
* Multiple module definitions into one file
* All modules can be assigned to a public namespace, or kept internally
* If assigned to public namespace any resource can be accessed from anywhere, so bypassing the dependency injection. Not necessarily recommended
* Modules' namespaces match their path relative to the html file that loaded them.
* Set path prefixes for common source trees
* A module can assign its public api to a variable that was passed in, or return an object with its api, or assign it to this.
* A module's factory can be a function, or any other objects such as object literals, strings, arrays, numbers
* Bootstrap can be configured by editing its source file, assigning a config to a variable before executing bootstrap, or calling bootstrap with a config after it has executed  
* Any global variables created can have customized names.
* Code is commented fairly extensively and less than 1000 lines
* If you want to know what's happening set verbose level.
* Force a resource to be downloaded either as js, css or data 

Future possible features: 
* minimal version
* production mode where all the files are concatenated in one or more
  bundles and uglified (gzipped?) tied in with a minimal bootstrap
  where the html doesn't need to change. Offering the files needed for
  download. All this using a console command from the
  browser 
* External loader plugins instead of internal
* Injecting modules conforming to amd (eg underscore)
* AMD compliance
* Better test suites
* Better integration with dom events..
* Set optional callbacks for when all resources have loaded, or for when the callbacks are about to be executed 

Example
------
  
 In file apath/myapp.js 
 
	define 
	  { tag: 'foo',	
		load: ['somelib'], 
		inject : ['apath/myapp', 'path/d1|', 'path/d2'], 
		factory: function(self, d1, d2)  { 
		//use self, d1 and d2 in this closure
		this.api = "hello";  //these three do the same thing
		self.api = "hello";
		return "hello"; //however, this one overrides the previous two
		}
	  });

Try it
-----

	git clone git@github.com:Michieljoris/bootstrapjs.git
	cd bootstrapjs
	node server.js
	
Then open up localhost:9080 in your browser. 
You will see a test page with jasmine test results.


Usage
---
Decide on the name of your global function (define by default) that will define your modules. Decide whether you want your modules accessible only through dependency injection, or also stored in a globally accessible namespace. Set up paths, and choose your 'main' module. 

These options and more are settable through a config object. This object can be modified directly by editing bootstrap.js, by defining a bootstrap object with the settings as members before bootstrap.js is loaded, or enabling a hook on the global function. In the last case bootstrap.js will not activate till this hook is called with a config object. By the way, any options not specified will be set to defaults (see top of bootstrap.js).

If you've called your global function define, calling it will define a module. What define expects is an object with the following optional members:

* tag: string to differentiate between multiple modules in a file. Without this tag a module is stored in a namespace that matches the path of the file the module is defined in. With a tag the module is assigned to the namespace as a member. That means it will become part of the api of the module defined in this file that doesn't have a tag.
No tag defaults to an empty string. If multiple modules are defined with the same tag, the last one will be the one that defines the module.  

* load: array of strings, these dependencies are loaded before any callbacks are called.

* inject: array of strings, same with these dependencies, but any resulting values will be injected into a callback

* factory: the value of the module. Can be any javascript expression. If it is a function, the values of the modules listed in the previous option will be passed in.

The format of a dependency as listed in the load and inject options is as follows:

    (loader!)(protocol:)url(.ext)(#tag)(|)

Everything betweens parens is optional. The url is the path from the directory where the html file was loaded from that loaded bootstrap.js. If the first directory (anything before the first /) is listed in paths, it will be substituted with its corresponding path. If the url does not have an extionsion (.js for example) it will be assumed to be a bootstrap file, and any objects passed in with define calls will be used to define modules. If the dependency does have an extension the following actions will be taken:

* .js: the file will be loaded and executed. But no modules will be defined. This file better not rely on any global define function, because bootstrap has laid claim to it. (That is if your global hook for bootstrap is define)

* .css the css file will be loaded

* .any  any other extension will be loaded with an xhr call and if listed in the inject array, passed into the callback

An url starting with a protocol (eg http://www.a.b/bla.txt) will be loaded according to its extension same as relative urls. However if there is no extension the file will be loaded with a xhr call, not as a bootstrap file.

If you want to force a particular loader on a url, specify it by prefixing the url with the loader name, separated from the url by a exclamation mark. The following loaders are available:

* bootstrap: any define calls will create modules

* js: load and execute the file

* css: load the css file

* data: an xhr call will be made and the resulting value can be injected

unimplemented sofar
* amd: using modules defined using the amd specs
 
Note: cors restrictions might limit the use of xhr calls. By defining a module that has as its factory the data required you can get around this. If your server cannot pad its json data this might be an option.

tag: as mentioned above, to differentiate between different modules defined in the same file

A final | will block the loading (and execution!) of any other dependencies following this dependency in the list of dependencies. Inject dependencies get loaded **after** load dependencies.




Internal workings
---
Bootstrap builds a dependency tree as more and more modules come to be known every time a new resource is loaded. A new module might rely on other unloaded modules,or a new module has no dependencies or they do but they have already been met because the modules it relies on have themselves already had their dependencies met. In the last two cases, if the module has a callback, it is called and the values of its dependencies injected. Recursively the same process is applied to any modules that rely on this module as a dependency. This process stops either when a module depends on a module that has not been loaded yet, or we arrive at the root of the dependency tree, the module that was nominated as the first to be evaluated for dependencies. 

If a file has more than one module in it, one or more of those modules might not be required by any other module in the system. They are labeled bonus, their dependencies will not be followed up, and their callbacks will not be executed. If later in the process a module gets loaded that -does- need this bonus module, the bonus module gets asynchronously injected into the system with a setTimeout, as if the module was in its own separate file, and just got loaded. This will garantuee downward movement through the dependency tree. 

As long as we flow downwards so to speak to the root, and stop when dependencies are not met, we will never execute a callback twice, and, assuming all required files can be loaded, and there are no circular dependencies, all dependencies will be met and all callbacks executed
in the right order. I think of it as a river delta, with the mouth of the river (the sea) being the root. All water can only flow one direction, but can join up with any other canal anywhere along the way. You will only pass any point once, since you can not backtrack. 
As long as water flows into every canal when the river splits up into its many canals, and splits up at every junction, all canals will have water flowing through them and all travelers everywhere will reach the sea eventually. 

To actively check for circular dependencies bootstrap builds a list of callbacks and assigns them execution order numbers. This is done by doing a simple depth-first search for the delta root, and assigning execution order numbers as we go along. This is done every time a new module is loaded. In the end every module will have a proper ranking in the execution list. If then any module requires a module with a ranking higher than itself (meaning it would be executed after itself), we've got a circular dependency. This could also be used to determine the execution order after concatenation of all the files for a production version of the development environment. An alternative way of deciding execution order would be just to record it as the dependencies get resolved. 

Examples
---
TODO

  
Default config: 
---
  
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
  
  


[requirejs]: htt 
[AMD]: http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
[curl]: https://github.com/unscriptable/curl
[bdLoader]: http://bdframework.org/bdLoad/
