import { io } from "socket.io-client";
import * as config from "./config.js";
import * as Parcel from './parcel.js';
import * as Environment from './environment.js';
import * as Sensing from "./sensing.js";
import * as Utils from "./utils.js";
import * as Action from "./action.js";
import * as Enemy from "./enemy.js";

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
    console.log('Connected!')
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
    Sensing.ME.x = data.x;
    Sensing.ME.y = data.y;
    //FOR THE PADDED MAP
    //First check if the value is not a float (when moving)
    //Otherwise it will broke every matrix 
    if(Number.isInteger(data.x) && Number.isInteger(data.y)){
        Sensing.agentCell.x = data.x+1;
        Sensing.agentCell.y = data.y+1;
    }
    
    Sensing.ME.score = data.score;
});

socket.on( 'parcels sensing', pp => Parcel.updateParcelArray(pp) ) // [ {}, {id, x, y, carriedBy, reward}]//let dir = Utils.intToMove(standard)
       
socket.on( 'agents sensing', ee => Enemy.updateEnemyArray(ee) ) // [ {}, {id, x, y, score}]



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


    while(true){
        
        Environment.printPDMap();
        
        Sensing.SANEmhdF();
        
        //Environment.printMHDMap();
        let tEnd;
        if(Sensing.isCarrying()){
            console.log('carrying so go to the border')
            let mhdinfo = Sensing.borderPath();
            tEnd = mhdinfo[0];
        }
        else
            tEnd = Sensing.getHighestReward();

        console.log('end goal',tEnd);
        //console.log(Sensing.agentCell)
        //console.log(Sensing.astar(Sensing.agentCell,tEnd));
        //Create a set of moves to get to the destination
        let planned_moves = Sensing.convertPathToMoves(Sensing.astar(Sensing.agentCell,tEnd));
        //let planned_moves = ['right'];
        //If the plan has at least one move
        
        if(planned_moves.length > 0){
            let dir = planned_moves[0]
            await Action.move(dir)
            .then((dir)=>console.log('move ' + dir))
            .catch(async function(dir){
                console.log('failed to move ' + dir)
                //REFLECT ON YOUR MISTAKES DUMB AGENT
                await new Promise( res => setTimeout(res, 10) ); // wait  10 sec
                //standard += 1
            });
            await Action.putdown();
            await new Promise( res => setTimeout(res, 10) ); // wait  10 sec
            await Action.pickup();
            await new Promise( res => setTimeout(res, 10) ); // wait  10 sec
        }
        else{
            
            console.log('It aint much but its an honest job');
            await new Promise( res => setTimeout(res, 10) ); // wait  10 sec
        }
        console.log('carrying',Sensing.isCarrying());
    }
}

