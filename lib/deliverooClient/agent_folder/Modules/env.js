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
export var manualMovementDuration = 0.24;

export function setMovDuration(duration){
    if(duration < 0.1 || duration > 2){
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
var TPDMAP;

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
    TPDMAP = JSON.parse(JSON.stringify(PDMAP));
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

export function tunnelFinder(){

    // Loop for each element in the matrix
    for (let i=0;i<PDMAP.length-1;i++){
        for (let j=0;j<PDMAP[i].length-1;j++){
            let sum = PDMAP[i][j] + PDMAP[i+1][j] + PDMAP[i][j+1] + PDMAP[i+1][j+1];
            if(sum == 0){
                TPDMAP[i][j] = 0;
                TPDMAP[i+1][j] = 0;
                TPDMAP[i][j+1] = 0;
                TPDMAP[i+1][j+1] = 0;
            }
        }
    }

    for (let i=0;i<PDMAP.length;i++){
        for (let j=0;j<PDMAP[i].length;j++){
            if(PDMAP[i][j] == 2){
                TPDMAP[i][j] = 2;
            }
            else if(PDMAP[i][j] == 0 && TPDMAP[i][j] != 1){
                TPDMAP[i][j] = PDMAP[i][j];
            }
            else if(PDMAP[i][j] == 0 && TPDMAP[i][j] == 1){
                TPDMAP[i][j] = 'T';
            }
            else{
                TPDMAP[i][j] = 1;
            }
        }
    }

    printTunnels();
}

export function printTunnels(){
    console.log("--------  [PATH]  ---------");
    for (let i=PDmapDimension.y-1; i>=0; i--){
        let scanLine = "";
        for (let j=0; j < PDmapDimension.x; j++){
            let color = 31
            if(TPDMAP[i][j] == 'T')
                color = 34
            else if (TPDMAP[i][j] == 0)
                //green
                color = 32
            else if(TPDMAP[i][j] == 2)
                //red
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

export function printTunnels(){
    console.log("--------  [PATH]  ---------");
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


function get3x3Chop(matrix, x, y) {
    let chop = [[matrix[y+1][x-1], matrix[y+1][x], matrix[y+1][x+1]],
                [matrix[y][x-1], matrix[y][x], matrix[y][x+1]],
                [matrix[y-1][x-1], matrix[y-1][x], matrix[y-1][x+1]]];
    return chop;
  }

  function sumMatrix(matrix) {
    let sum = 0;
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        sum += matrix[row][col];
      }
    }
    return sum;
  }

export function tunnelFinder(){
    let kernel = [[0,1,0],[0,1,0],[0,1,0]];
    //let kernel = [[0,0,0],[1,1,1],[0,0,0]];
    var tunnels = [];
    for(let y=1; y<PDmapDimension.y-2; y++){
        for(let x=1; x<PDmapDimension.x-2; x++){
            let chop = get3x3Chop(JSON.parse(JSON.stringify(PDMAP)), x,y);//JSON.parse(JSON.stringify(PDMAP.slice(y, y + 3).map(row => row.slice(x, x + 3))));
            chop = chop.map(row => row.map(value => Math.max(0, Math.min(1, value))));

            if (chop[1][1] === 0) { //centerpoint = 0
                if (chop[0][0] === 1 && chop[2][0] === 1 && chop[2][2] === 1 && chop[0][2] === 1) { // all corners = 1
                    //mark centerpoint as tunnel
                    tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                    TPDMAP[y][x] = 'T';
                    //Check for possible line elbow or t junction variations
                    if(sumMatrix(chop) < 3){
                        tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                        TPDMAP[y][x] = 'T';
                    }
                }// else{
                    //arrow scenarios
                    if (chop[2][0] == 1 && chop[0][2] == 1){ //NW & SE
                        console.log(chop, x, y);
                        //sadas-asds
                        if(chop[2][1] == 1 && chop[1][0] == 1){ 
                            tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                            TPDMAP[y][x] = 'T';
                        }else if(chop[0][1] == 1 && chop[1][2] == 1){
                            tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                            TPDMAP[y][x] = 'T';
                        }
                    }else if (chop[2][2] == 1 && chop[0][0] == 1){ //NE & SW
                        if(chop[2][1] == 1 && chop[1][2] == 1){ 
                            tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                            TPDMAP[y][x] = 'T';
                        }else if(chop[1][0] == 1 && chop[0][1] == 1){
                            tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                            TPDMAP[y][x] = 'T';
                        }
                    }//else{
                        
                        if(chop[2][0] == 0 ^ chop[2][2] == 0 ^ chop[0][0] == 0 ^ chop[0][2] == 0){ // 3 corner 1s 
                            if (sumMatrix(chop) == 4){ //and sum = 4
                                tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                                TPDMAP[y][x] = 'T';
                            }else if (chop[2][0] == 0 && (chop[1][0] == 0 ^ chop[2][1] ==0)){
                                tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                                TPDMAP[y][x] = 'T';
                            }else if (chop[2][2] == 0 && (chop[2][1] == 0 ^ chop[1][2] ==0)){
                                tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                                TPDMAP[y][x] = 'T';
                            }else if (chop[0][0] == 0 && (chop[1][0] == 0 ^ chop[0][1] ==0)){
                                tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                                TPDMAP[y][x] = 'T';
                            }else if (chop[0][2] == 0 && (chop[0][1] == 0 ^ chop[1][2] ==0)){
                                tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                                TPDMAP[y][x] = 'T';
                            }
                        }

                        if(sumMatrix(chop) == 4){
                            if(chop[0][0] == 0 && chop[2][2] == 0){
                                tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                                TPDMAP[y][x] = 'T';
                            }else if (chop[2][0] == 0 && chop[0][2] == 0){
                                tunnels.push({ 'x': x, 'y': y, 'type': 0 });
                                TPDMAP[y][x] = 'T';
                            }
                        }

                    //}
                //}                
            }
              
              

            /*
            if (chop[0][0] == 1 && chop[2][2] == 1 && chop[2][0] == 1 && chop[0][2] == 1 && chop[1][1] == 0){
                tunnels.push({'x':x,'y':y, 'type': 0}); //0 -> line, 1 -> elbow, 2 -> tjunction, 3 -> cross
                TPDMAP[y][x] = 'T';
            }*/

        }
    }    

    printTunnels();

    return tunnels;
}