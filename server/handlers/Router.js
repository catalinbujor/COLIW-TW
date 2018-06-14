const flickrHandler = require("./flickr"),
    twitter = require("./twitter"),
    gmailHandler = require("./gmail"),
    instagramHandler = require("./instagram"),
    slideshareHandler = require("./slideshare"),
    wordpressHandler = require("./wordpress"),
    requestLib = require("request"),
    dbM = require("./dbModel"),
    fs = require("fs"),
    config = require("./config.json"),
    request = require("request"),
    tumblr = require("./tumblr");

global.twitter = {};
global.flickr = {};
global.tumblr = {};
global.instagram = {};

const htmlContent = fs.readFileSync("../index.html", {encoding: "utf8"});
const cssContent = fs.readFileSync("../css/topbar.css", {encoding: "utf8"});
const jsContent = fs.readFileSync("../controller.js", {encoding: "utf8"});

module.exports = function (request, response, data) {
    let logged = request.session.get("logged"),
        username = request.session.get("username");
    let apis = ["twitter", "flickr", "tumblr", "instagram"];
    apis.forEach(api => {
        let value = request.session.get(api);
        if (!global[api] || Object.keys(global[api]) === 0) {
            global[api] = value;
        }
    });
    if (logged === 1) {
        global.coliw.logged = 1;
        global.coliw.username = username;
    }
    if (request.url.indexOf("/flickr/callback") === 0) {
        let tokens = {};
        tokens.oauth_verifier = request.url.substring(request.url.indexOf("oauth_verifier") + 15);
        global.flickr.opts.exchange(tokens, (err, res) => {
            console.log(err);
        });
        if (global.coliw.logged === 1) {
            setTimeout(() => {
                let url = "http://localhost:8001/users/add_token";
                let json = {
                    "username": global.coliw.username,
                    "token": "flickr",
                    "value": global.flickr
                };
                requestLib.post({url: url, json}, () => {
                });
            }, 1500);

        }
        response.writeHead(302, {
            'Location': "http://localhost:3000"
        });
        response.end();
    }
    else if (request.url.indexOf("/twitter/callback") === 0) {
        let verifier = request.url.substring(request.url.indexOf("verifier") + 9);
        twitterVerifier(response, verifier, (good) => {
            if (good === false) {
                return;
            }
            response.writeHead(302, {
                'Location': "http://localhost:3000"
            });
            response.end();
        });
    }
    else if (request.url.indexOf("/gmail/callback") === 0) {
        let auth_token = request.url.substring(request.url.indexOf("code") + 5);
        gmailHandler.setToken(auth_token);
        response.writeHead(302, {
            'Location': "http://localhost:3000"
        });
        response.end();
    }
    else if (request.url.indexOf("/tumblr/callback") === 0) {
        tumblr.lets_verify(request.url.substring(request.url.indexOf("verifier") + 9));
        response.writeHead(302, {
            'Location': "http://localhost:3000"
        });
        response.end();
    }

    else if (request.url.indexOf("/instagram/callback") === 0) {
        // console.log(request.url.substring(request.url.indexOf("code") + 5));
        instagramHandler.lets_verify(request.url.substring(request.url.indexOf("code") + 5));
        response.writeHead(302, {
            'Location': "http://localhost:3000"
        });
        response.end();
    }
    else if (request.url === "/") {
        htmlHandler(request, response);
    }
    else if (request.url === "/css/topbar.css") {
        cssHandler(request, response);
    }
    else if (request.url === "/controller.js") {
        jsHandler(request, response);
    }
    else {
        if (request.method === "GET") {
            response.writeHead(200, {"content-type": "text"});
            if (request.url === "/coliw/checkUser") {
                let logged = request.session.get("logged"),
                    username = request.session.get("username");
                if (global.coliw.logged === 1) {
                    logged = 1;
                    username = global.coliw.username;
                }
                if (logged === 1) {
                    return loadTokens(request, username, () => response.end("@" + username));
                }
                else {
                    response.end("@guest");
                }
            }
            else {
                response.write('Bad request');
                response.end();
            }
        }
        else if (request.method === "POST") {
            let obj = {};
            data = data || "{}";
            try {
                obj = JSON.parse(data);
            }
            catch (e) {
                console.error(e);
            }
            switch (request.url) {
                case "/coliw/register": {
                    coliwRegisterRequest(obj, request, response);
                    break;
                }
                case "/coliw/login": {
                    coliwLoginRequest(obj, request, response);
                    break;
                }
                case "/flickr/auth": {
                    flickrHandler.auth(request, response);
                    break;
                }
                case "/flickr/upload": {
                    flickrHandler.upload(request, response, obj.path, obj.title, obj.tags);
                    break;
                }
                case "/flickr/tag_first": {
                    flickrHandler.tagFirst(request, response, obj.tags);
                    break;
                }
                case "/flickr/tag_last": {
                    flickrHandler.tagLast(request, response, obj.tags);
                    break;
                }
                case "/flickr/tag": {
                    flickrHandler.tag(request, response);
                    break;
                }
                case "/rss/find": {
                    rssFind(request, response, obj.url1, obj.url2, obj.tag);
                    break;
                }
                case "/twitter/auth": {
                    twitterLogin(response);
                    break;
                }
                case "/twitter/update_photo": {
                    twitter.update_photo(request, response);
                    break;
                }
                //Testing
                case "/tumblr/update": {
                    tumblr.update(request, response);
                    break;
                }
                case "/tumblr/updateInfo": {
                    tumblr.postInstaInformation(request, response);
                    break;
                }

                //Testing
                case "/twitter/tweet": {
                    twitter_tweet(response, obj.message, (err, body) => {
                        if (err === false) {
                            return;
                        }
                        response.writeHead(200, {"content-type": "application/json"});
                        body = JSON.stringify(body);
                        response.end(body);
                    });
                    break;
                }
                case "/twitter/message": {
                    twitter_message(response, obj.user, obj.text, (err, body) => {
                        if (err === false) {
                            return;
                        }
                        response.writeHead(200, {"content-type": "application/json"});
                        body = JSON.stringify(body);
                        response.end(body);
                    });
                    break;
                }
                case "/twitter/get": {
                    twitter.get(request, response);
                    break;
                }
                case "/instagram/auth": {
                    instagramHandler.auth(request, response);
                    break;
                }
                case "/insta/get": {
                    instagramHandler.getUserInformation(request, response);
                    break;
                }
                case "/insta/tag": {
                    instagramHandler.getTag(request, response, obj.tagName);
                    break;
                }
                case "/wordpress": {
                    wordpressHandler(request, response);
                    break;
                }
                case "/gmail/auth": {
                    gmailHandler.auth(request, response);
                    break;
                }
                case "/gmail/label": {
                    console.log('Aici');
                    var labelate = gmailHandler.listLabels(gmailHandler.oauth2Client, request, response);
                    labelate.then(function (fulfilled) {
                        //console.log(fulfilled);
                    });
                    break;
                }
                case "/gmail/list": {
                    console.log("aici");
                    console.log("Keyword " + obj.keyword);
                    if (obj.keyword == undefined)
                        obj.keyword = null;
                    console.log("Data " + obj.date);
                    if (obj.date == undefined) {
                        obj.date = null;
                    }
                    if (obj.labels == undefined)
                        obj.labels = null;

                    var parsate = gmailHandler.parseAllMessages(request, response, obj);
                    parsate.then(function (rezultat) {
                        console.log("gata");
                    });
                    break;
                }
                case "/slideshare": {
                    slideshareHandler(request, response);
                    break;
                }
                case "/tumblr/auth": {
                    tumblr.auth(request, response);
                    break;
                }
                case "/tumblr/follow": {
                    tumblr.follow(request, response, obj.numeUser);
                    break;
                }
                case "/tumblr/unfollow": {
                    tumblr.unfollow(request, response, obj.numeUser);
                    break;
                }
                case "/tumblr/text": {
                    tumblr.createPostText(request, response, obj.title, obj.body);
                    break;
                }
                case "/tumblr/photo": {
                    tumblr.createPostPhoto(request, response, obj.photoUrl);
                    break;
                }

                case "/tumblr/delete": {
                    tumblr.deletePost(request, response, obj.nrofPost);
                    break;
                }
                case "/tumblr/upload": {
                    tumblr.uploadFile(request, response, obj.path);
                    break;
                }
                case "/gmail/tumblr": {
                    gmailRssUp(request, response, obj);
                    break;
                }
                default: {
                    response.writeHead(200, {"content-type": "text"});
                    response.write('Invalid path.');
                    response.end();
                }
            }
        }
        else {
            response.writeHead(200, {"content-type": "text"});
            response.write('Invalid verb.');
            response.end();
        }
    }
};

