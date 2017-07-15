
var CARGANDO_CLIENTES = 'Leyendo clientes...';
var CARGANDO_EVENTOS = 'Leyendo sesiones...';
var REALIZANDO_ACCION = 'Realizando acción...';

var acciones = [CARGANDO_CLIENTES];

var POPUP_W;
var POPUP_H;
var HOY = parseInt(new Date().getTime()/1000);

var FORMATO_FECHA = 'dd/mm/yyyy';
var FORMATO_FECHA2 = 'DD/MM/YYYY';
var PATRON_FECHA = /(\d{2})\/(\d{2})\/(\d{4})/;

function ajustarPopUps() {
	POPUP_W = $( window ).width()*6/7;
	POPUP_H = $( window ).height()*6/7;
}

ajustarPopUps();

var openSelect = function(selector){
    var element = selector[0], worked = false;
   if (document.createEvent) { // all browsers
       var e = document.createEvent("MouseEvents");
       e.initMouseEvent("mousedown", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
       worked = element.dispatchEvent(e);
   } else if (element.fireEvent) { // ie
       worked = element.fireEvent("onmousedown");
   }
   if (!worked) { // unknown browser / error
       alert("It didn't worked in your browser.");
   }   
}

function asignarTextoEspera() {
	$('#id_div_espera').html('<ul><li>'+acciones.join('</li><li>')+'</li></ul>');
}

function esperar(nombre) {
	acciones.push(nombre);
	asignarTextoEspera();
	$('#id_div_espera').removeClass('invisible');
}

function listo(nombre) {
	var indice = acciones.indexOf(nombre);
	if (indice >= 0) {
		acciones.splice(indice, 1);
		asignarTextoEspera();
		if (acciones.length == 0) {
			$('#id_div_espera').addClass('invisible');
		}
	}
}

function hasAttribute(self, llave) {
	var opciones = self.attr(llave);
	return (typeof opciones !== typeof undefined && opciones !== false);
}

function objToDict(obj) {
	var dicci = {}
	$.each( obj, function( key, value ) {
		dicci[key] = value;
	});
	return dicci;
}

function dictToObj(dict, obj) {
	for (llave in dict) {
		obj[llave] = dict[llave];
	}
}

var funcionLlenarForm = function(objeto, mapa) {
	for (llave in mapa) {
		var valor = mapa[llave];
		var attrform = objeto.find('.fastedit[data-name="'+llave+'"]');
		if (attrform.length > 0) {
			var fun = attrform.data('asignar');
			if (fun) {
				fun(valor);
			}
		}
	}
}

var funcionLeerFormulario = function(elform) {
	var envio = {};
	elform.find('.fastedit').each(function(i, elem) {
		var self = $(this);
		if (hasAttribute(self, 'data-options')) {
			//Es select
			envio[self.attr('data-name')] = self.attr('data-valor');
		} else {
			if (hasAttribute(self, 'data-longtext')) {
				envio[self.attr('data-name')] = self.html();
			} else if (hasAttribute(self, 'fecha')) {
				//convertir del formato a unix
				var partes = PATRON_FECHA.exec(self.text());
				if (partes.length == 4) {
					//El mes comienza en 0 :/
					nuevoValor = parseInt(new Date(partes[3], parseInt(partes[2])-1, partes[1]).getTime()/1000);
					envio[self.attr('data-name')] = nuevoValor;
				} else {
					envio[self.attr('data-name')] = null;
				}
			} else {
				//Es input
				envio[self.attr('data-name')] = self.text();
			}
		}
	});
	return envio;
};

$(document).ready(function() {
	
	//Prepara el formulario de eventos, esconde y muestra de acuerdo al valor del servicio
	var actualizarFormDeSrv = function(elem) {
		var campo = elem.find('.fastedit[data-name="srv"]');
		if (campo !== undefined) {
			var valSrv = campo.attr('data-valor');
			
			$('#dialog-form-event').find('.srv-x').css({display: 'none'});
			$('#dialog-form-event').find('.srv-x.srv-'+valSrv).css({display: 'block'});
			
			if (valSrv != '7') {
				//No es un pago
				if (valSrv in colores_srv_max_per) {
					var maxper = colores_srv_max_per[valSrv];
					asignarValorEvento('#dialog-form-event','maxper', maxper);
				}
			}
		}
	};
	
	var cliente_predefinido = {
		"title": "",
		"srv":"4",
		"maxper":"4",
		"obs":"",
		"cel":"",
		"tel":"",
		"eps":"",
		"cumple": HOY
	};

	var fisioterapeutas = [
		           			{ id: '1', title: 'Vanessa Mendez' },
		        			{ id: '0', title: 'Otra persona'}
		        		];
	
	var opc_fisios = {};
	for (i=0; i<fisioterapeutas.length; i++) {
		opc_fisios[fisioterapeutas[i]['id']] = {'texto':fisioterapeutas[i]['title']}
	}
	
	var eventoPredefinido = {
		"obs":"",
		"resourceId":'0'
	};
	
	var colores_srv = {
		"1":{"color":"#00acfa", "texto":"Mamás"},
		"2":{"color":"#ba005f", "texto":"Novias"},
		"3":{"color":"#8eb700", "texto":"Dual"},
		"4":{"color":"#ff3f00", "texto":"Grupal"},
		"5":{"color":"#DD53B1", "texto":"Valoración"},
		"6":{"color":"#222222", "texto":"Revaloración"},
	};
	
	var colores_srv2 = $.extend(true, {}, colores_srv);
	colores_srv2['7'] = {"color":"#000099", "texto":"Pago"};
	
	var opc_max_per = {
			"0": {"texto": "0"},
			"1": {"texto": "1"},
			"2": {"texto": "2"},
			"3": {"texto": "3"},
			"4": {"texto": "4"},
			"5": {"texto": "5"},
			"6": {"texto": "6"},
			"7": {"texto": "7"},
			"8": {"texto": "8"}
	};
	
	var opc_srvmeses = {
			"1": {"texto": "1 Mes"},
			"2": {"texto": "2 Meses"},
			"3": {"texto": "1 Trimestre"},
			"6": {"texto": "1 Semestre"},
			"12": {"texto": "1 Año"},
	};
	
	var opc_sesionesmes = {
			"4": {"texto": "1 vez/semana"},
			"8": {"texto": "2 veces/semana"},
			"12": {"texto": "3 veces/semana"},
			"16": {"texto": "4 veces/semana"},
			"20": {"texto": "5 veces/semana"},
			"24": {"texto": "6 veces/semana"},
	};
	
	var colores_srv_max_per = {
			"1":"2",
			"2":"4",
			"3":"2",
			"4":"4",
			"5":"1",
			"6":"1",
			"7":"0",
	};
	
	function asignarValorEvento(formulario, llave, valor) {
		var asignar = $(formulario+' .fastedit[data-name="'+llave+'"]').data('asignar');
		if (asignar) {
			asignar(valor);
		}
	}
	
	$('#dialog-form .fastedit[data-name="srv"]').attr('data-options', JSON.stringify(colores_srv));
	$('#dialog-form-event .fastedit[data-name="srv"]').attr('data-options', JSON.stringify(colores_srv2));
	$('#dialog-form .fastedit[data-name="maxper"]').attr('data-options', JSON.stringify(opc_max_per));
	$('#dialog-form-event .fastedit[data-name="maxper"]').attr('data-options', JSON.stringify(opc_max_per));
	
	$('#dialog-form-event .fastedit[data-name="srvpagado"]').attr('data-options', JSON.stringify(colores_srv));
	$('#dialog-form-event .fastedit[data-name="srvmeses"]').attr('data-options', JSON.stringify(opc_srvmeses));
	$('#dialog-form-event .fastedit[data-name="sesionesmes"]').attr('data-options', JSON.stringify(opc_sesionesmes));
	
	$('#dialog-form-event .fastedit[data-name="resourceId"]').attr('data-options', JSON.stringify(opc_fisios));	
	

	
	$('#dialog-form-event .fastedit[data-name="srv"]').data('change', function(valor) {
		actualizarFormDeSrv($('#dialog-form-event'));

	});
	
	$('#dialog-form .fastedit[data-name="srv"]').data('change', function(valor) {
		if (valor in colores_srv_max_per) {
			var maxper = colores_srv_max_per[valor];
			asignarValorEvento('#dialog-form','maxper', maxper);
		}
	});
	
	$('#cliente-clean').on('click', function() {
		$('#buscadorq').val('');
		$('#buscadorq').keyup();
	});
	
	var leyenda = $('#leyenda-srv');
	for (tipo in colores_srv2) {
		var eltipo = colores_srv2[tipo];
		leyenda.append($('<li class="leyenda-li" style="background-color: '+eltipo['color']+'">'+eltipo['texto']+'</li>'));
	}
	
	/* initialize the external events
	-----------------------------------------------------------------*/
	function activarCliente(elem) {
		// store data so the calendar knows to render an event upon drop
		var datos = elem.data("datos");
		elem.text(datos['title']);
		var miservicio = datos['srv'];
		var mimaxper = datos['maxper'];
		var micolor = colores_srv[miservicio]['color'];
		var micliente = elem.attr('data-id');
		elem.css('background-color', micolor);
		
		eventoNuevo = $.extend({},eventoPredefinido);
		eventoNuevo['title'] = $.trim(elem.text());
		eventoNuevo['color'] = micolor;
		eventoNuevo['persona'] = micliente;
		eventoNuevo['srv'] = miservicio;
		eventoNuevo['maxper'] = mimaxper;
		eventoNuevo['stick'] = true;
		
		elem.data('event', eventoNuevo);

		// make the event draggable using jQuery UI
		elem.draggable({
			zIndex: 999,
			revert: true,      // will cause the event to go back to its
			revertDuration: 0  //  original position after the drag
		});
		
		if (!hasAttribute(elem, 'data-id')) {
			console.log('Elemento no tiene id');
			return;
		}
		
		var funcionClick = function() {
			//lleno los datos en el formulario
			var elDialogo = $('#dialog-form');
			elDialogo.data('id', elem);
			
			var mapa = elem.data("datos");
			funcionLlenarForm(elDialogo, mapa);
			//elimino el detalle
			elDialogo.find('.todo-detalle').hide();
			dialog.dialog("open");
		};
		
		elem.unbind('click', funcionClick);
		elem.bind('click', funcionClick);
	};
	
	$('.fastedit').each(function(i, elem) {
		var self = $(this);

		self.hover(function() {
			self.addClass('hover');
		}, function() {
			self.removeClass('hover');
		});
		
		if (hasAttribute(self, 'data-options')) {
			var opciones = self.attr('data-options');
			if (opciones.length > 0) {
				var listaOpc = JSON.parse(opciones);
				var replaceWith = '<select class="editando" name="'+self.attr('data-name')+'">';
				for (var llave in listaOpc) {
					replaceWith += '<option value="'+llave+'">'+listaOpc[llave]['texto']+'</option>';
				}
				replaceWith += '</select>';
				var tagName = 'SELECT';
			}
		} else {
			if (hasAttribute(self, 'data-longtext')) {
				var replaceWith = '<textarea rows="5" class="editando" name="'+self.attr('data-name')+'" type="text" />';
				var tagName = 'TEXTAREA';
			} else {
				var replaceWith = '<input class="editando" name="'+self.attr('data-name')+'" type="text" />';
				var tagName = 'INPUT';
			}
		}
		
		self.data('asignar', function(valor) {
			if (tagName == 'SELECT') {
				self.attr('data-valor', valor);
				var miopcion = listaOpc[valor];
				if (miopcion)
					self.text(miopcion['texto']);
			} else if (tagName == 'INPUT') {
				if ((''+valor).trim().length == 0) {
					self.addClass("sintexto");
				} else {
					self.removeClass("sintexto");
				}
				if (hasAttribute(self, 'fecha')) {
					//convierte de unix (s) a fecha
					valorNuevo = moment(valor*1000).format(FORMATO_FECHA2);
					self.text(valorNuevo);
				} else {
					self.text(valor);	
				}
			} else if (tagName == 'TEXTAREA') {
				if (valor.trim().length == 0) {
					self.addClass("sintexto");
				} else {
					self.removeClass("sintexto");
				}
				self.html(valor);
			}
		});
		
		replaceWith = $(replaceWith);
		
		replaceWith.hide();
		self.after(replaceWith);
		if (hasAttribute(self, 'fecha')) {
			replaceWith.datepicker({
				format: FORMATO_FECHA,
				autoclose: true,
			});
			replaceWith.unbind('change').bind('change', function() {//TODO 1
				self.text($(this).val());
				replaceWith.hide();
				self.show();
			});
		}
		
		self.click(function() {
			self.data('prev', self.text());
			
			if (tagName == 'SELECT') {
				replaceWith.val(self.attr('data-valor'));
			} else if (tagName == 'INPUT') {
				replaceWith.val(self.text());
				
			if (hasAttribute(self, 'fecha')) {
				replaceWith.datepicker('update', self.text());
			}
				
			} else if (tagName == 'TEXTAREA') {
				replaceWith.val(self.html().replace(/(<br)(\s*)\/?>/g, '\n'));
			}
			
			self.hide();
			replaceWith.show();
			replaceWith.focus();
			
			if (tagName == 'SELECT') {
				replaceWith.show();
				replaceWith[0].size = Math.min(listaOpc.length, 5);
				openSelect(replaceWith);
				replaceWith.unbind('change').bind('change', function(eve) {//TODO 2
					$(this).blur();
					var cambio = self.data('change');
					if (cambio) {
						cambio(replaceWith.val());
					}
				});
			} else if (tagName == 'INPUT') {
				replaceWith.on('keydown', function(event) {
					self.text($(this).val());
				});
			} else if (tagName == 'TEXTAREA') {
				replaceWith.on('keydown', function(event) {
					self.html($(this).val().replace(/\n/g, '<br>'));
				});
			}

			replaceWith.on('keyup', function(event) {
				if (event.which == 13 && tagName != 'TEXTAREA') {
					$(this).blur();
				}
				if (event.keyCode == 27) {//TODO esto no está usandose
					self.text(self.data('prev'));
					$(this).hide();
					self.show();
				}
			});
			
			replaceWith.on('blur', function(event) {
				if ($(this).val() != null) {
					if (tagName == 'SELECT') {
						self.text($(this).find(":selected").text());
						self.attr('data-valor', $(this).val());
					} else if (tagName == 'INPUT') {
						if (hasAttribute(self, 'fecha')) {
							if ($(this).val().length > 0) {
								self.text($(this).val());
							}
						} else {
							self.text($(this).val());
						}
					} else if (tagName == 'TEXTAREA') {
						self.html($(this).val().replace(/\n/g, '<br>'));
					}
				}
				$(this).hide();
				self.show();
			});
		});
	
	});
	

	function hayValor(algo) {
		return (algo !== undefined && algo !== null);
	}
	
	//-------------------------------------------
	function detalleCliente() {
		//Se debe buscar el cliente
		var elem = $('#dialog-form').data('id');
		if (hayValor(elem)) {
			var datos = elem.data("datos");
			if (hayValor(datos)) {
				var id = datos.id;
				
				esperar(CARGANDO_EVENTOS);
				$.ajax({
					"type": "GET",
					"url": "/citas?start=2016-01-01&end=3016-08-07&persona="+id
				})
				.done(function( citas ) {
					var tpl = $('#tpl-detalle').text();
					var padreDestino = $('#dialog-form .todo-detalle');
					var destino = $('#dialog-form .todo-detalle .panel-body');
					padreDestino.show();
					destino.empty();
					
					for (var i=0; i<citas.length; i++) {
						//Preproceso de cada cita
						//fecha
						var fechaInicio = citas[i].start;
						
						var fechaLeida = moment(fechaInicio, moment.ISO_8601);
						
						citas[i]._dia = fechaLeida.format('D');
						citas[i]._mes = fechaLeida.format('MMM');
						citas[i]._anio = fechaLeida.format('YYYY');
						citas[i].srvName = colores_srv2[citas[i].srv].texto;
						
						if (hayValor(colores_srv[citas[i].srvpagado])){
							citas[i]._srvpagado = colores_srv[citas[i].srvpagado].texto;
						}
						if (hayValor(opc_srvmeses[citas[i].srvmeses])){
							citas[i]._srvmeses = opc_srvmeses[citas[i].srvmeses].texto;
						}
						if (hayValor(opc_sesionesmes[citas[i].sesionesmes])){
							citas[i]._sesionesmes = opc_sesionesmes[citas[i].sesionesmes].texto;
						}
						
						var nuevo = $(tpl);
						$.each(citas[i], function(llave, valor) {
							var unCampo = nuevo.find('.'+llave);
							unCampo.text(valor);
						});
						destino.append(nuevo);
					}
					
					listo(CARGANDO_EVENTOS);
				})
				.fail(function( jqXHR, textStatus ) {
					$.notify("Error cargando eventos. "+textStatus, "error");
					listo(CARGANDO_EVENTOS);
				});
			}
		}
	}
	
	function guardarCliente() {
		var id = $('#dialog-form').data('id');
		if (id === null) {
			//nuevo
			var nuevo = funcionLeerFormulario($('#dialog-form'));
			funcCrearActualizar({'payload': nuevo, 'leng': null}, function() {
				$.notify('Error creando cliente', "error");
			}, function(mensaje) {
				var nuevoDicci = objToDict(mensaje.payload);
				var elemento = crearObjetoCliente(nuevoDicci);
				$("#clientes-container").prepend(elemento);
				activarCliente(elemento);
				$( "#dialog-form" ).dialog("close");
			}, 'PUT', '/rest/Cliente/');
		} else {
			//viejo
			var viejo = funcionLeerFormulario($('#dialog-form'));
			funcCrearActualizar({'payload': viejo, 'leng': null}, function() {
				$.notify('Error actualizando cliente', "error");
			}, function() {
				id.data("datos", viejo);
				activarCliente(id);
				$( "#dialog-form" ).dialog("close");
			}, 'PUT', '/rest/Cliente/'+id.attr("data-id"));
		}
	};
	
	function redefinirConfirmar(funcionAceptar) {
		confirmar.dialog("open");
		confirmar.dialog({
			buttons: {
				"Sí": function() {
					funcionAceptar();
					confirmar.dialog( "close" );
				},
				Cancel: function() {
					confirmar.dialog( "close" );
				}
			}
		});
	}
	
	function borrarCliente() {
		
		redefinirConfirmar(function() {
			var id = $('#dialog-form').data('id');
			if (id !== null) {
				funcCrearActualizar(null, function() {
					$.notify('Error eliminando cliente', 'error');
				}, function() {
					id.remove();
					$( "#dialog-form" ).dialog("close");
				}, 'DELETE', '/rest/Cliente/'+id.attr("data-id"));
			}
		});
	};
	
	$( "#dialog-form form").submit(function( event ) {
		guardarCliente();
		event.preventDefault();
	});
	
	var confirmar = $('#dialog-form-confirm').dialog({
		  autoOpen: false,
		  height: 200,
		  width: 400,
		  modal: true,
		  buttons: {
			"Sí": function() {
				console.log('sí');
			},
			Cancel: function() {
				confirmar.dialog( "close" );
			}
		  },
		  close: function() {
		  }
		});
	
	var dialog = $( "#dialog-form" ).dialog({
	  autoOpen: false,
	  height: POPUP_H,
	  width: POPUP_W,
	  modal: true,
	  buttons: {
		"Guardar": guardarCliente,
		"Borrar": borrarCliente,
		"Detalle": detalleCliente,
		Cancel: function() {
		  dialog.dialog( "close" );
		}
	  },
	  close: function() {
		//form[ 0 ].reset();
		//allFields.removeClass( "ui-state-error" );
	  }
	});
	
	var llenarEvento = function(envio, evento) {
		evento.title = envio['title'];
		evento.color = colores_srv2[envio['srv']]['color'];
	}
	
	var guardarEventoFun = function() {
		var evento = $('#dialog-form-event').data('evento');
		var envio = funcionLeerFormulario($('#dialog-form-event'));
		envio['id'] = evento.id;
		envio['color'] = colores_srv2[envio['srv']]['color'];
		funcCrearActualizar(envio, function() {
				$.notify('Error actualizando sesión', "error");
			}, function() {
				dictToObj(envio, evento);
				llenarEvento(envio, evento);
				$('#calendar').fullCalendar('updateEvent', evento);
				dialog2.dialog( "close" );
			});
	};
	

	
	var dialog2 = $( "#dialog-form-event" ).dialog({
		  autoOpen: false,
		  height: POPUP_H,
		  width: POPUP_W,
		  modal: true,
		  buttons: {
			"Guardar": guardarEventoFun,
			Cancel: function() {
				dialog2.dialog( "close" );
			},
			"Borrar": function() {
				redefinirConfirmar(function() {
					var evento = $('#dialog-form-event').data('evento');
					funcCrearActualizar(null, function() {
						$.notify('Error eliminando sesión', 'error');
					}, function() {
						$('#calendar').fullCalendar( 'removeEvents', evento.id);
						$('#calendar').fullCalendar("rerenderEvents");
						dialog2.dialog( "close" );
					}, 'DELETE', "/citas/?id="+evento.id);
				});
			}
		  },
		  close: function() {
			//form[ 0 ].reset();
			//allFields.removeClass( "ui-state-error" );
		  }
		});
	
	$( "#dialog-form-event form").submit(function( event ) {
		guardarEventoFun();
		event.preventDefault();
	});
	
	$('#external-events .fc-event').each(function() {
		activarCliente($(this));
	});
	
	$('#cliente-add').on('click', function() {
		$('#dialog-form').data('id', null);
		funcionLlenarForm($('#dialog-form'), cliente_predefinido);
		dialog.dialog( "open");
	});
	
	$('#buscadorq').on('keyup', function() {
		var self = $(this);
		var contenedor = $('#external-events');
		var q = self.val();
		var pattern = new RegExp('(.*)('+q+')(.*)', 'i');
		contenedor.find('.fc-event').each(function(i, elem) {
			if (!pattern.test($(elem).text())) {
				$(elem).addClass('invisible');
			} else {
				$(elem).removeClass('invisible');
			}
		});
	});


	/* initialize the calendar
	-----------------------------------------------------------------*/
	
	var ajustarDims = function () {
		var altura = $( window ).height();
		$('#calendar').fullCalendar('option', 'height', altura-50);
		$('#external-events').css('height', altura-70);
		$('#clientes-container').css('height', altura-330);
		ajustarPopUps();
		$( "#dialog-form-event" ).dialog( "option", "width", POPUP_W );
		$( "#dialog-form-event" ).dialog( "option", "height", POPUP_H );
		$( "#dialog-form" ).dialog( "option", "width", POPUP_W );
		$( "#dialog-form" ).dialog( "option", "height", POPUP_H );
	};
	
	$( window ).resize(function() {
		ajustarDims();
	});	

	var duracionPre = moment.utc("1970-01-01T01:00:00");
	
	var funcCrearActualizar = function(envio, revertFunc, exitoFunc, metodo, url) {
		esperar(REALIZANDO_ACCION);
		var carga = {};
		
		if (metodo === null || metodo === undefined) {
			metodo = 'PUT';
		}
		
		if (url === null || url === undefined) {
			url = "/citas/";
		}
		
		carga['type'] = metodo;
		carga['url'] = url;
		
		if (metodo == 'PUT') {
			carga['data'] = JSON.stringify(envio);
			carga['contentType'] = "application/json; charset=utf-8";
		}
		
		$.ajax(carga)
		.done(function( msg ) {
			if (msg.error == 0) {
				console.log('OK');
				if (exitoFunc !== null && exitoFunc !== undefined) {
					exitoFunc(msg);
				}
			} else {
				console.log(msg.msg);
			}
			listo(REALIZANDO_ACCION);
		})
		.fail(function( jqXHR, textStatus ) {
			if (revertFunc !== null && revertFunc !== undefined) {
				revertFunc();
			} else {
				$.notify('Error creando o actualizando. '+textStatus, "error");
			}
			listo(REALIZANDO_ACCION);
		});
	};
	
	function crearObjetoCliente(dicci) {
		var plantillaCli = "<div class='fc-event' data-id=''></div>";
		var elemento = $(plantillaCli);
		elemento.attr("data-id", dicci['id']);
		elemento.data("datos", dicci);
		return elemento;
	}
	
	function leerClientes() {
		$.ajax({
			"type": "GET",
			"url": "/rest/Cliente/"
		})
		.done(function( clientes ) {
			var contClientes = $("#clientes-container");
			for (var i=0; i<clientes.length; i++) {
				var cliente = objToDict(clientes[i]);
				var elemento = crearObjetoCliente(cliente);
				contClientes.append(elemento);
				activarCliente(elemento);
			}
			listo(CARGANDO_CLIENTES);
		})
		.fail(function( jqXHR, textStatus ) {
			$.notify("Error cargando clientes. "+textStatus, "error");
			listo(CARGANDO_CLIENTES);
		});
	}
	
	var ultimoAgregado = null;
	
	function getEndUnix(event) {
		if (event.end == null || event.end === undefined) {
			return event.start.unix() + duracionPre.unix();
		}
		return event.end.unix();
	}
	
	$('#calendar').fullCalendar({
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'agendaDay,agendaWeek,month'
		},
		defaultView: 'agendaWeek',
		defaultTimedEventDuration: duracionPre.format('hh:mm:ss'),
		resources: fisioterapeutas,
		editable: true,
		eventLimit: true, // allow "more" link when too many events
		events: {
			url: '/citas/',
			error: function() {
				$.notify("Error cargando las sesiones", "error");
			}
		},
		loading: function(valor) {
			if (valor == true) {
				esperar(CARGANDO_EVENTOS);
			} else {
				listo(CARGANDO_EVENTOS);
			}
		},
		droppable: true, // this allows things to be dropped onto the calendar
		eventDrop: function(event, delta, revertFunc, jsEvent, ui, view) {
			console.log('event drop');
			if (event.id === undefined) {
				$.notify('error! event.id='+event.id, "error");
				revertFunc();
				return;
			}
			var envio = {"id":event.id, "start": event.start.unix(), "end": getEndUnix(event)};
			funcCrearActualizar(envio, revertFunc);
		},
		eventResize: function(event, delta, revertFunc, jsEvent, ui, view) {
			var envio = {"id":event.id, "start": event.start.unix(), "end": getEndUnix(event)};
			funcCrearActualizar(envio, revertFunc);
		},
		eventReceive: function(event) {
			funcCrearActualizar(ultimoAgregado, null, function(temp) {
				event.id = Number(temp['rta']['id']);//se debe asignar
				//$('#calendar').fullCalendar( 'refetchEvents' );
				$('#calendar').fullCalendar( 'rerenderEvents' );
				$('#calendar').fullCalendar('updateEvent',event);
				ultimoAgregado = null;
			});
		},
		eventClick: function(event, element) {
			$('#dialog-form-event').data('evento', event);
			//lleno los datos en el formulario
			var mapa = objToDict(event);//{"nombres": event.title};
			var elFormulario = $('#dialog-form-event');
			funcionLlenarForm(elFormulario, mapa);
			actualizarFormDeSrv(elFormulario);
			dialog2.dialog( "open");
	    },
		drop: function(inicio, jsEvent, ui, resourceId) {
			//resourceId es el calendario!
			//http://fullcalendar.io/docs/dropping/drop/
			var persona = $(jsEvent.target);
			var detalle = persona.data('event');
			if (detalle != undefined) {
				var start = inicio.unix();
				var end = start+duracionPre.unix();
				
				var envio = JSON.parse(JSON.stringify(detalle));
				envio['start'] = start;
				envio['end'] = end;
				ultimoAgregado = envio;
			}
		}
	});
	
	ajustarDims();
	leerClientes();
});