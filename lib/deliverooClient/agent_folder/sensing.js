import * as Environment from './environment.js';

export var ME = {
    id: 'id',
    x: 0,
    y: 0,
    score: 0
}

//THIS IS IN PADDED COORDINATES (SO +1 FOR EACH AXIS)
export var agentCell = {
    x: 1,
    y: 1
}

export function printPosition(){
    console.log(ME.x,ME.y)
}

export function pathFind(start,end){
    let A = {x: start.x, y: start.y};
    let B = {x: end.x, y: end.y};
    let path = [];
    //IF ONE AMONG A or B IS NOT CONNECTED TO THE SAME LANDSCAPE RETURN NO POSSIBLE PATH
    if(!(Environment.arrayContains(Environment.connectedSet,A) || Environment.arrayContains(Environment.connectedSet,B))){
        optimalPath(A,B);
    }
    else
        return path;
}

function optimalPath(start,end){
    
}
