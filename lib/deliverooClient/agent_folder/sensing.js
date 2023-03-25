import * as Environment from './environment.js'

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


const map_dimension = {
    x: 10,
    y: 10
};

export var mhdMap = [];

export function mhdFinder(){
    console.log("---------------------------------------------------");
    console.log("position", ME);
    Environment.printMap(Environment.MAP,map_dimension);
    mhdMap = Environment.PDMAP.slice(); // copy the map

    //loop the map
    for (let y=1;y<mhdMap.length-1;y++){ //number of rows
        for(let x=1;x<mhdMap[0].length-1;x++){ //lenght of each row
            let cell = mhdMap[y][x];
            if(cell == 1){
                mhdMap[y][x] = Infinity;
            }else if(cell < ME.x && cell < ME.y){// top left quadrant
                mhdMap[y][x] = ME.x-x + ME.y-y;
            }else if(cell < ME.x && cell > ME.y){// bottom left quadrant
                mhdMap[y][x] = Math.abs(x - ME.x) + Math.abs(y-ME.y);                 
            }else if(cell > ME.x && cell < ME.y){// top right quadrant
                mhdMap[y][x] = x + Math.abs(y - ME.y);                  
            }
        }
    }

    /*
    let b1234 = [ME.x,
                ME.y,
                Environment.MAP.length-1 - ME.x,
                Environment.MAP[0].length-1 - ME.y]
    //b1234.sort();
    let mhds =[0,0,0,0];
    let idk=0;
    //Check if borders are deliverable
    for (let i=0;i<2;i++){ 

        if(i==0){
            idk=0;
        }else
            idk = Environment.MAP.length-1;

        console.log("x: ", Environment.MAP[b1234[i*2]][idk], b1234[i*2], idk)
        if (Environment.MAP[b1234[i*2]][idk] ==2) // x loop
            mhds[i*2] = b1234[i*2];
        else
            mhds[i*2] = Infinity;

        if(i==0){
              idk=0;
          }else
              idk = Environment.MAP[0].length-1;

        console.log("y: ", Environment.MAP[idk][b1234[i*2+1]], b1234[i*2+1], idk)
        if (Environment.MAP[idk][b1234[i*2+1]] ==2) // y loop
            mhds[i+1] = b1234[i*2+1];
        else
            mhds[i+1] = Infinity;
        
        bordersArray.push(new border(b1234[i*2+1], idk, mhds[i*2+1]));
        bordersArray.push(new border(idk,b1234[i*2],mhds[i*2]));
    }

    bordersArray.sort((a, b) => a.mhd - b.mhd);

    /*
    //Get sorting indexes
    let sortedArr = mhd.slice().sort(); 
    let indx = sortedArr.map((value) => {
        return arr.indexOf(value);
    });

    for (var i=0;i<4;i++ ){
        bordersArray.push(new border(x=b1234))
    }
    */
    
}

/*
export function go2border(){
    let pathclear = true;
    if(ME.carring){ // check if carring parcel
        if(ME.x < ME.y && Environment.MAP[0][ME.y] == 2){ //Check if agent is closer to x than y origin and check if that border deliverable
            for (let i = 1; i < ME.y; i++) {
                if(Environment.MAP[ME.x][i] !=0){ //Check if the path to border is clear
                    pathclear = false;
                    break;
                }
            }
        }else if(ME.y < ME.x && Environment.MAP[ME.x][0] == 2){ //Same just for y closer than x
            for (let i = 1; i < ME.x; i++) {
                if(Environment.MAP[i][ME.y] !=0){ //Check if the path to border is clear
                    pathclear = false;
                    break;
                }
            }
        } 
        
        if (pathclear)
            return 
        else
        //Couldn't find a straight path so just keep moving

    }
}*/

