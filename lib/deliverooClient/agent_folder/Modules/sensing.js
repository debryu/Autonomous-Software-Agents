import * as Env from './env.js';
import * as Parcel from './parcel.js';
import * as Planner from './planner.js';
import * as Main from '../mainframe.js';
import { lostFOVEnemies } from "./enemy.js";

/* 
SENSING MODULE
Handle all the sensing and the messages from the server
---------------------------------------------------------------
*/

// Store information about the agent
export var ME = {
    id: 'id',
    x: 0,
    y: 0,
    score: 0,
    carring: false,
    carringid:[]
}

// Analyze the map to count the total accessible cells
// the delivery cells and the total tunnel cells
// Compute the ratio between accessible and tunnel cells
export function analyzeMap(cells){
    let deliveryCells = countDeliveryCells(cells);
    let tunnelCells = 0;
    let totalCells = 0;

    // Iterate for each cell in the cells array
    for(let i = 0; i < cells.length; i++){
        totalCells++;
        let cell = cells[i];
        if(Env.TPDMAP[cell.y][cell.x] === 'T'){
            tunnelCells++;
        }
    }
    console.log('Tunnel cells: ', tunnelCells);
    console.log('Total cells: ', totalCells);
    console.log('Del cells: ', deliveryCells.length)
    let result = tunnelCells/(totalCells-deliveryCells.length);
    console.log('Tunnel ratio: ', result);
    return [totalCells, tunnelCells, result, deliveryCells, cells];
    
}

// Check if the map is just a huge single tunnel
// This is used to decide if to use agent-jones or agent-smith
export function isSingleTunnel(){
    let result = false;
    if(Main.tunnelRatio == 1 && Main.accessibleDC.length == 1){
        result = true;
    }
    return result;
}

// Check the available cells in the map
// Starting from the seedBlock (usually the agent position at the start)
// it computes all the cells that are connected (reachable) to the seedBlock
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
        // Add them in an array
        let neighbors = [nLEFT, nRIGHT, nUP, nDOWN];
        for(let i = 0; i < neighbors.length; i++){
            if(Env.PDMAP[neighbors[i].y][neighbors[i].x] != 1){
                //Check if the cell is already in the connectedCells array
                let alreadyIn = containsCell(neighbors[i], connectedCells);
                if(!alreadyIn){
                    queue.push(neighbors[i]);
                    connectedCells.push(neighbors[i]);
                }
            }
        }
    }
    return connectedCells;
}

// Count the delivery cells in the map
function countDeliveryCells(cells){
    let DC = [];
    for(let i = 0; i < cells.length; i++){
        let cell = cells[i];
        if(Env.PDMAP[cell.y][cell.x] == 2){
            DC.push(cell);
        }
    }
    return DC;
}

// Check if a cell is already in an array of cells
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

// Just a simple Manhatthan distance heuristic
export function admissible_heuristic(start,end){ 
    let manhattanDistance = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
    return manhattanDistance;
}

//This function is used to compute the time it took to the agent to go from the start to the end
export function travelTime(start,end){
    if (Parcel.decay != Infinity){
        let timeFactor = Env.manualMovementDuration //Env.mapConfig.MOVEMENT_DURATION / 1000;
        let steps = astar(start,end).length - 1;
        return steps*timeFactor;
    }else{
        return 0;
    }
}

// A* algorithm implementation
// It takes as input the start and end cell
// It returns the path from start to end
// the flag ignoreenem is used to ignore the enemies presence and predicted location
// when computing the path
export function astar(start,end,ignoreenem=false){
    //console.log('start',start);
    //console.log('end',end);
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

        //console.log('currentCell',currentCell);
        //console.log('end',end);
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
        if(nLEFT.x>=0 && nLEFT.y>=0 && Env.PDMAP[nLEFT.y][nLEFT.x] != 1 && Env.PDMAP[nLEFT.y][nLEFT.x] != 3 && !ignoreenem){
            neighbours.add(nLEFT);
        }
        if(nLEFT.x>=0 && nLEFT.y>=0 && Env.PDMAP[nLEFT.y][nLEFT.x] != 1 && ignoreenem){
            neighbours.add(nLEFT);
        }
            
        if(nRIGHT.x>=0 && nRIGHT.y>=0 && Env.PDMAP[nRIGHT.y][nRIGHT.x] != 1 && Env.PDMAP[nRIGHT.y][nRIGHT.x] != 3 && !ignoreenem){
            neighbours.add(nRIGHT);
        }
        if(nRIGHT.x>=0 && nRIGHT.y>=0 && Env.PDMAP[nRIGHT.y][nRIGHT.x] != 1 && ignoreenem){
            neighbours.add(nRIGHT);
        }
            
        if(nUP.x>=0 && nUP.y>=0 && Env.PDMAP[nUP.y][nUP.x] != 1 && Env.PDMAP[nUP.y][nUP.x] != 3 && !ignoreenem){
            neighbours.add(nUP);
        }
        if(nUP.x>=0 && nUP.y>=0 && Env.PDMAP[nUP.y][nUP.x] != 1 && ignoreenem){
            neighbours.add(nUP);
        }
            
        if(nDOWN.x>=0 && nDOWN.y>=0 && Env.PDMAP[nDOWN.y][nDOWN.x] != 1 && Env.PDMAP[nDOWN.y][nDOWN.x] != 3 && !ignoreenem){
            neighbours.add(nDOWN);
        }
        if(nDOWN.x>=0 && nDOWN.y>=0 && Env.PDMAP[nDOWN.y][nDOWN.x] != 1 && ignoreenem){
            neighbours.add(nDOWN);
        }
            
        if (neighbours.size != 0){ 
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
                        alreadyPresent = true;
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
    // Make sure to reset the enemy map to avoid bugs
    lostFOVEnemies([]);
    return 'failed';
}

// Since the A* returns a matrix that contains the links between the 
// different cells, we use this function to reconstruct the path
// as an array
function recontructPath(connectedGraph,endCell){
    let path = new Set();
    let listPath = [];
    let current = endCell;
    path.add(current);
    listPath.push(current);

    while(true){
        // Follow the path backwards (from end to start)
        if(connectedGraph[current.x][current.y] != null){
            current = connectedGraph[current.x][current.y]
            path.add(current);
            listPath.unshift(current);
        }else // We reached the start cell and we can exit the loop
            return listPath; 
            //listPath is a list ordered from start to finish
            // instead if we use
            //return path;  is a set ordered from finish to start
    }
}

// Manhatthan distance map creation
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

// Set the map with the correct manhatthan distance w.r.t. the agent cell
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
}

