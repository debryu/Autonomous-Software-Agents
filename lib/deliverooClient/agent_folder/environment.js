import * as Utils from "./utils.js";
import * as Sensing from "./sensing.js";



export var prunedMAP = MAP;


export var update = false;

export var mapDimension = {
    x: 10,
    y: 10
}

export var MAP = Array.from({ length: mapDimension.x }, () => Array(mapDimension.y).fill(1));

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
