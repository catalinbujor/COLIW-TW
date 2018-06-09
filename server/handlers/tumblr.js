const config = require("./config");
const request = require("request");
const qs = require("querystring");
const fs= require("fs");
global.tumblr = {};

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
        global.tumblr = req_data || {};
        let data = JSON.stringify({
            "uri": uri
        });
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    });
};

exports.lets_verify = function (verifier) {
    let oauth = {
            consumer_key: config.tumblr_api_key,
            consumer_secret: config.tumblr_api_secret,
            token: global.tumblr.oauth_token,
            token_secret: global.tumblr.oauth_token_secret,
            verifier: verifier
        },
        url = "https://www.tumblr.com/oauth/access_token";

    request.post({url: url, oauth: oauth}, function (e, r, body) {
        let qs = require("querystring");
        let perm_data = qs.parse(body);
        global.tumblr.access = perm_data || {};
        console.log(perm_data);
    });
};


exports.follow = function (req, res, user) {

    let data ={ status :0};
    if(global.tumblr.access === undefined)
    {
        data.status=2;
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
        return;

    }
    let tumblr = require('tumblr.js');
    let  client = tumblr.createClient({
        consumer_key: config.tumblr_api_key,
        consumer_secret: config.tumblr_api_secret,
        token: global.tumblr.access.oauth_token,
        token_secret: global.tumblr.access.oauth_token_secret
    });

    let urlUser="https://"+user+".tumblr.com";
    client.followBlog(urlUser,{}, function (err, r) {

        data.status=1;
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    });
};

exports.unfollow = function (req, res, user) {
    let data ={ status :0};
    if(global.tumblr.access === undefined)
    {
        data.status=2;
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
        return;

    }
    let tumblr = require('tumblr.js');
    let  client = tumblr.createClient({
        consumer_key: config.tumblr_api_key,
        consumer_secret: config.tumblr_api_secret,
        token: global.tumblr.access.oauth_token,
        token_secret: global.tumblr.access.oauth_token_secret
    });

    let urlUser="https://"+user+".tumblr.com";
    client.unfollowBlog(urlUser,{}, function (err, data) {
        data.status=1;
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    });
};

exports.createPostText=function(req,res,titlePost,bodyPost)
{
    let data ={status: 0};
    let tumblr = require('tumblr.js');

    if(global.tumblr.access === undefined)
    {
        data.status=2;
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
        return;

    }
    let  client = tumblr.createClient({
        consumer_key: config.tumblr_api_key,
        consumer_secret: config.tumblr_api_secret,
        token: global.tumblr.access.oauth_token,
        token_secret: global.tumblr.access.oauth_token_secret
    });
    let userBlog="coliwblog";
    let atribute = {
        title: titlePost,
        body: bodyPost
    };
    client.createTextPost(userBlog,atribute,function(err, resas) {

        data.status=1;
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    });
}


exports.createPostPhoto=function(req,res,source)
{
    let tumblr = require('tumblr.js');
    let  client = tumblr.createClient({
        consumer_key: config.tumblr_api_key,
        consumer_secret: config.tumblr_api_secret,
        token: global.tumblr.access.oauth_token,
        token_secret: global.tumblr.access.oauth_token_secret
    });
    let userBlog="coliwblog";
    client.createPhotoPost(userBlog,params,function(err, data) {
        console.log(err);
    });
}

exports.deletePost=function(req,res,nrofPost)
{
    let data ={status: 0};
    let tumblr = require('tumblr.js');

    if(global.tumblr.access === undefined)
    {
        data.status=2;
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
        return;

    }

    let  client = tumblr.createClient({
        consumer_key: config.tumblr_api_key,
        consumer_secret: config.tumblr_api_secret,
        token: global.tumblr.access.oauth_token,
        token_secret: global.tumblr.access.oauth_token_secret
    });

    let blogName="coliwblog";
    client.blogPosts(blogName, function(err, resp) {
        var nrPost=parseInt(nrofPost);
        if(resp.posts[nrPost]  ===  undefined )
        {
            data.status =3;
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            return;

        }
        var postId=resp.posts[nrPost].id;
        client.deletePost(blogName,postId,function(err){
            data.status=1;
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
        });
    });
}





exports.uploadFile=function(req,res,path)
{
    let data ={status: 0};
    let tumblr = require('tumblr.js');

    if(global.tumblr.access === undefined)
    {
        data.status=2;
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
        return;

    }
    let  client = tumblr.createClient({
        consumer_key: config.tumblr_api_key,
        consumer_secret: config.tumblr_api_secret,
        token: global.tumblr.access.oauth_token,
        token_secret: global.tumblr.access.oauth_token_secret
    });
       let userBlog="coliwblog";
       fs.readFile(path, (err, result) => {
          if (err)
        {
            console.log("aici#######################3");
            data.status=4;
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            return;

        }
        console.log(result);
        let atribute = {
            title: path,
            body:result
        };
        client.createTextPost(userBlog,atribute,function(err, resas) {

            data.status=1;
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
        });
    });


}


