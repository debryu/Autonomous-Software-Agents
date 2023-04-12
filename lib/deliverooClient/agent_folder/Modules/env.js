import * as Utils from "./utils.js";
import * as Sensing from "./sensing.js";
import * as Connection from "./connection.js";

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
export var MAP = Array.from({ length: mapDimension.y }, () => Array(mapDimension.x).fill(1));
export var PDMAP = Array.from({ length: PDmapDimension.y }, () => Array(PDmapDimension.x).fill(1));

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