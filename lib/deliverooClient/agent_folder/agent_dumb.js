import { io } from "socket.io-client";
import * as config from "./Modules/config.js";
import * as Parcel from './Modules/parcel.js';
import * as Env from './Modules/env.js';
import * as Sensing from "./Modules/sensing.js";
import * as Action from "./Modules/action.js";
import * as Enemy from "./Modules/enemy.js";
import * as Connection from "./Modules/connection.js";

/* ------------------------------------------
INITIALIZE ALL THE LISTENERS
*/
export var socket = io( config.host, {
    extraHeaders: {
        'x-token': config.token
    },
});

//Establish connection with server
socket.on("connect", async function(){
    console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc
    Connection.turnOnAllSensing();
    //WAIT UNTIL WE GET THE ENTIRE MAP
    //0.1 SECOND THEN GOOOO
    await new Promise(res => setTimeout(res, 100));
    console.log('Connected!')
    ARE_YOU_WINNING_SON();
});

//MAIN LOOP
async function ARE_YOU_WINNING_SON(){
    console.log('Initialize...');
    Env.initializePDMAP();
    Sensing.initializeMHDMAP();
    console.log('Almost ready...');
    //Env.computeConnectedSet(Sensing.agentCell,Env.PDMAP);
    console.log('Connected set of cells: ', Env.connectedSet);
    console.log('Ok, lets win this!');

    while(true){
        
        Env.printPDMap();
        Sensing.mhdFinder();
        
        //Env.printMHDMap();
        let tEnd;
        if(Sensing.isCarrying()){
            console.log('carrying so go to the border')
            let mhdinfo = Sensing.borderPath();
            tEnd = mhdinfo[0];
        }
        else
            tEnd = Sensing.getHighestReward();

        console.log('end goal',tEnd);
        //Create a set of moves to get to the destination
        let planned_moves = Sensing.convertPathToMoves(Sensing.astar(Sensing.agentCell,tEnd));
        //let planned_moves = ['right'];

        //If the agent has nothing to do move randomly
        //console.log(Sensing.agentCell, tEnd, planned_moves, Sensing.agentCell == tEnd);
        if (Sensing.agentCell == tEnd){
            console.log("Moving randomly");
            let randommove = ['right', 'left', 'up', 'down'];
            planned_moves = randommove[Math.floor(Math.random() * 4)];
        }
        
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
        await new Promise( res => setTimeout(res, 1000) ); // 5 sec?
    }
}