'use strict'


/*
    Routes:

  //login => return token Bearer
  Route.get('/login/', 'UberController.login');
  //find_store require place_id google that parameter => return json with info 
  Route.get('/find_store/', 'UberController.find_store');
  //estimate_deleviry => require lat, lon, formated adress to dorpoff => return json with estimate and estimate id to create delivery
  Route.post('/estimate_delivery/', 'UberController.estimate_delivery');
  //create_delivery => requiere json
  Route.post('/create_delivery/', 'UberController.create_delivery');
  //status_delivery => require order_id => return status order
  Route.get('/status_delivery/', 'UberController.status_delivery');
  //cancel_delivery => require order_id => return OK
  Route.get('/cancel_delivery/', 'UberController.cancel_delivery');
*/


//requiere install npm i node-fetch to api
const fetch = require('node-fetch');
//alojo en memoria las 
let Uber_client_info = {
    //info store api-uber
    client_id: "70nCBlES4qHFbWf_YyStEcmMT2ayjcYj",
    client_secret: "5Dj6tt5pI51dp2p0kC2plSBq2oc0PP5sG-rDmLwy",
    place_id: "ChIJZ0hLrpvPYpYR7KeW5Jf2Sfg",
    store_id: "f20ff1b6-cc1e-4911-90a9-fffac1d8447d",
    //constats
    uri: 'http://127.0.0.1:4000/api/uri',
    scope: 'eats.deliveries eats.store.orders.cancel ',
}


class UberController {

    //login => return token Bearer
    async login() {
        let token = "";
        let params = new URLSearchParams();
        params.append("client_secret", Uber_client_info.client_secret);
        params.append("client_id", Uber_client_info.client_id);
        params.append("grant_type", "client_credentials");
        params.append("redirect_uri", Uber_client_info.uri);
        params.append("scope", Uber_client_info.scope);
        await fetch('https://login.uber.com/oauth/v2/token', {
            method: 'post',
            body: params,
            "Content-Type": "application/x-www-form-urlencoded",
        })
            .then(res => res.json())
            .then(json => {
                token = json.access_token;
            });
        return token;
    }

    //disconect
    async disconnect({ token }) {
        let params = new URLSearchParams();
        params.append("client_secret", Uber_client_info.client_secret);
        params.append("client_id", Uber_client_info.client_id);
        params.append("token", token);
        await fetch('https://login.uber.com/oauth/v2/revoke', {
            method: 'post',
            body: params,
            "Content-Type": "application/x-www-form-urlencoded",
        });

        return;
    }

    //find_store require place_id google that parameter => return json with info 
    async find_store({ request, response }) {
        let token = await this.login();
        let respuesta = '';
        await fetch(`https://api.uber.com/v1/eats/deliveries/stores?place_id=${Uber_client_info.place_id}&place_provider=google_places`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept-Language': 'en_US',
                'Content-Type': 'application/json'
            },
        })
            .then(res => res.json())
            .then(json => {
                respuesta = json;
            });

        await this.disconnect(token);
        response.send(respuesta);
    }

    //estimate_deleviry => require lat, lon, formated adress to dorpoff => return json with estimate and estimate id to create delivery
    async estimate_delivery({ request, response }) {
        let token = await this.login();
        let data = request.all()
        console.info(data)
        let respuesta;
        await fetch('https://api.uber.com/v1/eats/deliveries/estimates', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "pickup": {
                    "store_id": Uber_client_info.store_id
                },
                "dropoff_address": {
                    "location": {
                        "latitude": parseFloat(data.latitude),
                        "longitude": parseFloat(data.longitude)
                    },
                    "formatted_address": data.formatted_address
                },
                "pickup_times": [0]
            }),

        })
            .then(res => res.json())
            .then(json => {
                console.info(json)
                respuesta = json;
            });
        await this.disconnect(token);
        response.send(respuesta);
    }

    //create_delivery => require json / return => json with info order
    async create_delivery({ request, response }) {
        let token = await this.login();
        let data = request.all()
        let respuesta;
        await fetch('https://api.uber.com/v1/eats/deliveries/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(json => {
                console.info(json)
                respuesta = json;
            });

        await this.disconnect(token);
        response.send(respuesta);
    }


    //cancel_delivery => post form with order_id / return => json with info order
    async cancel_delivery({ request, response }) {
        let token = await this.login();
        let data = request.all()
        console.info(data)
        let respuesta;
        await fetch(`https://api.uber.com/v1/eats/orders/${data.order_id}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "reason":"CANNOT_COMPLETE_CUSTOMER_NOTE",
                "details":"note is impossible"
            })
        })
            .then(res => res.json())
            .then(json => {
                console.info(json)
                respuesta = json;
            });

        await this.disconnect(token);
        response.send(respuesta);
    }


    //status_delivery => require order_id => return status order
    async status_delivery({ request, response }) {
        let token = await this.login();
        let data = request.all()
        console.info(data)
        let respuesta;
        await fetch(`https://api.uber.com/v1/eats/deliveries/orders/${data.order_id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        })
            .then(res => res.json())
            .then(json => {
                console.info(json)
                respuesta = json;
            });

        await this.disconnect(token);
        response.send(respuesta);
    }


}

module.exports = UberController
