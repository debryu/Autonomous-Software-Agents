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

//LEARN THE TOPOLOGY
export var connectedSet = []

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
    //console.log(x,y);
    MAP[y][x] = 0;
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
    console.log("----->------Y------->-----"); //PDMAP[row][column] -> [1][x] means row 1, ie y=1 
    //console.log(PDMAP[1][2]);
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
            if(i == Sensing.ME.y && j == Sensing.ME.x)
                symbol = "X";
            scanLine = scanLine + " " + Utils.colorizeString(symbol, color);
        }
        console.log(scanLine);
    }
    console.log("----->------Y------->-----");
}


export function reachable(end){
    /* start and end are cell objects
    start.x , start.x
    */
    if(arrayContains(connectedSet,end))
        return true;
    else   
        return false;

}

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

export function arrayContains(array,cell){
    let temp = array;
    if(temp.filter((obj) => obj.x == cell.x && obj.y == cell.y).length > 0) 
        return true;
    else
        return false;
}