import { io } from "socket.io-client";
import * as config from "./config.js";
import * as Parcel from './parcel.js';
import * as Environment from './environment.js';
import * as Sensing from "./sensing.js";
import * as Utils from "./utils.js";
import * as Action from "./action.js";

/* ------------------------------------------
INITIALIZE ALL THE LISTENERS
*/
export var socket = io( config.host, {
    extraHeaders: {
        'x-token': config.token
    },
    // query: {
    //     name: "scripted",
    // }
});


socket.on("connect", async function(){
    console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc

    //WAIT UNTIL WE GET THE ENTIRE MAP
    //0.1 SECOND THEN GOOOO
    await new Promise(res => setTimeout(res, 100));
    
    ARE_YOU_WINNING_SON();
});

socket.on("disconnect", () => {
    console.log( "socket disconnect", socket.id ); // x8WIv7-mJelg7on_ALbxc
});

//Save the map
socket.on( 'tile', function(x,y,deliv){
    Environment.getMap(x,y,deliv);
}); 

socket.on("you", function(data){
    Sensing.ME.id = data.id;
    Sensing.ME.name = data.name;
    Sensing.ME.x =Math.round(data.x), Sensing.ME.y=Math.round(data.y);
    //FOR THE PADDED MAP
    Sensing.agentCell.x = Sensing.ME.x+1;
    Sensing.agentCell.y = Sensing.ME.y+1;
    Sensing.ME.score = data.score;
});

/*
socket.on("you", function(data){
    Sensing.ME.id = data.id;
    Sensing.ME.name = data.name;
    Sensing.ME.x = data.x;
    Sensing.ME.y = data.y;
    Sensing.ME.score = data.score;
    
    Sensing.printPosition();
});
*/

/*
socket.on("you", ({id, name, x, y, score}) => {
    Sensing.ME.id = id;
    Sensing.ME.name = name;
    Sensing.ME.x = x;
    Sensing.ME.y = y;
    Sensing.ME.score = score;
    //Sensing.ME.x =x, Sensing.ME.y=y
    //Sensing.ME.x =Math.round(x), Sensing.ME.y=Math.round(y);
});
*/

//socket.on( 'agents sensing', aa => console.log(aa) ) // [ {}, {id, x, y, score}]
//socket.on( 'parcels sensing', pp => Parcel.findParcel(pp[0]) ) // [ {}, {id, x, y, carriedBy, reward}]
//


//MAIN LOOP
async function ARE_YOU_WINNING_SON(){
    console.log('Initialize...');

    let standard = 3
    Environment.initializePDMAP();
    Sensing.initializeMHDMAP();
    console.log('Almost ready...');

    Environment.computeConnectedSet(Sensing.agentCell,Environment.PDMAP);
    console.log('Connected set of cells: ', Environment.connectedSet);
    console.log('Ok, lets win this!');



    //TEMPORARY
    let tSta = {x:1,y:3};
    let tEnd = {x:2,y:10};
    let path = Sensing.astar(tSta,tEnd);
    //--------------------
    while(true){
        socket.on( 'parcels sensing', pp => Parcel.findParcel(pp[0]) ) // [ {}, {id, x, y, carriedBy, reward}]//let dir = Utils.intToMove(standard)
        //console.log('trying to move ', dir)
        
        
        

        Environment.printPDMap();
        Sensing.SANEmhdF();
        //Environment.printMHDMap();
        let tEnd = {x:5,y:2};
    
        //console.log(Sensing.agentCell)
        //console.log(Sensing.astar(Sensing.agentCell,tEnd));

        //Create a set of moves to get to the destination
        let path = Sensing.astar(Sensing.agentCell,tEnd);
        console.log(path);
        let planned_moves = Sensing.convertPathToMoves(path);
        console.log(planned_moves);
        //If the plan has at least one move
        if(planned_moves.length > 0){
            let dir = planned_moves[0]
            await Action.move(dir)
            .then((dir)=>console.log('move ' + dir))
            .catch(async function(dir){
                console.log('failed to move ' + dir)
                //REFLECT ON YOUR MISTAKES DUMB AGENT
                await new Promise( res => setTimeout(res, 10000) ); // wait  10 sec
                //standard += 1
            });
            await Action.pickup();
        }
        else{
            console.log('It ain much but its an honest job');
        }
    }
}

