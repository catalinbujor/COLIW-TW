const config = require("./config");
const Flickr = require("flickrapi"),
    flickrOptions = {
        api_key: config.flickr_api_key,
        secret: config.flickr_api_secret,
        callback: "http://localhost:3000",
        permissions: "write"
    };

global.flickr = {};

exports.auth = function (req, res) {
    let resp = {
        "flickr": 1
    };
    let data = JSON.stringify(resp);
    res.writeHead(200, {"content-type": "application/json"});
    res.write(data);
    Flickr.authenticate(flickrOptions, (err, res) => global.flickr.client = res);
    setTimeout(() => {
        global.flickr.opts = flickrOptions;
    }, 3000);
    res.end();
};

exports.upload = function (req, res, path) {
    let uploadOptions = {
        photos: [{
            title: "testare",
            tags: [
                "testare"
            ],
            photo: path
        }]
    };

    Flickr.upload(uploadOptions, global.flickr.opts, (err, res) => {
        console.log(err, res);
    });

    let resp = {
        "flickr": 1
    };
    let data = JSON.stringify(resp);
    res.writeHead(200, {"content-type": "application/json"});
    res.end(data);
};


