//misc logging functions
function log() {
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

var timestamp = (function () {
		     var bootstart = new Date();
		     return function () {
			 if (arguments.length>0) {
			     var args = Array.prototype.slice.call(arguments);
			     if (args.length>1) {
				 console.log(new Date() - bootstart + ":");
				 // args=args.slice(1);
				 args.forEach(function(a) {console.log("  " + a);});
			     }
			     else console.log(new Date() - bootstart + ":" + args[0]);
			 }
			 return new Date() - bootstart; 
		     };
		 })();


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

//-----------------shims 
//testing for array
var isArray = function (value) {
    return Object.prototype.toString.call(value) === "[object Array]";
    // return value &&
    //     typeof value === 'object' &&
    //     typeof value.length === 'number' &&
    //     typeof value.splice === 'function' &&
    //     !(value.propertyIsEnumerable('length'));
};
