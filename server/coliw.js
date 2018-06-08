let http = require("http"),
    flickrHandler = require("./handlers/flickr"),
    twitterHandler = require("./handlers/twitter"),
    tumblrHandler = require("./handlers/tumblr"),
    instagramHandler=require("./handlers/instagram"),
    gmailHandler = require("./handlers/gmail"),
    slideshareHandler = require("./handlers/slideshare"),
    wordpressHandler = require("./handlers/wordpress");
    http.createServer(function (req, res) {
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    });
    req.on("end", () => {
        res.setHeader('Access-Control-Allow-Origin','http://localhost:3000');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Max-Age', "3628800");
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
        if (req.method === "OPTIONS") {
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
            let obj = {};
            try{
                obj = JSON.parse(data);
            }
            catch(e) {
                console.error(e);
            }
            switch (req.url) {
                case "/flickr/auth": {
                    flickrHandler.auth(req, res);
                    break;
                }
                case "/flickr/upload": {
                    flickrHandler.upload(req, res, obj.path);
                    break;
                }
                case "/flickr/tag": {
                    flickrHandler.tag(req, res);
                    break;
                }
                case "/twitter/auth": {
                    twitterHandler.auth(req, res);
                    break;
                }
                // TUMBLR
                case "/tumblr/auth":
                {
                    tumblrHandler.auth(req,res);
                    break;
                }
                case "/tumblr/follow":
                    {
                        tumblrHandler.follow(req,res,obj.numeUser);
                        break;
                }
                case "/tumblr/unfollow":
                {
                    tumblrHandler.unfollow(req,res,obj.numeUser);
                    break;
                }
                case "/tumblr/text":
                {
                    tumblrHandler.createPostText(req,res,obj.title,obj.body);
                    break;
                }
                case "/tumblr/photo":
                {
                    tumblrHandler.createPostPhoto(req,res,obj.photoUrl);
                    break;
                }

                case "/tumblr/delete":
                {
                    tumblrHandler.deletePost(req,res,obj.nrofPost);
                    break;
                }
                case "/twitter/tweet": {
                    twitterHandler.tweet(req, res, obj.status);
                    break;
                }
                case "/twitter/message": {
                    twitterHandler.message(req, res, obj.user, obj.text);
                    break;
                }
                case "/twitter/get": {
                    twitterHandler.get(req, res);
                    break;
                }
                case "/instagram/auth": {
                    instagramHandler.auth(req, res);
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
    });
}).listen(8000);