function cssHandler(request, response) {
    response.writeHead(200, {"Content-Type": "text/css"});
    response.end(cssContent);
}

function jsHandler(request, response) {
    response.writeHead(200, {"Content-Type": "text/javascript"});
    response.end(jsContent);
}

function htmlHandler(request, response) {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.end(htmlContent);
}

function twitterLogin(res) {
    const form = {
            "consumer_key": config.twitter_api_key,
            "consumer_secret": config.twitter_api_secret
        },
        url = "http://localhost:8002/twitter/auth";
    requestLib.post({url: url, json: form}, function (e, r, body) {
        if (e || !body || typeof body.status === "undefined") {
            let data = JSON.stringify({
                "status": 0
            });
            res.writeHead(200, {"content-type": "application/json"});
            return res.end(data);
        }
        let data = JSON.stringify({
            "status": 1,
            "uri": body.uri
        });
        global.twitter = body.twitter;
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    });
}

function twitterVerifier(res, verifier, cb) {
    const form = {
            "app_key": config.twitter_api_key,
            "app_secret": config.twitter_api_secret,
            "oauth_token": global.twitter.oauth_token,
            "oauth_secret": global.twitter.oauth_token_secret,
            verifier
        },
        url = "http://localhost:8002/twitter/verifier";
    requestLib.post({url: url, json: form}, function (e, r, body) {
        if (e || !body || typeof body.status === "undefined") {
            let data = JSON.stringify({
                "status": 0
            });
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            return cb(false);
        }
        global.twitter = body.perm_data;
        let url = "http://localhost:8001/users/add_token";
        if (global.coliw.logged === 1) {
            let json = {
                "username": global.coliw.username,
                "token": "twitter",
                "value": global.twitter
            };
            request.post({url: url, json}, () => {
            });
        }
        cb();
    });
}

