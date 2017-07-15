
function getVieHere() {
	var vie = new VIE();
    vie.use(new vie.RdfaService());
    return vie;
}

function configureEditorsHere() {
}




(function($) {
	document.body.className = '';
	window.ontouchmove = function() { return false; };
	window.onorientationchange = function() { document.body.scrollTop = 0; };
	
})(jQuery);