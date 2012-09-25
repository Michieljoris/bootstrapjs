
DO NOT USE, IN DEVELOPMENT!!!!!
============


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
* Loading of non js files (css, xhr)
* Loading of absolute urls
* Dependency injection into the module's callback
* Assign any resource to an injected variable, or just download it
* Any resource can be set to block any subsequent dependencies
* Multiple module definitions into one file
* All modules can be assigned to a public namespace, or kept
  internally
* If assigned to public namespace any resource can be accessed from
  anywhere, so bypassing the dependency injection. Not necessarily recommended
* Modules' namespaces match their path relative to the html file that
  loaded them.
* Set path prefixes for common source trees
* A module can assign its public api to a variable that
  was passed in, or return an object with its api, or assign it to this.
* A module's factory can be a function, or any other objects such as object
  literals, strings, arrays, numbers
* Bootstrap can be configured by editing its source file, assigning a
  config to a variable before executing bootstrap, or
  calling bootstrap with a config after it has executed  
* Any global variables created can have customized names.
* Code is commented fairly extensively and is only 700 lines with
  comments, 7k minified
* If you want to know what's happening set verbose level.
* Set optional callbacks for when all resources have loaded, or for
  when the callbacks are about to be executed 
* Force a resource to be downloaded either as js, css or data  
  
Example
------
  
 In file apath/myapp.js 
 
	define //this could be set module, or make or anything you want
	  {
		tag: 'foo',	//if more than one define in a file use the tag
		load: ['somelib'], //these files are not injected
		inject : ['apath/myapp', 'doodads/d1|', 'doodads/d2'], //these are
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
	cd bootstrap
	node server.js
	
Then open up localhost:9080 in your browser. 
You will see a test page with jasmine test results.



	  
Reference
====

  
Default config: 
----- 
  
  
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
  
  
  


[requirejs]: http://daringfireball.net/
[AMD]: http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
[curl]: https://github.com/unscriptable/curl
[bdLoader]: http://bdframework.org/bdLoad/
