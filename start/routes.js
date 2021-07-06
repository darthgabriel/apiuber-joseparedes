'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

//consltador de api
const fetch = require('node-fetch');
//alojo en memoria las 
global.Uber = {
  client_id: "y7NNIU7zFuQDmN-K-w7OPyQCIB7SFXdw",
  client_secret: "-j87-JiZcMXD_obzPg_A-SMOUTwMyV8HbYf7JGEb",
  uri: 'http://127.0.0.1:4000/api/uri',
  scope: 'offline_access',
  conectado: 0,
  token_cliente: '', //se llena el token despues del login, el token dura 10minutos segun la documentacion
  access_token: '', //se cambia el token anterior por un access token para los request
  redireccion: '',
}


Route.group(() => {
  Route.get('/login', async ({ response, request }) => {
    let url = `https://login.uber.com/oauth/v2/authorize?client_id=${global.Uber.client_id}&response_type=code&scope=${global.Uber.scope}&redirect_uri=${global.Uber.uri}`;
    response.redirect(url);
  });

  Route.get('/uri/', async ({ response, request }) => {
    global.Uber.token_cliente = await request._all.code;
    //obteniendo el berer token o token de consultas
    /* CURL API
   curl -F 'client_secret=<CLIENT_SECRET>' \
    -F 'client_id=<CLIENT_ID>' \
    -F 'grant_type=authorization_code' \
    -F 'redirect_uri=<REDIRECT_URI>' \
    -F 'scope=profile' \
    -F 'code=<AUTHORIZATION_CODE>' \
    https://login.uber.com/oauth/v2/token
    */
    let params = new URLSearchParams();
    params.append("client_secret", global.Uber.client_secret);
    params.append("client_id", global.Uber.client_id);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", global.Uber.uri);
    params.append("scope", global.Uber.scope);
    params.append("code", global.Uber.token_cliente);
    await fetch('https://login.uber.com/oauth/v2/token', {
      method: 'post',
      body: params,
      "Content-Type": "application/x-www-form-urlencoded",
    })
      .then(res => res.json())
      .then(json => {
        //cargando a las globals
        global.Uber.conectado = 1;
        global.Uber.access_token = json.access_token;
      });
    response.redirect(`/api/${global.Uber.redireccion}`);
  });

  Route.get('/check_connection/', async ({ response, request }) => {
    if (global.Uber.conectado == 0) {
      global.Uber.redireccion = "check_connection";
      response.redirect('/api/login');
    } else {
      global.Uber.redireccion = "";
      response.send(global.Uber)
    }
  });



  Route.get('/profile', async ({ response, request, params }) => {
    if (global.Uber.conectado == 0) {
      global.Uber.redireccion = "profile";
      response.redirect('/api/login');
    } else {
      global.Uber.redireccion = "";
    /* consulta CURL
    curl -H 'Authorization: Bearer <TOKEN>' \
     -H 'Accept-Language: en_US' \
     -H 'Content-Type: application/json' \
     'https://api.uber.com/v1.2/me'    
    */
    await fetch('https://api.uber.com/v1.2/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${global.Uber.access_token}`,
        'Accept-Language': 'en_US',
        'Content-Type': 'application/json'
      },
    })
      .then(res => res.json())
      .then(json => console.log(json));
  }
  });


}).prefix('/api/');