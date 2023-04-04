import * as Utils from "./utils.js";
import * as Sensing from "./sensing.js";

//DIMENSION OF THE MAP
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

//LEARN THE TOPOLOGY (to understand if the agent is on an island and to just consider connected cells)
export var connectedSet = []





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
    PDMAP[1][1] = 1;
    PDMAP[mapDimension.y][1] = 1;
    PDMAP[1][mapDimension.x] = 1;
    PDMAP[mapDimension.y][mapDimension.x] = 1;    
}



//UPDATES THE MAP FROM THE socket.io LISTENER
export function getMap(x,y,deliv){
    console.log(x,y,deliv);
    if(x != undefined && y != undefined){
    MAP[y][x] = 0;
    if (deliv)
        MAP[y][x] = 2;
    }

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


//PRINT ANY MAP FROM A MATRIX with dim dimension
/* dim has to have this structure:
const map_dimension = {
    x: 10,
    y: 10
};
----------------------------------------*/
export function printMap(matrix, dim,label){
    console.log("--------  [" + label + "]  ---------");
    for (let i=dim.x-1; i>=0; i--){
        let scanLine = "";
        for (let j=0; j<dim.y; j++){
            let color = 31;
            if(matrix[i][j] == 2)
                //red
                color = 31
            else if (matrix[i][j] == 0)
                //green
                color = 32;
            else
                //gray
                color = 30;
            
            let symbol = matrix[i][j].toString();
            scanLine = scanLine + " " + Utils.colorizeString(symbol, color);
        }
        console.log(scanLine);
    }
    console.log("----->------X------->-----");
}

//CHECK IF A CELL IS REACHABLE FROM THE AGENT (in a fully connected map it will be always true)
export function reachable(end){
    /* start and end are cell objects
    start.x , start.x
    */
    if(arrayContains(connectedSet,end))
        return true;
    else   
        return false;
}

//COMPUTE THE FULL SET OF CONNECTED TILES (connected from the starting position of the agent)
export function computeConnectedSet(cell,map){
    console.log('Start computing topology...')
    let tcell = {x:cell.x,y:cell.y};
    let stack = [tcell];

    while (stack.length > 0) {
        //console.log(stack);
        let currentCell = stack.pop();
        connectedSet.push(currentCell);

        let neighbourRIGHT = {
            x: currentCell.x + 1,
            y: currentCell.y
        }
        let neighbourLEFT = {
            x: currentCell.x - 1,
            y: currentCell.y
        }
        let neighbourUP = {
            x: currentCell.x,
            y: currentCell.y + 1
        }
        let neighbourDOWN = {
            x: currentCell.x,
            y: currentCell.y - 1
        }

        if(map[neighbourDOWN.y][neighbourDOWN.x] != 1 && !arrayContains(connectedSet,neighbourDOWN) && !arrayContains(stack,neighbourDOWN))
            stack.push(neighbourDOWN);
        if(map[neighbourUP.y][neighbourUP.x] != 1 && !arrayContains(connectedSet,neighbourUP) && !arrayContains(stack,neighbourUP))
            stack.push(neighbourUP);
        if(map[neighbourLEFT.y][neighbourLEFT.x] != 1 && !arrayContains(connectedSet,neighbourLEFT) && !arrayContains(stack,neighbourLEFT))
            stack.push(neighbourLEFT);
        if(map[neighbourRIGHT.y][neighbourRIGHT.x] != 1 && !arrayContains(connectedSet,neighbourRIGHT) && !arrayContains(stack,neighbourRIGHT))
            stack.push(neighbourRIGHT);
    }
}

//CHECK IF AN ARRAY THAT CONTAINS OBJECTS CONTAIN A PARTICULAR OBJECT
// In this case the objects are cell/tiles obj so have x,y coordinates.
export function arrayContains(array,cell){
    let temp = array;
    if(temp.filter((obj) => obj.x == cell.x && obj.y == cell.y).length > 0) 
        return true;
    else
        return false;
}