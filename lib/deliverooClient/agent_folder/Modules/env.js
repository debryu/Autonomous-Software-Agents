import * as Utils from "./utils.js";
import * as Sensing from "./sensing.js";
import * as Connection from "./connection.js";
import { backpack, parcelsArray } from "./parcel.js";
import * as Planner from './planner.js';

/*
ENVIRONMENT-BELIEFS MODULE
Stores the beliefs of the agent about the environment
---------------------------------------------------------------
*/


//How the configuration of the map is received from the server
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

export var manualMovementDuration = 0.24; //in seconds, it's the duration of the agent movement
// The variable that is used in mainframe
//export var tunnelRatio = 'undef';

// Set the movement duration variable 
export function setMovDuration(duration){
    if(duration < 0.1 || duration > 2){ // If the duration is either too small or too big
        console.log("Invalid duration with", duration," - using default value");
    }
    else{
        console.log("Setting duration to: " + duration);
        manualMovementDuration = duration;
    }
        
}


export var mapConfig = {
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

// Store the cells that are available for the agent to move to (0 in the map)
// In the randomExplore
export var Ocells =[];

export function setOcells(array){
    Ocells = array;
}

//Dimension of the map
export var mapDimension = {
    x: 20,
    y: 20
}
//DIMENSION OF THE PADDED MAP (+2 for each axis)
export var PDmapDimension = {
    x: mapDimension.x +2,
    y: mapDimension.y +2
}

//INITIALIZE ALL THE MAPS AS 1
export var MAP = Array.from({ length: mapDimension.y }, () => Array(mapDimension.x).fill(1));
export var PDMAP = Array.from({ length: PDmapDimension.y }, () => Array(PDmapDimension.x).fill(1));
export var HM1 = Array.from({ length: PDmapDimension.y }, () => Array(PDmapDimension.x).fill(0));
export var TPDMAP = Array.from({ length: PDmapDimension.y }, () => Array(PDmapDimension.x).fill(1));

export var PDMAPbkp;
export var PDMAPmoves;
export var deliveryCells = [];

/*-----------------------------------------------------
    FUNCTIONS
-------------------------------------------------------*/

export function addDeliveryCellsFromPDMAP(){
    for(let i=1;i<PDMAP.length-1;i++){
        for(let j=1;j<PDMAP[i].length-1;j++){
            if(PDMAP[i][j] == 2){
                deliveryCells.push({x:j,y:i});
            }
        }
    }
}

export function initializePDMAP(){
    //COPY THE MAP INTO THE PADDED ONE
    for(let i=0;i<mapDimension.x;i++){
        for(let j=0;j<mapDimension.y;j++){
            PDMAP[j+1][i+1] = MAP[j][i];
        }
    }
    //SET THE FOUR CORNERS (of the original map) AS 1
    //PDMAP[1][1] = 1;
    //PDMAP[mapDimension.y][1] = 1;
    //PDMAP[1][mapDimension.x] = 1;
    //PDMAP[mapDimension.y][mapDimension.x] = 1;    
    PDMAPbkp = JSON.parse(JSON.stringify(PDMAP));
    PDMAPmoves = JSON.parse(JSON.stringify(PDMAP));
}


// This function is not used anymore
// Initializing the HeatMap1:
// it's a sort of convolution of the map
// to give a score to each cell based on the number of
// obstacles around it

export function initializeHM1(){
    //COPY THE MAP INTO THE PADDED ONE
    for(let i=0;i<mapDimension.x;i++){
        for(let j=0;j<mapDimension.y;j++){
            if(MAP[j][i] == 1)
            HM1[j+1][i+1] = MAP[j][i];
        }
    }
    //SET THE FOUR CORNERS (of the original map) AS 1
    //PDMAP[1][1] = 1;
    //PDMAP[mapDimension.y][1] = 1;
    //PDMAP[1][mapDimension.x] = 1;
    //PDMAP[mapDimension.y][mapDimension.x] = 1;    
}

//PRINT THE PADDED MAP
export function printPDMap(){
    console.log("--------  [MAP]  ---------");
    for (let i=PDmapDimension.y-1; i>=0; i--){
        let scanLine = "";
        for (let j=0; j < PDmapDimension.x; j++){
            let color = 31
            if(PDMAP[i][j] == 2)
                //red
                color = 31
            else if (PDMAP[i][j] == 0)
                //green
                color = 32
            else
                //gray
                color = 30
            let symbol = PDMAP[i][j].toString();
            //ADJUSTED FOR PADDED MAP
            if(i == Sensing.agentCell.y && j == Sensing.agentCell.x)
                symbol = "X";
            scanLine = scanLine + " " + Utils.colorizeString(symbol, color);
        }
        console.log(scanLine);
    }
    console.log("----->------X------->-----"); //PDMAP[row][column] -> [1][x] means row 1, ie y=1 
}

// Print the path that the agent is following
export function pathMap(path, parray){
    if (path != undefined){
        for (let i=0;i<path.length;i++){
            PDMAPmoves[path[i].y][path[i].x] = 7;
        }
    }
    for (let i=0;i<parray.length;i++){
        PDMAPmoves[parray[i].y][parray[i].x] = 8;
        
    }

}

//PRINT THE PADDED MAP
export function printPath(){
    console.log("--------  [PATH]  ---------");
    for (let i=PDmapDimension.y-1; i>=0; i--){
        let scanLine = "";
        for (let j=0; j < PDmapDimension.x; j++){
            let color = 31
            if(PDMAPmoves[i][j] == 2)
                //red
                color = 31
            else if (PDMAPmoves[i][j] == 0)
                //green
                color = 32
            else if(PDMAPmoves[i][j] == 7)
                //blue
                color = 34
            else if(PDMAPmoves[i][j] == 8)
                color = 35
            else
                //gray
                color = 30
            let symbol = PDMAPmoves[i][j].toString();
            //ADJUSTED FOR PADDED MAP
            if(i == Sensing.agentCell.y && j == Sensing.agentCell.x)
                symbol = "X";
            scanLine = scanLine + " " + Utils.colorizeString(symbol, color);
        }
        console.log(scanLine);
    }
    console.log("----->------X------->-----"); //PDMAP[row][column] -> [1][x] means row 1, ie y=1 

    //Reset
    PDMAPmoves = JSON.parse(JSON.stringify(PDMAP));
}

//PRINT THE PADDED MAP
export function printMHDMap(){
    console.log("--------  [MANHATTAN]  ---------");
    for (let i=PDmapDimension.y-1; i>=0; i--){
        let scanLine = "";
        for (let j=0; j<PDmapDimension.x; j++){
            let color = 31
            let isABigNumber = false;
            if(Sensing.mhdMap[i][j] == 0)
                //green
                color = 32
            else if(Sensing.mhdMap[i][j] > 0 && Sensing.mhdMap[i][j] < 10)
                color = 33
            else if (Sensing.mhdMap[i][j] >= 10){
                //Make it red, but also make it only 1 character long to keep the map readable
                color = 31
                isABigNumber = true;
            }
            else
                //gray
                color = 30
            let symbol = Sensing.mhdMap[i][j].toString();
            if(isABigNumber)
                symbol = (Sensing.mhdMap[i][j]%10).toString();
            //ADJUSTED FOR PADDED MAP
            scanLine = scanLine + " " + Utils.colorizeString(symbol, color);
        }
        console.log(scanLine);
    }
    console.log("----->---------X---------->-----"); //PDMAP[row][column] -> [1][x] means row 1, ie y=1 
}

// Print the tunnel map
export function printTunnels(){
    console.log("--------  [TUNNELS]  ---------");
    for (let i=PDmapDimension.y-1; i>=0; i--){
        let scanLine = "";
        for (let j=0; j < PDmapDimension.x; j++){
            let color = 31
            if(TPDMAP[i][j] == 'T')
                //red
                color = 34
            else if (TPDMAP[i][j] == 0)
                //green
                color = 32
            else if(TPDMAP[i][j] == 2)
                //blue
                color = 31
            else
                //gray
                color = 30
            let symbol = TPDMAP[i][j].toString();
            //ADJUSTED FOR PADDED MAP
            if(i == Sensing.agentCell.y && j == Sensing.agentCell.x)
                symbol = "X";
            scanLine = scanLine + " " + Utils.colorizeString(symbol, color);
        }
        console.log(scanLine);
    }
    console.log("----->------X------->-----"); //PDMAP[row][column] -> [1][x] means row 1, ie y=1 
}

// Find the tunnels in the map
export function tunnelFinder(){
    // Loop for each element in the matrix as a convolution kernel
    // that has size 2x2
    for (let i=0;i<PDMAP.length-1;i++){
        for (let j=0;j<PDMAP[i].length-1;j++){
            let sum = PDMAP[i][j] + PDMAP[i+1][j] + PDMAP[i][j+1] + PDMAP[i+1][j+1];
            // Sum the values of the kernel
            // If the sum is 0 then it means that the 2x2 matrix is all 0 (no obstacles)
            if(sum == 0){
                TPDMAP[i][j] = 0;
                TPDMAP[i+1][j] = 0;
                TPDMAP[i][j+1] = 0;
                TPDMAP[i+1][j+1] = 0;
            }

            //Otherwise the TPDMAP is kept as 1
        }
    }

    // Iterate again but now for each element in the matrix
    for (let i=0;i<PDMAP.length;i++){
        for (let j=0;j<PDMAP[i].length;j++){
            // If the cell is a delivery
            if(PDMAP[i][j] == 2){
                TPDMAP[i][j] = 2; // Set the cell as a delivery in the tunnel map
            }
            // If the cell is not a tunnel and not a delivery
            else if(PDMAP[i][j] == 0 && TPDMAP[i][j] != 1){
                TPDMAP[i][j] = PDMAP[i][j]; // Set the cell as accessible (0)
            }
            // If the cell is a tunnel and not a delivery
            else if(PDMAP[i][j] == 0 && TPDMAP[i][j] == 1){
                TPDMAP[i][j] = 'T'; // Set the cell as a tunnel
            }
            else{
                TPDMAP[i][j] = 1; // Set the cell as inaccessible (1)
            }
        }
    }

    printTunnels();
    // Also save the tunnel cells in an array for later use
    let tunnels =[];
    for (let i = 0; i < TPDMAP.length; i++) {
        for (let j = 0; j < TPDMAP[i].length; j++) {
          if (TPDMAP[i][j] === 'T') {
            tunnels.push({'x':j,'y':i}); // Store the indexes as [row, column]
          }
        }
    }

    return tunnels;
}

