//var request = new XMLHttpRequest();
var url = "http://localhost:3000/coliw/checkUser";
var request = new XMLHttpRequest();
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

            request.open("POST", url, true);

            request.setRequestHeader("Content-Type", "text/plain");
            let data = JSON.stringify({
                "path": inputCmd.substring(14)
            });
            request.send(data);
        }
        else if (inputCmd.indexOf("flickr tag") === 0) {
            // tag opt FLICKR

            var request = new XMLHttpRequest();
            var url = "http://localhost:3000/flickr/tag";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
            }

            request.open("POST", url, true);

            request.setRequestHeader("Content-Type", "text/plain");
            request.send();
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
                else if (data.status === 0) {
                    msg = "Oops, an errors has occured! Please retry."
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
                    msg = "Foto problem!"
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
                    msg = "Tumblr delete operation was successful!";
                }
                else if (data.status == 2) {
                    msg = "Tumblr operations requires authentication!"
                }
                else if(data.status == 4)
                {
                    msg="Oops something is wrong with the file !"
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
                path: inputCmd.substring(14)

            });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data);
        }
        else if (inputCmd.indexOf("login instagram") === 0) {
            console.log(window.location);
            window.location.replace("https://www.instagram.com/oauth/authorize?client_id=6575194369714920832c694fe324a479&redirect_uri=http://localhost:3000/instagram/callback/&response_type=token&scope=likes+comments+public_content");

            //window.location.replace("http://localhost:3000/");
            //window.location.replace("http://localhost:3000");
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

var bgculori = ['#B388FF', '#283593', '#8C9EFF', '#009688', '#00ACC1', '#CDDC39', '#FFE082', '#795548', '#BDBDBD', '#E64A19', '#EA80FC', '#F48FB1',
    '#607D8B', '#EFEBE9', '#84FFFF', '#311B92'];

function openNav() {
    document.getElementById("mySidenav").style.width = "13em";
    document.getElementById("main").style.marginLeft = "11em";
    document.body.style.backgroundColor = bgculori[Math.floor((Math.random() * bgculori.length))];

}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = bgculori[Math.floor((Math.random() * bgculori.length))];
}

