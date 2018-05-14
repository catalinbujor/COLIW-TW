const config = require("./config");
const request = require("request");


exports.auth = function (req, res) {
    let oauth = {
            callback: "http://localhost:3000/tumblr/callback" ,
            consumer_key: config.tumblr_api_key,
            consumer_secret: config.tumblr_api_secret
        },
        url = "https://www.tumblr.com/oauth/request_token"
    ;
    request.post({url: url, oauth: oauth}, function (e, r, body) {

        let req_data = qs.parse(body);
        let uri = "https://www.tumblr.com/oauth/authorize"
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
