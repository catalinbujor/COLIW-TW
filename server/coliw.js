let http = require("http"),
    flickrHandler = require("./handlers/flickr"),
    twitterHandler = require("./handlers/twitter"),
    gmailHandler = require("./handlers/gmail"),
    instagramHandler = require("./handlers/instagram"),
    slideshareHandler = require("./handlers/slideshare"),
    wordpressHandler = require("./handlers/wordpress"),
    request = require("request"),
    dbM = require("./handlers/dbModel"),
    tumblrHandler = require("./handlers/tumblr");
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
            try {
                obj = JSON.parse(data);
            }
            catch (e) {
                console.error(e);
            }
            switch (req.url) {
                case "/coliw/register": {
                    const form = {
                            "username": obj.username,
                            "passId": obj.password
                        },
                        url = "http://localhost:8001/users/register";
                    return request.post({url: url, json: form}, function (e, r, body) {
                        if (e || !body || typeof body.status === "undefined") {
                            res.writeHead(200, {"content-type": "text"});
                            res.end("An error occured! Please retry!");
                            return;
                        }

                        let msg = null;
                        if (body.status === 1) {
                            res.writeHead(200, {"content-type": "text"});
                            res.end("User registered successfully!");
                            return;
                        }
                        switch (body.code) {
                            case 300:
                                msg = "Internal error! Please retry later!";
                                break;
                            case 301:
                                msg = "Invalid command! Please retry!";
                                break;
                            case 303:
                                msg = "User is taken! Please try another one!";
                                break;
                            default:
                                msg = "This command is invalid!";
                                break;
                        }
                        res.writeHead(200, {"content-type": "text"});
                        res.write(msg);
                        res.end();
                    });
                }
                case "/coliw/login": {
                    const form = {
                            "username": obj.username,
                            "passId": obj.password
                        },
                        url = "http://localhost:8001/users/login";
                    return request.post({url: url, json: form}, function (e, r, body) {
                        if (e || !body || typeof body.status === "undefined") {
                            res.writeHead(200, {"content-type": "text"});
                            res.end("An error occured! Please retry!");
                            return;
                        }

                        let msg = null;
                        if (body.status === 1) {
                            loadTokens(obj.username);
                            global.coliw.logged = 1;
                            global.coliw.username = obj.username;
                            res.writeHead(200, {"content-type": "text"});
                            res.end("You have successfully logged in!");
                            return;
                        }
                        switch (body.code) {
                            case 300:
                                msg = "Internal error! Please retry later!";
                                break;
                            case 301:
                                msg = "Invalid command! Please retry!";
                                break;
                            case 304:
                                msg = "Invalid credentials!";
                                break;
                            default:
                                msg = "This command is invalid!";
                                break;
                        }
                        res.writeHead(200, {"content-type": "text"});
                        res.write(msg);
                        res.end();
                    });
                }
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
                    twitterHandler.tweet(req, res, obj.message);
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
                    var labelate = gmailHandler.listLabels(gmailHandler.oauth2Client, req, res);
                    labelate.then(function (fulfilled) {
                        //console.log(fulfilled);
                    });
                    break;
                }
                case "/slideshare": {
                    slideshareHandler(req, res);
                    break;
                }
                case "/tumblr/auth": {
                    tumblrHandler.auth(req, res);
                    break;
                }
                case "/tumblr/follow": {
                    tumblrHandler.follow(req, res, obj.numeUser);
                    break;
                }
                case "/tumblr/unfollow": {
                    tumblrHandler.unfollow(req, res, obj.numeUser);
                    break;
                }
                case "/tumblr/text": {
                    tumblrHandler.createPostText(req, res, obj.title, obj.body);
                    break;
                }
                case "/tumblr/photo": {
                    tumblrHandler.createPostPhoto(req, res, obj.photoUrl);
                    break;
                }

                case "/tumblr/delete": {
                    tumblrHandler.deletePost(req, res, obj.nrofPost);
                    break;
                }
                case "/tumblr/upload": {
                    tumblrHandler.uploadFile(req, res, obj.path);
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

function loadTokens(username) {
    let url = "http://localhost:8001/users/get_tokens";
    let json = {
        username
    };
    request.post({url: url, json}, function (e, r, body) {
        if (e || !body || typeof body.status === "undefined") {
            return;
        }
        Object.keys(body.tokens).forEach((token) => {
            global[token].access = body.tokens[token];
        });
    });
}