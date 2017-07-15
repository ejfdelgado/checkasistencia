

(function($) {
	
	//Se agrega el elemento que permitira subir archivos
	$( "body" ).append( $( "<input type='file' id=\"formularioImagenes\" class=\"fileEscondido\" nodo2=\"\" property2=\"\" />" ) );
	
	//Se agrega el elemento que permite editar html
	$( "body" ).append($(
		'<div class="formhtml invisible">'+
		'	<div class="ctrles"><a class="guardar">Guardar</a>&nbsp;<a class="cancelar">Cancelar</a></div>'+
		'	<div class="boxtexto">'+
		'	<textarea></textarea>'+
		'	</div>'+
		'</div>'
	));
	
	function activarEstilosEditables(objeto) {
		objeto.find('[styleProperty]').each(function (index, element) {
			var self = $(element);
			if(self.attr("act_style") !== "ok") {
				var propiedad = self.attr('styleProperty');
				var padre;
				if (self.attr('about') !== undefined) {
					padre = self; 
				} else {
					padre = self.closest('[about]');
				}
				if (padre === undefined) { return; }
				var nuevo = $('<textarea style="display: none;" property="'+propiedad+'" class="editable"></textarea>');
				nuevo.text(self.attr('style'));
				padre.append(nuevo);
				
				nuevo.change(function() {
					var texto = nuevo.val();
					texto = texto.replace(/"/g, '&quot;');
					self.attr('style', texto);
				});

				self.on("click", function(e) {
					if (e.shiftKey) {
						nuevo.click();
					}
				});
				
				self.attr("act_style", "ok");
			}
		});
	};
	
	activarEstilosEditables($('body'));	
	
	//------------------imagenes---------------------
	//Todas las imágenes podrán cambiar con click
	  var abrirFileChooser = function(e) {
		  if ($('#midgardcreate-save').css('display') === 'none') {return;}
		  
		  var self = e;
		  var padre;
		  if (self.attr('about') !== undefined) {
			  padre = self;
		  } else {
			  padre = self.closest('[about]');
		  }
		  
		  if (padre === undefined) {return;}
		  
		  var ident = padre.attr('about');
		  var propiedad = self.attr('property');
		  if (ident === undefined || propiedad === undefined) {return;}
		  
		  $(".formhtml").attr('nodo2', ident);
		  $(".formhtml").attr('property2', propiedad);
		  if (self.prop("tagName") == 'IMG') {
			  $('.formhtml textarea').val(self.attr('src'));
		  }
		  $('.formhtml').removeClass('invisible');
		  pila.push("formhtml");
		  
	  }
	  
		function activarImagenes(objeto) {
			objeto.find('img[property]').each(function (index, element) {
				var actual = $(element);
				if(actual.attr("act_img") !== "ok") {
					$(element).click(function() {
						abrirFileChooser($(element));
					});
					actual.attr("act_img", "ok");
				}
			});
		}
		activarImagenes($('body'));
		//------------------imagenes---------------------

		//------------------html editables---------------------
		function activarEditables(objeto) {
			objeto.find('.editable').each(function (index, element) {
				var actual = $(element);
				if(actual.attr("act_edt") !== "ok") {
					actual.on('click', function() {
						var padre = actual.closest('[about]');
						if (padre) {
							if ($('#midgardcreate-save').css('display') === 'none') {return;}
							$(".formhtml").attr('nodo2', padre.attr('about'));
							$(".formhtml").attr('property2', actual.attr('property'));
							$('.formhtml textarea').val(actual.html());
							$('.formhtml').removeClass('invisible');
							pila.push("formhtml");
						}
					});
					actual.attr("act_edt", "ok");
					//Se intenta agregar un elemento que permita edición después de creación
					if (!actual.hasClass('textarea_background')) {//? TODO decidir se para los fondos se va a hacer así
						var nuevoBoton = $('<button type="button" style="padding: 5px !important;">editar</button>');
						nuevoBoton.bind('click', function() {
							actual.click();
						});
						actual.after(nuevoBoton);
					}
				}
			});
		}
		activarEditables($('body'));
		//------------------html editables---------------------
		
		function activarTextoPlano(objeto) {
			objeto.find('[textplain="true"]').each(function (index, element) {
				var actual = $(element);
				if(actual.attr("act_tpl") !== "ok") {
					actual.on('change keyup paste', function() {
						actual.html(actual.text());
					});
					actual.attr("act_tpl", "ok");
				}
			});
		}
		activarTextoPlano($('body'));
		
		
		//------------------html fechas---------------------
		function activarFechas(objeto) {
			objeto.find("[dateProperty]").each(function(index, element) {
				var actual = $(element);
				var nomPropiedad = actual.attr("dateProperty");
				if(actual.attr("act_date") !== "ok") {
					var padre = actual.closest('[about]');
					if (padre) {
						var valorViejo = formatearFecha(actual, 'dd/MM/yyyy');
						var nuevo = $('<input style="display: none;" class="datepicker" type="text" autofocuss value="'+valorViejo+'" data-valuee="'+valorViejo+'"></input>');
						padre.append(nuevo);
						//TODO verificar porque a veces no funciona
						actual.click(function() {
							nuevo.click();
							//nuevo.focus();
						});
						
						var nuevoProp = $('<div style="display: none;" property="'+nomPropiedad+'">'+actual.attr("data-value")+'</div>');
						padre.append(nuevoProp);
						
						nuevo.on('change', function() {
							var nomProp = nomPropiedad;
							var dato = {};
							
							var txtNueVal = "0";
							try {
								txtNueVal = parseInt((toDate(nuevo.val()).getTime())/1000);
							} catch (e) {}
							
							dato[nomProp] = txtNueVal;
							var modelo = vie.entities.get(padre.attr("about"));
							modelo.set(dato);
							  
							//para notificar a createjs que cambio
							var cambiados = $('body').data('Midgard-midgardStorage').changedModels;
							if (_.indexOf(cambiados, modelo) === -1) {
							  cambiados.push(modelo);
							}
							$('#midgardcreate-save').button({disabled: false});
							
							actual.attr("data-value", txtNueVal);
							nuevoProp.text(txtNueVal);
							formatearFecha(actual);
						});
						
						nuevo.pickadate({
							format: 'dd/mm/yyyy',
				            formatSubmit: 'dd/mm/yyyy',
				            closeOnSelect: true,
				            closeOnClear: true,
				            selectMonths: true,
				            selectYears: true
				        });
					}
					actual.attr("act_date", "ok");
				}
				
				
			});
		}
		activarFechas($('body'));
		//------------------html fechas---------------------
		
		//midgardeditableenable cuando una entidad es editable
		//midgardeditablechanged cuando la propiedad fue modificada
		//midgardeditableenableproperty al hacerse editable
		$('body').bind('midgardeditableenable',
			function(event, data) {
				var ident = data.entity['@subject'];
				var patronIdent = /(<)(.*)(>)/g;
				var matchIdent = patronIdent.exec(ident);
				if (matchIdent) {
					matchIdent = matchIdent[2];
				} else {
					matchIdent = ident;
				}
				
				var objeto = $("[about='"+matchIdent+"']");
				if (objeto !== undefined) {
					activarEstilosEditables(objeto);//debe ser antes que activarEditables
					activarImagenes(objeto);
					activarEditables(objeto);
					activarTextoPlano(objeto);
					activarFechas(objeto);
				}
			}
		);

	
	var vie = getVieHere();
     
	  // Instantiate Create
	  $('body').midgardCreate({
	    url: function() {
	      return 'javascript:false;';
	    },
	    vie: vie,
	    //toolbar: 'full',//full or minimized
	    highlight: false,
	    //state: 'edit',//browse or edit tiene problemas cuando muestra los controles de formato posibles
	    collectionWidgets: {
	    	'default': 'midgardCollectionAdd',
	      //'default': 'midgardCollectionAddBetween',
	      //'feature': 'midgardCollectionAdd'
	    },
	  });
	  
	  configureEditorsHere();
	  
	  var templatebotoneditar = "<div class='editableicon'></div>";
	  
	  $('.formhtml .cancelar').click(function() {
		  $('.formhtml').addClass('invisible');
		  if (pila[pila.length-1] === "formhtml") {pila.pop();}
	  });
	  
	  $('.formhtml .guardar').click(function() {
		  try {
			  formulario = $('.formhtml');
			  var nomNodo = formulario.attr('nodo2');
			  var nomProp = formulario.attr('property2');
			  var nuevo = $('.formhtml textarea').val();
			  var sql = "[about='"+nomNodo+"'] [property='"+nomProp+"']";
			  var sql2 = "[about='"+nomNodo+"'] [styleProperty='"+nomProp+"']";
			  
			  var objeto = $(sql);
			  var objeto2 = $(sql2);
			  
			  if (objeto.length > 0) {
				  var nombreTag = objeto.prop("tagName");
				  
				  if (nombreTag == 'IMG') {
					  objeto.attr( "src", nuevo );
				  } else {
					  if (nombreTag == 'TEXTAREA') {
						  if (objeto2.length > 0) {
							  nuevo = nuevo.replace(/"/g, '&quot;');
						  }
						  objeto.text(nuevo);
						  objeto.change();
					  } else {
						  objeto.html(nuevo);
					  }
				  }
				  
				  var dato = {};
		      	  dato[nomProp] = nuevo;
				  var modelo = vie.entities.get(nomNodo);
				  modelo.set(dato);
				  
				  //para notificar a createjs que cambio
				  var cambiados = $('body').data('Midgard-midgardStorage').changedModels;
				  if (_.indexOf(cambiados, modelo) === -1) {
					  cambiados.push(modelo);
				  }
				  $('#midgardcreate-save').button({disabled: false});
			  }
			  $('.formhtml').addClass('invisible');
			  if (pila[pila.length-1] === "formhtml") {pila.pop();}
		  } catch (e) {
			  $('body').data('Midgard-midgardNotifications').create({body: "Error "+e});
		  }
	  });
	  
	  $("#formularioImagenes").change( function readImage() {
		    if ( this.files && this.files[0] ) {
		        var FR = new FileReader();
		        FR.onload = function(e) {
		        	var formulario = $("#formularioImagenes");
		        	var nomNodo = formulario.attr('nodo2');
		        	var nomProp = formulario.attr('property2');
		        	var objeto = $("[about='"+nomNodo+"'] [property='"+nomProp+"']");
		        	var dato = {};
		        	dato[nomProp] = e.target.result;
		        	if (objeto) {
			        	if (objeto.prop("tagName") == 'IMG') {
			        		objeto.attr( "src", e.target.result );
			        	} else {
			        		//asigna la imagen en el estilo
			        		objeto.attr( "style", "background-image: url('"+e.target.result+"') !important");
			        	}
			        	
			        	var modelo = vie.entities.get(nomNodo);
			        	modelo.set(dato);
			        	
			        	//para notificar a createjs que cambio
						var cambiados = $('body').data('Midgard-midgardStorage').changedModels;
						if (_.indexOf(cambiados, modelo) === -1) {
							cambiados.push(modelo);
						}
						$('#midgardcreate-save').button({disabled: false});
		        	}
		        };       
		        FR.readAsDataURL( this.files[0] );
		    }
		} );
	  
	  $('textarea[property]').on('change keyup paste', function () {
		  self = $(this);
		  propiedad = self.attr('property');
		  padre = self.closest('[about]');
		  if (padre) {
			  ident = padre.attr('about');
			  valor = self.val();
			  
			  var dato = {};
	      	  dato[propiedad] = valor;
			  var modelo = vie.entities.get(ident);
			  modelo.set(dato);
			  
			  //para notificar a createjs que cambio
			  var cambiados = $('body').data('Midgard-midgardStorage').changedModels;
			  if (_.indexOf(cambiados, modelo) === -1) {
				  cambiados.push(modelo);
			  }
			  $('#midgardcreate-save').button({disabled: false});
		  }
	  });
})(jQuery);