// Convert the path (a list of cells) to moves
// like left,right,up,down
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

// Used for simpler implementations of the agent
// get the highest reward cell in the map
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

// Check if the agent is carrying a parcel
export function isCarrying(){
    if (Parcel.backpack.length == 0)
        return false;
    else
        return true;
}

// Deprecated 
// Not used anymore, it was used to find the closest delivery cell
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
    for(let i=1; i<Env.PDmapDimension.x-1; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[Env.PDmapDimension.x-2][i] != 1 && Env.PDMAP[Env.PDmapDimension.x-2][i] != 3){
            let cell = {x: i, y: Env.PDmapDimension.x-2, mhd: mhdMap[Env.PDmapDimension.x-2][i]};
            borders.push(cell);
        }
    }

    //Bottom row
    for(let i=1; i<Env.PDmapDimension.x-1; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[1][i] != 1 && Env.PDMAP[1][i] != 3){
            let cell = {x: i, y: 1, mhd: mhdMap[1][i]};
            borders.push(cell);
        }
    }

    //Left column
    for(let i=1; i<Env.PDmapDimension.y-1; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[i][1] != 1 && Env.PDMAP[i][1] != 3){
            let cell = {x: 1, y: i, mhd: mhdMap[i][1]};
            borders.push(cell);
        }
    }

    //Right column
    for(let i=1; i<Env.PDmapDimension.y-1; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[i][Env.PDmapDimension.y-2] != 1 && Env.PDMAP[i][Env.PDmapDimension.y-2] != 3){
            let cell = {x: Env.PDmapDimension.y-2, y: i, mhd: mhdMap[i][Env.PDmapDimension.y-2]};
            borders.push(cell);
        }
    }

    //Sort the borders from the closest to the farthest
    borders = borders.sort((a,b) => a.mhd-b.mhd);

    return borders[0];
}


// Find the other side of the tunnel in a "agent-jones" scenario
// i.e. when there is a single tunnel in the map
// Simple implementation, could output the wrong cell
// in some particular cases.
// Best solution would be to use the deadEnds found in the map and 
// to coordinate with the other agent to sweep from delivery to every
// dead end (WIP)
export function farthestCell(objects, referencePoint) {
    function calculateDistance(point1, point2) {
      const dx = Math.abs(point2.x - point1.x);
      const dy = Math.abs(point2.y - point1.y);
      return Math.sqrt(dx * dx + dy * dy);
    }
  
    let farthest = objects[0];
  
    for (let i = 1; i < objects.length; i++) {
      const current = objects[i];
      const distanceToReference = calculateDistance(referencePoint, current);
      
      const farthestDistance = calculateDistance(referencePoint, farthest);
      if (distanceToReference > farthestDistance) {
        farthest = current;
      }
    }
  
    return farthest;
  }

  // Dead ends finder for the "agent-jones" 
  export function dEndsFinder(cells){
    var deadends=[];
    for (let k=0;k<cells.length;k++){
        let c = cells[k]
        let i =c.y;
        let j =c.x;
            if (Env.PDMAP[i][j] == 2 || Env.PDMAP[i][j] == 0){
                let conn = [];
                if(Env.PDMAP[i+1][j] == 2 || Env.PDMAP[i+1][j] == 0)
                    conn.push({'x':j,'y':i});
                if(Env.PDMAP[i-1][j] == 2 || Env.PDMAP[i-1][j] == 0)
                    conn.push({'x':j,'y':i});
                if(Env.PDMAP[i][j+1] == 2 || Env.PDMAP[i][j+1] == 0)
                    conn.push({'x':j,'y':i});
                if(Env.PDMAP[i][j-1] == 2 || Env.PDMAP[i][j-1] == 0)
                    conn.push({'x':j,'y':i});

                if (conn.length == 1)
                    deadends.push(conn.pop());
            }
    }
    return deadends;
}