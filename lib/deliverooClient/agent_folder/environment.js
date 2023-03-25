import * as Utils from "./utils.js";
import * as Sensing from "./sensing.js";

//DIMENSION OF THE MAP
export var mapDimension = {
    x: 10,
    y: 10
}
//DIMENSION OF THE PADDED MAP (+2 for each axis)
export var PDmapDimension = {
    x: mapDimension.x +2,
    y: mapDimension.y +2
}

//INITIALIZE ALL THE MAPS AS 1
export var MAP = Array.from({ length: mapDimension.x }, () => Array(mapDimension.y).fill(1));
export var PDMAP = Array.from({ length: mapDimension.x +2}, () => Array(mapDimension.y +2).fill(1));

//LEARN THE TOPOLOGY (to understand if the agent is on an island and to just consider connected cells)
export var connectedSet = []





/*-----------------------------------------------------
    FUNCTIONS
-------------------------------------------------------*/

export function initializePDMAP(){
    //COPY THE MAP INTO THE PADDED ONE
    for(let i=0;i<mapDimension.x;i++){
        for(let j=0;j<mapDimension.y;j++){
            PDMAP[i+1][j+1] = MAP[i][j];
        }
    }
    //SET THE FOUR CORNERS (of the original map) AS 1
    PDMAP[1][1] = 1;
    PDMAP[mapDimension.x][1] = 1;
    PDMAP[1][mapDimension.y] = 1;
    PDMAP[mapDimension.x][mapDimension.y] = 1;    
}



//UPDATES THE MAP FROM THE socket.io LISTENER
export function getMap(x,y,deliv){
    MAP[x][y] = 0;
    if (deliv)
        MAP[x][y] = 2;
}

//PRINT THE PADDED MAP
export function printPDMap(){
    console.log("--------  [MAP]  ---------");
    for (let i=0; i<PDmapDimension.x; i++){
        let scanLine = "|  ";
        if(i == 4)
            scanLine = "X  ";
        for (let j=0; j<PDmapDimension.y; j++){
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
            if(i == Sensing.ME.x + 1 && j == Sensing.ME.y + 1)
                symbol = "X";
            scanLine = scanLine + " " + Utils.colorizeString(symbol, color);
        }
        console.log(scanLine);
    }
    console.log("----->------Y------->-----");
}

//PRINT ANY MAP FROM A MATRIX with dim dimension
/* dim has to have this structure:
const map_dimension = {
    x: 10,
    y: 10
};
----------------------------------------*/
export function printMap(matrix, dim){
    console.log("--------  [MAP]  ---------");
    for (let i=0; i<dim.x; i++){
        let scanLine = "|  ";
        if(i == 4)
            scanLine = "X  ";
        for (let j=0; j<dim.y; j++){
            let color = 31
            if(matrix[i][j] == 2)
                //red
                color = 31
            else if (matrix[i][j] == 0)
                //green
                color = 32
            else
                //gray
                color = 30

            
            let symbol = matrix[i][j].toString();
            if(i == Sensing.ME.x && j == Sensing.ME.y)
                symbol = "X";
            scanLine = scanLine + " " + Utils.colorizeString(symbol, color);
        }
        console.log(scanLine);
    }
    console.log("----->------Y------->-----");
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

        if(map[neighbourDOWN.x][neighbourDOWN.y] != 1 && !arrayContains(connectedSet,neighbourDOWN) && !arrayContains(stack,neighbourDOWN))
            stack.push(neighbourDOWN);
        if(map[neighbourUP.x][neighbourUP.y] != 1 && !arrayContains(connectedSet,neighbourUP) && !arrayContains(stack,neighbourUP))
            stack.push(neighbourUP);
        if(map[neighbourLEFT.x][neighbourLEFT.y] != 1 && !arrayContains(connectedSet,neighbourLEFT) && !arrayContains(stack,neighbourLEFT))
            stack.push(neighbourLEFT);
        if(map[neighbourRIGHT.x][neighbourRIGHT.y] != 1 && !arrayContains(connectedSet,neighbourRIGHT) && !arrayContains(stack,neighbourRIGHT))
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