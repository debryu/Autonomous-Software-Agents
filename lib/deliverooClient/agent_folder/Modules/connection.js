import { io } from "socket.io-client";
import * as Config from "./config.js";

export var socket = io( Config.host, {
    extraHeaders: {
        'x-token': Config.token
    },
});


export function connectToServer(){
    socket.on("connect", () => {
        console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc
    });
}

export function agentSensing(){
    socket.on( 'agents sensing', aa => console.log(aa) ); // [ {}, {id, x, y, score}]
}

export function parcelSensing(){
    socket.on( 'parcels sensing', pp => console.log(pp) ); // [ {}, {id, x, y, carriedBy, reward}]
}

export function mapSensing(){
    socket.on( 'tile', function(x,y,deliv){
        console.log(x,y,deliv);
    }); 
}

export function meSensing(){
    socket.on("you", function(data){
        console.log(data);
    });
}

export function configSensing(){
    socket.on( 'config', config => console.log('config:',config));
}

//Do everything at once
export function turnOnAllSensing(){
    connectToServer();
    configSensing();
    //PROB WAIT SOME TIME HERE
    //SET THE MAP DIMENSION RIGHT
    mapSensing();
    meSensing();
    agentSensing();
    parcelSensing();
}




turnOnAllSensing();



/* ----------[LIST OF POSSIBLE CALLS]---------------------

socket.on("connect", () => {
    console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc
});

socket.on("disconnect", () => {
    console.log( "socket disconnect", socket.id ); // x8WIv7-mJelg7on_ALbxc
});

socket.on( 'tile', function(x,y,deliv){
    console.log(x,y,deliv);
}); 

socket.on("you", function(data){
    console.log(data);
});


socket.on( 'config', config => console.log('config:',config));

socket.on( 'agents sensing', aa => console.log(aa) ); // [ {}, {id, x, y, score}]
socket.on( 'parcels sensing', pp => console.log(pp) ); // [ {}, {id, x, y, carriedBy, reward}]


---------------------------------------------------------------------------------------------*/