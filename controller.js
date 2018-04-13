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
        if(ind < 0) {
            ind = lastCmd.length - 1;
        }
    }
}
function keyPressed(e) {
    if (e.keyCode === 13) { // enter
        var inputCmd = document.getElementById("input-line").children[0].value;
        lastCmd.push(inputCmd);
        ind = lastCmd.length - 1;
        if (inputCmd === "login flickr") {
            // LOGIN FLICKR

            var request = new XMLHttpRequest();
            var url = "http://localhost:8000/flickr/auth";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
            }

            request.open("POST", url, true);

            request.setRequestHeader("Content-Type", "application/json");
            request.send();
        }
        else if (inputCmd.indexOf("flickr upload") === 0) {
            // UPLOAD FLICKR

            var request = new XMLHttpRequest();
            var url = "http://localhost:8000/flickr/upload";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
            }

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
            var url = "http://localhost:8000/flickr/tag";
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
            var url = "http://localhost:8000/twitter/auth";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                data = JSON.parse(data);
                if (data.uri) {
                    window.location.replace(data.uri);
                }
            }

            request.open("POST", url, true);

            request.setRequestHeader("Content-Type", "text/plain");
            request.send();
        }
        else if (inputCmd.indexOf("twitter tweet") === 0) {
            // twitter tweet
            var request = new XMLHttpRequest();
            var url = "http://localhost:8000/twitter/tweet";
            request.onload = function () {
                var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
                var data = request.responseText; // Returned data, e.g., an HTML document.
                console.log("TWITTER TWEET: " + data);
            }

            request.open("POST", url, true);
            var verifier = window.location.href.substring(window.location.href.indexOf("verifier") + 9);
            let data = JSON.stringify({
                status: inputCmd.substring(14),
                verifier: verifier
            });
            request.setRequestHeader("Content-Type", "text/plain");
            request.send(data);
        }


        var itm = document.getElementById("big-box").children[document.getElementById("big-box").children.length - 1];
        document.getElementById("messenger").innerHTML = computeDisplayMessage();

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
    }
}

function computeDisplayMessage() {
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

