import * as Environment from './environment.js';

export var ME = {
    id: 'id',
    x: 0,
    y: 0,
    score: 0,
    carring: false
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

const map_dimension = {
    x: 10,
    y: 10
};

function recontructPath(connectedGraph,endCell){
    let path = new Set();
    let current = endCell;
    path.add(current);

    while(true){
        if(connectedGraph[current.x][current.y] != null){
            current = connectedGraph[current.x][current.y]
            path.add(current);
        }
        else
            return path;
    }
}

export var mhdMap = [];

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
    let closestB = Math.min(...borders.map(subArr => Math.min(...subArr.filter(val => typeof val === 'number' && val != 0))));
    console.log(borders, closestB)
    
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
        case 1:
            y = mhdMap.length-2;
            x = otherI;
            break;
        case 2:
            y = otherI;
            x = 1;
            break;
        case 3:
            y = otherI;
            x = mhdMap[0].length-2;
            break;
    }

    console.log("pos:", x,y);

}