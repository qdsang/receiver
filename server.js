var http = require('http');
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
var _exists = fs.existsSync || path.existsSync;
var mkdirp = require('mkdirp');
var PORT = parseInt(process.argv[2]) || 8999;

var JSFtp = require("jsftp"), ftp_config = {};
JSFtp = require('jsftp-mkdirp')(JSFtp);

/*
.ftppass 文件

{
  host: "myserver.com",
  port: 3331, // defaults to 21
  user: "user", // defaults to "anonymous"
  pass: "1234" // defaults to "@anonymous"
}

*/

var ftpPassPath = "./.ftppass";

if(_exists(ftpPassPath)){
    var ftp_content = fs.readFileSync(ftpPassPath);
    ftp_config = (new Function('return ' + ftp_content))();
    console.log('ftp load ' + JSON.stringify(ftp_config));
/*
    var to = 'test/test.js';
    fs.readFile('./server.js', function (err, data) {
        var buffer = new Buffer(data, "binary");
        ftp_client.mkdirp(path.dirname(to), function (err) {
            console.log(err);
            ftp_client.put(buffer, to, function(err) {
                if (err) {
                    console.log(err);
                } else {
                }
            });

        });
    });
*/
}



var server = http.createServer(function (req, res) {
    
    function error(err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end(err.toString()); //fail
        console.log('error: ' + err.toString());
    }

    function next(from, to) {
        fs.readFile(from, function (err, content) {
            if (err) {
                error(err);
            } else {
                fs.writeFile(to, content, function (err) {
                    if (err) {
                        error(err);
                    }
                    res.writeHead(200, {'Content-Type': 'text/plain'});
                    res.end('0'); //success
                });
            }
        });
    }

    console.log(req.url);

    if (req.url == '/') {
        // show a file upload form
        res.writeHead(200, {'content-type': 'text/html'});
        res.end('I\'m ready for that, you know.');
    } else if (req.url == '/receiver' && req.method.toLowerCase() == 'post') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                error(err);
            } else {
                var to = fields['to'];
                fs.exists(to, function (exists) {
                    if (exists) {
                        fs.unlink(to, function (err) {
                            next(files.file.path, to); 
                        });
                    } else {
                        fs.exists(path.dirname(to), function (exists) {
                            if (exists) {
                                next(files.file.path, to); 
                            } else {
                                mkdirp(path.dirname(to), 0777, function (err) {
                                    if (err) {
                                        error(err);
                                        return;
                                    }
                                    next(files.file.path, to); 
                                });
                            }
                        });
                    }
                });
            }
        });
    } else if (req.url == '/receiver/ftp' && req.method.toLowerCase() == 'post') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) {
                error(err);
            } else {
                var to = fields['to'];

                fs.readFile(files.file.path, function (err, data) {
                    if (err) {
                        console.log('error file: ' + to);
                        //error(err);
                        res.writeHead(200, {'Content-Type': 'text/plain'});
                        res.end('0'); //success
                    } else {
                        var buffer = new Buffer(data, "binary");
                        try{
                            var ftp_client = new JSFtp(ftp_config);
                            ftp_client.mkdirp(path.dirname(to), function (err) {
                                if (err) {
                                    error(err);
                                }
                                console.log(to);
                                ftp_client.put(buffer, to, function(err) {
                                    if (err) {
                                        error(err);
                                    } else {
                                        res.writeHead(200, {'Content-Type': 'text/plain'});
                                        res.end('0'); //success
                                    }

                                    ftp_client.raw.quit();
                                });

                            });
                        }catch(ex){
                            console.log('ex');
                        }
                    }
                });
            }
        });
    }

});

server.listen(PORT, function () {
    console.log('receiver listening *:' + PORT);
});


process.on('uncaughtException', function (err) {
    console.log("Node NOT Exiting...");
    console.error(err.stack);
});