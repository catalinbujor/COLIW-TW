const config = require("./config");
const request = require("request");
const qs = require("querystring");
const fs= require("fs");
global.tumblr = {};

function LoginError(res, req) {
    let tumblrInfo = req.session.get("tumblr");
    if (global.tumblr.access === undefined && tumblrInfo === undefined) {
        let data = {status: 2};
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
        return true;
    }
    return false;
}
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
        let url = "http://localhost:8001/users/add_token";
        if (global.coliw.logged === 1) {
            let json = {
                "username": global.coliw.username,
                "token": "tumblr",
                "value": perm_data
            };
            request.post({url: url, json}, () => {});
        }
    });
};

function UserError(user,res) {
    if(user.length == 0)
    {
        let data={status:4};
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
        return true ;
    }

    return false;
}

exports.follow = function (req, res, user) {
    let tumblrInfo = req.session.get("tumblr");
    if (!tumblrInfo) {
        tumblrInfo = global.tumblr.access;
    }

    let data ={ status :0};
    if(LoginError(res,req))
   {
        return;
    }
    if(UserError(user,res))
    {
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
        if(err !== null)
        {
            let data = {status: 0};
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            return ;
        }

        data.status=1;
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    });
};

exports.unfollow = function (req, res, user) {
    let data ={ status :0};
    let tumblrInfo = req.session.get("tumblr");
    if (!tumblrInfo) {
        tumblrInfo = global.tumblr.access;
    }
    if(LoginError(res,req))
    {
        return;
    }
    if(UserError(user,res))
    {
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
        if(err !== null)
        {
            let data = {status: 0};
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            return ;
        }
        data.status=1;
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    });
};



exports.createPostText = function (req, res, titlePost, bodyPost) {
    let data = {status: 0};
    let tumblrInfo = req.session.get("tumblr");
    if (!tumblrInfo) {
        tumblrInfo = global.tumblr.access;
    }
    let tumblr = require('tumblr.js');

    if(LoginError(res,req))
    {
        return;
    }
    let client = tumblr.createClient({
        consumer_key: config.tumblr_api_key,
        consumer_secret: config.tumblr_api_secret,
        token: global.tumblr.access.oauth_token,
        token_secret: global.tumblr.access.oauth_token_secret
    });
    let userBlog = "coliwblog";
    let atribute = {
        title: titlePost,
        body: bodyPost
    };
    client.createTextPost(userBlog, atribute, function (err, resas) {
        if(err !== null)
        {
            let data = {status: 0};
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            return ;
        }
        data.status = 1;
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
    });
}


exports.createPostPhoto=function(req,res,source) {
    let tumblrInfo = req.session.get("tumblr");
    if (!tumblrInfo) {
        tumblrInfo = global.tumblr.access;
    }
    if(LoginError(res,req))
    {
        return;
    }

    let tumblr = require('tumblr.js');
    let client = tumblr.createClient({
        consumer_key: config.tumblr_api_key,
        consumer_secret: config.tumblr_api_secret,
        token: global.tumblr.access.oauth_token,
        token_secret: global.tumblr.access.oauth_token_secret
    });
    let userBlog = "coliwblog";
    let params={
        source:source,
        caption:'test'

    }
    client.createPhotoPost(userBlog,params,function(err, data) {
        if(err != null)
        {
            var data ={status :0};
            data.status=3;
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            return;
        }
        else {
            var data ={status :0};
            data.status = 1;
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);

        }
    });
}


exports.deletePost=function(req,res,nrofPost)
{   let tumblrInfo = req.session.get("tumblr");
    if (!tumblrInfo) {
        tumblrInfo = global.tumblr.access;
    }
    let data ={status: 0};
    let tumblr = require('tumblr.js');

    if(LoginError(res,req))
    {
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
    let tumblrInfo = req.session.get("tumblr");
    if (!tumblrInfo) {
        tumblrInfo = global.tumblr.access;
    }
    let tumblr = require('tumblr.js');

    if(LoginError(res,req))
    {
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
           if(err != null)
           {
               var data ={status :0};
               data.status=3;
               data = JSON.stringify(data);
               res.writeHead(200, {"content-type": "application/json"});
               res.end(data);
               return;
           }
        let atribute = {
            title: path,
            body:result
        };
        client.createTextPost(userBlog,atribute,function(err, resp) {
            if(err != null)
            {
                var data ={status :0};
                data.status=3;
                data = JSON.stringify(data);
                res.writeHead(200, {"content-type": "application/json"});
                res.end(data);
                return;
            }
            var data ={status: 0};
            data.status=1;
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
        });
    });


}


