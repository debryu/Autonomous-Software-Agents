import * as Env from './env.js';
import * as Parcel from './parcel.js';
import * as Planner from '../planner.js';

export var ME = {
    id: 'id',
    x: 0,
    y: 0,
    score: 0,
    carring: false,
    carringid:[]
}

export function analyzeMap(cells){
    
    let deliveryCells = countDeliveryCells(cells);
    let tunnelCells = 0;
    let totalCells = 0;

    // Iterate for each cell in the cells array
    for(let i = 0; i < cells.length; i++){
        totalCells++;
        let cell = cells[i];
        //console.log('cell',cell);
        if(Env.TPDMAP[cell.x][cell.y] === 'T'){
            tunnelCells++;
        }
    }
    console.log('Tunnel cells: ', tunnelCells);
    console.log('Total cells: ', totalCells);
    console.log('Del cells: ', deliveryCells)
    let result = tunnelCells/totalCells;
    console.log('Tunnel ratio: ', result);
    return totalCells, tunnelCells, result, deliveryCells;
    
}


export function connectedMap(seedBlock){
    console.log('seedBlock',seedBlock);
    let connectedCells = [];
    let queue = [];
    queue.push(seedBlock);
    while(queue.length > 0){
        let currentCell = queue.shift();
        // Get the neighbors of the current cell
        let nLEFT = {x: currentCell.x-1, y:currentCell.y};
        let nRIGHT = {x: currentCell.x+1, y:currentCell.y};
        let nUP = {x: currentCell.x, y:currentCell.y+1};
        let nDOWN = {x: currentCell.x, y:currentCell.y-1};

        let neighbors = [nLEFT, nRIGHT, nUP, nDOWN];
        for(let i = 0; i < neighbors.length; i++){
            if(Env.PDMAP[neighbors[i].x][neighbors[i].y] != 1){
                //Check if the cell is already in the connectedCells array
                let alreadyIn = containsCell(neighbors[i], connectedCells);
                if(!alreadyIn){
                    queue.push(neighbors[i]);
                    connectedCells.push(neighbors[i]);
                }
            }
        }
    }
    //console.log('connectedCells',connectedCells);
    return connectedCells;
}

function countDeliveryCells(cells){
    let count = 0;
    for(let i = 0; i < cells.length; i++){
        let cell = cells[i];
        if(Env.PDMAP[cell.x][cell.y] == 2){
            count++;
        }
    }
    return count;
}

function containsCell(cell, arrayOfCells){
    let result = false;
    for(let i = 0; i < arrayOfCells.length; i++){
        if(cell.x === arrayOfCells[i].x && cell.y === arrayOfCells[i].y){
            result = true;
        }
    }
    return result;
}

// Check if the agent can reach a delivery cell
export function canReachDeliveryCell(){
    let canReach = false;
    for(let i = 0; i < Env.deliveryCells.length; i++){
        let path = astar({x: ME.x, y: ME.y}, {x: Env.deliveryCells[i].x, y: Env.deliveryCells[i].y});
        //console.log('path',path);
        if(path !== 'failed'){
            canReach = true;
        }
    }
    return canReach;
}

//THIS IS IN PADDED COORDINATES (SO +1 FOR EACH AXIS)
export var agentCell = {
    x: 1,
    y: 1
}

export function admissible_heuristic(start,end){ //Flipped?????? Dude it's an absolute value, order doesn't matter
    let manhattanDistance = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    return manhattanDistance;
}

//This function is used to compute the time it took to the agent to go from the start to the end
//TODO
export function travelTime(start,end){
    if (Parcel.decay != Infinity){
        let timeFactor = Env.manualMovementDuration //Env.mapConfig.MOVEMENT_DURATION / 1000;
        let steps = astar(start,end).length - 1;
        return steps*timeFactor;
    }else{
        return 0;
    }
}

