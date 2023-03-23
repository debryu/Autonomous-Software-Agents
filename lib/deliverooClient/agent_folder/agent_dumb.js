import { io } from "socket.io-client";
import * as config from "./config.js";
import * as Parcel from './parcel.js';
import * as Environment from './environment.js';
import * as Sensing from "./sensing.js";
import * as Utils from "./utils.js";
import * as Action from "./action.js";

/* ------------------------------------------
INITIALIZE ALL THE LISTENERS
*/
export var socket = io( config.host, {
    extraHeaders: {
        'x-token': config.token
    },
    // query: {
    //     name: "scripted",
    // }
});


socket.on("connect", () => {
    console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc
});

socket.on("disconnect", () => {
    console.log( "socket disconnect", socket.id ); // x8WIv7-mJelg7on_ALbxc
});

//Save the map
socket.on( 'tile', function(x,y,deliv){
    Environment.getMap(x,y,deliv);

    //START THE CODE AS SOON AS WE GET THE ENTIRE MAP
    if(x == Environment.mapDimension.x - 1 && y == Environment.mapDimension.y - 1)
        ARE_YOU_WINNING_SON();
}); 

socket.on("you", function(data){
    Sensing.ME.id = data.id;
    Sensing.ME.name = data.name;
    Sensing.ME.x = data.x;
    Sensing.ME.y = data.y;
    Sensing.ME.score = data.score;
    console.log('not frozen');
});

/*
socket.on("you", function(data){
    Sensing.ME.id = data.id;
    Sensing.ME.name = data.name;
    Sensing.ME.x = data.x;
    Sensing.ME.y = data.y;
    Sensing.ME.score = data.score;
    
    Sensing.printPosition();
});
*/

/*
socket.on("you", ({id, name, x, y, score}) => {
    Sensing.ME.id = id;
    Sensing.ME.name = name;
    Sensing.ME.x = x;
    Sensing.ME.y = y;
    Sensing.ME.score = score;
    //Sensing.ME.x =x, Sensing.ME.y=y
    //Sensing.ME.x =Math.round(x), Sensing.ME.y=Math.round(y);
});
*/

//socket.on( 'agents sensing', aa => console.log(aa) ) // [ {}, {id, x, y, score}]
//socket.on( 'parcels sensing', pp => Parcel.findParcel(pp[0]) ) // [ {}, {id, x, y, carriedBy, reward}]
//


//MAIN LOOP
async function ARE_YOU_WINNING_SON(){
    while(true){
        await Action.move('left')
            .then((dir)=>console.log('move ' + dir))
            .catch((dir)=>console.log('failed to move ' + dir));
        await new Promise( res => setTimeout(res, 900) ); // wait 1 sec
        Environment.printMap(Environment.MAP,Environment.mapDimension);
    }
}

