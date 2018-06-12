const config = require("./config");
const request = require("request");
const fs = require("fs");
const Flickr = require("flickrapi"),
    flickrOptions = {
        api_key: config.flickr_api_key,
        secret: config.flickr_api_secret,
        callback: "http://localhost:3000/flickr/callback",
        permissions: "write"
    };

global.flickr = {
    opts: {}
};

exports.auth = function (req, res) {
    let resp = {
        "flickr": 1
    };
    let data = JSON.stringify(resp);
    res.writeHead(200, {"content-type": "application/json"});
    Flickr.authenticate(flickrOptions, (err, res) => {
        global.flickr.client = res
    });
    setTimeout(() => {
        global.flickr.opts = flickrOptions;
    }, 3000);
    res.end(data);
};

exports.upload = function (req, res, path, tags) {
    let uploadOptions = {
        photos: [{
            title: "test",
            tags: ["aaa"],
            photo: path
        }]
    };
    res.writeHead(200, {"content-type": "application/json"});
    if (!fs.existsSync(path)) {
        let resp = {
            "status": 0,
            "error": "Invalid path!"
        };
        let data = JSON.stringify(resp);
        return res.end(data);
    }
    let flickrOpts = req.session.get("flickr");
    try {
        Flickr.upload(uploadOptions, flickrOpts, (err, result) => {
            if (err) {
                let resp = {
                    "status": 0,
                    "error": "Oops, something went wrong! Please retry or login again with the required permissions!"
                };
                let data = JSON.stringify(resp);
                return res.end(data);
            }
            let resp = {
                "status": 1
            };
            let data = JSON.stringify(resp);
            res.end(data);
        });
    }catch(e){
        let resp = {
            "status": 0,
            "error": "Oops, something went wrong! Please retry or login again with the required permissions!"
        };
        let data = JSON.stringify(resp);
        return res.end(data);
    }

};

exports.tag = function (req, res) {
    global.flickr.client.photos.getSizes({photo_id: ""}, (err, res) => {
        if (err) {
            throw err;
        }
        download(res.sizes.size[8].source, "test.jpg", () => console.log("done downloading!"));
    });

    let resp = {
        "flickr": 1
    };
    let data = JSON.stringify(resp);
    res.writeHead(200, {"content-type": "application/json"});
    res.end(data);
};

function download(uri, filename, callback){
    request.head(uri, function(err, res, body){
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}
