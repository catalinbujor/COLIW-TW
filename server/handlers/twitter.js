const config = require("./config");
const request = require("request");
const qs = require("querystring");

global.twitter = {
    "access": {}
};

exports.auth = function (req, res) {
    let oauth = {
            callback: "http://localhost:3000/twitter/callback",
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
    let twitterInfo = req.session.get("twitter") || {};
    let oauth =
            {
                consumer_key: config.twitter_api_key,
                consumer_secret: config.twitter_api_secret,
                token: twitterInfo.oauth_token,
                token_secret: twitterInfo.oauth_token_secret
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
};

exports.message = function (req, res, user, text) {
    let twitterInfo = req.session.get("twitter") || {};

    let oauth =
            {
                consumer_key: config.twitter_api_key,
                consumer_secret: config.twitter_api_secret,
                token: twitterInfo.oauth_token,
                token_secret: twitterInfo.oauth_token_secret
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
};

exports.get = function (req, res) {
    let oauth =
            {
                consumer_key: config.twitter_api_key,
                consumer_secret: config.twitter_api_secret,
                token: global.twitter.access.oauth_token,
                token_secret: global.twitter.access.oauth_token_secret
            },
        url = "https://api.twitter.com/1.1/direct_messages.json";

    let event = {
        "count": 3
    };

    request.get({url: url, oauth: oauth, qs: event, json: true}, function (e, r, user) {
        let resp = {
            status: 1
        };
        console.error(user);
        if ((user && user.errors) || e) {
            resp.status = 0;
            resp.errors = (e) ? e : user.errors;
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
        url = "http://localhost:8001/users/add_token";
        if (global.coliw.logged === 1) {
            let json = {
                "username": global.coliw.username,
                "token": "twitter",
                "value": perm_data
            };
            request.post({url: url, json}, () => {
            });
            console.log(perm_data);
        }
    });
};