function twitter_tweet(res, message, cb) {
    const form = {
            "app_key": config.twitter_api_key,
            "app_secret": config.twitter_api_secret,
            "userInfo": global.twitter,
            message
        },
        url = "http://localhost:8002/twitter/tweet";
    requestLib.post({url: url, json: form}, function (e, r, body) {
        if (e || !body || typeof body.status === "undefined") {
            let data = JSON.stringify({
                "status": 0
            });
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            cb("done");
        }
        cb(null, body);
    });
}

function twitter_message(res, user, text, cb) {
    const form = {
            "app_key": config.twitter_api_key,
            "app_secret": config.twitter_api_secret,
            "userInfo": global.twitter,
            user,
            text
        },
        url = "http://localhost:8002/twitter/message";
    requestLib.post({url: url, json: form}, function (e, r, body) {
        if (e || !body || typeof body.status === "undefined") {
            let data = JSON.stringify({
                "status": 0
            });
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            cb("done");
        }
        cb(null, body);
    });
}

function coliwLoginRequest(obj, req, res) {
    const form = {
            "username": obj.username,
            "passId": obj.password
        },
        url = "http://localhost:8001/users/login";
    return requestLib.post({url: url, json: form}, function (e, r, body) {
        if (e || !body || typeof body.status === "undefined") {
            res.writeHead(200, {"content-type": "text"});
            res.end("An error occured! Please retry!");
            return;
        }

        let msg = null;
        if (body.status === 1) {
            return loadTokens(req, obj.username, () => {
                req.session.put("logged", 1);
                req.session.put("username", obj.username);
                global.coliw.logged = 1;
                global.coliw.username = obj.username;
                res.writeHead(200, {"content-type": "text"});
                res.end("You have successfully logged in!");
            });

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

function coliwRegisterRequest(obj, req, res) {
    const form = {
            "username": obj.username,
            "passId": obj.password
        },
        url = "http://localhost:8001/users/register";
    return requestLib.post({url: url, json: form}, function (e, r, body) {
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

function loadTokens(req, username, cb) {
    let url = "http://localhost:8001/users/get_tokens";
    let json = {
        username
    };
    requestLib.post({url: url, json}, function (e, r, body) {
        if (e || !body || typeof body.status === "undefined") {
            return cb();
        }
        Object.keys(body.tokens).forEach((token) => {
            let data = {};
            data.access = body.tokens[token];
            req.session.put(token, body.tokens[token]);
        });
        cb();
    });
}

function rssFind(request, response, url1, url2, tag) {
    let rss = require("./rss.js");
    rss.parseRSS(url1, url2, (err) => {
        if (err) {
            response.writeHead(200, {"content-type": "application/json"});
            let data = JSON.stringify({
                "status": 0
            });
            return response.end(data);
        }
        tumblr.uploadFile(request, response, "./flux.rss");
    }, tag);
}

function gmailRssUp(request, response, obj) {

    let parsate = gmailHandler.parseAllMessages(null, null, obj);
    parsate.then(function () {
        tumblr.uploadFile(request, response, './msg.rss');
    });

}

