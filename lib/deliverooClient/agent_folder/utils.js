import * as Environment from './environment.js'

//input a string and a number (for the color) and output a string 
// that will be coloured in a console log.
export function colorizeString(text, color){
    // RED   = 31
    // GREEN = 32
    return '\u001b[' + color + 'm' + text + '\u001b[0m';
}

function isDeadEnd(cell){
    let i = cell.x;
    let j = cell.y;
    //USING PADDED MAP
    //CASE 1: only up accessible
    if(Environment.PDMAP[i+1][j] == 1 && Environment.PDMAP[i-1][j] == 1 && Environment.PDMAP[i][j+1] == 1)
        return true;
    //CASE 2: only down accessible
    if(Environment.PDMAP[i+1][j] == 1 && Environment.PDMAP[i-1][j] == 1 && Environment.PDMAP[i][j-1] == 1)
        return true;
    //CASE 3: only right accessible
    if(Environment.PDMAP[i-1][j] == 1 && Environment.PDMAP[i][j-1] == 1 && Environment.PDMAP[i][j+1] == 1)
        return true;
    //CASE 1: only left accessible
    if(Environment.PDMAP[i+1][j] == 1 && Environment.PDMAP[i][j-1] == 1 && Environment.PDMAP[i][j+1] == 1)
        return true;

    return false;
}

export function findDeadEnds(){
    let dead_ends = []
    for (let i=1; i<Environment.PDmapDimension.x-1;i++){
        for (let j=1; j< Environment.PDmapDimension.y-1; j++){

            let cell = {
                x: i,
                y: j
            }
            //only check walkable cells
            if(Environment.PDMAP[cell.x][cell.y] != 1)
                //check for dead end
                if(isDeadEnd(cell))
                    dead_ends.push(cell);
        }
    }
    
    console.log('Dead ends:',dead_ends);
    return dead_ends;
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

export function intToMove(value){
    let move = (value % 4)
    if(move == 0)
        return 'left'
    if(move == 1)
        return 'up'
    if(move == 2)
        return 'right'
    if(move == 3) 
        return 'down'
}

export function debounce(callback, delay) {
    let timeoutId;
    return function() {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    }
}