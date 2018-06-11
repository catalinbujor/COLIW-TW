let http = require("http"),
    flickrHandler = require("./handlers/flickr"),
    twitterHandler = require("./handlers/twitter"),
    gmailHandler = require("./handlers/gmail"),
    instagramHandler = require("./handlers/instagram"),
    slideshareHandler = require("./handlers/slideshare"),
    wordpressHandler = require("./handlers/wordpress");

http.createServer(function (req, res) {
    let data = "";
    req.on("data", (chunk) => {
        data += chunk;
    });
    req.on("end", () => {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

        // Request methods you wish to allow
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Max-Age', "3628800");

        // Request headers you wish to allow
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        res.setHeader('Access-Control-Allow-Credentials', true);
        if (req.method === "OPTIONS") {
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
            let obj = {};
            data = data || "{}";
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
                case "/gmail/auth": {
                    console.log("In coliw.js auth");
                    gmailHandler.auth(req, res);
                    console.log("Dupa coliw auth");
                    break;
                }
                case "/gmail/label": {
                    var labelate = gmailHandler.listLabels(gmailHandler.oauth2Client,req,res);
                    labelate.then(function(fulfilled){
                    });
                    break;
                }
                case "/gmail/list": {
                    console.log("Keyword "+obj.keyword);
                    if(obj.keyword == undefined)
                        obj.keyword = null;
                    console.log("Data "+obj.date);
                    if(obj.date == undefined)
                    {
                        obj.date = null;
                    }
                    if(obj.labels == undefined)
                        obj.labels=null;
                    gmailHandler.listLabels(gmailHandler.oauth2Client,null,null).then(function(){
                    var listate = gmailHandler.listMessages(gmailHandler.oauth2Client,req,res,obj.keyword,obj.labels,obj.date);//'pisica',[],'after:2018/06/07');
                        listate.then(function(fulfilled){
                        })
                    })


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