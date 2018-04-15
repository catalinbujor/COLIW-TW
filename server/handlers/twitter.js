const config = require("./config");
const request = require("request");
let qs = require("querystring");

global.twitter = {};

exports.auth = function (req, res) {
    let oauth = {
            callback: "http://localhost:3000",
            consumer_key: config.twitter_api_key,
            consumer_secret: config.twitter_api_secret
        },
        url = "https://api.twitter.com/oauth/request_token"
    ;
    request.post({url: url, oauth: oauth}, function (e, r, body) {

        let req_data = qs.parse(body);
        let uri = "https://api.twitter.com/oauth/authenticate"
            + "?" + qs.stringify({oauth_token: req_data.oauth_token});
        console.log(req_data);
        console.log(uri);
        global.twitter = req_data || {};
        let data = JSON.stringify({
            "uri": uri
        });
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    });
};

exports.tweet = function (req, res, status) {
    let oauth =
            {
                consumer_key: config.twitter_api_key,
                consumer_secret: config.twitter_api_secret,
                token: global.twitter.access.oauth_token,
                token_secret: global.twitter.access.oauth_token_secret
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
        if (typeof user.errors !== "undefined") {
            resp.status = 0;
            resp.errors = user.errors;
        }
        let data = JSON.stringify(resp);

        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    })
};

exports.message = function (req, res, user, text) {
    let oauth =
            {
                consumer_key: config.twitter_api_key,
                consumer_secret: config.twitter_api_secret,
                token: global.twitter.access.oauth_token,
                token_secret: global.twitter.access.oauth_token_secret
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
        if (typeof user.errors !== "undefined") {
            resp.status = 0;
            resp.errors = user.errors;
        }
        let data = JSON.stringify(resp);

        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    })
};

exports.lets_verify = function (verifier) {
    let oauth = {
            consumer_key: config.twitter_api_key,
            consumer_secret: config.twitter_api_secret,
            token: global.twitter.oauth_token,
            token_secret: global.twitter.oauth_token_secret,
            verifier: verifier
        },
        url = "https://api.twitter.com/oauth/access_token";

    request.post({url: url, oauth: oauth}, function (e, r, body) {
        let qs = require("querystring");
        let perm_data = qs.parse(body);
        global.twitter.access = perm_data || {};
        console.log(perm_data);
    });
};
