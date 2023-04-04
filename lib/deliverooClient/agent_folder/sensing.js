import * as Environment from './environment.js';
import * as Parcel from './parcel.js';

export var ME = {
    id: 'id',
    x: 0,
    y: 0,
    score: 0,
    carring: false,
    cid:0
}

export function border (x,y,mhd){
    this.x=x,
    this.y = y,
    this.mhd= mhd
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

    //Create the map containing the best values at the time at runtime
    let optMap = new Array(Environment.PDmapDimension.x).fill(Infinity).map(() => new Array(Environment.PDmapDimension.y).fill(Infinity));
    optMap[start.x][start.y] = 0;

    let heurMap = new Array(Environment.PDmapDimension.x).fill(Infinity).map(() => new Array(Environment.PDmapDimension.y).fill(Infinity));
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
        if(Environment.PDMAP[nLEFT.y][nLEFT.x] != 1 && Environment.PDMAP[nLEFT.y][nLEFT.x] != 3){
            neighbours.add(nLEFT);
            //console.log('LEFT', Environment.PDMAP[nLEFT.y][nLEFT.x], 'from' , currentCell);
        }
            
        if(Environment.PDMAP[nRIGHT.y][nRIGHT.x] != 1 && Environment.PDMAP[nRIGHT.y][nRIGHT.x] != 3){
            neighbours.add(nRIGHT);
            //console.log('RIGHT', Environment.PDMAP[nRIGHT.y][nRIGHT.x], 'from' , currentCell);
        }
            
        if(Environment.PDMAP[nUP.y][nUP.x] != 1 && Environment.PDMAP[nUP.y][nUP.x] != 3){
            neighbours.add(nUP);
            //console.log('UP', Environment.PDMAP[nUP.y][nUP.x], 'from' , currentCell);
        }
            
        if(Environment.PDMAP[nDOWN.y][nDOWN.x] != 1 && Environment.PDMAP[nDOWN.y][nDOWN.x] != 3){
            neighbours.add(nDOWN);
            //console.log('DOWN', Environment.PDMAP[nLEFT.y][nLEFT.x], 'from' , currentCell);
        }
            

        for (const neighbour of neighbours) {
            let possible_opt = optMap[currentCell.x][currentCell.y] + 1;
            if(possible_opt < optMap[neighbour.x][neighbour.y]){
                cameFrom[neighbour.x][neighbour.y] = currentCell;
                optMap[neighbour.x][neighbour.y] = possible_opt;
                heurMap[neighbour.x][neighbour.y] = possible_opt + admissible_heuristic(neighbour,end);

                let alreadyPresent = false
                for(const q in queue){
                    if(q.x == neighbour.x && q.y == neighbour.y)
                        alredyPresent = true;
                }
                if(!alreadyPresent)
                    queue.add(neighbour);
            }
        }

    }

    return 'failed';
}

const map_dimension = {
    x: 10,
    y: 10
};

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

export var mhdMap = [];
export function initializeMHDMAP(){
    mhdMap = JSON.parse(JSON.stringify(Environment.PDMAP)); // copy the map
    for(let x=0; x<Environment.PDmapDimension.x; x++){
        for(let y=0; y<Environment.PDmapDimension.y; y++){
            if(x == 0 || y == 0 || x == Environment.PDmapDimension.x-1 || y == Environment.PDmapDimension.y-1)
                mhdMap[y][x] = "I";
        }
    }    
}

export function SANEmhdF(){
    //console.log("---------------------------------------------------");
    //console.log("position", ME);
    //Environment.printPDMap();///Environment.printMap(Environment.MAP,map_dimension);
    //Environment.printPDMap();
    for(let x=1; x<Environment.PDmapDimension.x-1; x++){
        for(let y=1; y<Environment.PDmapDimension.y-1; y++){
            let startCell = {x: agentCell.x, y: agentCell.y};
            let endCell = {x: x, y: y};
            if(Environment.PDMAP[y][x] == 1){// padding or blocked cells
                mhdMap[y][x] = 'I';
            }
            else
                mhdMap[y][x] = admissible_heuristic(startCell,endCell);
        }        
    }
}

