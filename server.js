var sys = require("sys"),
http = require("http"),
url = require("url"),
path = require("path"),
fs = require("fs");

var ipaddr  = process.env.OPENSHIFT_INTERNAL_IP || '127.0.0.1';
var port    = process.env.OPENSHIFT_INTERNAL_PORT || 8080;
http.createServer(
    function(request, response) 
    {
	var uri = url.parse(request.url).pathname;
	var delay = url.parse(request.url).search;
	var filename = path.join(process.cwd(), uri);
	if (delay) {
	    delay = Number(delay.slice(1));
	    console.log( "Loading " + uri + " delayed by " + delay);
	}
      if (typeof delay != "number") delay = 0; 
      fs.exists(filename, function(exists) {
    		  if(!exists) {
    		    response.writeHead(404, {"Content-Type": "text/plain"});
    		    response.write("404 Not Found\n");
    		    response.end();
    		    return;
    		  };
    		  sys.puts('Serving file ' + filename);
		  var GMTdate = fs.statSync(filename).mtime;
		  sys.put(GMTdate);
    		  fs.readFile(filename, "binary", function(err, file) {
    				if(err) {
    				  response.writeHead(500, {"Content-Type": "text/plain"});
    				  response.write(err + "\n");
    				  response.end();
    				  return;
    				}
				if (path.extname(filename)==".js")
    				  setTimeout(function() {
    					       response.writeHead(200, {"Content-Type": "application/x-javascript", 'last-modified': GMTdate});
    					       response.write(file, "binary");
    					       response.end();
					     }, delay);
				else
				  if (path.extname(filename)==".css")
    				    setTimeout(function() {
    					        response.writeHead(200, {"Content-Type": "text/css", 'last-modified': GMTdate});
    						 response.write(file, "binary");
    						 response.end();
					       }, delay);
				else {
				  // console.log("writing out" + filename);
    				  response.writeHead(200, {'last-modified':GMTdate});
    				  response.write(file, "binary");
    				  response.end();
				  
				}					
    			      });
		});
    }).listen(port,  ipaddr);


sys.puts("Server started on 9080");
