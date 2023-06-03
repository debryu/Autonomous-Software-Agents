export var name = process.argv[2];
export var token = process.argv[3];
import { io } from "socket.io-client";
import * as config from "./Modules/config.js";
import * as Parcel from './Modules/parcel.js';
import * as Env from './Modules/env.js';
import * as Sensing from "./Modules/sensing.js";
import * as Action from "./Modules/action.js";
import * as Planner from "./planner.js";
import * as Connection from "./Modules/connection.js";
import * as Coms from "./Modules/coms.js";
//import * as Pddl from './PDDLplanner.js';
import * as BDI from './Modules/bdi.js';

//console.log('name', name, 'token', token);

/* ------------------------------------------
PARAMETERS
*/

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    // Additional error handling or logging can be done here
  });



export var tunnelRatio;
export var accessibleDC;
export var totalCells;
export var tunnelCells;
export var connectedCells;

/*
---------------------------------------------
*/
//var tunnels;


//Establish connection with server
await preparation();
ARE_YOU_WINNING_SON();

async function preparation(){
    
    Connection.updateSocket();
    Connection.connect2Server();
    
    Connection.turnOnAllSensing();
    console.log('Sensing turned on!')
    Connection.parcelSensing();
    console.log('Parcel Sensing turned on!')
    //WAIT A LITTLE BIT UNTIL WE GET THE ENTIRE MAP
    await new Promise(res => setTimeout(res, 50));
    
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



    // Analyze the map
    let connectedSet = Sensing.connectedMap(Sensing.agentCell);
    // return totalCells, tunnelCells, result, deliveryCells, cells;
    [totalCells, tunnelCells, tunnelRatio, accessibleDC, connectedCells] = Sensing.analyzeMap(connectedSet);
    Env.addDeliveryCellsFromPDMAP();
    //console.log('delivery cells',Env.deliveryCells, Env.deliveryCells.length);
}


var emergency = 0;

async function ARE_YOU_WINNING_SON(){
    while(true){
        // Select the intention
        let intention = await BDI.intentSelection();
        console.log('intention',intention);
        // Perform the intention
        await BDI.intentExecution(intention);
        // Check if the intention was successful
        console.log('Exited the character!\n\n\n\n\n\n');
        BDI.setActive(true);
    }
}