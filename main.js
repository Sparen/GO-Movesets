"use strict"

function setup() {
    console.log("setup(): Running");
    var client = new XMLHttpRequest();
    client.open("GET", "db.json", true);
    client.onreadystatechange = function () { //callback
        if (client.readyState == 4) {
            if (client.status == 200 || client.status == 0) {
                loadDatabase(JSON.parse(client.responseText));
            }
        }
    };

    client.send();
    console.log("getFileContents(): Request Sent");
}

function loadDatabase(input) {
    console.log("loadDatabase(): Running");

    var borderline = "*-----------------------------------------*\n";
    var midline = "|------------------+----------------------|\n"

    var qmoves = input.qmoves;
    var cmoves = input.cmoves;
    var mons = input.mons;

    var output = "";

    var i = 0;
    for (i = 0; i < mons.length; i += 1) { //For every mon
        var montable = borderline;
        var mon = mons[i];
        montable += "| " + mon.id + " " + pad(mon.name, 12) + "|                      | ";
        montable += "<span class='" + mon.type1 + "'>   </span>" + "<span class='" + mon.type2 + "'>   </span>\n"
        montable += midline;
        var j = 0;
        for (j = 0; j < mon.quick.length; j += 1) { //for every quick move
            var qmovename = mon.quick[j].name;
            var qmoveleg = mon.quick[j].legacy;
            var qmoveobj = getQuick(qmoves, qmovename);
            montable += "| " + pad(qmovename, 17) + "| ";
            //calculate DPS with STAB, format the number with leading 0s and decimal places
            var dps = qmoveobj.power / qmoveobj.duration;
            if (qmoveobj.type === mon.type1 || qmoveobj.type === mon.type2) {
                dps *= 1.25;
            }
            montable += formatDecimal(dps) + " DPS ";
            var eps = qmoveobj.energy / qmoveobj.duration;
            montable += formatDecimal(eps) + " EPS  ";
            if (qmoveleg) {
                montable += "L |";
            } else {
                montable += "  |";
            }
            //Add move type
            montable += " <span class='" + qmoveobj.type + "'> " + qmoveobj.type + "  </span>\n";
        }
        montable += midline;
        j = 0;
        for (j = 0; j < mon.charge.length; j += 1) { //for every charge move
            var cmovename = mon.charge[j].name;
            var cmoveleg = mon.charge[j].legacy;
            var cmoveobj = getCharge(cmoves, cmovename);
            montable += "| " + pad(cmovename, 17) + "| ";
            //calculate DPS with STAB, format the number with leading 0s and decimal places
            var dps = cmoveobj.power / cmoveobj.duration;
            if (cmoveobj.type === mon.type1 || cmoveobj.type === mon.type2) {
                dps *= 1.25;
            }
            montable += formatDecimal(dps) + " DPS    " + cmoveobj.bars + " BAR  ";
            if (cmoveleg) {
                montable += "L |";
            } else {
                montable += "  |";
            }
            //Add move type
            montable += " <span class='" + cmoveobj.type + "'> " + cmoveobj.type + "  </span>\n";
        }
        montable += borderline + "\n";

        output += montable;
    }

    document.getElementById("main").innerHTML = output;

    var moveoutput = "";
    i = 0;
    for (i = 0; i < cmoves.length; i += 1) {
        moveoutput += "* " + pad(cmoves[i].name, 17);
        if (cmoves[i].bars === "1") {
            moveoutput += "<span class='" + cmoves[i].type + "'>           </span>\n";
        } else if (cmoves[i].bars === "2") {
            moveoutput += "<span class='" + cmoves[i].type + "'>     </span> ";
            moveoutput += "<span class='" + cmoves[i].type + "'>     </span>\n";
        } else if (cmoves[i].bars === "3") {
            moveoutput += "<span class='" + cmoves[i].type + "'>   </span> ";
            moveoutput += "<span class='" + cmoves[i].type + "'>   </span> ";
            moveoutput += "<span class='" + cmoves[i].type + "'>   </span>\n";
        } else {
            moveoutput += "<span class='" + cmoves[i].type + "'></span>\n";
        }
    }
    document.getElementById("moves").innerHTML = moveoutput;
}

//Pad a string with spaces
function pad(input, length) {
    var str = input;
    var j = 0;
    for (j = 0; j < (length - input.length); j += 1) {
        str += " ";
    }
    return str;
}

//formats a dps value into the 00.0 format
function formatDecimal(input) {
    var str = "";
    if (input < 10) { //pad starting
        str += " ";
    }
    str += roundPrec(input, 1).toString();
    if (str.length == 2) {
        str += ".0";
    } else if (str.length == 3) { //NaN
        str += " ";
    }
    return str;
}

//round with precision, from http://stackoverflow.com/questions/7342957/how-do-you-round-to-1-decimal-place-in-javascript
function roundPrec(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

//returns quick move object corresponding to given name
function getQuick(qmoves, qmovename) {
    var k = 0;
    for (k = 0; k < qmoves.length; k += 1) { //search quick move database
        if (qmoves[k].name === qmovename) {
            return qmoves[k];
        }
    }
    console.log("Error: Move " + qmovename + " was not found in db.json");
    return {"name": "???", "type": "UNK", "power": "0", "duration": "0"};
}

//returns charge move object corresponding to given name
function getCharge(cmoves, cmovename) {
    var k = 0;
    for (k = 0; k < cmoves.length; k += 1) { //search quick move database
        if (cmoves[k].name === cmovename) {
            return cmoves[k];
        }
    }
    console.log("Error: Move " + cmovename + " was not found in db.json");
    return {"name": "???", "type": "UNK", "power": "0", "duration": "0.0", "crit": "0.00", "bars": "?"};
}