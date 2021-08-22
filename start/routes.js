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

Route.get('/', () => {
  return { greeting: 'Api Uber => apiuber/v1' }
});

// Grouped
Route.group(() => {

  Route.get('/', () => {
    return { greeting: 'Hello you are inside api-uber' }
  });

  //login => return token Bearer
  Route.get('/login/', 'UberController.login');
  //find_store require place_id (in variables) google => return json with info 
  Route.get('/find_store/', 'UberController.find_store');
  //estimate_deleviry => require lat, lon, formated adress to dorpoff => return json with estimate and estimate id to create delivery
  Route.post('/estimate_delivery/', 'UberController.estimate_delivery');
  //create_delivery => require json
  /*{
    "currency_code": "CLP",
      "dropoff": {
      "address": {
        "location": {
          "latitude": -33.4577472, <- latitude from estimate
            "longitude": -70.6046975 <- longitude from estimate
        }
      },
      "formatted_address": "JOSE DOMINGO CAÑAS 2809 ÑUÑOA", <- formated adress form estimate
        "contact": {
        "email": "test.email@gmail.com",
          "first_name": "Test",
            "last_name": "E",
              "phone": "+17037276834"
      },
      "instructions": null
    },
    "estimate_id": "9b8ca947-d2ec-424f-adc7-730372741940", <- from estimate
      "external_order_id": "516062",
        "external_user_id": "2532",
          "order_items": [
            {
              "name": "Bacon Egg & Cheese Biscuit",
              "quantity": 1
            }
          ],
            "order_value": 1,
              "pickup": {
      "external_store_id": "273",
        "instructions": "Pickup order via Front-Counter or Drive-Thru - select the faster option. If the lobby is closed (late night), please pickup order via Drive-Thru. After collecting the order from McDonald's, please do not break open the sticker seal.",
          "store_id": "f20ff1b6-cc1e-4911-90a9-fffac1d8447d" <- from find store
    },
    "pickup_at": 0
  }
  
  return => json with order id*/
  Route.post('/create_delivery/', 'UberController.create_delivery');
  //status_delivery => require order_id => return status order
  Route.post('/status_delivery/', 'UberController.status_delivery');
  //cancel_delivery => post form with order_id / return => empty json it is OK
  Route.post('/cancel_delivery/', 'UberController.cancel_delivery');

}).prefix('apiuber/v1')



Route.group(() => {

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