# coding: utf-8
'''
Created on 17/04/2016

@author: Edgar
'''

import logging
import unicodedata
from django.http import HttpResponse
from django.utils import simplejson
from google.appengine.api import users
from models import Asistente
from models import Asistencia
import datetime
from google.appengine.ext import ndb
from views import comun
from google.appengine.api import mail


def AsistenciaHandler(request, ident):
    
    fechaAhora = datetime.datetime.now() - datetime.timedelta(hours=5)
    response = HttpResponse("", content_type='application/json')
    
    def corregirFecha(nombre, payload):
        if (payload.has_key(nombre) and not (payload[nombre] is None)):
            payload[nombre] = payload[nombre]/1000;
    
    def corregirFechasPersona(rta):
        if (rta.has_key('nacimiento') and not (rta['nacimiento'] is None)):
            rta['nacimiento'] = rta['nacimiento']*1000;
        if (rta.has_key('aniversario') and not (rta['aniversario'] is None)):
            rta['aniversario'] = rta['aniversario']*1000;
        if (rta.has_key('primiparo') and not (rta['primiparo'] is None)):
            rta['primiparo'] = rta['primiparo']*1000;
    
    def buscarPersona(payload):
        if (payload.has_key('id')):
            return buscarPersonaConId(payload['id'])
        if (payload.has_key('cedula')):
            return buscarPersonaConCedula(payload['cedula'])
        return None
    
    def buscarPersonaConId(idLocal):
        llave = ndb.Key(Asistente, idLocal)
        viejo = llave.get()
        return viejo
    
    def buscarPersonaConCedula(numero):
        #busco por correo
        busqueda = "SELECT * FROM Asistente "
        busqueda += "WHERE "
        busqueda += "cedula = '"+str(numero)+"'"
        objeto = comun.buscarGQL({"q":busqueda, "n":long(1)})
        if (len(objeto['datos']) == 0):
            return None
        return objeto['datos'][0]
    
    def buscarMonitores(payload, tampagina):
        busqueda = "SELECT * FROM Asistente WHERE rol = 2"
        nextPoint = None
        if not payload is None and payload.has_key('next'):
            nextPoint = payload['next']
        objeto = comun.buscarGQL({"q":busqueda, "n":long(tampagina), "next": nextPoint})
        return objeto
    
    def verAsistencia(payload, tampagina):
        fecha = payload['fecha']
        nextPoint = None
        if payload.has_key('next'):
            nextPoint = payload['next']
        fechaAntes = datetime.datetime.fromtimestamp(float(fecha))
        fechaDespues = datetime.datetime.fromtimestamp(float(fecha))+datetime.timedelta(hours=24)
        formato = "%Y, %m, %d, %H, %M, %S"
        
        busqueda = "SELECT * FROM Asistencia "
        busqueda += "WHERE "
        busqueda += "fecha > DATETIME("+fechaAntes.strftime(formato)+") AND "
        busqueda += "fecha < DATETIME("+fechaDespues.strftime(formato)+") "
        busqueda += "ORDER BY fecha ASC "
        objeto = comun.buscarGQL({"q":busqueda, "n":long(tampagina), "next": nextPoint})
        return objeto
    
    def verTodos(payload, tampagina):
        busqueda = "SELECT * FROM Asistente ORDER BY apellidos ASC"
        nextPoint = None
        if payload.has_key('next'):
            nextPoint = payload['next']
        objeto = comun.buscarGQL({"q":busqueda, "n":long(tampagina), "next": nextPoint})
        return objeto
    
    def verNuevos(payload, tampagina):
        fecha = payload['fecha']
        nextPoint = None
        if payload.has_key('next'):
            nextPoint = payload['next']
        fechaAntes = datetime.datetime.fromtimestamp(float(fecha))
        fechaDespues = datetime.datetime.fromtimestamp(float(fecha))+datetime.timedelta(hours=24)
        formato = "%Y, %m, %d, %H, %M, %S"
        
        busqueda = "SELECT * FROM Asistente "
        busqueda += "WHERE "
        busqueda += "primiparo > DATETIME("+fechaAntes.strftime(formato)+") AND "
        busqueda += "primiparo < DATETIME("+fechaDespues.strftime(formato)+") "
        busqueda += "ORDER BY primiparo ASC "
        objeto = comun.buscarGQL({"q":busqueda, "n":long(tampagina), "next": nextPoint})
        return objeto
    
    def checkearTamanioToken(x, tam):
        return len(x)>=tam
    
    def tokenizar(texto, mimSize):
        #texto = texto.decode('utf-8')
        texto = ''.join((c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn'))
        texto = texto.lower()
        ans = []
        tokens = texto.split()
        tokens = [x for x in tokens if checkearTamanioToken(x, mimSize)]
        for untoken in tokens:
            for i in range(mimSize, len(untoken)+1):
                parte = untoken[:i]
                if not parte in ans:
                    ans.append(parte)
        return ans
    
    def verPersonasQ(payload, tampagina):
        monitor = None
        token = None
        if payload.has_key('q'):
            token = payload['q'];
        if payload.has_key('monitor'):
            monitor = payload['monitor'];
        if (token is None):
            token = ""
        tokens = token.split()
        #limpio los tokens de menos de 3
        tokens = [x for x in tokens if checkearTamanioToken(x, 3)]
        if (len(tokens) > 0):
            busqueda = "SELECT * FROM Asistente WHERE "
            for untoken in tokens:
                busqueda += "busqueda IN ('"+untoken.lower()+"') AND "
            if not monitor is None:
                busqueda += "monitor = "+str(monitor)+" AND"
            busqueda = busqueda[:-4]
        else:
            busqueda = "SELECT * FROM Asistente "
            if not monitor is None:
                busqueda += "WHERE monitor = "+str(monitor)+" "
        busqueda += "ORDER BY apellidos ASC"
        
        nextPoint = None
        if payload.has_key('next'):
            nextPoint = payload['next']
        objeto = comun.buscarGQL({"q":busqueda, "n":long(tampagina), "next": nextPoint})
        return objeto

    
    def buscarPersonaConCorreo(correo):
        #busco por correo
        busqueda = "SELECT * FROM Asistente "
        busqueda += "WHERE "
        busqueda += "correo = '"+correo.upper()+"'"
        objeto = comun.buscarGQL({"q":busqueda, "n":long(1)})
        if (len(objeto['datos']) == 0):
            return None
        return objeto['datos'][0]
    
    def enriquecerEntidad(payload, clase):
        attributos = clase._buscables
        texto = '';
        for atributo in attributos:
            contenido = payload[atributo]
            if not contenido is None :
                if atributo == 'cedula':
                    texto+=contenido[2:]+' '#le quito las primeras dos letras
                else:
                    texto+=contenido+' '
        payload['busqueda'] = tokenizar(texto, 3)
    
    def crearPersona(payload):
        nuevo = Asistente()
        nuevo.primiparo = fechaAhora
        enriquecerEntidad(payload, Asistente)
        if not payload.has_key('monitor'):
            payload['monitor'] = 0 #significa que esta por asignar
        rta = comun.llenarYpersistir(Asistente, nuevo, payload, None)
        return rta
    
    def crearAsistencia(asistente):
        nuevo = Asistencia()
        nuevo.asistente = asistente.key.id()
        nuevo.fecha = fechaAhora
        nuevo.put()
    
    def actualizarPersona(payload, viejo):
        llave = ndb.Key(Asistente, payload['id'])
        viejo2 = llave.get()
        if (viejo2):
            enriquecerEntidad(payload, Asistente)
            logging.info(payload)
            #existe el que voy a actualizar
            if (viejo is None or viejo.key.id() == viejo2.key.id()):
                rta = comun.llenarYpersistir(Asistente, viejo2, payload, None)
                return {'error':0, 'rta': rta}
            else:
                return {'error':4, 'msg': 'La cédula '+str(payload['cedula'])+' ya existe'}
    
    try:
        if request.method == 'PUT':
            payload = None
            if (request.raw_post_data):
                payload = simplejson.loads(request.raw_post_data)
            accion = request.GET.get('accion', None)
            
            #A partir de aca se evalua la accion
            if (accion == 'leer-usuario'):
                usuario = users.get_current_user()
                if (usuario is None):
                    response.write(simplejson.dumps({'error':1, 'msg':'Debe ingresar antes'}))
                else:
                    #busco por correo
                    respuesta = buscarPersonaConCorreo(usuario.email())
                    entidades = comun.to_dict(respuesta)
                    if (entidades is None):
                        response.write(simplejson.dumps({'error':1, 'msg':'El usuario no se encuentra registrado'}))
                    else:
                        response.write(simplejson.dumps({'error':0, 'data':entidades}))
                
            elif (accion == 'leer-grupo'):
                response.write(simplejson.dumps({'error':0}))
            elif (accion == 'crear-persona' or accion == 'actualizar-persona' or accion == 'crear-actualizar-persona'):
                corregirFecha('nacimiento', payload)
                corregirFecha('aniversario', payload)
                #busco si ya existe con la cedula dada
                viejo = buscarPersonaConCedula(payload['cedula'])
                
                if (not payload.has_key('id') or payload['id'] is None):
                    if (accion != 'crear-persona' and accion != 'crear-actualizar-persona'):
                        response.write(simplejson.dumps({'error':5, 'msg': 'Sin id solo se debe crear la persona'}))
                    else:
                        #Aca es crear la persona
                        if viejo:
                            response.write(simplejson.dumps({'error':2, 'msg': 'La cédula '+str(payload['cedula'])+' ya existe'}))
                        else:
                            rta = crearPersona(payload)
                            response.write(simplejson.dumps({'error':0, 'rta': rta}))
                else:
                    if (accion == 'crear-persona'):
                        response.write(simplejson.dumps({'error':3, 'msg': 'Con id no se debe crear la persona'}))
                    else:
                        rta = actualizarPersona(payload, viejo)
                        response.write(simplejson.dumps(rta))
            elif (accion == 'leer-persona'):
                viejo = buscarPersona(payload)
                if viejo:
                    rta = comun.to_dict(viejo)
                    corregirFechasPersona(rta)
                    response.write(simplejson.dumps({'error':0, 'rta': rta}))
                else:
                    response.write(simplejson.dumps({'error':1, 'msg': 'La persona no esta registrada'}))
            elif (accion == 'pedir-actualizar'):
                viejo = buscarPersona(payload)
                if viejo:
                    try:
                        message = mail.EmailMessage()
                        message.sender = "gcamigosdedios@gmail.com"
                        message.to = viejo.correo
                        message.html = payload['mensaje']
                        message.body = payload['mensaje']
                        message.subject = "Grupo de conexión".decode('utf-8')+'-'+datetime.date.today().strftime("%B %d, %Y")
                        message.send()
                        response.write(simplejson.dumps({'error':0}))
                    except:
                        logging.exception("message")
                        response.write(simplejson.dumps({'error':1, 'msg': 'No se logró enviar el correo'}))
                else:
                    response.write(simplejson.dumps({'error':1, 'msg': 'La persona no esta registrada'}))
            elif (accion == 'buscar-personas'):
                objeto = verPersonasQ(payload, 10)
                entidades = comun.to_dict(objeto['datos'])
                for rta in entidades:
                    corregirFechasPersona(rta)
                cursor = None
                if (objeto.has_key('next')):
                    cursor = objeto['next']
                response.write(simplejson.dumps({'error':0, 'entidades': entidades, 'next': cursor}))
            elif (accion == 'borrar-persona'):
                if (users.is_current_user_admin()):
                    llave = ndb.Key(Asistente, long(payload['id']))
                    llave.delete()
                    response.write(simplejson.dumps({'error':0, 'borradas': 1}))
                else:
                    response.write(simplejson.dumps({'error':2, 'msg':'No tiene los privilegios'}))
            elif (accion == 'tomar-asistencia'):
                viejo = buscarPersona(payload)
                if (viejo):
                    #Debo crear una instancia de asistencia
                    crearAsistencia(viejo)
                    response.write(simplejson.dumps({'error':0, 'msg':'Gracias por asistir '+viejo.nombres+' '+viejo.apellidos}))
                else:
                    response.write(simplejson.dumps({'error':1, 'msg':'Debe ingresar como nuevo'}))
            elif (accion == 'verasistencia'):
                corregirFecha('fecha', payload) 
                objeto = verAsistencia(payload, 10)
                entidades = comun.to_dict(objeto['datos'])
                for rta in entidades:
                    corregirFechasPersona(rta)
                cursor = None
                if (objeto.has_key('next')):
                    cursor = objeto['next']
                response.write(simplejson.dumps({'error':0, 'entidades': entidades, 'next': cursor}))
                
            elif (accion == 'vernuevos'):
                corregirFecha('fecha', payload) 
                objeto = verNuevos(payload, 10)
                entidades = comun.to_dict(objeto['datos'])
                for rta in entidades:
                    corregirFechasPersona(rta)
                cursor = None
                if (objeto.has_key('next')):
                    cursor = objeto['next']
                response.write(simplejson.dumps({'error':0, 'entidades': entidades, 'next': cursor}))
            elif (accion == 'vertodos'):
                if (users.is_current_user_admin()):
                    corregirFecha('fecha', payload) 
                    objeto = verTodos(payload, 10)
                    entidades = comun.to_dict(objeto['datos'])
                    for rta in entidades:
                        corregirFechasPersona(rta)
                    cursor = None
                    if (objeto.has_key('next')):
                        cursor = objeto['next']
                    response.write(simplejson.dumps({'error':0, 'entidades': entidades, 'next': cursor}))
                else:
                    response.write(simplejson.dumps({'error':2, 'msg':'No tiene los privilegios'}))
            elif (accion == 'enviarreporte'):
                destinatario = payload['email']
                contenido = payload['contenido']
                asunto = payload['subject']
                try:
                    message = mail.EmailMessage()
                    message.sender = "gcamigosdedios@gmail.com"
                    message.to = destinatario
                    message.html = contenido
                    message.body = contenido
                    message.subject = "Reporte de grupo de conexión - ".decode('utf-8')+asunto
                    message.send()
                    response.write(simplejson.dumps({'error':0}))
                except:
                    logging.exception("message")
                    response.write(simplejson.dumps({'error':1, 'msg': 'No se logró enviar el correo'}))
            elif (accion == 'vermonitores'):
                if (users.is_current_user_admin()):
                    objeto = buscarMonitores(payload, 10)
                    entidades = comun.to_dict(objeto['datos'])
                    for rta in entidades:
                        corregirFechasPersona(rta)
                    cursor = None
                    if (objeto.has_key('next')):
                        cursor = objeto['next']
                    response.write(simplejson.dumps({'error':0, 'entidades': entidades, 'next': cursor}))
                else:
                    response.write(simplejson.dumps({'error':2, 'msg':'No tiene los privilegios'}))
        else:
            response.write(simplejson.dumps({'error':0}))
    except Exception, e:
        logging.exception("message")
        response.write(simplejson.dumps({'error':100, 'msg': 'Error de servidor: '+str(e)}))

    return response