import { io } from "socket.io-client";
import * as config from "../Modules/config.js";
import * as Parcel from '../Modules/parcel.js';
import * as Env from '../Modules/env.js';
import * as Sensing from "../Modules/sensing.js";
import * as Action from "../Modules/action.js";
import * as Planner from "./planner.js";
import * as Connection from "../Modules/connection.js";
import { shout } from "../Modules/coms.js";
import * as Pddl from './PDDLplanner.js';

/* ------------------------------------------
PARAMETERS
*/
const min_reward_threshold = 5;
const delivery_cutoff = 1;

console.log(config.host, config.token);
export var socket = io( config.host, {
    extraHeaders: {
        'x-token': config.token
    },
});

console.log('Sensing turned on!')
Connection.turnOnAllSensing();
console.log('Sensing turned on!')
//Establish connection with server

socket.on("connect", async function(){
    
    console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc
    //WAIT UNTIL WE GET THE ENTIRE MAP
    //0.1 SECOND THEN GOOOO
    await new Promise(res => setTimeout(res, 100));
    console.log('Connected!')
    console.log('Initialize...');
    while(!Connection.ready){
        console.log('Waiting for the map...');
        await new Promise(res => setTimeout(res, 100));
    }
    console.log(Env.MAP);
    console.log(Env.MAP);
    Env.initializePDMAP();
    Sensing.initializeMHDMAP();
    
    console.log('Ok, lets win this!');
    await new Promise(res => setTimeout(res, 100));
    //Set the planner dimension
    Planner.setDimension();

    ARE_YOU_WINNING_SON();
});

async function ARE_YOU_WINNING_SON(){

    let i = 0;
    let times = [];
    while(true){
        let start_time = Date.now();
        await Action.move('up');
        let delta = Date.now()-start_time;
        times.push(delta);
        console.log(delta);
        delta = 0;
        i += 1;

        if(i == 18){
            // Compute the mean of the times
            let sum = 0;
            for(let j = 0; j < times.length; j++){
                sum += times[j];
            }
            let mean = sum/times.length;
            console.log('Mean: ', mean);
            break;
        }

    }
    
    

}