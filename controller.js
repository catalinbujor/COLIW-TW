var cmd = document.getElementById("input-line");
document.getElementById("input-line").children[0].focus();

cmd.addEventListener("keypress", keyPressed);

function keyPressed(e) {
    if (e.keyCode === 13) { // enter
        var itm = document.getElementById("big-box").children[document.getElementById("big-box").children.length-1];
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
        newCmd.children[0].value = '';
        newCmd.children[0].focus();

        document.getElementById("messenger").innerHTML="";
    }
}

function computeDisplayMessage() {
    return "Command " + "'" + document.getElementById("input-line").children[0].value + "'" + " executed successfully!";
}

function removeEvents (element) {
    var clone = element.cloneNode();
    while (element.firstChild) {
        clone.appendChild(element.lastChild);
    }
    element.parentNode.replaceChild(clone, element);
}

var bgculori=['#B388FF','#283593','#8C9EFF','#009688','#00ACC1','#CDDC39','#FFE082','#795548','#BDBDBD','#E64A19','#EA80FC','#F48FB1',
'#607D8B','#EFEBE9','#84FFFF','#311B92'];

function openNav() {
    document.getElementById("mySidenav").style.width = "13em";
    document.getElementById("main").style.marginLeft = "11em";
    document.body.style.backgroundColor = bgculori[Math.floor((Math.random() * bgculori.length))];

}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    document.body.style.backgroundColor = bgculori[Math.floor((Math.random() * bgculori.length) )];
}

