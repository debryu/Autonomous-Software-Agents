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
import * as BDI from './Modules/bdi.js';


// Handle
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Promise Rejection:');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    // Additional error handling or logging can be done here
});

/* ------------------------------------------
PARAMETERS
*/

// If tunnelRatio = 1 then the map is a big single tunnel
export var tunnelRatio; // Ratio between tunnel cells and total cells

export var accessibleDC; // Accessible delivery cells
export var totalCells; // Total cells in the map
export var tunnelCells; // Tunnel cells in the map
export var connectedCells; // Connected cells (that the agent can access) in the map

/*
---------------------------------------------
*/


//Establish connection with server
await preparation();
ARE_YOU_WINNING_SON();

async function preparation(){
    // Initialize the socket
    Connection.updateSocket();
    // Connect to the server
    Connection.connect2Server();
    // Turn on all the sensing
    Connection.turnOnAllSensing();
    console.log('Sensing turned on!')
    // Turn on the parcel sensing
    Connection.parcelSensing();
    console.log('Parcel Sensing turned on!')
    console.log('Initialize...');
    // WAIT A LITTLE BIT UNTIL WE GET THE ENTIRE MAP
    await new Promise(res => setTimeout(res, 50));
    
    // Wait until we get the configuration file from the server
    while(!Connection.ready){
        console.log('Waiting for server response...');
        await new Promise(res => setTimeout(res, 100));
    }

    //console.log(Env.MAP);
    
    // Initialize the map (Padded version)
    Env.initializePDMAP();

    // Initialize the MHD (Manhattan Distance) map 
    // We don't use this anymore but is useful to keep it just in case
    Sensing.initializeMHDMAP();

    // Analyze the map and find the tunnel cells
    Env.tunnelFinder();

    // Everything is now ready
    console.log('Ok, lets win this!');
    //await new Promise(res => setTimeout(res, 50));


    //Set the planner dimension in order to match the map we received from server
    Planner.setDimension();

    // Analyze the map to understand its structure 
    // Such as:
    // - the area that the agent can access (totalCells)
    // - where are the tunnels (tunnelCells)
    // - the ration between the tunnel cells and the total cells (tunnelRatio)
    // - how many delivery cells are accessible (accessibleDC)
    // connectedCells is returning the same set of cells in input (connectedSet in this case, the set of cells that the agent can access)
    let connectedSet = Sensing.connectedMap(Sensing.agentCell);
    // return totalCells, tunnelCells, result, deliveryCells, cells;
    [totalCells, tunnelCells, tunnelRatio, accessibleDC, connectedCells] = Sensing.analyzeMap(connectedSet);

    // Store all the delivery cells in the map (even the non-accessible ones)
    Env.addDeliveryCellsFromPDMAP();
}

// Variable to track emergency situations
var emergency = 0;

// Main loop
async function ARE_YOU_WINNING_SON(){
    while(true){
        // Select the intention
        let intention = await BDI.intentSelection();
        console.log('intention',intention);
        // Perform the intention
        await BDI.intentExecution(intention);

        // Print when there is a change in character
        console.log('Exited the character!\n\n\n\n\n\n');
        BDI.setActive(true);
    }
}