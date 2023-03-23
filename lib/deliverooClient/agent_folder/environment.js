import * as Utils from "./utils.js";


export var MAP = Array.from({ length: 10 }, () => Array(10).fill(1));

export function getMap(x,y,deliv){
    MAP[x][y] = 0;
    if (deliv)
        MAP[x][y] = 2;

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
        let scanLine = "  ";
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

            scanLine = scanLine + " " + Utils.colorizeString(matrix[i][j].toString(), color);
        }
        console.log(scanLine);
    }
    console.log("--------------------------");
}
