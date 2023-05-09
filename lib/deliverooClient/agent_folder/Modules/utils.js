import * as Env from './env.js';
import * as Sensing from "./sensing.js";

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
    if(Env.PDMAP[i+1][j] == 1 && Env.PDMAP[i-1][j] == 1 && Env.PDMAP[i][j+1] == 1)
        return true;
    //CASE 2: only down accessible
    if(Env.PDMAP[i+1][j] == 1 && Env.PDMAP[i-1][j] == 1 && Env.PDMAP[i][j-1] == 1)
        return true;
    //CASE 3: only right accessible
    if(Env.PDMAP[i-1][j] == 1 && Env.PDMAP[i][j-1] == 1 && Env.PDMAP[i][j+1] == 1)
        return true;
    //CASE 1: only left accessible
    if(Env.PDMAP[i+1][j] == 1 && Env.PDMAP[i][j-1] == 1 && Env.PDMAP[i][j+1] == 1)
        return true;

    return false;
}

export function findDeadEnds(){
    let dead_ends = []
    for (let i=1; i<Env.PDmapDimension.x-1;i++){
        for (let j=1; j< Env.PDmapDimension.y-1; j++){

            let cell = {
                x: i,
                y: j
            }
            //only check walkable cells
            if(Env.PDMAP[cell.x][cell.y] != 1)
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

    let dead_ends = []
    for (let i=0; i<max_x;i++){
        for (let j=0; j< max_y; j++){

            let cell = {
                x: i,
                y: j
            }
            //only check walkable cells
            if(Env.MAP[cell.x][cell.y] != 1)
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

export function moveToInt(string){
    
    if(string === 'left')
        return 0
    if(string === 'up')
        return 1
    if(string === 'right')
        return 2
    if(string === 'down') 
        return 3
}

export function printPDPosition(){
    console.log('PD pos: ', Sensing.agentCell.x, Sensing.agentCell.y);
}