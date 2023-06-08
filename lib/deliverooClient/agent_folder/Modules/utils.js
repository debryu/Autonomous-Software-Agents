import * as Env from './env.js';
import * as Sensing from "./sensing.js";

/*
UTILS MODULE
-----------------------------------------------
*/

//input a string and a number (for the color) and output a string 
// that will be coloured in a console log.
export function colorizeString(text, color){
    // RED   = 31
    // GREEN = 32
    return '\u001b[' + color + 'm' + text + '\u001b[0m';
}

// Check if a cell is a dead end
function isDeadEnd(cell){
    let i = cell.y;
    let j = cell.x;
    console.log('cell',cell);
    
    //USING TUNNEL PADDED MAP
    //CASE 1: only up accessible
    if(Env.TPDMAP[i+1][j] == 1 && Env.TPDMAP[i-1][j] == 1 && Env.TPDMAP[i][j+1] == 1)
        return true;
    //CASE 2: only down accessible
    if(Env.TPDMAP[i+1][j] == 1 && Env.TPDMAP[i-1][j] == 1 && Env.TPDMAP[i][j-1] == 1)
        return true;
    //CASE 3: only right accessible
    if(Env.TPDMAP[i-1][j] == 1 && Env.TPDMAP[i][j-1] == 1 && Env.TPDMAP[i][j+1] == 1)
        return true;
    //CASE 1: only left accessible
    if(Env.TPDMAP[i+1][j] == 1 && Env.TPDMAP[i][j-1] == 1 && Env.TPDMAP[i][j+1] == 1)
        return true;

    return false;
}

// Find all the dead ends in the map
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

// Find all the dead ends in an array of cells
export function findDeadEndsInArray(array){
    let dead_ends = []
    for (let i=1; i<array.length;i++){
        let cell = array[i];
        //only check tunnel cells
            if(Env.TPDMAP[cell.y][cell.x] === 'T'){
            //check for dead end
            if(isDeadEnd(cell)){
                dead_ends.push(cell);
            }
        }
        
    }
    
    console.log('Dead ends:',dead_ends);
    return dead_ends;
}


// Convert a string movement type to a number type
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

// Used for encrypting the messages
export function xorEncrypt(text, key) {
    let encryptedText = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encryptedText += String.fromCharCode(charCode);
    }
    return encryptedText;
}

// Used for decrypting the messages
export function xorDecrypt(encryptedText, key) {
    let decryptedText = '';
    for (let i = 0; i < encryptedText.length; i++) {
      const charCode = encryptedText.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      decryptedText += String.fromCharCode(charCode);
    }
    return decryptedText;
}