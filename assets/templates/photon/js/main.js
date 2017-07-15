/*
	Photon by HTML5 UP
	html5up.net | @n33co
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

function getVieHere() {
	var vie = new VIE();
    vie.use(new vie.RdfaService());
    
    vie.types.add('Caracteristica', [
                                     {id: 'imagen', range: 'Text', min: 0, max: 1},
                                     {id: 'titulo', range: 'TextSimple', min: 0, max: 1},
                                     {id: 'contenido', range: 'nuevo', min: 0, max: 1},
                                     ]);
    
    
    vie.types.add('lista1', [
           {
             id: 'caracteristicasTipoRel',
 			  range: 'Caracteristica',
             min: 0,
             max: -1
           }
         ]);
    
    vie.service('rdfa').setTemplate('Caracteristica', 'caracteristicasTipoRel', jQuery('#SectionCar').html());
    return vie;
}

function configureEditorsHere() {
	  jQuery('body').midgardCreate('configureEditor', 'default', 'halloWidget', {
			plugins: {'halloformat': {},'halloblock': {},'hallolists': {},'hallolink': {},'halloreundo': {},}});
	  
	  jQuery('body').midgardCreate('configureEditor', 'plaintext', 'halloWidget', {
			plugins: {'halloreundo': {}}});
	  
	  jQuery('body').midgardCreate('setEditorForProperty', 'TextSimple', 'plaintext');
	  
      jQuery('body').midgardCreate('configureEditor', 'nuevo', 'halloWidget', {
          plugins: {
            halloformat: {},
            halloblacklist: {
              tags: ['br']
            }
          }
        });
}

(function($) {
	
	skel.breakpoints({
		xlarge: '(max-width: 1680px)',
		large: '(max-width: 1140px)',
		medium: '(max-width: 980px)',
		small: '(max-width: 736px)',
		xsmall: '(max-width: 480px)',
		xxsmall: '(max-width: 320px)'
	});

	$(function() {

		var	$window = $(window),
			$body = $('body');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 250);
			});

		// Fix: Placeholder polyfill.
			//$('form').placeholder();

		// Prioritize "important" elements on mobile.
			skel.on('+mobile -mobile', function() {
				$.prioritize(
					'.important\\28 mobile\\29',
					skel.breakpoint('mobile').active
				);
			});

		// Scrolly.
			$('.scrolly').scrolly();

	});

})(jQuery);