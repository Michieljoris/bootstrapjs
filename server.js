var sys = require("sys"),
http = require("http"),
url = require("url"),
path = require("path"),
fs = require("fs");

http.createServer(
    function(request, response) 
    {
	var uri = url.parse(request.url).pathname;
	var delay = url.parse(request.url).search;
	// console.log("uri="+uri);
	var filename = path.join(process.cwd(), uri);
	if (delay) {
	    delay = Number(delay.slice(1));
	    console.log( "Loading " + uri + " delayed by " + delay);
	}
	if (typeof delay != "number") delay = 0; 
	// console.log("filename="+filename); 
	fs.exists(filename, function(exists) {
    			if(!exists) {
    			    response.writeHead(404, {"Content-Type": "text/plain"});
    			    response.write("404 Not Found\n");
    			    response.end();
    			    return;
    			}
    			
    			fs.readFile(filename, "binary", function(err, file) {
    					if(err) {
    					    response.writeHead(500, {"Content-Type": "text/plain"});
    					    response.write(err + "\n");
    					    response.end();
    					    return;
    					}
					if (path.extname(filename)==".js")
    						setTimeout(function() {
    							       response.writeHead(200, {"Content-Type": "application/x-javascript"});
    							       response.write(file, "binary");
    							       response.end();
							   }, delay);
					else {
					    // console.log("writing out" + filename);
    					    response.writeHead(200);
    					    response.write(file, "binary");
    					    response.end();
					    
					}					
    				    });
		    });
    }).listen(9080);


sys.puts("Server started on 9080");
