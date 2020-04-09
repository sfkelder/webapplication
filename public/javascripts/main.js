//When hovering over the menu, hidden items will be shown
$('.menu__innerlist').hover(function() {
	$(this).children('ul').stop(true, false, true).fadeToggle(300);
       });

//when login button is pressed, th elogin screen becomes vissible
function openLogin(){
    var loginScreen = document.getElementById("login");

    loginScreen.style.display="block";
}


var niveaus = ['Bachelor 1','Bachelor 2 + 3'];
var programs = ['Informatica','Game technologie','Informatiekunde'];
var semesters = ['Semester 1', 'Semester 2', 'Semester 3','Semester 4',];


//creates the inputboxes with values for the register page
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

function semester(){
    var a = document.createElement("SELECT");

    a.setAttribute("id", "selectionBox2");
    a.setAttribute("name", "semester");

    document.getElementById('login-box__selsction2').appendChild(a);

     for(let i =0; i<semesters.length; i++){
        var z = document.createElement("option");
        var t = document.createTextNode(semesters[i]);

        z.appendChild(t);
        document.getElementById("selectionBox2").appendChild(z);
    }
}

//tijdelijke functie
var faculteit = ['Beta']; //['Aarde en Duurzaamheid', 'Bredere opleidingen', 'Beta', 'Gedrag en Maatschappij', 'Gezondheid van Mens en Dier', 'Media, kunt, Cultuur en Gescheidenis', 'Recht, Economie en Bestuur', 'Relgie en Filosofie', 'Talen en Communicatie', 'Economie, Bestuur en Organisatie', 'Filosofie en Religiewetenschappen', 'Natuurwetenschappen', 'Onderwijs', 'Rechten', 'Sociale en Gedragswetenschappen', 'Talen, Literatuur en Communicatie', 'Wiskunde en Informatiewetenschappen', 'Honours', 'Da Vince Project', 'Descartes College', 'Exchange'];
window.addEventListener("load", faculteiten, true);
function faculteiten(){
    var b = document.createElement("SELECT");

    b.setAttribute("id", "selectionBox3");
    b.setAttribute("name", "faculteit");

    document.getElementById('login-box__selsction3').appendChild(b);

     for(let i =0; i<faculteit.length; i++){
        var z = document.createElement("option");
        var t = document.createTextNode(faculteit[i]);

        z.appendChild(t);
        document.getElementById("selectionBox3").appendChild(z);
    }
}


function deleteFunction(){
    document.getElementById('deleteButton').style.display="none";
    document.getElementById('deleteButton1').style.display="inline-block";
}

//sets up the acount page
function acountPage(){

}

//alerts for when a page is requested by user
window.addEventListener("load", loginBox, true);
window.addEventListener("load", semester, true);
