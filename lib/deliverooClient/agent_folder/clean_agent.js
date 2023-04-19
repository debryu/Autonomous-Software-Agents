import { io } from "socket.io-client";
import * as config from "./Modules/config.js";
import * as Parcel from './Modules/parcel.js';
import * as Env from './Modules/env.js';
import * as Sensing from "./Modules/sensing.js";
import * as Action from "./Modules/action.js";
import * as Planner from "./planner.js";

//import * as Action from "./Modules/action.js";
//import * as Enemy from "./Modules/enemy.js";
import * as Connection from "./Modules/connection.js";

/* ------------------------------------------
INITIALIZE ALL THE LISTENERS
*/
export var socket = io( config.host, {
    extraHeaders: {
        'x-token': config.token
    },
});

//socket.on( 'parcels sensing', pp => Parcel.updateParcelArray(pp) ) // [ {}, {id, x, y, carriedBy, reward}]

Connection.turnOnAllSensing();

//Establish connection with server
socket.on("connect", async function(){
    console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc
    //WAIT UNTIL WE GET THE ENTIRE MAP
    //0.1 SECOND THEN GOOOO
    await new Promise(res => setTimeout(res, 100));
    console.log('Connected!')
    console.log('Initialize...');
    console.log(Env.MAP);
    Env.initializePDMAP();
    Sensing.initializeMHDMAP();
    console.log('Ok, lets win this!');

    //Set the planner dimension
    Planner.setDimension();

    ARE_YOU_WINNING_SON();
});

async function ARE_YOU_WINNING_SON(){

    while(true){
        //Env.printPDMap();
        //Sensing.mhdFinder();
        //Env.printMHDMap();
        //console.log('Closest border:',Sensing.closestDelivery());
        //Wait for the server to send the new map
        
        let plan = Planner.plan();
        let path = Planner.fromPathToListOfCells(plan.path);
        console.log('Path retrieved!');
        console.log('Par array',Parcel.parcelsArray);
        console.log('agent position',Sensing.agentCell);
        console.log(path);
        
        
        for(let i = 0; i<path.length; i++){
            console.log('Going to: ',path[i]);
            await new Promise(res => setTimeout(res, 10));
            Env.printPDMap();
            let reachCellPath = Sensing.astar(Sensing.agentCell,path[i]);
            await Action.goTo(reachCellPath);

        }
        
        console.log('Path completed with score ' + plan.pathScore);
        await new Promise(res => setTimeout(res, 100));
    }
    
    

}