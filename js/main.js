var syncpage = "http://10.46.18.39/WebCodeCam/remote/remote.php";
var evento;
var db = new Dexie( "eceel_3" );
db.version(1).stores({
	usuarios: "id, nome",
	eventos: "id, nome",
	frequencia: "++idx, usuario, evento",
});
db.open();

function deleteDatabase() {
	db.delete();
}

function loadInitialData() {
	db.usuarios.add({
		id: 1,
		nome: "Wilk Coêlho Maia",
	});
	db.usuarios.add({
		id: 2,
		nome: "Marcos Henrique",
	});
	
	db.eventos.add({
		id: 1,
		nome: "Olimpíada de Programação",
	})
}

if( document.location.search )
{
	var queries = document.location.search.split('?')[1].split('&');
	var evento = parseInt( queries[0].split('=')[1] );
}

(function(window) {
	'use strict';
	var decoder = $('#qr-canvas'),
		sl = $('.scanner-laser'),
		sQ = $('#scanned-QR');
	sl.css('opacity', .5);
	
	decoder.click(function(){
		if (decoder.data().plugin_WebCodeCam.options.ReadBarecode)
			decoder.data().plugin_WebCodeCam.tryParseBarecode();
		
		if (decoder.data().plugin_WebCodeCam.options.ReadQRCode)
			decoder.data().plugin_WebCodeCam.tryParseQRCode();
	});

	function gotSources(sourceInfos) {
		for (var i = 0; i !== sourceInfos.length; ++i) {
			var sourceInfo = sourceInfos[i];
			var option = document.createElement('option');
			option.value = sourceInfo.id;
			if (sourceInfo.kind === 'video') {
				var face = sourceInfo.facing == '' ? 'unknown' : sourceInfo.facing;
				switch(face)
				{
					case "unknown":
						face = "Desconhecida";
						break;
						
					case "user":
						face = "Frontal";
						break;
						
					case "environment":
						face = "Traseira";
						break;
						
					default:
						break;
				}
				
				option.text = sourceInfo.label || 'camera ' + (videoSelect.length + 1) + ' (Câmera: ' + face + ')';
				videoSelect.appendChild(option);
			}
		}
	}
	if (typeof MediaStreamTrack.getSources !== 'undefined') {
		var videoSelect = document.querySelector('select#cameraId');
		$(videoSelect).change(function(event) {
			if (typeof decoder.data().plugin_WebCodeCam !== "undefined") {
				decoder.data().plugin_WebCodeCam.options.videoSource.id = $(this).val();
				decoder.data().plugin_WebCodeCam.cameraStop();
				decoder.data().plugin_WebCodeCam.cameraPlay(false);
			}
		});
		
		MediaStreamTrack.getSources(gotSources);
	} else {
		document.querySelector('select#cameraId').remove();
	}
	
	if (typeof decoder.data().plugin_WebCodeCam == "undefined") {
		decoder.WebCodeCam({
			videoSource: {
				id: document.querySelector('select#cameraId').value,
				maxWidth: 640,
				maxHeight: 480
			},
			autoBrightnessValue: 120,
			resultFunction: function(text, imgSrc) {
				text = JSON.parse(text +"");
				
				sQ.html("<strong>"+ text.nome +"</strong> registrado com sucesso.");
				sl.fadeOut(150, function() {
					sl.fadeIn(150);
				});
				
				// Banco de dados local
				db.usuarios.where("id").equals(text.id).count(function(c){
					// Não há usuário com esse ID
					if( c == 0 )
					{
						sQ.html("Erro na leitura. Por favor, tente novamente.<br />Caso o erro persista, busque ajuda.");
						return;
					}
					
					db.eventos.where("id").equals(evento).count(function(c){
						// Não há evento com esse ID
						if( c == 0 )
						{
							sQ.html("ERRO - EVENTO NÃO CADASTRADO");
							return;
						}
					
						// Caso tudo corra bem, insere a frequência
						db.frequencia.where("usuario").equals(text.id).count(function(c){
							// Para evitar dados reinseridos sem necessidade
							if( c == 0 )
							{
								db.frequencia.add({
									usuario: text.id,
									evento: evento,
								});
							}
						});
					});
				});
			},
			getUserMediaError: function() {
				alert('Sorry, the browser you are using doesn\'t support getUserMedia');
			},
			cameraError: function(error) {
				var p, message = 'Error detected with the following parameters:\n';
				for (p in error) {
					message += p + ': ' + error[p] + '\n';
				}
				alert(message);
			}
		});
		sQ.text('Direcione a câmera ao QR Code');
	} else {
		sQ.text('Direcione a câmera ao QR Code');
		$("#qr-canvas").data().plugin_WebCodeCam.cameraPlay();
	}
}).call(window.Page = window.Page || {});

function syncData() {
	
	// ENVIA FREQUÊNCIAS
	var n = -1;
	var _f_u = [];
	var _f_e = [];

	db.frequencia.each(function(f){
		++n;

		_f_u[n] = f.usuario;
		_f_e[n] = f.evento;
		
		console.log( "n = " + n + " - Usuario = " + f.usuario );
	}).then(function(){
		if( typeof _f_u !== "undefined" )
		{
			f_u = _f_u.join(',');
			f_e = _f_e.join(',');
		}
		else
		{
			f_u = "";
			f_e = "";
		}
		
		$.ajax({
			type: 'GET',
			url: syncpage + "?callback=successFreq&opt=1",
			data: "usuario=" + f_u + "&evento=" + f_e,
			dataType: "jsonp",
			jsonpCallback: "successFreq",
			crossDomain: true,
			sucess: successFreq,
			error: function(a, b, e) {
				console.error(e);
			}
		});
	});

	$.ajax({
		type: 'GET',
		url: syncpage + "?callback=successUsers&opt=2",
		dataType: "jsonp",
		jsonpCallback: "successUsers",
		crossDomain: true,
		sucess: successUsers,
		error: function(a, b, e) {
			console.error(e);
		}
	});
	
	$.ajax({
		type: 'GET',
		url: syncpage + "?callback=successEvents&opt=3",
		dataType: "jsonp",
		jsonpCallback: "successEvents",
		crossDomain: true,
		sucess: successEvents,
		error: function(a, b, e) {
			console.error(e);
		}
	});
}

function successFreq(res){
	for( i = 0; data = res[i]; ++i )
	{
		data = JSON.parse(data);
		
		if( data.id == -1 )
			console.error( data );
		else if( data.error != 0 && data.error != "23000" )
			console.error( data );
		else
		{
			console.log( data );
			db.frequencia.where("usuario").equals(parseInt(data.id)).delete();
		}
	}
}

function successUsers(res){
	db.usuarios.clear().then(function(){
		for( i = 0; data = res[i]; ++i )
		{
			data = JSON.parse(data);
			
			if( data.error != 0 && data.error != "23000" )
				console.error(data);
			else
			{
				db.usuarios.add({
					id: parseInt(data.id),
					nome: data.nome,
				});
			}
		}
	});
}

function successEvents(res){
	db.eventos.clear().then(function(){
		for( i = 0; data = res[i]; ++i )
		{
			data = JSON.parse(data);

			if( data.error != 0 && data.error != "23000" )
				console.error(data);
			else
			{
				db.eventos.add({
					id: parseInt(data.id),
					nome: data.nome,
				});
			}
		}
	});
}