import { io } from "socket.io-client";
import * as config from "./Modules/config.js";
import * as Parcel from './Modules/parcel.js';
import * as Env from './Modules/env.js';
import * as Sensing from "./Modules/sensing.js";
//import * as Action from "./Modules/action.js";
import * as Enemy from "./Modules/enemy.js";
import * as Connection from "./Modules/connection.js";

/* ------------------------------------------
INITIALIZE ALL THE LISTENERS
*/
export var socket = io( config.host, {
    extraHeaders: {
        'x-token': config.token
    },
});

//Establish connection with server
socket.on("connect", async function(){
    console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc
    Connection.turnOnAllSensing();
    //WAIT UNTIL WE GET THE ENTIRE MAP
    //0.1 SECOND THEN GOOOO
    await new Promise(res => setTimeout(res, 100));
    console.log('Connected!')
    console.log('Initialize...');
    Env.initializePDMAP();
    Sensing.initializeMHDMAP();
    console.log('Ok, lets win this!');
    ARE_YOU_WINNING_SON();
});

async function ARE_YOU_WINNING_SON(){

    while(true){
        Env.printPDMap();
        Sensing.mhdFinder();
        Env.printMHDMap();
        console.log('Closest border:',Sensing.closestDelivery());
        //Wait for the server to send the new map
        await new Promise(res => setTimeout(res, 1000));
    }
    

}