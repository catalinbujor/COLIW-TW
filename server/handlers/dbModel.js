const http = require("http"),
    MongoClient = require('mongodb').MongoClient,
    async = require("async"),
    url = 'mongodb://localhost:32768',
    dbName = 'Coliw';


MongoClient.connect(url, function (err, client) {
    if (err) {
        return console.error(`Failed to connect to MONGODB Server! ${err}`);
    }
    console.log("Connected successfully to MONGODB Server!");

    const db = client.db(dbName);
    startServer(db);
});

function startServer(db) {
    const Users = db.collection("users");
    http.createServer(function (req, res) {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
        });
        req.on("error", (err) => {
            console.error(`Http request error: ${err}`)
        });
        req.on("end", () => {
            res.writeHead(200, {"content-type": "application/json"});

            if (req.method !== "POST") {
                let resp = {
                    "status": 0,
                    "error": "Invalid request!",
                    "code": 302
                };
                resp = JSON.stringify(resp);
                return res.end(resp);
            }
            let input = null;
            try {
                input = JSON.parse(data);
            }
            catch (e) {
                input = {};
            }
            RouterHandleThis(req, res, input, Users);
        });
    }).listen(8001);
}

function RouterHandleThis(req, res, input, Users) {
    const invalidParams = JSON.stringify({
        "status": 0,
        "error": "Invalid parameters",
        "code": 301
    });
    const invalidPath = JSON.stringify({
        "status": 0,
        "error": "Invalid path",
        "code": 305
    });
    switch (req.url) {
        case "/users/register":
            if (!Validator(input, req.url)) {
                return res.end(invalidParams);
            }
            return RegisterUser(res, input, Users);
        case "/users/add_token":
            if (!Validator(input, req.url)) {
                return res.end(invalidParams);
            }
            return UserAddToken(res, input, Users);
        case "/users/get_tokens":
            if (!Validator(input, req.url)) {
                return res.end(invalidParams);
            }
            return UserGetTokens(res, input, Users);
        case "/users/login":
            if (!Validator(input, req.url)) {
                return res.end(invalidParams);
            }
            return LoginUser(res, input, Users);
        default:
            res.end(invalidPath);
    }
}

function Validator(input, path) {
    if (["/users/register", "/users/login"].includes(path)) {
        return (input.hasOwnProperty("username") && input.hasOwnProperty("passId"));
    }
    else if (path === "/users/get_tokens") {
        return (input.hasOwnProperty("username"));
    }
    else if (path === "/users/add_token") {
        return (input.hasOwnProperty("username") && input.hasOwnProperty("token") && input.hasOwnProperty("value"));
    }
    return false;
}

function RegisterUser(res, input, Users) {
    const query = {"username": input.username};
    Users.findOne(query, (err, docs) => {
        if (err) {
            const dbError = JSON.stringify({
                "status": 0,
                "error": err,
                "code": 300
            });
            return res.end(dbError);
        }
        if (docs) {
            const uError = JSON.stringify({
                "status": 0,
                "error": "User already registered!",
                "code": 303
            });
            return res.end(uError);
        }
        const update = {
            "username": input.username,
            "passId": input.passId,
            "tokens": {}
        };
        Users.insertOne(update, (err, resp) => {
            if (err) {
                const rError = JSON.stringify({
                    "status": 0,
                    "error": err,
                    "code": 300
                });
                return res.end(rError);
            }
            const success = JSON.stringify({
                "status": 1,
                "message": "User registered!"
            });
            res.end(success);
        })
    });
}

function UserAddToken(res, input, Users) {
    const query = {"username": input.username};
    Users.findOne(query, (err, docs) => {
        if (err) {
            const dbError = JSON.stringify({
                "status": 0,
                "error": err,
                "code": 300
            });
            return res.end(dbError);
        }
        if (!docs) {
            const uError = JSON.stringify({
                "status": 0,
                "error": "User not found!",
                "code": 304
            });
            return res.end(uError);
        }
        docs.tokens[input.token] = input.value;
        const update = {
            "$set": docs
        };
        Users.updateOne(query, update, (err, resp) => {
            if (err) {
                const dbError = JSON.stringify({
                    "status": 0,
                    "error": err,
                    "code": 300
                });
                return res.end(dbError);
            }
            const success = JSON.stringify({
                "status": 1,
                "message": "Token updated"
            });
            return res.end(success);
        });
    });
}

function UserGetTokens(res, input, Users) {
    const query = {"username": input.username};
    Users.findOne(query, (err, docs) => {
        if (err) {
            const dbError = JSON.stringify({
                "status": 0,
                "error": err,
                "code": 300
            });
            return res.end(dbError);
        }
        if (!docs) {
            const uError = JSON.stringify({
                "status": 0,
                "error": "User not found!",
                "code": 304
            });
            return res.end(uError);
        }
        const success = JSON.stringify({
            "status": 1,
            "tokens": docs.tokens
        });
        res.end(success);
    });
}

function LoginUser(res, input, Users) {
    const query = {"username": input.username};
    Users.findOne(query, (err, docs) => {
        if (err) {
            const dbError = JSON.stringify({
                "status": 0,
                "error": err,
                "code": 300
            });
            return res.end(dbError);
        }
        if (!docs || docs.passId !== input.passId) {
            const uError = JSON.stringify({
                "status": 0,
                "error": "User not found!",
                "code": 304
            });
            return res.end(uError);
        }
        const success = JSON.stringify({
            "status": 1
        });
        res.end(success);
    });
}