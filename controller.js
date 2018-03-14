var cmd = document.getElementById("input-line");

cmd.addEventListener("keypress", keyPressed);

function keyPressed(e) {
    if (e.keyCode === 13) { // enter
        var itm = document.getElementById("big-box").lastChild;
        removeEvents(document.getElementById("input-line"));
        document.getElementById("input-line").children[0].disabled = true;
        document.getElementById("input-line").removeAttribute("id");
        document.getElementById("user-box").removeAttribute("id");
        var cln = itm.cloneNode(true);
        cln.children[0].setAttribute("id", "user-box");
        cln.children[1].setAttribute("id", "input-line");

        document.getElementById("big-box").appendChild(cln);
        var newCmd = document.getElementById("input-line");
        newCmd.children[0].disabled = false;
        // add events
        newCmd.addEventListener("keypress", keyPressed);
        newCmd.children[0].value = '';
        newCmd.children[0].focus();
    }
}

function removeEvents (element) {
    var clone = element.cloneNode();
    while (element.firstChild) {
        clone.appendChild(element.lastChild);
    }
    element.parentNode.replaceChild(clone, element);
}