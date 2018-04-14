const http = require("http"),
    flickr = require("./coliw"),
    twitter = require("./handlers/twitter"),
    fs = require("fs");

const hostname = "127.0.0.1";
const port = 3000;
const htmlContent = fs.readFileSync("../index.html", {encoding: "utf8"});
const cssContent = fs.readFileSync("../css/topbar.css", {encoding: "utf8"});
const jsContent = fs.readFileSync("../controller.js", {encoding: "utf8"});

http.createServer((request, response) => {
    switch (request.url) {
        case "/css/topbar.css":
            cssHandler(request, response);
            break;
        case "/controller.js":
            jsHandler(request, response);
            break;
        default:
            if (request.url.indexOf("oauth_verifier") > -1 && request.url.indexOf("oauth_token") > -1) {
                let verifier = request.url.substring(request.url.indexOf("verifier") + 9);
                if (verifier.length !== 16) {
                    twitter.lets_verify(request.url.substring(request.url.indexOf("verifier") + 9));
                }
                else {
                    let tokens = {};
                    tokens.oauth_verifier = request.url.substring(request.url.indexOf("oauth_verifier") + 15);
                    global.flickr.opts.exchange(tokens, (err, res) => {
                        console.log(err);
                    });
                }
            }

            htmlHandler(request, response);
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
