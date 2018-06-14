//var request = new XMLHttpRequest();
var url = "http://localhost:3000/coliw/checkUser";
var request = new XMLHttpRequest();
var saved=false;
request.open('GET', url, false);  // `false` makes the request synchronous
request.send(null);

if (request.status === 200) {
    document.getElementById("user-box").children[0].innerHTML = request.responseText;
}

var cmd = document.getElementById("input-line");
document.getElementById("input-line").children[0].focus();

cmd.addEventListener("keypress", keyPressed);
cmd.onkeydown = Arrows;

var lastCmd = [], ind = -1;

function Arrows(e) {
    if (e.keyCode === 38) { // arrow up
        document.getElementById("input-line").children[0].value = lastCmd[ind];
        newCmd.children[0].focus();
        ind--;
        if (ind < 0) {
            ind = lastCmd.length - 1;
        }
    }
}

function keyPressed(e) {
    if (e.keyCode === 13) { // enter
        var inputCmd = document.getElementById("input-line").children[0].value;
        lastCmd.push(inputCmd);
        ind = lastCmd.length - 1;
        if(inputCmd.indexOf("save theme") === 0)
        {
            saved=true;
            create_box("Theme saved!");
        }
        else
        if(inputCmd.indexOf("change theme") === 0)
        {
            saved=false;
            create_box("You can change your theme now!");
        }
        else
        if (inputCmd.indexOf("register coliw") === 0) {
            const username = inputCmd.split(" ")[2];
            const password = inputCmd.split(" ")[3];

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/coliw/register";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                create_box(data);
            };
            request.open("POST", url);

            request.setRequestHeader("Content-Type", "text/plain");
            let data = JSON.stringify({
                username,
                password
            });
            request.send(data);
        }
        else if (inputCmd.indexOf("login coliw") === 0) {
            const username = inputCmd.split(" ")[2];
            const password = inputCmd.split(" ")[3];

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/coliw/login";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                if (data === "You have successfully logged in!") {
                    return create_box(data, username);
                }
                create_box(data);
            };
            request.open("POST", url);

            request.setRequestHeader("Content-Type", "text/plain");
            let data = JSON.stringify({
                username,
                password
            });
            request.send(data);
        }
        else if (inputCmd === "login flickr") {
            // LOGIN FLICKR

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/flickr/auth";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                console.log(status, data);
            };

            request.open("POST", url, true);

            request.setRequestHeader("Content-Type", "application/json");
            request.send();
        }
        else if (inputCmd.indexOf("flickr upload") === 0) {
            // UPLOAD FLICKR

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/flickr/upload";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                var msg = null;
                if (data.status === 1) {
                    msg = "Photo uploaded successfully!";
                }
                else {
                    msg = data.error;
                }
                console.log(JSON.stringify(data));
                create_box(msg);
            };
            let ititle = inputCmd.indexOf("-title ");
            let itag = inputCmd.indexOf("-tag ");
            let tags, title;
            let lg;
            if (ititle > 0 && itag > 0) {
                if (ititle > itag) {
                    title = inputCmd.substring(ititle+7);
                    tags = inputCmd.substring(itag+5, ititle-1);
                    tags = tags.split(",");
                    lg=itag;
                }
                else {
                    tags = inputCmd.substring(itag+5);
                    tags = tags.split(",");
                    title = inputCmd.substring(ititle+7, itag-1);
                    lg=ititle;
                }
            }
            else if (ititle > 0) {
                title = inputCmd.substring(ititle+7);
                lg=ititle;
            }
            else if (itag > 0) {
                tags = inputCmd.substring(itag+5);
                tags = tags.split(",");
                lg=itag;
            }
            request.open("POST", url, true);
            let path = inputCmd.substring(14);
            if (lg) {
                path = inputCmd.substring(14, lg-1);
            }
            request.setRequestHeader("Content-Type", "text/plain");
            let data = JSON.stringify({
                path,
                title,
                tags
            });
            request.send(data);
        }
        else if (inputCmd.indexOf("flickr tag") === 0) {
            // tag opt FLICKR

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/flickr/tag_first";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
            };

            request.open("POST", url, true);

            request.setRequestHeader("Content-Type", "text/plain");
            request.send();
        }
        else if (inputCmd.indexOf("flickr -tag") === 0 && inputCmd.indexOf("-last") > 0 && inputCmd.endsWith("| tumblr upload")) {

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/flickr/tag_last";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                var msg = null;
                if (data.status === 1) {
                    msg = "Photo uploaded successfully on tumblr!";
                }
                else if (data.status === 0) {
                    if (data.code === 309) {
                        msg = "You don't have enough permissions. Please login again!";
                    }
                    else if (data.code === 310) {
                        msg = "An error occured, please retry!";
                    }
                    else if (data.code === 311) {
                        msg = "You must have at least 1 photo on flickr!"
                    }
                }
                else if (data.status === 3){
                    msg = "An error occured, please retry!";
                }
                else if (data.status === 2) {
                    msg = "You don't have enough permissions. Please login again!";
                }

                console.log(JSON.stringify(data));
                create_box(msg);
            };

            request.open("POST", url, true);

            request.setRequestHeader("Content-Type", "text/plain");
            let itags = inputCmd.indexOf("-tag ");
            let ifirst = inputCmd.indexOf("-last");
            let data = JSON.stringify({
                tags: inputCmd.substring(itags + 5, ifirst - 1)
            });
            request.send(data);
        }
        else if (inputCmd.indexOf("flickr -tag") === 0 && inputCmd.indexOf("-first") > 0 && inputCmd.endsWith("| tumblr upload")) {

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/flickr/tag_first";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                var msg = null;
                if (data.status === 1) {
                    msg = "Photo uploaded successfully on tumblr!";
                }
                else if (data.status === 0) {
                    if (data.code === 309) {
                        msg = "You don't have enough permissions. Please login again!";
                    }
                    else if (data.code === 310) {
                        msg = "An error occured, please retry!";
                    }
                    else if (data.code === 311) {
                        msg = "You must have at least 1 photo on flickr!"
                    }
                }
                else if (data.status === 3){
                    msg = "An error occured, please retry!";
                }
                else if (data.status === 2) {
                    msg = "You don't have enough permissions. Please login again!";
                }

                console.log(JSON.stringify(data));
                create_box(msg);
            };

            request.open("POST", url, true);

            request.setRequestHeader("Content-Type", "text/plain");
            let itags = inputCmd.indexOf("-tag ");
            let ifirst = inputCmd.indexOf("-first");
            let data = JSON.stringify({
                tags: inputCmd.substring(itags + 5, ifirst - 1)
            });
            request.send(data);
        }
        else if (inputCmd.indexOf("login twitter") === 0) {
            // LOGIN twitter

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/twitter/auth";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                data = JSON.parse(data);
                if (data.uri) {
                    window.location.replace(data.uri);
                }
            };
            request.open("POST", url, true);

            request.setRequestHeader("Content-Type", "text/plain");
            request.send();
        }
        else if (inputCmd.indexOf("twitter tweet") === 0) {
            // twitter tweet
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/twitter/tweet";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                console.log("TWITTER TWEET: " + data);
                var msg = null;
                if (data.status === 1) {
                    msg = "Tweet operation was successful!";
                }
                else if (data.errors.code === "ENOTFOUND") {
                    msg = "Tweet operation requires authentication!";
                }
                else if (data.errors instanceof Array && data.errors.length > 0 && data.errors[0].code === 89) {
                    msg = "Your token has expired! Please login again."
                }
                else {
                    msg = "Oops, an errors has occured! Please retry."
                }
                console.log(JSON.stringify(data.errors));
                create_box(msg);
            };

            request.open("POST", url, true);
            var verifier = window.location.href.substring(window.location.href.indexOf("verifier") + 9);
            let data = JSON.stringify({
                message: inputCmd.substring(14),
                verifier: verifier
            });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data);
        }
        else if (inputCmd.indexOf("twitter message") === 0) {
            // twitter tweet

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/twitter/message";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                console.log("TWITTER message: " + data);
                var msg = null;
                if (data.status === 1) {
                    msg = "Message operation was successful!";
                }
                else if (data.errors.code === "ENOTFOUND") {
                    msg = "Message operation requires authentication!";
                }
                else if (data.errors instanceof Array && data.errors.length > 0 && data.errors[0].code === 89) {
                    msg = "Your token has expired! Please login again."
                }
                else {
                    msg = "Oops, an errors has occured! Please retry."
                }
                create_box(msg);
            };

            request.open("POST", url, true);
            let data = JSON.stringify({
                user: inputCmd.split(" ")[2],
                text: inputCmd.substring(inputCmd.indexOf(inputCmd.split(" ")[2]) + inputCmd.split(" ")[2].length + 1)
            });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data);
        }
        else if (inputCmd.indexOf("twitter upd") === 0) {
            // twitter tweet

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/twitter/update_photo";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                var msg = null;
                if (data.status === 1) {
                    msg = "Message operation was successful!";
                }
                else if (data.errors.code === "ENOTFOUND") {
                    msg = "Message operation requires authentication!";
                }
                else if (data.errors instanceof Array && data.errors.length > 0 && data.errors[0].code === 89) {
                    msg = "Your token has expired! Please login again."
                }
                else {
                    msg = "Oops, an errors has occured! Please retry."
                }
                create_box(msg);
            };

            request.open("POST", url, true);
            let data = JSON.stringify({});
            request.setRequestHeader("Content-Type", "text/plain");
            request.send();
        }
        else if (inputCmd.indexOf("twitter get") === 0) {
            var request = new XMLHttpRequest();
            // twitter get
            var url = "http://localhost:3000/twitter/get";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                console.log("TWITTER get: " + data);
                var msg = null;
                msg = "Get operation was successful!";
                if (data.status === 1) {
                    msg = "Get operation requires authentication!";
                }

                else if (data.errors.code === "ENOTFOUND") {
                }
                else if (data.errors instanceof Array && data.errors.length > 0 && data.errors[0].code === 89) {
                    msg = "Your token has expired! Please login again."
                }
                else {
                    msg = "Oops, an errors has occured! Please retry."
                }
                create_box(msg);
            };

            request.open("POST", url, true);
            // let data = JSON.stringify({
            // });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send("");
        }
        else if (inputCmd.indexOf("login gmail") === 0) {
            // LOGIN gmail

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/gmail/auth";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                data = JSON.parse(data);
                if (data.uri) {
                    window.location.replace(data.uri);
                }
            };

            request.open("POST", url, true);

            request.setRequestHeader("Content-Type", "text/plain");
            request.send();

        }

        else if (inputCmd.indexOf("gmail label") === 0) {
            console.log('sal');
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/gmail/label";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                data = JSON.parse(data);
                create_box(data.data);
            }

            request.open("POST", url, true);

            request.setRequestHeader("Content-Type", "text/plain");
            request.send();
        }
        else if (inputCmd.indexOf("gmail list") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/gmail/list";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                data = JSON.parse(data);
                create_box(data.data);
            }

            request.open("POST", url, true);
            let words = inputCmd.split(' ');
            let keyword_='';
            let key_f = words.indexOf('-tag:');
            if(key_f>0){
                keyword_ = words[key_f+1];
            }

            let date_ = '';
            let date_f = Math.max(words.indexOf('-before:'),words.indexOf('-after:'));

            if(date_f > 0){
                date_ = words[date_f].substr(1)+words[date_f+1];
            }
            let labels_;
            labels_ = [];

            let lab_f = words.indexOf('-labels:');

            if(lab_f>0)
            {
                for(var i=lab_f+1;i<words.length;i++)
                    if(words[i]!=null)
                        labels_.push(words[i]);
            }

            let data2 = JSON.stringify({
                keyword:keyword_,
                date : date_,//'after:2018/06/07',
                labels:labels_
            });

            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data2);
        }


        else if (inputCmd.indexOf("login tumblr") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/tumblr/auth";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                data = JSON.parse(data);
                if (data.uri) {
                    window.location.replace(data.uri);
                }
            };
            request.open("POST", url, true);
            request.setRequestHeader("Content-Type", "text/plain");
            request.send();

        }
        else if (inputCmd.indexOf("get insta pp | update tumblr") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/tumblr/update";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                data = JSON.parse(data);
                if (data.status === 1) {
                    msg = "Operation was successful!";
                }
                else if (data.status == 2) {
                    msg = "Operation requires authentification on instagram and tumblr!"
                }
                else if (data.status === 0) {
                    msg = "Oops, an errors has occured! (Maybe the user)."
                }
                console.log(JSON.stringify(data.errors));
                create_box(msg);
            };
            request.open("POST", url, true);
            request.setRequestHeader("Content-Type", "text/plain");
            request.send();

        }

        else if (inputCmd.indexOf("get insta info | update tumblr") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/tumblr/updateInfo";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                data = JSON.parse(data);
                if (data.status === 1) {
                    msg = "Operation was successful!";
                }
                else if (data.status == 2) {
                    msg = "Operation requires authentification on instagram and tumblr!"
                }
                else if (data.status === 0) {
                    msg = "Oops, an errors has occured! (Maybe the user)."
                }
                console.log(JSON.stringify(data.errors));
                create_box(msg);
            };
            request.open("POST", url, true);
            request.setRequestHeader("Content-Type", "text/plain");
            request.send();

        }
        else if (inputCmd.indexOf("tumblr follow") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/tumblr/follow";
            request.onload = function () {
                var status = request.status; // HTTP respo nse status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                var msg = null;
                if (data.status === 1) {
                    msg = "Tumblr follow operation was successful!";
                }
                else if (data.status == 2) {
                    msg = "Tumblr operations requires authentication!"
                }
                else if (data.status == 4) {
                    msg = "You must provide the user !"
                }
                else if (data.status === 0) {
                    msg = "Oops, an errors has occured! (Maybe the user)."
                }
                console.log(JSON.stringify(data.errors));
                create_box(msg);

            };

            request.open("POST", url, true);
            let data = JSON.stringify({
                numeUser: inputCmd.substring(14)
            });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data);
        }
        else if (inputCmd.indexOf("tumblr unfollow") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/tumblr/unfollow";
            request.onload = function () {
                var status = request.status; // HTTP respo nse status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                var msg = null;
                if (data.status === 1) {
                    msg = "Tumblr unfollow operation was successful!";
                }
                else if (data.status == 2) {
                    msg = "Tumblr operations requires authentication!"
                }
                else if (data.status == 4) {
                    msg = "You must provide the user !"
                }
                else if (data.status === 0) {
                    msg = "Oops, an errors has occured! Please retry."
                }
                console.log(JSON.stringify(data.errors));
                create_box(msg);
            };
            request.open("POST", url, true);
            let data = JSON.stringify({
                numeUser: inputCmd.substring(16)
            });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data);
        }
        else if (inputCmd.indexOf("tumblr text") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/tumblr/text";
            request.onload = function () {
                var status = request.status; // HTTP respo nse status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                var msg = null;
                if (data.status === 1) {
                    msg = "Tumblr text  operation was successful!";
                }
                else if (data.status == 2) {
                    msg = "Tumblr operations requires authentication!"
                }

                else if (data.status == 4) {
                    msg = "You must provide the text!"
                }
                else if (data.status === 0) {
                    msg = "Oops, an errors has occured! Please retry."
                }
                console.log(JSON.stringify(data.errors));
                create_box(msg);
            };

            request.open("POST", url, true);
            let data = JSON.stringify({
                title: inputCmd.split(" ")[2],
                body: inputCmd.substring(inputCmd.indexOf(inputCmd.split(" ")[2]) + inputCmd.split(" ")[2].length + 1)

            });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data);
        }

        else if (inputCmd.indexOf("tumblr photo") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/tumblr/photo";
            request.onload = function () {
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                var msg = null;
                if (data.status === 1) {
                    msg = "Tumblr upload operation was successful!";
                }
                else if (data.status == 2) {
                    msg = "Tumblr operations requires authentication!"
                }
                else if (data.status == 3) {
                    msg = "Check the photo !"
                }
                else if (data.status === 0) {
                    msg = "Oops, an errors has occured! Please retry."
                }
                console.log(JSON.stringify(data.errors));
                create_box(msg);
            };
            request.open("POST", url, true);
            let data = JSON.stringify({
                photoUrl: inputCmd.substring(13)
            });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data);
        }

        else if (inputCmd.indexOf("tumblr delete") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/tumblr/delete";
            request.onload = function () {
                var status = request.status; // HTTP respo nse status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                var msg = null;
                if (data.status === 1) {
                    msg = "Tumblr delete operation was successful!";
                }
                else if (data.status == 2) {
                    msg = "Tumblr operations requires authentication!"
                }
                else if (data.status == 3) {
                    msg = "You must provide the number of the post !"
                }
                else if (data.status === 0) {
                    msg = "Oops, an errors has occured! Please retry."
                }
                console.log(JSON.stringify(data.errors));
                create_box(msg);

            };
            request.open("POST", url, true);
            let data = JSON.stringify({
                nrofPost: inputCmd.substring(13)
            });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data);
        }
        else if (inputCmd.indexOf("tumblr upload") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/tumblr/upload";
            request.onload = function () {
                var status = request.status; // HTTP respo nse status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                var msg = null;
                if (data.status === 1) {
                    msg = "Tumblr upload operation was successful!";
                }
                else if (data.status == 2) {
                    msg = "Tumblr operations requires authentication!"
                }
                else if(data.status == 3)
                {
                    msg="Oops something is wrong with the file !"
                }
                else if (data.status == 4) {
                    msg = "Oops, an errors has occured! Please retry.!"
                }
                else if (data.status === 0) {
                    msg = "Oops, an errors has occured! Please retry."
                }
                console.log(JSON.stringify(data.errors));
                create_box(msg);

            };
            request.open("POST", url, true);
            let data = JSON.stringify({
                path: inputCmd.substring(14)

            });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data);
        }
        else if (inputCmd.indexOf("tumblr post | gmail list ") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/gmail/tumblr";
            request.onload = function () {
                var status = request.status; // HTTP respo nse status, e.g., 200 for "200 OK"
                var data = JSON.parse(request.responseText); // Returned data, e.g., an HTML document.
                var msg = null;
                if (data.status === 1) {
                    msg = "Tumblr upload operation was successful!";
                }
                else if (data.status == 2) {
                    msg = "Tumblr operations requires authentication!"
                }
                else if(data.status == 3)
                {
                    msg="Oops something is wrong with the file !"
                }
                else if (data.status == 4) {
                    msg = "Oops, an errors has occured! Please retry.!"
                }
                else if (data.status === 0) {
                    msg = "Oops, an errors has occured! Please retry."
                }
                console.log(JSON.stringify(data.errors));
                create_box(msg);

            };
            request.open("POST", url, true);
            let words = inputCmd.split(' ');
            let keyword_='';
            let key_f = words.indexOf('-tag:');
            if(key_f>0){
                keyword_ = words[key_f+1];
            }

            let date_ = '';
            let date_f = Math.max(words.indexOf('-before:'),words.indexOf('-after:'));

            if(date_f > 0){
                date_ = words[date_f].substr(1)+words[date_f+1];
            }
            let labels_;
            labels_ = [];

            let lab_f = words.indexOf('-labels:');

            if(lab_f>0)
            {
                for(var i=lab_f+1;i<words.length;i++)
                    if(words[i]!=null)
                        labels_.push(words[i]);
            }

            let data2 = JSON.stringify({
                keyword:keyword_,
                date : date_,//'after:2018/06/07',
                labels:labels_
            });

            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data2);
        }
        else if (inputCmd.indexOf("login instagram") === 0) {
            var url = 'https://www.instagram.com/oauth/authorize?client_id=6575194369714920832c694fe324a479&redirect_uri=http://localhost:3000/instagram/callback&response_type=code';
            window.location.replace(url);
        }
        else if (inputCmd.indexOf("insta me") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/insta/get";
            request.onload = function () {
                var data = request.responseText; // Returned data, e.g., an HTML document.
                data = JSON.parse(data);

                if (data.status == 3) {
                    msg = "Instagram operations requires authentication!"
                    create_box(msg);
                }
                else if (data.status == 2) {
                    msg = "Oops, an errors has occured! Please retry!"
                    create_box(msg);
                }
                else
                    create_box(data.data);
            }
            request.open("POST", url, true);
            request.setRequestHeader("Content-Type", "text/plain");
            request.send();
        }
        else if (inputCmd.indexOf("insta find") === 0) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/insta/tag";
            request.onload = function () {
                var data = request.responseText; // Returned data, e.g., an HTML document.
                data = JSON.parse(data);
                if (data.status == 3) {
                    msg = "Instagram operations requires authentication!"
                    create_box(msg);
                }
                else if (data.status == 2) {
                    msg = "Oops, an errors has occured! Please retry!"
                    create_box(msg);
                }
                else if (data.status == 4) {
                    msg = "Tags are two or more characters"
                    create_box(msg);
                }
                else {
                    console.log(data.data);
                    create_box(data.data);
                }

            };
            request.open("POST", url, true);
            let data = JSON.stringify({
                tagName: inputCmd.substring(11)
            });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data);
        }
        else if (inputCmd.indexOf("join rss ") === 0 && inputCmd.endsWith(" | tumblr upload")) {
            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/rss/find";
            request.onload = function () {
                var data = request.responseText; // Returned data, e.g., an HTML document.
                data = JSON.parse(data);
                if (data.status !== 1) {
                    msg = "Error occured!";
                    create_box(msg);
                }
                else {
                    create_box("Successfully uploaded on tumblr!");
                }

            };
            let url1=inputCmd.split(" ")[2];
            let url2=inputCmd.split(" ")[3];
            let iWhere = inputCmd.indexOf("-where");
            let tag;
            if (iWhere > 0) {
                tag = inputCmd.substring(iWhere).split(" ")[1];
            }

            request.open("POST", url, true);
            let data = JSON.stringify({
                url1,
                url2,
                tag
            });
            request.setRequestHeader("Content-Type", "text/plain");
           request.send(data);
        }


        else {
            create_box("Unknown command!");
        }
}
}


