import { io } from "socket.io-client";
import * as Config from "./config.js";
import * as Env from "./env.js";
import * as Sensing from "./sensing.js";
import * as Enemy from "./enemy.js";
import * as Parcel from "./parcel.js";

var mapConf;

export var socket = io( Config.host, {
    extraHeaders: {
        'x-token': Config.token
    },
});

export function connect2Server(){
    socket.on("connect", () => {
        console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc
    });
}

export function disconnect2Server(){
    socket.on("disconnect", () => {
        console.log( "socket disconnect", socket.id ); // x8WIv7-mJelg7on_ALbxc
    });
}

export function agentSensing(){
    socket.on( 'agents sensing', ee => Enemy.updateEnemyArray(ee) ) // [ {}, {id, x, y, score}]
}

export function parcelSensing(){
    socket.on( 'parcels sensing', pp => Parcel.updateParcelArray(pp) ) // [ {}, {id, x, y, carriedBy, reward}]
}

export function mapSensing(){
    socket.on( 'tile', function(x,y,deliv){
        console.log(x,y,deliv);
        if(x != undefined && y != undefined){
            Env.MAP[y][x] = 0;
        if (deliv)
            Env.MAP[y][x] = 2;
        }
    }); 
}

export function meSensing(){
    socket.on("you", function(data){
        Sensing.ME.id = data.id;
        Sensing.ME.name = data.name;
        Sensing.ME.x = data.x;
        Sensing.ME.y = data.y;
        //FOR THE PADDED MAP
        //First check if the value is not a float (when moving)
        //Otherwise it will broke every matrix 
        if(Number.isInteger(data.x) && Number.isInteger(data.y)){
            Sensing.agentCell.x = data.x+1;
            Sensing.agentCell.y = data.y+1;
        }
        
        Sensing.ME.score = data.score;
    });
}

export function configSensing(){
    socket.on( 'config', function(config){
        mapConf = config;
        console.log(mapConf);
    });
}

//Do everything at once
export function turnOnAllSensing(){
    //connect2Server();
    disconnect2Server();
    configSensing();
    //PROB WAIT SOME TIME HERE
    //SET THE MAP DIMENSION RIGHT
    mapSensing();
    meSensing();
    agentSensing();
    parcelSensing();
}

turnOnAllSensing();

export function getMapConf(){
    return mapConf;
}


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