export function astar(start,end){
    let startingCell = {x: start.x, y:start.y};
    let queue = new Set();
    queue.add(startingCell);

    //MAP FOR EVERY CELL THE CELL FROM WHERE THE AGENT CAME FROM
    let cameFrom = new Array(Env.PDmapDimension.x).fill(null).map(() => new Array(Env.PDmapDimension.y).fill(null));

    //Create the map containing the best values at the time at runtime
    let optMap = new Array(Env.PDmapDimension.x).fill(Infinity).map(() => new Array(Env.PDmapDimension.y).fill(Infinity));
    optMap[start.x][start.y] = 0;

    let heurMap = new Array(Env.PDmapDimension.x).fill(Infinity).map(() => new Array(Env.PDmapDimension.y).fill(Infinity));
    heurMap[start.x][start.y] = 0;

    while (queue.size > 0){
        //PICK THE CELL IN THE QUEUE THAT HAS THE LOWER HEURISTIC SCORE
        let lowestHeurScore = Infinity;
        let currentCell = null;
        //First select the current cell as the one that has the lower heuristic
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
        //Aparently js checks conditions in order so this will prevent undefined issues
        if(nLEFT.x>=0 && nLEFT.y>=0 && Env.PDMAP[nLEFT.y][nLEFT.x] != 1 && Env.PDMAP[nLEFT.y][nLEFT.x] != 3){
            neighbours.add(nLEFT);
            //console.log('LEFT', Env.PDMAP[nLEFT.y][nLEFT.x], 'from' , currentCell);
        }
            
        if(nRIGHT.x>=0 && nRIGHT.y>=0 && Env.PDMAP[nRIGHT.y][nRIGHT.x] != 1 && Env.PDMAP[nRIGHT.y][nRIGHT.x] != 3 ){
            neighbours.add(nRIGHT);
            //console.log('RIGHT', Env.PDMAP[nRIGHT.y][nRIGHT.x], 'from' , currentCell);
        }
            
        if(nUP.x>=0 && nUP.y>=0 && Env.PDMAP[nUP.y][nUP.x] != 1 && Env.PDMAP[nUP.y][nUP.x] != 3 ){
            neighbours.add(nUP);
            //console.log('UP', Env.PDMAP[nUP.y][nUP.x], 'from' , currentCell);
        }
            
        if(nDOWN.x>=0 && nDOWN.y>=0 && Env.PDMAP[nDOWN.y][nDOWN.x] != 1 && Env.PDMAP[nDOWN.y][nDOWN.x] != 3 ){
            neighbours.add(nDOWN);
            //console.log('DOWN', Env.PDMAP[nLEFT.y][nLEFT.x], 'from' , currentCell);
        }
            
        if (neighbours.size != 0){ //Was causing undefined issues //TODO
        for (const neighbour of neighbours) {
            let possible_opt = optMap[currentCell.x][currentCell.y] + 1;
            try{
            if(possible_opt < optMap[neighbour.x][neighbour.y]){
                cameFrom[neighbour.x][neighbour.y] = currentCell;
                optMap[neighbour.x][neighbour.y] = possible_opt;
                heurMap[neighbour.x][neighbour.y] = possible_opt + admissible_heuristic(neighbour,end);

                let alreadyPresent = false
                for(const q in queue){
                    if(q.x == neighbour.x && q.y == neighbour.y){
                        console.log('\n\n\n\n\n\n\n\n\n\\n\n\n\n\n\n\n\n\n\n\n\n\n\nn\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
                        alredyPresent = true;
                    }
                }
                if(!alreadyPresent)
                    queue.add(neighbour);
            }
            }catch{
                console.log(neighbour.x, neighbour.y, neighbours, queue, start, end, nDOWN, nLEFT, nRIGHT, nUP);
                Env.printPDMap();
                throw new Error("STOP");
            }
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
        }else
            return listPath; //listPath is a list ordered from start to finish
            //return path;  //path is a set ordered from finish to start
    }
}

export var mhdMap = [];
export function initializeMHDMAP(){
    mhdMap = JSON.parse(JSON.stringify(Env.PDMAP)); // copy the map
    for(let x=0; x<Env.PDmapDimension.x; x++){
        for(let y=0; y<Env.PDmapDimension.y; y++){
            if(x == 0 || y == 0 || x == Env.PDmapDimension.x-1 || y == Env.PDmapDimension.y-1)
                mhdMap[y][x] = "I";
        }
    }    
}

export function mhdFinder(){
    for(let x=1; x<Env.PDmapDimension.x-1; x++){
        for(let y=1; y<Env.PDmapDimension.y-1; y++){
            let startCell = {x: agentCell.x, y: agentCell.y};
            let endCell = {x: x, y: y};
            if(Env.PDMAP[y][x] == 1 || Env.PDMAP[y][x] == 3){// padding or blocked cells
                mhdMap[y][x] = 'I';
            }
            else
                mhdMap[y][x] = admissible_heuristic(startCell,endCell);
            
        }        
    }
    //console.log(mhdMap);
}

export function convertPathToMoves(path){
    let actions = [];
    for(let i=0; i<path.length-1; i++){
        if(path[i].x - path[i+1].x == 0){
            if(path[i+1].y - path[i].y == 1)
                actions.push('up');
            else
                actions.push('down');
        }
        else{
            if(path[i+1].x - path[i].x == 1)
                actions.push('right');
            else
                actions.push('left');
        }
    }

    return actions;
}

export function getHighestReward(){
    let max_reward = 0;
    let destination = {x: agentCell.x, y:agentCell.y};
    for(let i = 0; i < Parcel.parcelsArray.length; i++){
        if(Parcel.parcelsArray[i].reward > max_reward){
            max_reward = Parcel.parcelsArray[i].reward;
            destination = {x: Parcel.parcelsArray[i].x, y: Parcel.parcelsArray[i].y};
        }
    }

    return destination;
}

export function isCarrying(){
    if (Parcel.backpack.length == 0)
        return false;
    else
        return true;
}

export function borderPath(){
    let borders = []; //0 & 1 -> top and bottom rows ; 2 & 3 left and right columns
    borders.push(mhdMap[1].slice(1,mhdMap[0].length-1))
    borders.push(mhdMap[mhdMap.length-2].slice(1,mhdMap[0].length-1))
    borders.push([])
    borders.push([])
    for (let i=1;i<mhdMap.length-1;i++){
        borders[2].push(mhdMap[i][1])
        borders[3].push(mhdMap[i][mhdMap[0].length-2])
    }
    //Get the lowest mhd border
    let closestB = Math.min(...borders.map(subArr => Math.min(...subArr.filter(val => typeof val === 'number' && val != 0 && val != 3))));
    //console.log(borders, closestB)
    
    for (var i=0;i<4;i++){//loop the borders to seach for the index of the closest one
        var otherI = borders[i].indexOf(closestB);
        if(otherI != -1){
            otherI++;
            break;
        }
    }

    let x=-1,y=-1
    switch(i){
        case 0: //top row
            y = 1;
            x = otherI;
            break;
        case 1: // bottom row
            y = mhdMap.length-2;
            x = otherI;
            break;
        case 2: // left column
            y = otherI;
            x = 1;
            break;
        case 3: // right column
            y = otherI;
            x = mhdMap[0].length-2;
            break;
    
    }
    console.log("Closest border pos:", x,y);
    return [{x:x,y:y},closestB] 
}

//Create a function that return the closest delivery zone given a cell
export function closestDelivery(cell){
    //Create a list of all border cells
    let borders = []; 
    //For now just one list but we can use 4 lists for each border
    //0 & 1 -> top and bottom rows ; 2 & 3 left and right columns
    mhdFinder();

    //Top row
    //let temp = [];
    for(let i=1; i<Env.PDmapDimension.x-1; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[Env.PDmapDimension.x-2][i] != 1 && Env.PDMAP[Env.PDmapDimension.x-2][i] != 3){
            let cell = {x: i, y: Env.PDmapDimension.x-2, mhd: mhdMap[Env.PDmapDimension.x-2][i]};
            borders.push(cell);
        }
    }
    //borders.push(temp);
    //temp = [];

    //Bottom row
    for(let i=1; i<Env.PDmapDimension.x-1; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[1][i] != 1 && Env.PDMAP[1][i] != 3){
            let cell = {x: i, y: 1, mhd: mhdMap[1][i]};
            borders.push(cell);
        }
    }
    //borders.push(temp);
    //temp = [];

    //Left column
    for(let i=1; i<Env.PDmapDimension.y-1; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[i][1] != 1 && Env.PDMAP[i][1] != 3){
            let cell = {x: 1, y: i, mhd: mhdMap[i][1]};
            borders.push(cell);
        }
    }
    //borders.push(temp);
    //temp = [];

    //Right column
    for(let i=1; i<Env.PDmapDimension.y-1; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[i][Env.PDmapDimension.y-2] != 1 && Env.PDMAP[i][Env.PDmapDimension.y-2] != 3){
            let cell = {x: Env.PDmapDimension.y-2, y: i, mhd: mhdMap[i][Env.PDmapDimension.y-2]};
            borders.push(cell);
        }
    }
    //borders.push(temp);
    //temp = [];

    //Sort the borders from the closest to the farthest
    borders = borders.sort((a,b) => a.mhd-b.mhd);


    //TODO: 
    // - Check if the cell is not a blocked cell by another ce
    // - Check if the cell is actually that distant from the agent:
    //   check if there is direct path to the cell without going through a blocked cell
    //   so it means that the mhd is also the shortest path
    //   otherwise use a* to compute the shortest path and check the distance to find the true closest cell
    return borders[0];
}




