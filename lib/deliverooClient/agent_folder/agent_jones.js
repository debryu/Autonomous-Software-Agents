import { io } from "socket.io-client";
import * as config from "./Modules/config.js";
import * as Parcel from './Modules/parcel.js';
import * as Env from './Modules/env.js';
import * as Sensing from "./Modules/sensing.js";
import * as Action from "./Modules/action.js";
import * as Planner from "./planner.js";
import * as Connection from "./Modules/connection.js";
import { shout } from "./Modules/coms.js";
import * as Pddl from './PDDLplanner.js';

/* ------------------------------------------
PARAMETERS
*/
const min_reward_threshold = 5;
const delivery_cutoff = 1;
var tunnels;

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

    tunnels = Env.tunnelFinder();

    ARE_YOU_WINNING_SON();
});

function randomExplore(){

    for(let i=0;i<Env.PDmapDimension.x;i++){
        for(let j=0;j<Env.PDmapDimension.y;j++){
            if (Env.PDMAP[j][i] == 0){
                //console.log(i+1,j+1);
                Env.Ocells.push(Planner.createUniqueID(i,j));
            }
        }
    }

    let num = Env.Ocells.length;
    num = Math.floor(Math.random()*num);
    let destination = Planner.cellFromUniqueID(Env.Ocells[num]);
    //destination.x = destination.x-1;
    //destination.y = destination.y-1;
    console.log('decoded coord', destination, Env.Ocells[num], num, Env.Ocells.length, Env.PDMAP[destination.y][destination.x]);
    return destination;
}

var emergency = 0;

async function ARE_YOU_WINNING_SON(){

    while(true){
        console.log(Connection.getMapConf());
        Env.printPDMap();
        Parcel.updateRewards(Parcel.parcelsArray);
        console.log('using PDDL to explore');
        await new Promise(res => setTimeout(res, 1000));
        Pddl.initPDDL(randomExplore());
        let pddlStuff = await Pddl.getPlan();
        console.log('agent position',Sensing.agentCell);

         //let plength = Parcel.parcelsArray.length;
        await new Promise(res => setTimeout(res, 10));
        try{
            await Action.goTo(pddlStuff, true);
        }
        catch(err){
            console.log(err);
             break;
        }
    }
    
    

}