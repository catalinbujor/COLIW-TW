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

global.flickr = {};

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
