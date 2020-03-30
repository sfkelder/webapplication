//When hovering over the menu, hidden items will be shown
$('.menu__innerlist').hover(function() {
	$(this).children('ul').stop(true, false, true).fadeToggle(300);
       });

//when login button is pressed, th elogin screen becomes vissible
function openLogin(){
    var loginScreen = document.getElementById("login");

    loginScreen.style.display="block";

}

//
var niveaus = ['Bachelor 1','Bachelor 2','Bachelor 3','Master 1','Master 2'];
var programs = ['Informatica','Game technologie','bestuur en organisatiewetenschappen','Rechten','Wiskunde'];

function setUpPage(){
    loginBox();
}

function loginBox() {
  var x = document.createElement("SELECT");
  var y = document.createElement("SELECT");

  x.setAttribute("id", "selectionBox");
  x.setAttribute("name", "academic_level");
  y.setAttribute("id", "selectionBox1");
  y.setAttribute("name", "program");

  document.getElementById('login-box__selsction').appendChild(x);
  document.getElementById('login-box__selsction1').appendChild(y);

    for(let i =0; i<niveaus.length; i++){
        var z = document.createElement("option");
        var t = document.createTextNode(niveaus[i]);

        z.appendChild(t);
        document.getElementById("selectionBox").appendChild(z);
    }

    for(let i =0; i<programs.length; i++){
        var z = document.createElement("option");
        var t = document.createTextNode(programs[i]);

        z.appendChild(t);
        document.getElementById("selectionBox1").appendChild(z);
    }
}


window.addEventListener("load", setUpPage, true);
