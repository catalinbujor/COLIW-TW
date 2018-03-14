module.exports = function (req, res) {
    let resp = {
        "slideshare": 1
    };
    let data = JSON.stringify(resp);
    res.writeHead(200, {"content-type": "application/json"});
    res.write(data);
    res.end();
};