export function mhdFinder(){
    console.log("---------------------------------------------------");
    console.log("position", ME);
    //Environment.printPDMap();///Environment.printMap(Environment.MAP,map_dimension);
    //Environment.printPDMap();
    mhdMap = JSON.parse(JSON.stringify(Environment.PDMAP)); // copy the map
    console.log(mhdMap.length)
    //loop the map
    ME.x = ME.x + 1; ME.y = ME.y + 1;
    for (let y=0;y<mhdMap.length;y++){ //number of columns
        for(let x=0;x<mhdMap[0].length;x++){ //lenght of each row
            let cell = mhdMap[y][x];
            if(cell == 1 || y == 0 || x == 0 || y == mhdMap.length-1 || x == mhdMap[0].length -1){// padding or blocked cells
                mhdMap[y][x] = 'I';
            }else if( x == ME.x && y == ME.y){ // own position
                mhdMap[y][x] = 0;
                console.log("ME: ", x,y);
            }else if(x < ME.x && y < ME.y){// top left quadrant
                mhdMap[y][x] = ME.x-x + ME.y-y;
            }else if(x < ME.x && y > ME.y){// bottom left quadrant
                mhdMap[y][x] = ME.x-x + y-ME.y;                 
            }else if(x > ME.x && y < ME.y){// top right quadrant
                mhdMap[y][x] = x-ME.x + ME.y-y;                  
            }else if(x > ME.x && y > ME.y){// bottom right quadrant
                mhdMap[y][x] = x-ME.x + y-ME.y;
            }else if(x < ME.x && y == ME.y){// same y on the left 
                mhdMap[y][x] = ME.x-x;
            }else if(x > ME.x && y == ME.y){// same y on the right
                mhdMap[y][x] = x-ME.x;
            }else if(x == ME.x && y < ME.y){// same x on the top
                mhdMap[y][x] = ME.y-y;
            }else if(x == ME.x && y > ME.y){// same x on the bottom
                mhdMap[y][x] = y-ME.y;
            }else{                          
                mhdMap[y][x] = 'e';
            }
        }
        //return mhdMap;
        
    }


    console.log("HASDHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
        //console.log("MHD: ",mhdMap);
        const maxLength = mhdMap.reduce((max, row) => Math.max(max, ...row.map(cell => cell.toString().length)), 0);
        console.log("MHD:");
        mhdMap.forEach(row => {
        console.log(row.map(cell => cell.toString().padEnd(maxLength)).join(" "));
        });
        borderPath()
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

//TODO
export function parcelPath(){
    //let mhdParcels = [];// array of mhds of seen parcels
    //let xyParcels = [];
    let coordinates = [0,0];//y x
    let aux =1000;
    for (let i=0;i<Parcel.parcelsArray.length;i++){
        //Loop seen parcels and get their positions
        //Then use this positions to get the mhd to the player and push them to the mhdParcels array
        if(mhdMap[Parcel.parcelsArray[i].y+1][Parcel.parcelsArray[i].x+1] < aux){//Find the closest parcel 
            aux = mhdMap[Parcel.parcelsArray[i].y+1][Parcel.parcelsArray[i].x+1];
            coordinates[0] = Parcel.parcelsArray[i].y+1;coordinates[1] = Parcel.parcelsArray[i].x+1; //Store the coordinates
        }
        //mhdParcels.push(mhdMap[Parcel.parcelsArray[i].y+1][Parcel.parcelsArray[i].x+1]); //col y row x
        //xyParcels.push([Parcel.parcelsArray[i].y+1, Parcel.parcelsArray[i].x+1]);
        console.log(coordinates[0], coordinates[1]);
        return {x: coordinates[0], y: coordinates[1] };
    }

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
    //console.log("pos:", x,y);
    //return [{x:x,y:y},closestB] 
    //temporary
    return [{x:2,y:8}, closestB];
}

export function getHighestReward(){
    let max_reward = 0;
    let destination = null;
    for(let i = 0; i < Parcel.parcelsArray.length; i++){
        if(Parcel.parcelsArray[i].reward > max_reward){
            max_reward = Parcel.parcelsArray[i].reward;
            destination = {x: Parcel.parcelsArray[i].x+1, y: Parcel.parcelsArray[i].y+1};
        }
    }

    return destination;
}

export function isCarrying(){
    for(let i = 0; i < Parcel.parcelsArray.length; i++){
        if(Parcel.parcelsArray[i].carriedBy == ME.id)
            return true;
    }
    return false;
}

export function avoidEnemy(){
    
}

//search the maximum Value of a matrix and return the index
export function findMaxMatrix(matrix){
    let maxValue = 0;
    let maxCell = false;
    for(let i=1;i<matrix[0].length-1;i++){
        for(let j=1;j<matrix.length-1;j++){
            //Check if the cell is walkable
            if(matrix[j][i] > maxValue){
                maxValue = matrix[j][i];
                maxCell = {x:i, y:j};
            }
        }
    }
    return maxCell;
}