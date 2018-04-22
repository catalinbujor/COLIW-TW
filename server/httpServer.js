const http = require("http"),
    flickr = require("./coliw"),
    twitter = require("./handlers/twitter"),
    fs = require("fs");

const hostname = "127.0.0.1";
const port = 3000;
const htmlContent = fs.readFileSync("../index.html", {encoding: "utf8"});
const cssContent = fs.readFileSync("../css/topbar.css", {encoding: "utf8"});
const jsContent = fs.readFileSync("../controller.js", {encoding: "utf8"});

let FlickrStrategy = require("passport-flickr");
const passport = require("passport");
const config = require("./handlers/config.json");

passport.use(new FlickrStrategy.Strategy({
        consumerKey: config.flickr_api_key,
        consumerSecret: config.flickr_api_secret,
        callbackURL: "http://127.0.0.1/3000"
    },
    function (token, tokenSecret, profile, done) {
        User.findOrCreate({flickrId: profile.id}, function (err, user) {
            return done(err, user);
        });
    }
));
let auth = passport.authenticate('flickr');

http.createServer((request, response) => {
    if (request.url.indexOf("/flickr/callback") === 0) {
        let tokens = {};
        tokens.oauth_verifier = request.url.substring(request.url.indexOf("oauth_verifier") + 15);
        global.flickr.opts.exchange(tokens, (err, res) => {
            console.log(err);
        });
        response.writeHead(302, {
            'Location': "http://localhost:3000"
        });
        response.end();
    }
    else if (request.url.indexOf("/twitter/callback") === 0) {
        twitter.lets_verify(request.url.substring(request.url.indexOf("verifier") + 9));
        response.writeHead(302, {
            'Location': "http://localhost:3000"
        });
        response.end();
    }
    else {
        switch (request.url) {
            case "/auth/flickr":
                auth(request, response, (err) => {
                    console.error(err);
                });
                break;
            case "/css/topbar.css":
                cssHandler(request, response);
                break;
            case "/controller.js":
                jsHandler(request, response);
                break;
            default:
                htmlHandler(request, response);
        }
    }
}).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

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
