import { io } from "socket.io-client";
import * as Config from "./config.js";
import * as Env from "./env.js";
import * as Sensing from "./sensing.js";
import * as Enemy from "./enemy.js";
import * as Parcel from "./parcel.js";
import * as Planner from "./planner.js";
import * as Main from "../mainframe.js";

/*
HANDLE ALL THE CONFIGURATION AND CONNECTIONS WITH THE SERVER
---------------------------------------------------------------
*/


// Variable to check if the connection is everything is ready
export var ready = false;

// Initialize the socket
export var socket = io( Config.host + Main.name, {
    extraHeaders: {
        'x-token': /*Config.token*/ Main.token
    },
});

// set the socket with the token and the name from the terminal command
export function updateSocket(){
    socket = io( Config.host + Main.name, {
        extraHeaders: {
            'x-token': /*Config.token*/ Main.token
        },
    });
    console.log('Socket updated to token and name', Main.token, Main.name);
}

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

/*
export function jparcelSensing(){
    socket.on( 'parcels sensing', pp => Parcel.watcher(pp) ) // [ {}, {id, x, y, carriedBy, reward}]
}

export function j2parcelSensing(){
    socket.on( 'parcels sensing', pp => Parcel.watcher(pp) ) // [ {}, {id, x, y, carriedBy, reward}]
}
*/

export function mapSensing(){
    socket.on( 'tile', function(x,y,deliv){
        ready = true;
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

//Variable for the configuration of the map
/*
{
  MAP_FILE: 'default_map',
  PARCELS_GENERATION_INTERVAL: '2s',
  MOVEMENT_STEPS: 1,
  MOVEMENT_DURATION: 500,
  AGENTS_OBSERVATION_DISTANCE: 5,
  PARCELS_OBSERVATION_DISTANCE: 5,
  PARCEL_REWARD_AVG: 30,
  PARCEL_REWARD_VARIANCE: 10,
  PARCEL_DECADING_INTERVAL: '1s',
  RANDOMLY_MOVING_AGENTS: 2,
  RANDOM_AGENT_SPEED: '2s',
  CLOCK: 50
}
*/
export function configSensing(){
    socket.on( 'config', function(config){
        Env.mapConfig.MAP_FILE = config.MAP_FILE;
        Env.mapConfig.PARCELS_GENERATION_INTERVAL = config.PARCELS_GENERATION_INTERVAL;
        Env.mapConfig.MOVEMENT_STEPS = config.MOVEMENT_STEPS;
        Env.mapConfig.MOVEMENT_DURATION = config.MOVEMENT_DURATION;
        Env.mapConfig.AGENTS_OBSERVATION_DISTANCE = config.AGENTS_OBSERVATION_DISTANCE;
        Env.mapConfig.PARCELS_OBSERVATION_DISTANCE = config.PARCELS_OBSERVATION_DISTANCE;
        Env.mapConfig.PARCEL_REWARD_AVG = config.PARCEL_REWARD_AVG;
        Env.mapConfig.PARCEL_REWARD_VARIANCE = config.PARCEL_REWARD_VARIANCE;
        Env.mapConfig.PARCEL_DECADING_INTERVAL = config.PARCEL_DECADING_INTERVAL;
        Env.mapConfig.RANDOMLY_MOVING_AGENTS = config.RANDOMLY_MOVING_AGENTS;
        Env.mapConfig.RANDOM_AGENT_SPEED = config.RANDOM_AGENT_SPEED;
        Env.mapConfig.CLOCK = config.CLOCK;
        
        console.log(config);
        console.log(config.PARCEL_DECADING_INTERVAL);
        //Planner.initializeGammaAs('1s');
        Planner.initializeGammaAs(config.PARCEL_DECADING_INTERVAL);
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
    //parcelSensing(); other one needed for explorer
}

//turnOnAllSensing();

export function getMapConf(){
    socket.on('map', function(data){
        console.log(data)})
    //return mapConf;
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