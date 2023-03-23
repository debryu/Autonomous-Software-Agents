import * as Environment from './environment.js'

//input a string and a number (for the color) and output a string 
// that will be coloured in a console log.
export function colorizeString(text, color){
    // RED   = 31
    // GREEN = 32
    return '\u001b[' + color + 'm' + text + '\u001b[0m';
}


function isCellOnBorder(cell){
    let max_x = 10;
    let max_y = 10;
    if(cell.x == 0 || cell.y == 0 || cell.y == max_y-1 || cell.x == max_x-1)
        return true;
    else
        return false;
}

function isDeadEnd(cell){
    if(isCellOnBorder(cell)){
        //for now is false but needs to be implemented properly
        return false;
    }
    else{
        let i = cell.x;
        let j = cell.y;

        //cell is not on border so we can access every adiacent cell
        
        //CASE 1: only up accessible
        if(Environment.MAP[i+1][j] == 1 && Environment.MAP[i-1][j] == 1 && Environment.MAP[i][j+1] == 1)
            return true;
        //CASE 2: only down accessible
        if(Environment.MAP[i+1][j] == 1 && Environment.MAP[i-1][j] == 1 && Environment.MAP[i][j-1] == 1)
            return true;
        //CASE 3: only right accessible
        if(Environment.MAP[i-1][j] == 1 && Environment.MAP[i][j-1] == 1 && Environment.MAP[i][j+1] == 1)
            return true;
        //CASE 1: only left accessible
        if(Environment.MAP[i+1][j] == 1 && Environment.MAP[i][j-1] == 1 && Environment.MAP[i][j+1] == 1)
            return true;

        return false;
    }
}


export function pruneMap(map){
    let pruned_map = map;
    let max_x = 10
    let max_y = 10
    /*
    Borders will have 
        0-y , x-0, 
    maxX-y  , x-maxX

    looking for dead ends
    checks corner separately
    */

    let dead_ends = []
    for (let i=0; i<max_x;i++){
        for (let j=0; j< max_y; j++){

            let cell = {
                x: i,
                y: j
            }
            //only check walkable cells
            if(Environment.MAP[cell.x][cell.y] != 1)
                //check for dead end
                if(isDeadEnd(cell))
                    dead_ends.push(cell);
        }
    }
    
    console.log(dead_ends);
    return pruned_map;
}