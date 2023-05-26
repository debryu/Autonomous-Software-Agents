import { io } from "socket.io-client";
import * as config from "./Modules/config.js";
import * as Parcel from './Modules/parcel.js';
import * as Env from './Modules/env.js';
import * as Sensing from "./Modules/sensing.js";
import * as Action from "./Modules/action.js";
import * as Planner from "./planner.js";
import * as Connection from "./Modules/connection.js";
import * as Coms from "./Modules/coms.js";
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
Connection.parcelSensing();
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
    Env.tunnelFinder();
    console.log('Ok, lets win this!');
    await new Promise(res => setTimeout(res, 100));
    //Set the planner dimension
    Planner.setDimension();

    tunnels = Env.tunnelFinder();
    Coms.onMsg();
    ARE_YOU_WINNING_SON();
});

var emergency = 0;

async function ARE_YOU_WINNING_SON(){

    while(true){
        let reachCellPath;
        console.log(Connection.getMapConf());
        Env.printPDMap();
        //Coms.say('copy acer copy!', '75194fded80');
        //console.log(ans);
        //console.log('parcel', Parcel.parcelsArray);
        console.log("TUNNELS!!", tunnels, tunnels.length);
        Parcel.updateRewards(Parcel.parcelsArray);
        let plan = Planner.plan(min_reward_threshold,delivery_cutoff);
        if(!plan){
            console.log('No valid plan found! \nusing PDDL to explore');
            
            //await new Promise(res => setTimeout(res, 3000));
            Pddl.initPDDL({'x':8,'y':8});
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
        else{
            let path = Planner.fromPathToListOfCells(plan.path);
            console.log('Path retrieved!');
            //console.log('Par array',Parcel.parcelsArray);
            console.log('Free parcels',Parcel.parcelsArray.length);
            console.log('agent position',Sensing.agentCell);
            console.log(path);
            
            //Sensing.ME.score = Connection.agentSensing[1].score; // get current score
            let plength = Parcel.parcelsArray.length;
            for(let i = 0; i<path.length; i++){
                console.log('Going to: ',path[i]);
                await new Promise(res => setTimeout(res, 10));
                reachCellPath = Sensing.astar(Sensing.agentCell,path[i]);
                try{
                    let tempScore = Parcel.parcelsArrayBounty + Parcel.backpackBounty;
                    await Action.goTo(reachCellPath, false, tempScore);
                }
                catch(err){
                    console.log(err);
                    break;
                }

            }
            
            console.log('Path completed with score ' + plan.pathScore);
            await new Promise(res => setTimeout(res, 100));
        }
        plan = null;
    }
    
    

}