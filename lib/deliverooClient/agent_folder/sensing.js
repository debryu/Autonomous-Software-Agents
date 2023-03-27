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

function admissible_heuristic(start,end){
    let manhattanDistance = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    return manhattanDistance;
}

export function astar(start,end){
    let startingCell = {x: start.x, y:start.y};
    let queue = new Set();
    queue.add(startingCell);

    //MAP FOR EVERY CELL THE CELL FROM WHERE THE AGENT CAME FROM
    let cameFrom = new Array(Environment.PDmapDimension.x).fill(null).map(() => new Array(Environment.PDmapDimension.y).fill(null));

    //let 
    let optMap = new Array(Environment.PDmapDimension.x).fill(Infinity).map(() => new Array(Environment.PDmapDimension.y).fill(Infinity));
    optMap[start.x][start.y] = 0;

    let heurMap = new Array(Environment.PDmapDimension.x).fill(Infinity).map(() => new Array(Environment.PDmapDimension.y).fill(Infinity));
    heurMap[start.x][start.y] = 0;

    while (queue.size > 0){
        //PICK THE CELL IN THE QUEUE THAT HAS THE LOWER HEURISTIC SCORE
        let lowestHeurScore = Infinity;
        let currentCell = null;
        for (const cell of queue) {
            if (heurMap[cell.x][cell.y] < lowestHeurScore) {
                lowestHeurScore = heurMap[cell.x][cell.y];
                currentCell = cell;
            }
        }

        if(currentCell.x == end.x && currentCell.y == end.y){
            return recontructPath(cameFrom,currentCell);
        }
        queue.delete(currentCell);

        //ADD THE NEIGHBOURS OF THE CURRENT CELL
        let neighbours = new Set();
        let nLEFT = {x: currentCell.x-1, y:currentCell.y};
        let nRIGHT = {x: currentCell.x+1, y:currentCell.y};
        let nUP = {x: currentCell.x, y:currentCell.y+1};
        let nDOWN = {x: currentCell.x, y:currentCell.y-1};
        //CHECK IF THEY ARE NOT BLOCKED
        if(Environment.PDMAP[nLEFT.x][nLEFT.y] != 1)
            neighbours.add(nLEFT);
        if(Environment.PDMAP[nRIGHT.x][nRIGHT.y] != 1)
            neighbours.add(nRIGHT);
        if(Environment.PDMAP[nUP.x][nUP.y] != 1)
            neighbours.add(nUP);
        if(Environment.PDMAP[nDOWN.x][nDOWN.y] != 1)
            neighbours.add(nDOWN);

        for (const neighbour of neighbours) {
            let possible_opt = optMap[currentCell.x][currentCell.y] + 1;
            if(possible_opt < optMap[neighbour.x][neighbour.y]){
                cameFrom[neighbour.x][neighbour.y] = currentCell;
                optMap[neighbour.x][neighbour.y] = possible_opt;
                heurMap[neighbour.x][neighbour.y] = possible_opt + admissible_heuristic(neighbour,end);

                let present = false
                for(const q in queue){
                    if(q.x == neighbour.x && q.y == neighbour.y)
                        present = true;
                }
                if(!present)
                    queue.add(neighbour);
            }
        }

    }

    return 'failed';
}

function recontructPath(connectedGraph,endCell){
    let path = new Set();
    let listPath = [];
    let current = endCell;
    path.add(current);
    listPath.push(current);

    while(true){
        if(connectedGraph[current.x][current.y] != null){
            current = connectedGraph[current.x][current.y]
            path.add(current);
            listPath.unshift(current);
        }
        else
            return listPath; //listPath is a list ordered from start to finish
            //return path;  //path is a set ordered from finish to start
    }
    
}

export function convertPathToMoves(path){
    let actions = [];
    for(let i=0; i<path.length-1; i++){
        if(path[i].x - path[i+1].x == 0){
            if(path[i+1].y - path[i].y == 1)
                actions.push('right');
            else
                actions.push('left');
        }
        else{
            if(path[i+1].x - path[i].x == 1)
                actions.push('down');
            else
                actions.push('up');
        }
    }

    return actions;
}