function create_box(msg, username) {
    var itm = document.getElementById("big-box").children[document.getElementById("big-box").children.length - 1];
    document.getElementById("messenger").innerHTML = msg;

    removeEvents(document.getElementById("input-line"));
    document.getElementById("input-line").children[0].disabled = true;
    document.getElementById("input-line").removeAttribute("id");
    document.getElementById("user-box").removeAttribute("id");

    document.getElementById("messenger").removeAttribute("id");
    var cln = itm.cloneNode(true);

    var fchild = cln.children[0];
    fchild.children[0].setAttribute("id", "user-box");
    fchild.children[1].setAttribute("id", "input-line");
    cln.children[1].setAttribute("id", "messenger");
    document.getElementById("big-box").appendChild(cln);
    var newCmd = document.getElementById("input-line");
    newCmd.children[0].disabled = false;
    // add events
    newCmd.addEventListener("keypress", keyPressed);
    newCmd.onkeydown = Arrows;
    newCmd.children[0].value = '';
    newCmd.children[0].focus();

    document.getElementById("messenger").innerHTML = "";
    if (username) {
        document.getElementById("user-box").children[0].innerHTML = "@" + username;
    }
}

function computeDisplayMessage(rez) {
    if (rez)
        return "" + rez;
    return "Command " + "'" + document.getElementById("input-line").children[0].value + "'" + " executed successfully!";
}

function removeEvents(element) {
    var clone = element.cloneNode();
    while (element.firstChild) {
        clone.appendChild(element.lastChild);
    }
    element.parentNode.replaceChild(clone, element);
}

var bgculori = ['#B388FF','#283593', '#8C9EFF', '#009688', '#00ACC1', '#CDDC39', '#FFE082', '#795548', '#BDBDBD', '#E64A19', '#EA80FC', '#F48FB1', '#607D8B', '#311B92'];
function openNav() {
    document.getElementById("mySidenav").style.width = "13em";
    document.getElementById("main").style.marginLeft = "11em";
    if(!saved) {
        document.body.style.backgroundColor = bgculori[Math.floor((Math.random() * bgculori.length))];
    }

}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    if(!saved)
    {
        document.body.style.backgroundColor = bgculori[Math.floor((Math.random() * bgculori.length))];
    }
}

