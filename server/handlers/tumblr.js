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
        token: tumblrInfo.oauth_token,
        token_secret: tumblrInfo.oauth_token_secret
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
        token: tumblrInfo.oauth_token,
        token_secret: tumblrInfo.oauth_token_secret
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



function TextError(titlePost,bodyPost,res) {
    if(titlePost.length == 0 && bodyPost.length == 0)
    {
        let data={status:4};
        data = JSON.stringify(data);
        res.writeHead(200, {"content-type": "application/json"});
        res.end(data);
        return true ;
    }

    return false;
}
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

    let  client = tumblr.createClient({
        consumer_key: config.tumblr_api_key,
        consumer_secret: config.tumblr_api_secret,
        token: tumblrInfo.oauth_token,
        token_secret: tumblrInfo.oauth_token_secret
    });
    let userBlog = "coliwblog";
    let atribute = {
        title: titlePost,
        body: bodyPost
    };
    client.createTextPost(userBlog, atribute, function (err) {
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
    let  client = tumblr.createClient({
        consumer_key: config.tumblr_api_key,
        consumer_secret: config.tumblr_api_secret,
        token: tumblrInfo.oauth_token,
        token_secret: tumblrInfo.oauth_token_secret
    });
    let userBlog = "coliwblog";
    let params={
        source:source

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


exports.deletePost = function (req, res, nrofPost) {
    let data = {status: 0};
    let tumblrInfo = req.session.get("tumblr");
    if (!tumblrInfo) {
        tumblrInfo = global.tumblr.access;
    }
    if(LoginError(res,req))
    {
        return;
    }
    let tumblr = require('tumblr.js');
    let  client = tumblr.createClient({
        consumer_key: config.tumblr_api_key,
        consumer_secret: config.tumblr_api_secret,
        token: tumblrInfo.oauth_token,
        token_secret: tumblrInfo.oauth_token_secret
    });
    let blogName = "coliwblog";
    client.blogPosts(blogName, function (err, resp) {
        var nrPost = parseInt(nrofPost);
        if (resp.posts[nrPost] === undefined) {
            data.status = 3;
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            return;

        }
        var postId = resp.posts[nrPost].id;
        client.deletePost(blogName, postId, function (err) {
            data.status = 1;
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
        token: tumblrInfo.oauth_token,
        token_secret: tumblrInfo.oauth_token_secret
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
           if(path === "./msg.rss")
               path='Convos';
           if (path === "./flux.rss") {
               path = "Hot News:";
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


exports.update=function(req,res)
{
    let instaInfo = req.session.get("instagram");
    if (!instaInfo) {
        instaInfo = global.instagram.acces;
    }
    var url = "https://api.instagram.com/v1/users/self/?access_token=" + instaInfo;
    request.get(url, function (error, response) {
        if (error !== null) {
            let data = {status: 0};
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            return;
        }
        let data = JSON.parse(response.body);
        if(data.data === undefined) // instagram login failed.
        {

            let data = {status: 2};
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            return ;
        }
        let source=data.data.profile_picture;
        exports.createPostPhoto(req,res,source);
    })

}


exports.postInstaInformation=function (req,res) {


    let instaInfo = req.session.get("instagram");
    if (!instaInfo) {
        instaInfo = global.instagram.acces;
    }
    if (LoginError(res, req)) {
        return;
    }
    var url = "https://api.instagram.com/v1/users/self/?access_token=" + instaInfo;
    request.get(url, function (error, response) {
        if (error !== null) {
            let data = {status: 2};
            data = JSON.stringify(data);
            res.writeHead(200, {"content-type": "application/json"});
            res.end(data);
            return;
        }
        let data = JSON.parse(response.body);

    let html=
        "<html>" +
        "<head>" +
        "<title></title>"+
        "</head>"+
        "<body>"+
        "<h1>"+ data.data.full_name.toUpperCase()+"</h1>"+
        "<h2>"+"Username :    "+data.data.username+"</h2>"+
        "<img src="+data.data.profile_picture +  ">"+
        "<p><i>" + "BIO:         "+ data.data.bio +"</i></p>"+
        "<p><i>" + "WEBSITE:     "+ data.data.website +"</i></p>"+
        "<p><b>" + "POSTS:       "+ data.data.counts.media +"</b></p>"+
        "<p><b>" + "FOLLOWS:     "+ data.data.counts.follows +"</b></p>"+
        "<p><b>" + "FOLLOWED_BY: "+ data.data.counts.followed_by +"</b></p>"+
        "</body>"+
        "</html>";


    exports.createPostText(req,res,"Instagram informations",html);

    })


}




