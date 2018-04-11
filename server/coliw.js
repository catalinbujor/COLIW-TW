let http = require("http"),
    flickrHandler = require("./handlers/flickr"),
    twitterHandler = require("./handlers/twitter"),
    gmailHandler = require("./handlers/gmail"),
    instagramHandler = require("./handlers/instagram"),
    slideshareHandler = require("./handlers/slideshare"),
    wordpressHandler = require("./handlers/wordpress");

http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Max-Age', "3628800");

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    if (req.method === "OPTIONS")
    {
        //In case of an OPTIONS, we allow the access to the origin of the petition
        let vlsOrigin = req.headers["origin"];
        res.setHeader("Access-Control-Allow-Origin", vlsOrigin);
        res.setHeader("Access-Control-Allow-Methods", "POST");
        res.setHeader("Access-Control-Allow-Headers", "accept, content-type");
        res.setHeader("Access-Control-Max-Age", "1728000");
    }
    if (req.method === "GET") {
        res.writeHead(200, {"content-type": "text"});
        res.write('Hello World!');
        res.end();
    }
    else if (req.method === "POST") {
        switch (req.url) {
            case "/flickr/auth": {
                flickrHandler.auth(req, res);
                break;
            }
            case "/flickr/upload": {
                flickrHandler.upload(req, res);
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