import * as Utils from "./utils.js";
import * as Sensing from "./sensing.js";



export var prunedMAP = MAP;


export var update = false;

export var mapDimension = {
    x: 10,
    y: 10
}

export var PDmapDimension = {
    x: mapDimension.x +2,
    y: mapDimension.y +2
}

export var MAP = Array.from({ length: mapDimension.x }, () => Array(mapDimension.y).fill(1));
export var BORDER = []

export var PDMAP = Array.from({ length: mapDimension.x +2}, () => Array(mapDimension.y +2).fill(1));

export function initializePDMAP(){
    for(let i=0;i<mapDimension.x;i++){
        for(let j=0;j<mapDimension.y;j++){
            PDMAP[i+1][j+1] = MAP[i][j];
        }
    }


    //SET THE FOUR CORNERS AS 1
    PDMAP[1][1] = 1;
    PDMAP[mapDimension.x][1] = 1;
    PDMAP[1][mapDimension.y] = 1;
    PDMAP[mapDimension.x][mapDimension.y] = 1;    
}

export function getBorder(){
    for(let i=0;i<mapDimension.x;i++){
        let cell = {
            x: i,
            y: 0
        };
        BORDER.push(cell);
    }
    for(let i=0;i<mapDimension.x;i++){
        let cell = {
            x: 0,
            y: i
        };
        BORDER.push(cell);
    }
    for(let i=0;i<mapDimension.x;i++){
        let cell = {
            x: i,
            y: mapDimension.y
        };
        BORDER.push(cell);
    }
    for(let i=0;i<mapDimension.x;i++){
        let cell = {
            x: mapDimension.x,
            y: i
        };
        BORDER.push(cell);
    }
}

export function getMap(x,y,deliv){
    MAP[x][y] = 0;
    if (deliv)
        MAP[x][y] = 2;
    
    update = true;
}

/* dim has to have this structure:

const map_dimension = {
    x: 10,
    y: 10
};

----------------------------------------*/
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


export function reachable(start,end,map){
    /* start and end are cell objects
    start.x , start.x
    */
   let set = connectedSet(start,map);
}

export async function connectedSet(cell,map,connectedCells){
    let localConnectedCells = connectedCells;
    localConnectedCells.push(cell)
    let neighbourRIGHT = {
        x: cell.x + 1,
        y: cell.y
    }
    let neighbourLEFT = {
        x: cell.x - 1,
        y: cell.y
    }
    let neighbourUP = {
        x: cell.x,
        y: cell.y + 1
    }
    let neighbourDOWN = {
        x: cell.x,
        y: cell.y - 1
    }
    if(map[neighbourDOWN.x][neighbourDOWN.y] != 1 && !localConnectedCells.includes(neighbourDOWN))
        localConnectedCells.concat(connectedSet(neighbourDOWN,map,localConnectedCells));
    if(map[neighbourUP.x][neighbourUP.y] != 1 && !localConnectedCells.includes(neighbourUP))
        localConnectedCells.concat(connectedSet(neighbourUP,map,localConnectedCells));
    if(map[neighbourLEFT.x][neighbourLEFT.y] != 1 && !localConnectedCells.includes(neighbourLEFT))
        localConnectedCells.concat(connectedSet(neighbourLEFT,map,localConnectedCells));
    if(map[neighbourRIGHT.x][neighbourRIGHT.y] != 1 && !localConnectedCells.includes(neighbourRIGHT))
        localConnectedCells.concat(connectedSet(neighbourRIGHT,map,localConnectedCells));
        
    return localConnectedCells;
    
}