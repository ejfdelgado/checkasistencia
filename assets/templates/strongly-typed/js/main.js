/*
	Strongly Typed by HTML5 UP
	html5up.net | @n33co
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

function activarShowPop(objeto) {
	objeto.find(".featured").each(function (index, element) {
		var self = $(element);
		var padre = self.closest("section");
		var hermano = padre.find('.popupclient.elem1');
		var btnHermano = padre.find(".popupclient_btn");
		
		self.on("click", function(e) {
			if (!e.shiftKey) {
				hermano.removeClass('invisible');
				btnHermano.removeClass('invisible');
			}
		});
		
		btnHermano.on('click', function(e) {
			hermano.addClass('invisible');
			btnHermano.addClass('invisible');
		});
	});
}

activarShowPop($("[typeof='Gallery']"));

function getVieHere() {
	var vie = new VIE();
    vie.use(new vie.RdfaService());
    
    vie.types.add('Gallery', [
                              {id: 'titulo', range: 'Text', min: 0, max: 1},
                              {id: 'contenido', range: 'Text', min: 0, max: 1},
                              ]);
    
    vie.types.add('lista1', [
                             {
                               id: 'galleryTipoRel',
                   			  range: 'Gallery',
                               min: 0,
                               max: -1
                             }
                           ]);
    
    vie.service('rdfa').setTemplate('Gallery', 'galleryTipoRel', jQuery('#SectionGallery').html());
    
    return vie;
}

function configureEditorsHere() {
	  jQuery('body').midgardCreate('configureEditor', 'default', 'halloWidget', {
			plugins: {'halloformat': {},'halloblock': {},'hallolists': {},'hallolink': {},'halloreundo': {},}});
	  
	  jQuery('body').midgardCreate('configureEditor', 'plaintext', 'halloWidget', {
			plugins: {'halloreundo': {}}});
	  
	  jQuery('body').midgardCreate('setEditorForProperty', 'TextSimple', 'plaintext');
}

(function($) {

	skel
		.breakpoints({
			desktop: '(min-width: 737px)',
			tablet: '(min-width: 737px) and (max-width: 1200px)',
			mobile: '(max-width: 736px)'
		})
		.viewport({
			breakpoints: {
				tablet: {
					width: 1080
				}
			}
		});

	$(function() {

		var	$window = $(window),
			$body = $('body');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				$body.removeClass('is-loading');
			});

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on mobile.
			skel.on('+mobile -mobile', function() {
				$.prioritize(
					'.important\\28 mobile\\29',
					skel.breakpoint('mobile').active
				);
			});

		// CSS polyfills (IE<9).
			if (skel.vars.IEVersion < 9)
				$(':last-child').addClass('last-child');

		// Dropdowns.
			$('#nav > ul').dropotron({
				mode: 'fade',
				noOpenerFade: true,
				hoverDelay: 150,
				hideDelay: 350
			});

		// Off-Canvas Navigation.

			// Title Bar.
				$(
					'<div id="titleBar">' +
						'<a href="#navPanel" class="toggle"></a>' +
					'</div>'
				)
					.appendTo($body);

			// Navigation Panel.
				$(
					'<div id="navPanel">' +
						'<nav>' +
							$('#nav').navList() +
						'</nav>' +
					'</div>'
				)
					.appendTo($body)
					.panel({
						delay: 500,
						hideOnClick: true,
						hideOnSwipe: true,
						resetScroll: true,
						resetForms: true,
						side: 'left',
						target: $body,
						visibleClass: 'navPanel-visible'
					});

			// Fix: Remove navPanel transitions on WP<10 (poor/buggy performance).
				if (skel.vars.os == 'wp' && skel.vars.osVersion < 10)
					$('#titleBar, #navPanel, #page-wrapper')
						.css('transition', 'none');

	});
})(jQuery);
