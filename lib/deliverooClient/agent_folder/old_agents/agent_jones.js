import { io } from "socket.io-client";
import * as config from "../Modules/config.js";
import * as Parcel from '../Modules/parcel.js';
import * as Env from '../Modules/env.js';
import * as Sensing from "../Modules/sensing.js";
import * as Action from "../Modules/action.js";
import * as Planner from "./planner.js";
import * as Connection from "../Modules/connection.js";
import * as Pddl from '../Modules/PDDLplanner.js';
import * as Coms from "../Modules/coms.js";
import { xorEncrypt } from "../Modules/utils.js";
import { enemyArray } from "../Modules/enemy.js";

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
Connection.j2parcelSensing();
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
    //Coms.onMsg(); // Message listener
    ARE_YOU_WINNING_SON();
});





var emergency = 0;
var seenp = 0;
let alwaysReplan=0;

async function ARE_YOU_WINNING_SON(){

    //Find the delivery zone in the tunnel:
    const visited = [];
    for (let i = 0; i < Env.PDMAP.length; i++) {
        visited.push(new Array(Env.PDMAP[i].length).fill(false));
    }
    var delivery = findCellWithTwo(Env.PDMAP, [Sensing.agentCell.x,Sensing.agentCell.y], visited);
    delivery = {'x': delivery[1], 'y':Env.PDMAP.length - 1 - delivery[0]};

    while(true){
        console.log(Connection.getMapConf());
        //Env.printPDMap();
        let endpoint = oscilate(delivery);
        

        console.log('using PDDL to explore');
        await new Promise(res => setTimeout(res, 1000));
        Pddl.initPDDL();
        let pddlStuff = await Pddl.getPlan();
        console.log('agent position',Sensing.agentCell);
        //console.log(Parcel.seenParcels)
        await new Promise(res => setTimeout(res, 10));
        try{
            await Action.goTo(pddlStuff, true, alwaysReplan);
        }
        catch(err){
            console.log(err);
             break;
        }
    }
}