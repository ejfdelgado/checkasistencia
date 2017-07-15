
var MAX_FILE_SIZE = 512*1024;
var FORMATO_FECHA = 'DD/MM/YYYY';
var PATRON_DIA = /^(\d{2})\/\d{2}/;
var PATRON_MES = /^\d{2}\/(\d{2})/;
var PATRON_CEDULA = /^(\D+)(\d+)$/ig;
var PATRON_CORREO = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ig;

String.prototype.toCamelCase = function(str) {
	str = str.toLocaleLowerCase();
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

var formatearFecha = function(dato) {
	try {
		return moment(new Date(dato)).format(FORMATO_FECHA)
	}catch(e) {
		return 'Sin Fecha';
	}
};

var organizarOpciones = function(select) {
	var options = select.find('option');
	var arr = options.map(function(_, o) { return { t: $(o).text(), v: o.value }; }).get();
	arr.sort(function(o1, o2) { return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; });
	options.each(function(i, o) {
	  o.value = arr[i].v;
	  $(o).text(arr[i].t);
	});
};

var crearContexto = function(val){
	var ctx = JSON.stringify(val);
	ctx = btoa(ctx);
	return ctx;
};

var esFuncion = function(elem) {
	return typeof(elem) == 'function';
}

var hayValor = function(valor) {
	return (valor != undefined && valor != null && (!(typeof valor == 'string') || valor.trim().length > 0));
};

var asignarCheckBox = function(elem, val) {
	if (typeof(val) == 'boolean') {
		elem.prop("checked", val);
	}
};

var leerCheckBox = function(elem) {
	return elem.is(":checked")
};

var leerTextoSelect = function(elem) {
	if (!hayValor(elem.val())) {
		return 'Sin información';
	}
	return limpiarCampo(elem.find('option[value='+elem.val()+']').text());
};

//Evito que al hacer enter se recargue la página
$('input').keypress(function(e) {
    if(e.which == 13) {
        return false;
    }
});

var limpiarCampo = function(texto) {
	if (typeof(texto) == 'string') {
		var temp = texto.trim().toUpperCase();
		if (!hayValor(temp)) {
			temp = null;
		}
		return temp;
	}
	return texto;
};

var convertirHtmlReporte = function(elem) {
	var nuevo = $('<div></div>');
	$.each(elem.find('select'), function(i, unselect) {
		var temp = $(unselect);
		temp.attr('data-select', temp.val());
	});
	nuevo.append(elem.clone());
	nuevo.find('.col-xs-6').css('width','50%');
	nuevo.find('.col-xs-12').css('width','100%');
	nuevo.find('.col-xs-6').css('float','left');
	nuevo.find('.col-xs-12').css('float','left');
	nuevo.find('.col-sm-6').css('float','left');
	nuevo.find('.col-sm-6').css('width','50%');
	nuevo.find('label').css('font-weight','bold');
	nuevo.find('label').css('float','left');
	nuevo.find('p').css('margin','0');
	nuevo.find('p').css('padding','0');
	nuevo.find('.quitarenreporte').remove();
	nuevo.find('.invisible').remove();
	$.each(nuevo.find('input'), function(i, elem) {
		var temp = $(elem);
		if (temp.attr('type') == 'checkbox') {
			var isCheck = leerCheckBox(temp);
			elem.replaceWith(isCheck ? '(X)' : '( )' );
		} else {
			elem.replaceWith(temp.val());
		}
	});
	//Ojo, esto obliga a que todos los select deben tener id's
	$.each(nuevo.find('select'), function(i, unselect) {
		var temp = $(unselect);
		temp.val(temp.attr('data-select'));
		unselect.replaceWith(leerTextoSelect(temp));
	});
	return nuevo.html();
};

var extraerIdentificacion = function(val) {
	PATRON_CEDULA.lastIndex = 0;
	var grupos = PATRON_CEDULA.exec(val);
	var ans = {
		tipo:null,
		numero:null,
	};
	if (grupos) {
		ans.tipo = grupos[1];
		ans.numero = grupos[2];
	} else {
		ans.tipo = 'CC';
		ans.numero = '';
	}
	return ans;
};

var leerIdentificacion = function(elemTipo, elemNum) {
	try{
		var temp = parseInt(elemNum.val());
		if (isNaN(temp)){
			return null
		}else{
			return elemTipo.val()+temp;
		}
	}catch(e){
		return null;
	}
};

var homogeneizarTexto = function(texto) {
	if (!hayValor(texto)) {return texto;}
	texto = texto.latinise();
	texto = texto.toLowerCase();
	return texto;
};

var Latinise={};Latinise.latin_map={"Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A","Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY","Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B","Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C","Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ","É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET","Ḟ":"F","Ƒ":"F","Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G","Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H","Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I","Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS","Ĵ":"J","Ɉ":"J","Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K","Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ","Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M","Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ñ":"N","Ǌ":"NJ","Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU","Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P","Ꝙ":"Q","Ꝗ":"Q","Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R","Ꜿ":"C","Ǝ":"E","Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S","Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T","Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ","Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U","Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY","Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W","Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y","Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE","ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z","á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay","ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o","ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c","ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d","ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz","é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et","ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f","ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g","ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv","í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is","ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j","ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k","ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s","ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m","ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ñ":"n","ǌ":"nj","ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou","ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p","ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q","ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r","ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u","ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th","ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz","ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um","ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy","ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w","ẍ":"x","ẋ":"x","ᶍ":"x","ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y","ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z","ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st","ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"};
String.prototype.latinise=function(){return this.replace(/[^A-Za-z0-9\[\] ]/g,function(a){return Latinise.latin_map[a]||a})};
String.prototype.latinize=String.prototype.latinise;
String.prototype.isLatin=function(){return this==this.latinise()}

var escaparHtml = function(val) {
	return $('<div>').html(val).text()
};

$(function () {
	//showTodayButton:true, 
	var INIT_FECHA = {format: FORMATO_FECHA, locale: 'es', viewMode: 'years', maxDate: new Date()};
	
	var monitoresListos = $.Deferred();
	
	var cachePersonas = {};
	
	var reporteTemplate = '<table style="width:100%; border: 1px solid;"><thead>'+
	'<tr>'+
	'	<td>$titulo</td>'+
	'	<td>Fecha de generación del reporte: $fecha<br>Formato de fechas: '+FORMATO_FECHA+'</td>'+
	'</tr>'+
	'<tr>'+
	'	<td colspan="2"><h1>$descripcion</h1></td>'+
	'</tr>'+
	'</thead>'+
	'<tbody>'+
	'<tr>'+
	'	<td colspan="2">$contenido</td>'+
	'</tr>'+
	'</tbody></table>';
	var contenidoReporte = null;
	var asignarContenidoReporte=function(val) {
		contenidoReporte=val;
	}
	var leerContenidoReporte=function() {
		return contenidoReporte;
	}
	var darReporte = function() {
		var modelo = leerContenidoReporte();
		modelo.fecha = {contenido: formatearFecha(new Date().getTime())};
		var temp = reporteTemplate;
		for (llave in modelo) {
			if (modelo[llave].html == true) {
				temp = temp.replace('$'+llave, modelo[llave].contenido);
			} else {
				temp = temp.replace('$'+llave, escaparHtml(modelo[llave].contenido));
			}
		}
		return temp;
	};
	
	var aumentarPersona = function(modelo) {
    	var idFoto = adminFoto.darId();
    	if (hayValor(idFoto)) {
    		modelo.foto = idFoto;
    	}
	};
	
	var activarFecha = function(temp) {
		temp.datetimepicker($.extend({}, INIT_FECHA));
		temp.find('p').on('click tap', function() {
			temp.find('span span').click();
	    });
		temp.on("dp.change", function (e) {
			temp.find('p').text(temp.find('input').val());
	    });
		temp.trigger( "dp.change" );
	};
	
	//Se inicializan los campos tipo fecha
	$.each($('.input-group.date'), function(i, elem) {
		var temp = $(elem);
		activarFecha(temp);
	});
    
    var miModalConfirmeSalir = $('#miModalConfirmeSalir');
    var miModalEnviar = $('#miModalEnviar');
    var miModalGeneral = $('#miModalGeneral');
    
    miModalConfirmeSalir.modal({ show: false});
    miModalEnviar.modal({ show: false});
    miModalGeneral.modal({ show: false});
    
    var btnaccion_nuevo = $('.accion_nuevo');
    var btnaccion_registro = $('.accion_registro');
    var accion_confirmar = $('.accion_confirmar');
    var btncrearpersona = $('.accion_crear');
    var btniracrearpersona = $('.crear_usuario');
    var btnaccion_cancelar_crear = $('.accion_cancelar_crear');
    var btnaccion_login = $('.accion_login');
    var btnaccion_logout = $('.accion_logout');
    var btnregresar = $('.accion_regresar');
    var accion_buscar_personas = $('.accion_buscar_personas');
    var accion_buscar_real = $('.accion_buscar_real');
    var accion_ir_a_registro = $('.accion_ir_a_registro');
    var accion_verasistencia = $('.accion_verasistencia');
    var accion_ir_a_verasistencia = $('.accion_ir_a_verasistencia');
    var accion_vernuevos = $('.accion_vernuevos');
    var accion_vercumple = $('.accion_vercumple');
    var accion_agregar_hijo = $('#accion_agregar_hijo');
    var accion_verfaltantes = $('.accion_verfaltantes');
    var accion_enviar = $('.accion_enviar');
    var accion_enviar_nuevo = $('.accion_enviar_nuevo');
    var accion_ver_pareja =$('.accion_ver_pareja');
    
    var adminFoto = (function() {
    	var file = null;
    	var idFile = null;
    	var nombreAnterior = null;
    	var darId_ = function() {
    		return idFile;
    	};
    	
    	var asignarNombreAnterior_ = function(temp) {
    		nombreAnterior = temp;
    	};
    	
    	var init = function() {
    	    var fotopersona = $('#fotopersona');
    	    var previewFoto = $('#previewFotoPersona');
    	    var anteriorSrc = previewFoto.attr('src'); 
    	    fotopersona.on("change", function (e) {
    	        file = e.target.files[0];
    	        
    	        if (file.size > MAX_FILE_SIZE) {
    	        	mensajeGeneral('Archivo muy grande! debe ser menor a '+(MAX_FILE_SIZE/(1024))+'KB');
    	        	return;
    	        }
    	        
    	        var reader = new FileReader();
    	        reader.onload = function (e) {
    	        	previewFoto.attr('src', e.target.result);
    	        }
    	        reader.readAsDataURL(file);
    	        
    	        var form = new FormData();
    	        form.append('file-0', file);
    	        if (hayValor(nombreAnterior)) {
    	        	//Si no cambia la imagen queda siempre la misma...
    	        	form.append('name', nombreAnterior);
    	        }
    	        
    	        actividadOn();
    	        $.ajax({
    	            url: '/storage/',
    	            type: 'POST',
    	            data: form,
    	            headers:{
    	            	'X-CSRFToken':$('[name="csrfmiddlewaretoken"]').val()
    	            },
    	            cache: false,
    	            contentType: false,
    	            processData: false,
    	        }).done(function(data) {
    	        	if (data.error != 0) {
    	        		mensajeErrorSistema();
    	        		previewFoto.attr('src', anteriorSrc);
    	        	} else {
    	        		idFile = data.id;
    	        	}
    	        }).fail(function() {
    	        	mensajeErrorSistema();
    	        	previewFoto.attr('src', anteriorSrc);
    	        }).always(function() {
    	        	actividadOff();
    	        });
    	    });
    	    previewFoto.on("click tap", function (e) {
    	    	fotopersona.click();
    	    });
    	};
    	
    	init();
    	
    	return {
    		darId:darId_,
    		asignarNombreAnterior:asignarNombreAnterior_,
    	}
    })();

    
    function getParameterByName(name, url) {
	    if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
    };
    
    var leerContexto = function() {
    	var ctx = getParameterByName('ctx');
    	try {
    		ctx = atob(ctx);
    		ctx = JSON.parse(ctx);
    		return ctx;
    	} catch (e) {
    		return null;
    	}
    };
    
    var asignarIdentificacion = function(elemTipo, elemNum, val) {
    	var ans = extraerIdentificacion(val);
    	elemTipo.val(ans.tipo);
		elemNum.val(ans.numero);
	};
    
    var confirmeGeneral = function(msg, accion) {
    	miModalConfirmeSalir.find('p').text(msg);
    	miModalConfirmeSalir.find('.accion_confirmar').off('click tap');
    	miModalConfirmeSalir.find('.accion_confirmar').on('click tap', accion);
    	miModalConfirmeSalir.modal('show');
    };
    
    var mensajeGeneral = function(mensaje, funcion) {
    	if (hayValor(funcion)) {
    		$('.accion_aceptar_general').on('click tap', funcion);
    	} else {
    		$('.accion_aceptar_general').on('click tap', function(){});
    	}
    	miModalGeneral.find('.mensaje').text(mensaje);
    	miModalGeneral.modal('show');
    }
    
    var mensajeErrorSistema = function() {
    	mensajeGeneral('Error de servidor, por favor reintente');
    };
    
    var navegar = function(url) {
    	document.location.href = url;
    	//actividadOn();//TODO iOS
    }
    
    //Acciones de navegación -------------------------------------------
    accion_ir_a_registro.on('click tap', function() {
    	navegar('/toma-asistencia.html');
    });
    
    var agregarHijoReal = function(data) {
    	//Tomo el ejemplo
    	var clon = $('.ejemplo-hijos').clone();
    	clon.removeClass('ejemplo-hijos');
    	clon.removeClass('invisible');
    	
    	$.each(clon.find('.input-group.date'), function(i, elem) {
    		var temp = $(elem);
    		activarFecha(temp);
    	});
    	
    	clon.find('.accion_quitar_hijo').on('click tap', function(event) {
    		confirmeGeneral('¿Seguro que desea quitar el hijo?', function() {
    			$(event.target).closest('.un-hijo').remove();
    		});
    	});
    	if (hayValor(data.nombres)) {
    		clon.find('.hijo.nombres').val(data.nombres);
    	}
    	if (hayValor(data.cumple)) {
    		asignarFecha(clon.find('.hijo.cumpleanios'), data.cumple);
    	}
    	
    	$('.hijos').append(clon);
    }
    
    accion_agregar_hijo.on('click tap', function() {
    	agregarHijoReal({});
    });
    
    btnaccion_cancelar_crear.on('click tap', function() {
    	confirmeGeneral('¿Seguro que desea salir?', function() {
    		navegar('/toma-asistencia.html');
    	});
    });
    
    var funEnviarCorreo = function() {
    	miModalEnviar.find('.accion_confirmar').off('click tap');
    	miModalEnviar.find('.accion_confirmar').on('click tap', function() {
    		//Invocar servicio
    		var ctrls = {
	    		correo:	{ref:$('#correoenvio'), requeriodo:true, asignar:function(val) {$('#correoenvio').val(val)}, leer:function() {return $('#correoenvio').val();}, patrones:[{p:PATRON_CORREO, msg:'No parece un correo'}]},
	    	}
	   		var temp = validarForm(ctrls);
    		if (temp.errores == 0) {
    			miModalEnviar.modal('hide');
    			payload = {};
    			payload.email = temp.modelo.correo;
    			payload.contenido = darReporte();
    			payload.subject = leerContenidoReporte().subject.contenido;
    			var promesa = miCache.leer('ENVIAR_REPORTE', payload);
    	    	promesa.done(function(data) {
    	    		mensajeGeneral('El correo se envió!')
    	    	});
    		}
    	});
    	miModalEnviar.modal('show');
    }
    
    accion_enviar.on('click tap', function() {
    	funEnviarCorreo();
    });
    
    //Va hacia la pantalla de registro de nueva persona
    btnaccion_nuevo.on('click tap', function() {
    	//Debo tomar los datos ya escritos
    	var ctrl = controlPersonas.controlesFormularioNuevo();
    	var ctx = {datos_nuevo:{cedula:ctrl.cedula.leer()}};
    	ctx = crearContexto(ctx);
    	navegar('/nuevo.html?ctx='+ctx);
    });
    
    btnaccion_login.on('click tap', function() {
    	navegar(seguridadLocal.loginUrl());
    });
    
    accion_ver_pareja.on('click tap', function() {
    	//Debo tomar los datos ya escritos
    	var ctrl = controlPersonas.controlesFormularioNuevo();
    	var ctx = {leer_persona:{cedula:ctrl.pareja.leer()}};
    	ctx = crearContexto(ctx);
    	window.open(window.location.origin+'/nuevo.html?ctx='+ctx, '_blank');
    });
    
    btnaccion_logout.on('click tap', function() {
    	miCache.borrarTodo();
    	navegar(seguridadLocal.logoutUrl());
    });
    
    var darNombresPersona = function() {
    	var nombre = $('#nombres').val();
    	var apellido = $('#apellidos').val();
    	return apellido+' '+nombre;
    };
    
    accion_enviar_nuevo.on('click tap', function() {
    	var texto = convertirHtmlReporte($('.incluirreporte'));
    	var titulo = 'Persona '+darNombresPersona();
    	asignarContenidoReporte({
    		subject:{
    			contenido:titulo,
    		},contenido:{
				contenido:texto, 
				html:true
			}, descripcion:{
				contenido:titulo
			},titulo:{
				contenido:'Persona'
			}
		});
    	
    	funEnviarCorreo();
    });
    
    btniracrearpersona.on('click tap', function(){
    	navegar('/nuevo.html');
    });
    
    btnregresar.on('click tap', function() {
    	if (window.history.length == 1) {
    		window.close();
    	} else {
    		window.history.go(-1);
    	}
    });
    
    accion_buscar_personas.on('click tap', function() {
    	navegar('/personas.html');
    });
    
    accion_ir_a_verasistencia.on('click tap', function() {
    	navegar('/verasistencia.html');
    });
    
    accion_buscar_real.on('click tap', function() {
    	controlPersonas.buscarPersonas();
    });
    
    accion_verasistencia.on('click tap', function() {
    	controlAsistencia.verAsistencia();
    });
    
    accion_verfaltantes.on('click tap', function() {
    	controlAsistencia.verTodos();
    });
    
    accion_vernuevos.on('click tap', function() {
    	controlAsistencia.verNuevos();
    });
    
    accion_vercumple.on('click tap', function() {
    	controlAsistencia.verCumple();
    });
    
    var asignarFecha = function(elem, epoch) {
    	var valorTexto = formatearFecha(epoch);
    	elem.data("DateTimePicker").date(valorTexto);
    	elem.find('input').val(valorTexto);
    	elem.find('p').text(valorTexto);
    };
    
    $.fn.goTo = function() {
        $('html, body').animate({
            scrollTop: $(this).offset().top + 'px'
        }, 'fast');
        return this; // for chaining...
    }
    
    var leerAsinc_ = function(tipoBusqueda, controlesFormulario_, validarFormularioAsistencia_, transformarPayload, funCallBack) {
    	var promesaTotal = $.Deferred();
    	
    	var payload = undefined;
    	
    	if (esFuncion(controlesFormulario_) && esFuncion(validarFormularioAsistencia_)){
	    	//1- Validar el formulario
	    	var ctrl = controlesFormulario_();
	    	var todo = validarFormularioAsistencia_(ctrl);
	    	if (todo.errores > 0) {
	    		mensajeGeneral('Por favor corrija la información');
	    		return promesaTotal;
	    	}
	    	
	    	//2- Hacer la búsqueda
	    	var payload = todo.modelo;
	    	if (esFuncion(transformarPayload)) {
	    		payload = transformarPayload(payload);
	    	}
    	}
    	
    	var promesa = miCache.leer(tipoBusqueda, payload);
    	var contador = 1;
    	var respuesta = [];
    	var llenar1 = function(data1) {
    		var entidades = data1.entidades;
    		var funRecursiva = function() {
    			if (entidades.length > 0) {
        			var ref = entidades[0];
        			respuesta.push(ref);
        			if (esFuncion(funCallBack)) {
        				funCallBack(ref);
        			}
		    		entidades.splice(0, 1);
					funRecursiva();
        		} else {
        			if (hayValor(data1.next)) {
        				if (!hayValor(payload)) {
        					payload = {};
        				}
        				payload.next = data1.next;
        				var promesa = miCache.leer(tipoBusqueda, payload);
        				promesa.done(llenar1);
        			} else {
        				promesaTotal.resolve(respuesta);
        			}
        		}
    		};
    		funRecursiva();
    	};
    	promesa.done(llenar1);
    	return promesaTotal;
    } 
    
    var verTabla_ = function(tipoBusqueda, rebuscar, controlesFormulario_, validarFormularioAsistencia_, jTabla, transformarPayload, generadorFila, claseUnicaHeader) {
    	var promesaTotal = $.Deferred();
    	var borrarTabla_ = function() {
    		jTabla.find('tbody').empty();
    	};
    	
    	if (hayValor(claseUnicaHeader)) {
    		jTabla.find('thead').find('th').addClass('quitarenreporte');
    		jTabla.find('thead').find('th').addClass('invisible');
    		jTabla.find(claseUnicaHeader).removeClass('invisible');
    		jTabla.find(claseUnicaHeader).removeClass('quitarenreporte');
    		jTabla.find('.siempre').removeClass('invisible');
    	}
		 
    	var agregarFila_ = function(linea, idPersona) {
    		var fila = $('<tr>');
    		$.each(linea, function(i, elem) {
    			var col = $('<td>');
    			if (linea[i].html == true) {
    				col.html(linea[i].contenido);
    			} else {
    				col.text(linea[i].contenido);
    			}
    			if (hayValor(linea[i].clases)) {
    				$.each(linea[i].clases, function(j, val) {
    					col.addClass(val);
    				});
    			}
    			if (hayValor(linea[i].attrs)) {
    				$.each(linea[i].attrs, function(llave, valor) {
    					col.attr(llave, valor);
    				});
    			}
    			fila.append(col);
    		});
    		var botonEditar = $('<button type="button" class="btn btn-success">Ver</button>');
    		botonEditar.on('click tap', function() {
    			var ctx = {leer_persona:{id:idPersona}};
    			ctx = crearContexto(ctx);
    			window.open(window.location.origin+'/nuevo.html?ctx='+ctx, '_blank');
    		});
    		var botonBorrar = $('<button type="button" class="btn btn-danger">Borrar</button>');
    		botonBorrar.on('click tap', function() {
    			confirmeGeneral('¿Seguro?', function() {
    				var promesa = miCache.leer('BORRAR_PERSONA', {id:idPersona});
        	    	promesa.done(function(data) {
        	    		//Quitar la fila
        	    		mensajeGeneral('Hecho!');
        	    		fila.remove();
        	    	});
    			});
    		});
    		var t1 = $('<td class="quitarenreporte"><div class="btn-group pull-right"></div></td>');
    		if (hayValor(idPersona)) {
	    		t1.find('div').append(botonEditar);
	    		if (seguridadLocal.esAdmin()) {
	    			t1.find('div').append(botonBorrar);
	    		}
    		}
    		fila.append(t1);
    		jTabla.find('tbody').append(fila);
    	};
    	
    	//1- Validar el formulario
    	var ctrl = controlesFormulario_();
    	var todo = validarFormularioAsistencia_(ctrl);
    	if (todo.errores > 0) {
    		mensajeGeneral('Por favor corrija la información');
    		return promesaTotal;
    	}
    	
    	//2- Hacer la búsqueda
    	var payload = todo.modelo;
    	if (esFuncion(transformarPayload)) {
    		payload = transformarPayload(payload);
    	}
    	var promesa = miCache.leer(tipoBusqueda, payload);
    	
    	var contador = 1;
    	borrarTabla_();
    	var unicos = {};
    	
    	var llenar1 = function(data1) {
    		var entidades = data1.entidades;
    		
    		var funRecursiva = function() {
    			if (entidades.length > 0) {
        			var ref = entidades[0];
    	    		var agregarReal = function(data) {
    		    		var elem = $.extend({}, data.rta, true);
    		    		if (!(elem.id in unicos)) {
    		    			if (hayValor(elem.id)) {
	    		    			unicos[elem.id]=true;
		    		    		cachePersonas[ref.asistente] = data;
    		    			}
	    		    		elem.fecha = ref.fecha;
	    		    		var temp = [];
	    		    		if (esFuncion(generadorFila)) {
	    		    			generadorFila(contador, temp, elem);
	    		    		} else {
		    		    		temp.push({contenido:contador});
		    					temp.push({contenido:elem.apellidos});
		    					temp.push({contenido:elem.nombres});
		    					temp.push({contenido:elem.cedula});
	    		    		}
	    					agregarFila_(temp, elem.id);
	    					contador++;
    		    		}
    		    	};
    		    	var seguir = function() {
    		    		entidades.splice(0, 1);
    					funRecursiva();
    		    	}
    		    	if (rebuscar == false) {
    		    		agregarReal({rta:ref});
    		    		seguir();
    		    	} else {
	    		    	if (!(ref.asistente in cachePersonas)) {
	    		    		var promesa2 = miCache.leer('LEER_PERSONA', {id: ref.asistente});
		    		    	promesa2.done(agregarReal);
		    		    	promesa2.always(seguir);
	    		    	} else {
	    		    		agregarReal(cachePersonas[ref.asistente]);
	    		    		seguir();
	    		    	}
    		    	}

        		} else {
        			if (hayValor(data1.next)) {
        				payload.next = data1.next;
        				var promesa = miCache.leer(tipoBusqueda, payload);
        				promesa.done(llenar1);
        			} else {
        				promesaTotal.resolve();
        			}
        		}
    		};
    		
    		funRecursiva();
    	};
    	
    	promesa.done(llenar1);
    	return promesaTotal;
    };
    
    var validarForm = function(ctrls) {
    	//1. quito todos los errores
    	$('.form-group').removeClass('has-error');
    	$('.form-group ul').empty();
    	var agregarError = function(elem, msg) {
    		elem.addClass('has-error');
    		var agregado = $('<li></li>');
    		agregado.text(msg);
    		elem.find('ul').append(agregado)
    	};
    	//2. Voy validando campo por campo
    	var errores = 0;
    	var modelo = {};
    	for (llave in ctrls) {
    		var unCtrl = ctrls[llave];
    		var temp = unCtrl.leer();
    		var campoLimpiado = limpiarCampo(temp);
    		if (temp !== undefined) {
    			modelo[llave] = campoLimpiado;
    		}
    		if (unCtrl.ref.length > 0){
	    		var padre = unCtrl.ref.closest('.form-group'); 
	    		if (unCtrl.requeriodo && !hayValor(campoLimpiado)) {
	    			agregarError(padre, 'Este campo es requerido');
	    			errores++;
	    		}
	    		if (hayValor(unCtrl.patrones) && hayValor(campoLimpiado)) {
	    			var lista = unCtrl.patrones;
	    			$.each(lista, function(i, patron) {
	    				patron.p.lastIndex = 0;
	    				if (!patron.p.test(campoLimpiado)) {
	    					agregarError(padre, patron.msg);
	    					errores++;
	    				}
	    			});
	    		}
    		}
    	}
    	if (errores>0) {
    		$($('.form-group.has-error')[0]).goTo();
    	}
    	return {errores:errores, modelo:modelo};
    };
    
    //Acciones reales ---------------------------------------------------
    
    var controlAsistencia = function() {
    	
	   	 var validarFormularioAsistencia_ = function() {
			 var ctrls = controlesFormulario_();
			 return validarForm(ctrls);
		 };
    	
    	var controlesFormulario_ = function() {
	    	var datos = {
			    fecha: {ref:$('#fechaasistencia'), requeriodo:true, asignar:function(val) {asignarFecha($('#fechaasistencia'),val);}, leer:function() {try{return $('#fechaasistencia').datetimepicker().data().DateTimePicker.date().valueOf();}catch(e){return null;}}},
	    	};
	    	return datos;
	    };
	    
	    var verAsistencia_ = function() {
	    	verTabla_('VER_ASISTENCIA', true, controlesFormulario_, validarFormularioAsistencia_, $('#resultados_busqueda_personas'), null, null, '.tabla_asistencia');
	    };
	    
	    var verCumple_ = function() {
	    	var fecha = new Date();
	    	var todasPersonas = {};
	    	var jTabla = $('#resultados_busqueda_personas');
	    	monitoresListos.done(function(lista) {
	    		var generadorFila = function(i, fila, elem) {
	    			fila.push({contenido:i, clases:['indice']});
	    			fila.push({contenido:elem.apellidos});
	    			fila.push({contenido:elem.nombres});
	    			fila.push({contenido:elem.correo});
	    			fila.push({contenido:elem.celular});
	    			fila.push({contenido:elem.pareja, clases:['remplezar_persona_id']});
	    			var nacimiento = formatearFecha(elem.nacimiento);
	    			PATRON_DIA.lastIndex = 0;
	    			PATRON_MES.lastIndex = 0;
	    			var dia = PATRON_DIA.exec(nacimiento);
	    			var mes = PATRON_MES.exec(nacimiento);
	    			if (hayValor(dia) && dia.length > 0 && hayValor(mes) && mes.length) {
	    				fila.push({contenido:nacimiento, clases:['ordenar'], attrs:{'data-sort':mes[1]+dia[1]}});
	    			} else{
	    				fila.push({contenido:nacimiento, clases:['ordenar'], attrs:{'data-sort':'00/00'}});
	    			}
	    			fila.push({contenido:formatearFecha(elem.aniversario)});
	    			fila.push({contenido:lista[elem.monitor]});
	    			
	    			//Se mapea todas las personas
	    			todasPersonas[elem.cedula] = elem.apellidos+' '+elem.nombres;
	    		};
		    	var promesa = verTabla_('VER_TODOS', false, controlesFormulario_, validarFormularioAsistencia_, jTabla, null, generadorFila, '.tabla_cumple');
		    	promesa.done(function() {
		    		//Se debe buscar y remplazar el nombre del conyugue
		    		$.each(jTabla.find('.remplezar_persona_id'), function(i, noJqueryElem) {
		    			var elem = $(noJqueryElem);
		    			var ident = elem.text();
		    			
		    			var nombre = todasPersonas[ident];
		    			if (hayValor(nombre)) {
		    				elem.text(nombre);
		    			}
		    		});
		    		
		    		//ordeno
		    		var filas = jTabla.find('tbody').find('tr').detach()
		    		filas.sort(function (a, b) {
		    			var contentA = $(a).find('.ordenar').attr('data-sort');
		    			var contentB = $(b).find('.ordenar').attr('data-sort');
		    			var ans = (contentA < contentB) ? -1 : (contentA > contentB) ? 1 : 0;
		    			return ans;
	    		   });
		    		jTabla.find('tbody').append(filas);
		    		$.each(jTabla.find('tbody').find('tr'), function(i, elem) {
		    			var temp = $(elem);
		    			temp.find('.indice').text(i+1);
		    		});
		    		
		    		//Se debe registrar el reporte
	    			var nuevaTabla = $('<div><table style="width:100%;">'+$('#resultados_busqueda_personas').html()+'</table></div>');
	    			nuevaTabla.find('.quitarenreporte').remove();
	    			var titulo = 'Cumpleaños al día '+formatearFecha(fecha.getTime());
	    			asignarContenidoReporte({
	    				subject:{
	    					contenido:titulo
	    				},contenido:{
		    				contenido:nuevaTabla.html(), 
		    				html:true
	    				}, descripcion:{
	    					contenido:titulo
	    				},titulo:{
	    					contenido:'Reporte de cumpleaños'
	    				}
	    			});
		    	});
	    	});
	    };
	    
	    var verTodos_ = function() {
	    	
	    	var promesa = leerAsinc_('VER_ASISTENCIA', controlesFormulario_, validarFormularioAsistencia_);
	    	promesa.done(function(listaAsistentes) {
	    		var mapaAsistentes = {};
	    		for (var i=0; i<listaAsistentes.length; i++) {
	    			mapaAsistentes[listaAsistentes[i].asistente] = true;
	    		}
	    		var estados = {
					0:'<span class="label label-danger">Faltó</span>',
					1:'<span class="label label-success">Presente</span>',
					2:'<span class="label label-primary">Nuevo</span>',
	    		};
	    		var ctrl = controlesFormulario_();
	    		var fecha = new Date(ctrl.fecha.leer());
	    		fecha.setHours(0, 0, 0, 0);
	    		var calcularEstado = function(elem) {
	    			var estado = 0;
	    			try {
	    				var fechaPrimerDia = new Date(elem.primiparo);
	    				fechaPrimerDia.setHours(0, 0, 0, 0);
	    				if (fecha.getTime() == fechaPrimerDia.getTime()) {
	    					estado = 2;
	    				}
	    				if (estado == 0) {
	    					//Se mira si asistió
	    					if (mapaAsistentes[elem.id] == true) {
	    						estado = 1;
	    					}
	    				}
	    			} catch(e) {}
	    			return estado;
	    		};
	    		var generadorFila = function(i, fila, elem) {
	    			fila.push({contenido:i});
	    			fila.push({contenido:elem.apellidos});
	    			fila.push({contenido:elem.nombres});
	    			fila.push({contenido:elem.cedula});
	    			fila.push({contenido:estados[calcularEstado(elem)], html:true});
	    		};
	    		var promesa2 = verTabla_('VER_TODOS', false, controlesFormulario_, validarFormularioAsistencia_, $('#resultados_busqueda_personas'), null, generadorFila, '.tabla_asistencia');
	    		promesa2.done(function() {
	    			var nuevaTabla = $('<div><table style="width:100%;">'+$('#resultados_busqueda_personas').html()+'</table></div>');
	    			nuevaTabla.find('.quitarenreporte').remove();
	    			var titulo = 'Asistentes el día '+formatearFecha(fecha.getTime());
	    			asignarContenidoReporte({
	    				subject:{
	    					contenido:titulo
	    				},contenido:{
		    				contenido:nuevaTabla.html(), 
		    				html:true
	    				}, descripcion:{
	    					contenido:titulo
	    				},titulo:{
	    					contenido:'Reporte de asistencia'
	    				}
	    			});
	    		})
	    	});
	    };
	    
	    var verNuevos_ = function() {
	    	verTabla_('VER_NUEVOS', false, controlesFormulario_, validarFormularioAsistencia_, $('#resultados_busqueda_personas'));
	    };
	    
	    return {
	    	controlesFormulario: controlesFormulario_,
	    	verTodos: verTodos_,
	    	verAsistencia: verAsistencia_,
	    	verNuevos: verNuevos_,
	    	verCumple: verCumple_,
	    };
    }();
    
    //Controlador para el tema de las personas
    var controlPersonas = function() {
    	
    	var idActual = null;
    	
    	 var validarFormularioNuevo_ = function() {
    		 var ctrls = controlesFormularioNuevo_();
    		 var temp = validarForm(ctrls);
    		 temp.modelo.id = idActual;
    		 return temp;
    	 }
	    
	    var controlesFormularioBuscar_ = function() {
	    	var datos = {
			    q: {ref:$('#q'), requeriodo:false, asignar:function(val) {$('#q').val(val)}, leer:function() {return $('#q').val();}},
			    monitor: {ref:$('#monitor'), asignar:function(val) {$('#monitor').val(val)}, leer:function() {try{return parseInt2($('#monitor').val());}catch(e){return undefined}}},
	    	};
	    	return datos;
	    };
	    
	    var parseInt2 = function(text) {
	    	var temp = parseInt(text);
	    	if (isNaN(temp)) {
	    		throw 'No es numero';
	    	}
	    	return temp;
	    }
	    
	    var controlesFormularioNuevo_ = function() {
	    	var datos = {
			    cedula:{ref:$('#cedula'), requeriodo:true, asignar:function(val) {
			    	asignarIdentificacion($('#tipoIdent'), $('#cedula'), val);
			    }, leer:function() {
			    	return leerIdentificacion($('#tipoIdent'), $('#cedula'));
			    }, patrones:[]},
			    pareja: {ref:$('#cedulapareja'), requeriodo:true, asignar:function(val) {
			    	asignarIdentificacion($('#tipoIdentPareja'), $('#cedulapareja'), val);
			    }, leer:function() {
			    	return leerIdentificacion($('#tipoIdentPareja'), $('#cedulapareja'));
			    }, patrones:[]},
			    apellidos: {ref:$('#apellidos'), requeriodo:true, asignar:function(val) {$('#apellidos').val(val)}, leer:function() {return $('#apellidos').val();}},
			    nombres: {ref:$('#nombres'), requeriodo:true, asignar:function(val) {$('#nombres').val(val)}, leer:function() {return $('#nombres').val();}},
			    nacimiento: {ref:$('#nacimiento'), requeriodo:true, asignar:function(val) {asignarFecha($('#nacimiento'), val);}, leer:function() {try{return $('#nacimiento').datetimepicker().data().DateTimePicker.date().valueOf();}catch(e){return null;}}},
			    aniversario: {ref:$('#aniversario'), requeriodo:true, asignar:function(val) {asignarFecha($('#aniversario'),val);}, leer:function() {try{return $('#aniversario').datetimepicker().data().DateTimePicker.date().valueOf();}catch(e){return null;}}},
			    ocupacion: {ref:$('#ocupacion'), asignar:function(val) {$('#ocupacion').val(val)}, leer:function() {return $('#ocupacion').val();}},
			    empresa: {ref:$('#empresa'), asignar:function(val) {$('#empresa').val(val)}, leer:function() {return $('#empresa').val();}},
			    teloficina: {ref:$('#teloficina'), asignar:function(val) {$('#teloficina').val(val)}, leer:function() {return $('#teloficina').val();}},
			    telcasa: {ref:$('#telcasa'), asignar:function(val) {$('#telcasa').val(val)}, leer:function() {return $('#telcasa').val();}},
			    celular: {ref:$('#celular'), asignar:function(val) {$('#celular').val(val)}, leer:function() {return $('#celular').val();}, patrones:[{p:/^(3)(\d{9})$/ig, msg:'No parece un número de celular'}]},
			    dircasa: {ref:$('#dircasa'), asignar:function(val) {$('#dircasa').val(val)}, leer:function() {return $('#dircasa').val();}},
			    servicio: {ref:$('#servicio'), asignar:function(val) {$('#servicio').val(val)}, leer:function() {return parseInt($('#servicio').val());}},
			    correo:	{ref:$('#correo'), requeriodo:true, asignar:function(val) {$('#correo').val(val)}, leer:function() {return $('#correo').val();}, patrones:[{p:PATRON_CORREO, msg:'No parece un correo'}]},
			    antiguedad: {ref:$('#antiguedad'), requeriodo:true, asignar:function(val) {$('#antiguedad').val(val)}, leer:function() {try{return parseInt($('#antiguedad').val());}catch(e){return null;}}},
			    autorizacion: {ref:$('#autorizacion'), requeriodo:false, asignar:function(val) {asignarCheckBox($('#autorizacion'), val);}, leer:function() {try{return leerCheckBox($('#autorizacion'))}catch(e){return null;}}},
			    formacion: {ref:$('#formacion'), asignar:function(val) {
			    	var temp = [];
			    	if (hayValor(val)) {
			    		temp = val;
			    	}
			    	if (!($.isArray(temp))) {
			    		temp = [temp];
			    	}
			    	for (var i=0; i<temp.length; i++) {
			    		temp[i] = parseInt(temp[i]);
			    	}
			    	$.each($('input.formacion'), function(i, elem) {
			    		var jelem = $(elem);
			    		var data_val = parseInt(jelem.attr('data-val'));
			    		asignarCheckBox(jelem, (temp.indexOf(data_val) >= 0));
			    	});
			    }, leer:function() {
			    	var lista = [];
			    	$.each($('input.formacion'), function(i, elem) {
			    		var temp = $(elem);
			    		if (leerCheckBox(temp)) {
			    			lista.push(parseInt(temp.attr('data-val')));
			    		}
			    	});
			    	return lista;
			    }},
			    rol: {ref:$('#rol'), asignar:function(val) {$('#rol').val(val)}, leer:function() {try{return parseInt2($('#rol').val());}catch(e){return undefined}}},
			    monitor: {ref:$('#monitor'), asignar:function(val) {$('#monitor').val(val)}, leer:function() {try{return parseInt2($('#monitor').val());}catch(e){return undefined}}},
			    hijos: {
			    	ref:$('.campo_hijo'),
			    	asignar:function(val) {
			    		$('.hijos').empty();
			    		$.each(val, function(i, elem) {
			    			try {
			    				var temp = JSON.parse(elem);
			    				agregarHijoReal(temp);
			    			} catch (e) {}
			    		});
			    	},
			    	leer:function() {
			    		var lista = [];
			    		var listaElementos = $('.hijos').find('.un-hijo');
			    		$.each(listaElementos, function(i, elem) {
			    			var temp = $(elem);
			    			var unHijo = {cumple:null};
			    			unHijo.nombres=temp.find('.hijo.nombres').val();
			    			try {
			    				unHijo.cumple = temp.find('.hijo.cumpleanios').datetimepicker().data().DateTimePicker.date().valueOf()
			    			}catch(e){}
			    			lista.push(JSON.stringify(unHijo));
			    		});
			    		return lista;
			    	},
			    }
	    	};
	    	return datos;
	    };
	    
	    var crearPersona_ = function() {
	    	//1- Validar el formulario
	    	var todo = validarFormularioNuevo_();
	    	if (todo.errores > 0) {
	    		mensajeGeneral('Por favor corrija la información');
	    		return;
	    	}
	    	
	    	if (todo.modelo.autorizacion != true) {
	    		mensajeGeneral('Debe antes aceptar la autorización de uso de datos.');
	    		return;
	    	}
	    	
	    	//1.2- agrega forma de buscar
	    	aumentarPersona(todo.modelo);

	    	//2- Invocar
	    	var promesa = miCache.leer('CREAR_ACTUALIZAR_PERSONA', todo.modelo);
	    	promesa.done(function(data) {
	    		mensajeGeneral('Hecho!', function() {
	    			window.history.go(-1);
	    		});
	    		//debo guardar el id
	    		idActual = data.rta.id;
	    	});
	    };
	    
	    var leerPersona_ = function(modelo) {
	    	var ctrl = controlesFormularioNuevo_();
	    	for (llave in ctrl) {
	    		ctrl[llave].asignar(modelo[llave])
	    	}
	    	if (hayValor(modelo.foto)) {
	    		var previewFoto = $('#previewFotoPersona');
				previewFoto.attr('src', 'https://storage.googleapis.com'+modelo.foto);
				adminFoto.asignarNombreAnterior(modelo.foto);
	    	}
	    	idActual = modelo.id;
	    };
	    
	    var buscarPersonas_ = function() {
	    	var transformar = function(payload) {
	    		payload.q = homogeneizarTexto(payload.q);
	    		return payload;
	    	};
	    	verTabla_('BUSCAR_PERSONAS', false, controlesFormularioBuscar_, validarForm, $('#resultados_busqueda_personas'), transformar);
	    }
	    
	    return {
	    	validarFormularioNuevo : validarFormularioNuevo_,
	    	controlesFormularioNuevo : controlesFormularioNuevo_,
	    	crearPersona : crearPersona_,
	    	leerPersona : leerPersona_,
	    	buscarPersonas: buscarPersonas_,
	    };
    }();
    
    //Crea la persona en el sistema
    btncrearpersona.on('click tap', function() {
    	controlPersonas.crearPersona();
    });
    
    //Acción de registrar asistencia
    btnaccion_registro.on('click tap', function() {
    	var ctrl = controlPersonas.controlesFormularioNuevo();
    	
		var promesa = miCache.leer('TOMAR_ASISTENCIA', {cedula:ctrl.cedula.leer()});
    	promesa.done(function(data) {
    		mensajeGeneral(data.msg);
    		ctrl.cedula.asignar('');
    	});
    });
    
    var actividadOn = function() {
    	$('#loading').css({display:'block'});
    };
    
    var actividadOff = function() {
    	$('#loading').css({display:'none'});
    };
    
    var sessionCache = (function() {
    	var maxDif = 1000*60*30;
    	
    	var put_ = function(llave, val) {
    		var todo = {date:new Date().getTime(), val:val};
    		sessionStorage[llave] = JSON.stringify(todo);
    	};
    	
    	var get_ = function(llave) {
    		var todo = sessionStorage[llave];
    		try {
    			todo = JSON.parse(todo);
    			if ((new Date().getTime() - todo.date) > maxDif) {
    				return null;
    			} else {
    				return todo.val;
    			}
    		} catch (e) {
    			return null;
    		}
    	};
    	
    	return {
    		get: get_,
    		put:put_,
    	}
    })();
    
    var miCache = function() {
    	var llaves = {
    		GRUPO: {url:'/asistencia/?accion=leer-grupo', tipo:'PUT', dataType:'json'},
    		USUARIO: {url:'/asistencia/?accion=leer-usuario', tipo:'PUT', dataType:'json'},
    		LEER_PERSONA: {url:'/asistencia/?accion=leer-persona', tipo:'PUT', dataType:'json'},
    		CREAR_PERSONA: {url:'/asistencia/?accion=crear-persona', tipo:'PUT', dataType:'json'},
    		ACTUALIZAR_PERSONA: {url:'/asistencia/?accion=actualizar-persona', tipo:'PUT', dataType:'json'},
    		CREAR_ACTUALIZAR_PERSONA: {url:'/asistencia/?accion=crear-actualizar-persona', tipo:'PUT', dataType:'json'},
    		BUSCAR_PERSONAS: {url:'/asistencia/?accion=buscar-personas', tipo:'PUT', dataType:'json'},
    		BORRAR_PERSONA: {url:'/asistencia/?accion=borrar-persona', tipo:'PUT', dataType:'json'},
    		TOMAR_ASISTENCIA: {url:'/asistencia/?accion=tomar-asistencia', tipo:'PUT', dataType:'json'},
    		VER_ASISTENCIA: {url:'/asistencia/?accion=verasistencia', tipo:'PUT', dataType:'json'},
    		VER_TODOS: {url:'/asistencia/?accion=vertodos', tipo:'PUT', dataType:'json'},
    		VER_NUEVOS: {url:'/asistencia/?accion=vernuevos', tipo:'PUT', dataType:'json'},
    		ENVIAR_REPORTE: {url:'/asistencia/?accion=enviarreporte', tipo:'PUT', dataType:'json'},
    		VER_MONITORES: {url:'/asistencia/?accion=vermonitores', tipo:'PUT', dataType:'json'},
    	};
    	var pendientes = 0;
    	
    	var esperar = function() {
    		pendientes++;
    		actividadOn();
    	};
    	
    	var liberar = function() {
    		pendientes--;
    		if (pendientes <= 0) {
    			pendientes = 0;
    			actividadOff();
    		}
    	}
    	
    	var leer_ = function(llave, data, usarCache) {
    		var promesa = $.Deferred();
    		var peticion = llaves[llave];
    		if (!peticion){promesa.reject(null);return promesa;}
    		var lectura = null;
    		try {
    			if (usarCache==true) {
    				lectura = JSON.parse(sessionStorage[llave]);
    			}
    		} catch(e) {}
    		
    		if (lectura) {
    			promesa.resolve(lectura);
    			console.log(llave+':estaba en cache');
    			return promesa;
    		}
    		esperar();
    		$.ajax({
      		  type: peticion.tipo,
      		  contentType: 'application/json; charset=utf-8',
      		  url: peticion.url,
      		  data: hayValor(data)?JSON.stringify(data):null,
      		  error: function(data) {
      			mensajeErrorSistema();
      			promesa.reject(data);
      		  },
      		  success: function(data){
      			console.log(llave+':servicio exitoso', data);
      			if (data.error > 0) {
      				mensajeGeneral('Ups!: '+data.msg)
      				promesa.reject(data);
      			} else {
          			if (usarCache==true) {
          				sessionStorage[llave] = JSON.stringify(data);
          			}
          			promesa.resolve(data);
      			}

      		  },
      		  dataType: peticion.dataType
      		});
    		promesa.always(function() {
    			liberar();
    		})
    		return promesa;
    	};
    	
    	var borrarTodo_ = function() {
    		for (llave in llaves) {
    			delete sessionStorage[llave];
    		}
    	}
    	
    	liberar();
    	
    	return {
    		leer: leer_,
    		borrarTodo: borrarTodo_,
    	}
    }();
    
    var inicializar = function() {
    	var ctx = leerContexto();
    	if (hayValor(ctx)) {
    		if (hayValor(ctx.leer_persona)) {
    			var promesa = miCache.leer('LEER_PERSONA', ctx.leer_persona);
    	    	promesa.done(function(data) {
    	    		controlPersonas.leerPersona(data.rta)
    	    	});
    		} else if (hayValor(ctx.datos_nuevo)) {
    			var ctrl = controlPersonas.controlesFormularioNuevo();
    			ctrl.cedula.asignar(ctx.datos_nuevo.cedula);
    		}
    	}
    }();
    
    //Debo buscar el grupo de conexión al que pertenezco
    //TODO agregar seguridad
    if (seguridadLocal.hayUsuario()) {
    	//var valorUsuario = miCache.leer('USUARIO', null, true);
    	//valorUsuario.done(function(data) {
    	//	console.log(data);
    	//});
    }
    
    if (seguridadLocal.esAdmin()) {
    	var LLAVE_MONITOR = 'VER_MONITORES';
    	var monitores = sessionCache.get(LLAVE_MONITOR);
    	if (monitores != null) {
    		monitoresListos.resolve(monitores);
    	} else {
    		var promesa = leerAsinc_(LLAVE_MONITOR);
        	promesa.done(function(monitores) {
        		var lista = {};
        		for (var i=0; i<monitores.length; i++) {
        			var monitor = monitores[i];
        			lista[monitor.id] = (monitor.apellidos+' '+monitor.nombres);
        		}
        		sessionCache.put(LLAVE_MONITOR, lista);
        		monitoresListos.resolve(lista);
        	});
    	}
    }
    
    monitoresListos.done(function(lista) {
    	var destinoSelect = $('#monitor');
    	destinoSelect.empty();
    	destinoSelect.append($('<option value="null">- Cualquiera -</option>'));
    	destinoSelect.append($('<option value="0">- Sin asignar -</option>'));
    	$.each(lista, function(llave, valor) {
    		destinoSelect.append($('<option value="'+llave+'">'+valor.toCamelCase(valor)+'</option>'));
    	});
    	organizarOpciones(destinoSelect);
    });
    
    //Se organiza la lista de opciones
    organizarOpciones($('#servicio'))
    
    /*
    history.navigationMode = 'compatible';
    actividadOff();
    window.onload = function(){
    	actividadOff();
    };
    $(document).ready(function(){
    	actividadOff();
    });
    */
    
});
