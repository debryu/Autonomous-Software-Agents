import * as Utils from "./utils.js";
import * as Sensing from "./sensing.js";
import * as Connection from "./connection.js";
import { backpack, parcelsArray } from "./parcel.js";
import * as Planner from '../planner.js';

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

export var middeploint = {'x':parseInt(mapDimension.x/2),'y':parseInt(mapDimension.x/2)} //did it on purpose 

//INITIALIZE ALL THE MAPS AS 1
export var MAP = Array.from({ length: mapDimension.y }, () => Array(mapDimension.x).fill(1));
export var PDMAP = Array.from({ length: PDmapDimension.y }, () => Array(PDmapDimension.x).fill(1));
export var HM1 = Array.from({ length: PDmapDimension.y }, () => Array(PDmapDimension.x).fill(0));
export var PDMAPbkp;
export var PDMAPmoves;

/*-----------------------------------------------------
    FUNCTIONS
-------------------------------------------------------*/

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


export function pathMap(path){
    if (path != undefined){
        for (let i=0;i<path.length;i++){
            PDMAPmoves[path[i].y][path[i].x] = 7;
        }
    }
    console.log('ass', parcelsArray)
    for (let i=0;i<parcelsArray.length;i++){
        PDMAPmoves[parcelsArray[i].y][parcelsArray[i].x] = 8;
    }
    //for (let i=0;i<backpack.length;i++){
    //    PDMAPmoves[backpack[i].y][backpack[i].x] = JSON.parse(JSON.stringify(Env.PDMAPbkp[enemyArray[seen].y][enemyArray[seen].x]));
    //}
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

export function midpointFinder(threshold){
    let midpoint = null;
    if (false){//PDMAP[middeploint.y][middeploint.x] == 0){
        midpoint = [{'x':middeploint.x,'y':middeploint.y,'idx':1,'delivery':true,'score':1,
                                'id':Planner.createUniqueID(middeploint.x,middeploint.y)}];
    }else{
        //Names are flipped i know i know...
        let col = middeploint.x;
        let row = middeploint.y;
        let found = false;
        console.log(col,row, PDMAP[10][10])
        printPDMap();
        for (let radius = 0; radius < PDMAP.length && !found; radius++) {
            for (let i = -radius; i <= radius && !found; i++) {
                for (let j = -radius; j <= radius && !found; j++) {
                    // Check if the current position is within the bounds of the map
                    if (row + i >= 0 && row + i < PDMAP.length && col + j >= 0 && col + j < PDMAP[0].length) {
                        // Check if the value at the current position is "0"
                        if (PDMAP[row + i][col + j] == 0) {
                            console.log(`Found 0 at (${row + i}, ${col + j})`);
                            midpoint = [{'x':col+i,'y':row+i,'idx':1,'delivery':false,'score':threshold,
                                            'id':Planner.createUniqueID(col+i,row+i)}];
                            found = true;
                        }
                        //as-asq
                    }
                }
            }
        }
    }
    return midpoint;
}