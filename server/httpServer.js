const http = require("http"),
    config = require("./handlers/config.json"),
    Router = require("./handlers/Router"),
    NodeSession = require('node-session'),
    session = new NodeSession({secret: config.session_secret});

const hostname = "127.0.0.1";
const port = 3000;

global.coliw = {
    logged: 0
};

http.createServer((request, response) => {
    session.startSession(request, response, () => {
        let data = "";
        request.on("data", (chunk) => {
            data += chunk;
        });
        request.on("end", () => {
            Router(request, response, data);
        });
    });
}).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
