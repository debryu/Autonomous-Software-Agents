import { io } from "socket.io-client";
import * as config from "../Modules/config.js";
import * as Parcel from '../Modules/parcel.js';
import * as Env from '../Modules/env.js';
import * as Sensing from "../Modules/sensing.js";
import * as Action from "../Modules/action.js";
import * as Planner from "./planner.js";
//import * as Action from "./Modules/action.js";
//import * as Enemy from "./Modules/enemy.js";
import * as Connection from "../Modules/connection.js";
import { shout } from "../Modules/coms.js";
//Do git clone https://github.com/AI-Planning/api-tools.git in the same directory as the Autonomous-Software-Agents folder
//import * as PDDL from "../../../../api-tools/web/planning-domains.js"; 


/* ------------------------------------------
PARAMETERS
*/
const min_reward_threshold = 10;
const delivery_cutoff = 1;

/* ------------------------------------------
INITIALIZE ALL THE LISTENERS
*/
//config.serverSetup();



console.log(config.host, config.token);
export var socket = io( config.host, {
    extraHeaders: {
        'x-token': config.token
    },
});

//await new Promise(res => setTimeout(res, 1000));
Connection.turnOnAllSensing();
//await new Promise(res => setTimeout(res, 1000));
console.log('Sensing turned on!')
//socket.on( 'parcels sensing', pp => Parcel.updateParcelArray(pp) ) // [ {}, {id, x, y, carriedBy, reward}]
//Establish connection with server
socket.on("connect", async function(){
    console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc
    //WAIT UNTIL WE GET THE ENTIRE MAP
    //0.1 SECOND THEN GOOOO
    console.log('Connected!')
    console.log(Connection.ready);
    while(!Connection.ready){
        console.log('Waiting for the map...');
        await new Promise(res => setTimeout(res, 100));
    }
    
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

export function createPlan(){
    let plan = Planner.plan();
    let path = Planner.fromPathToListOfCells(plan.path);
    console.log('Path retrieved!');
    console.log('Par array',Parcel.parcelsArray);
    console.log('agent position',Sensing.agentCell);
    console.log(path);
    return path, plan;
}

async function ARE_YOU_WINNING_SON(){

    while(true){
        //Env.printPDMap();
        //Sensing.mhdFinder();
        //Env.printMHDMap();
        //console.log('Closest border:',Sensing.closestDelivery());
        //Wait for the server to send the new map
        
        //shout();
        
        //ass = asas
        Env.printPDMap();
        console.log('parcel', Parcel.parcelsArray);
        let plan = Planner.plan(min_reward_threshold,delivery_cutoff);
        if(!plan){
            console.log('No valid plan found! \nSitting idle for 3 seconds');
            await new Promise(res => setTimeout(res, 3000));
        }
        else{
            let path = Planner.fromPathToListOfCells(plan.path);
            console.log('Path retrieved!');
            //console.log('Par array',Parcel.parcelsArray);
            console.log('Free parcels',Parcel.parcelsArray.length);
            console.log('agent position',Sensing.agentCell);
            console.log('path', path);
            
            //Sensing.ME.score = Connection.agentSensing[1].score; // get current score
            
            for(let i = 0; i<path.length; i++){
                console.log('Going to: ',path[i]);
                await new Promise(res => setTimeout(res, 10));
                let reachCellPath = Sensing.astar(Sensing.agentCell,path[i]);
                try{
                    await Action.goTo(reachCellPath);
                }
                catch(err){
                    console.log(err);
                    continue;
                }

            }
            
            console.log('Path completed with score ' + plan.pathScore);
            await new Promise(res => setTimeout(res, 100));
        }
    }
    
    

}