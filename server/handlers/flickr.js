const config = require("./config");
const request = require("request");
const fs = require("fs");
const async = require("async");
const tumblr = require("./tumblr");
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
        "flickr_success": 1
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

exports.upload = function (req, res, path, title, tags) {
    title = title || "coliw title";
    tags = tags || ["coliw default tag"];
    let uploadOptions = {
        photos: [{
            title: title,
            tags: tags,
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
    let flickrInfo = global.flickr;
    try {
        Flickr.upload(uploadOptions, flickrInfo.opts, (err, result) => {
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
    } catch (e) {
        let resp = {
            "status": 0,
            "error": "Oops, something went wrong! Please retry or login again with the required permissions!"
        };
        let data = JSON.stringify(resp);
        return res.end(data);
    }

};

function download(uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
}

exports.tagFirst = function (req, res, tags) {
    let flickrInfo = global.flickr;
    if (!flickrInfo) {
        flickrInfo = req.session.get("flickr");
    }
    if (!flickrInfo || !flickrInfo.opts || !flickrInfo.client.photos.search) {
        let resp = {
            "status": 0,
            "code": 309
        };
        let data = JSON.stringify(resp);
        res.writeHead(200, {"content-type": "application/json"});
        return res.end(data);
    }
    let options = {
        "sort": "date-posted-asc",
        "user_id": flickrInfo.opts.user_id,
        tags
    };

    flickrInfo.client.photos.search(options, (err, result) => {
        if (err) {
            let resp = {
                "status": 0,
                "code": 310
            };
            let data = JSON.stringify(resp);
            res.writeHead(200, {"content-type": "application/json"});
            return res.end(data);
        }
        let {photos} = result;
        if (photos.photo.length === 0) {
            let resp = {
                "status": 0,
                "code": 311
            };
            let data = JSON.stringify(resp);
            res.writeHead(200, {"content-type": "application/json"});
            return res.end(data);
        }
        let pid = photos.photo[0].id;
        async.waterfall([
                (done) => {
                    flickrInfo.client.photos.getSizes({photo_id: pid}, (err, res) => {
                        if (err) {
                            let resp = {
                                "status": 0,
                                "code": 310
                            };
                            let data = JSON.stringify(resp);
                            res.writeHead(200, {"content-type": "application/json"});
                            res.end(data);
                            return done(err);
                        }
                        let arr = res.sizes.size;
                        done(null, arr[arr.length-1].source)
                    });
                },
                (url, done) => {
                    tumblr.createPostPhoto(req, res, url);
                    done();
                }
            ],
            () => {
            });

    });

};

exports.tagLast = function (req, res, tags) {
    let flickrInfo = global.flickr;
    if (!flickrInfo) {
        flickrInfo = req.session.get("flickr");
    }
    if (!flickrInfo || !flickrInfo.opts || !flickrInfo.client.photos.search) {
        let resp = {
            "status": 0,
            "code": 309
        };
        let data = JSON.stringify(resp);
        res.writeHead(200, {"content-type": "application/json"});
        return res.end(data);
    }
    let options = {
        "sort": "date-posted-desc",
        "user_id": flickrInfo.opts.user_id,
        tags
    };

    flickrInfo.client.photos.search(options, (err, result) => {
        if (err) {
            let resp = {
                "status": 0,
                "code": 310
            };
            let data = JSON.stringify(resp);
            res.writeHead(200, {"content-type": "application/json"});
            return res.end(data);
        }
        let {photos} = result;
        if (photos.photo.length === 0) {
            let resp = {
                "status": 0,
                "code": 311
            };
            let data = JSON.stringify(resp);
            res.writeHead(200, {"content-type": "application/json"});
            return res.end(data);
        }
        let pid = photos.photo[0].id;
        async.waterfall([
                (done) => {
                    flickrInfo.client.photos.getSizes({photo_id: pid}, (err, res) => {
                        if (err) {
                            let resp = {
                                "status": 0,
                                "code": 310
                            };
                            let data = JSON.stringify(resp);
                            res.writeHead(200, {"content-type": "application/json"});
                            res.end(data);
                            return done(err);
                        }
                        let arr = res.sizes.size;
                        done(null, arr[arr.length-1].source)
                    });
                },
                (url, done) => {
                    tumblr.createPostPhoto(req, res, url);
                    done();
                }
            ],
            () => {
            });

    });

};
