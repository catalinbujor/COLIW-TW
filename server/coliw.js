let http = require("http"),
    flickrHandler = require("./handlers/flickr"),
    twitterHandler = require("./handlers/twitter"),
    gmailHandler = require("./handlers/gmail"),
    instagramHandler = require("./handlers/instagram"),
    slideshareHandler = require("./handlers/slideshare"),
    wordpressHandler = require("./handlers/wordpress");

http.createServer(function (req, res) {
    if (req.method === "GET") {
        res.writeHead(200, {"content-type": "text"});
        res.write('Hello World!');
        res.end();
    }
    else if (req.method === "POST") {
        switch (req.url) {
            case "/flickr": {
                flickrHandler(req, res);
                break;
            }
            case "/twitter": {
                twitterHandler(req, res);
                break;
            }
            case "/instagram": {
                instagramHandler(req, res);
                break;
            }
            case "/wordpress": {
                wordpressHandler(req, res);
                break;
            }
            case "/gmail": {
                gmailHandler(req, res);
                break;
            }
            case "/slideshare": {
                slideshareHandler(req, res);
                break;
            }
            default: {
                res.writeHead(200, {"content-type": "text"});
                res.write('Invalid path.');
                res.end();
            }
        }
    }
    else {
        res.writeHead(200, {"content-type": "text"});
        res.write('Invalid verb.');
        res.end();
    }
}).listen(8000);