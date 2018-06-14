const config = require("./config");
const request = require("request");
const qs = require("querystring");
const http = require("http");
const fs = require("fs");

const hostname = "127.0.0.1",
    port = 8002;
// TWITTER MICROSERVICE

http.createServer((request, response) => {
    let data = "";
    request.on("data", (chunk) => {
        data += chunk;
    });
    request.on("end", () => {
        Router(request, response, data);
    });
}).listen(port, hostname, () => {
    console.log(`TWITTER MICROSERVICE running at http://${hostname}:${port}/`);
});

function Router(request, response, data) {
    if (request.method !== "POST") {
        response.writeHead(200, {"content-type": "text"});
        response.end("Invalid verb!");
    }
    let obj = {};
    data = data || "{}";
    try {
        obj = JSON.parse(data);
    }
    catch (e) {
    }
    switch (request.url) {
        case "/twitter/auth":
            auth(response, obj.consumer_key, obj.consumer_secret);
            break;
        case "/twitter/verifier":
            lets_verify(response, obj.app_key, obj.app_secret, obj.oauth_token, obj.oauth_secret, obj.verifier);
            break;
        case "/twitter/tweet":
            tweet(response, obj.app_key, obj.app_secret, obj.userInfo, obj.message);
            break;
        case "/twitter/message":
            message(response, obj.app_key, obj.app_secret, obj.userInfo, obj.user, obj.text);
            break;
        default:
            response.writeHead(200, {"content-type": "application/json"});
            response.end({
                "status": 0,
                "error": "Invalid path"
            });
    }
}


function auth(res, app_key, app_secret) {
    let oauth = {
            callback: "http://localhost:3000/twitter/callback",
            consumer_key: app_key,
            consumer_secret: app_secret
        },
        url = "https://api.twitter.com/oauth/request_token";
    request.post({url: url, oauth: oauth}, function (e, r, body) {

        let req_data = qs.parse(body);
        let uri = "https://api.twitter.com/oauth/authenticate"
            + "?" + qs.stringify({oauth_token: req_data.oauth_token});
        console.log(req_data);
        console.log(uri);
        //global.twitter = req_data || {};
        let data = JSON.stringify({
            "status": 1,
            "uri": uri,
            "twitter": req_data
        });
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    });
}

function tweet(res, app_key, app_secret, userInfo, status) {
    let oauth =
            {
                consumer_key: app_key,
                consumer_secret: app_secret,
                token: userInfo.oauth_token,
                token_secret: userInfo.oauth_token_secret
            },
        url = "https://api.twitter.com/1.1/statuses/update.json";

    let body = {
        status: status
    };

    request.post({url: url, oauth: oauth, qs: body, json: true}, function (e, r, user) {
        let resp = {
            status: 1,
            title: status
        };
        if ((user && user.errors) || e) {
            resp.status = 0;
            resp.errors = (e) ? e : user.errors;
        }

        let data = JSON.stringify(resp);

        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    })
}

function message(res, app_key, app_secret, userInfo, user, text) {
    let oauth =
            {
                consumer_key: app_key,
                consumer_secret: app_secret,
                token: userInfo.oauth_token,
                token_secret: userInfo.oauth_token_secret
            },
        url = "https://api.twitter.com/1.1/direct_messages/new.json";

    let event = {
        "screen_name": user,
        "text": text
    };

    request.post({url: url, oauth: oauth, qs: event, json: true}, function (e, r, user) {
        let resp = {
            status: 1
        };
        if ((user && user.errors) || e) {
            resp.status = 0;
            resp.errors = (e) ? e : user.errors;
        }
        let data = JSON.stringify(resp);

        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    })
}

function lets_verify(res, app_key, app_secret, oauth_token, oauth_secret, verifier) {
    let oauth = {
            consumer_key: app_key,
            consumer_secret: app_secret,
            token: oauth_token,
            token_secret: oauth_secret,
            verifier
        },
        url = "https://api.twitter.com/oauth/access_token";

    request.post({url: url, oauth: oauth}, function (e, r, body) {
        if (e) {
            let data = JSON.stringify({
                "error": true
            });
            res.writeHead(200, {"content-type": "application/json"});
            return res.end(data);
        }
        let qs = require("querystring");
        let perm_data = qs.parse(body);
        let data = JSON.stringify({
            perm_data,
            "status": 1
        });
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    });
}
