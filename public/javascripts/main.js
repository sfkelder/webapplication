//When hovering over the menu, hidden items will be shown
$('.menu__innerlist').hover(function() {
	$(this).children('ul').stop(true, false, true).fadeToggle(300);
       });

//when login button is pressed, th elogin screen becomes vissible
function openLogin(){
    var loginScreen = document.getElementById("login");

    loginScreen.style.display="block";

}
