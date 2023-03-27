import JSson from 'js-son-agent'

import { io } from "socket.io-client";
import * as config from "./config.js";
import * as Parcel from './parcel.js';
import * as Environment from './environment.js';
import * as Sensing from "./sensing.js";
import * as Utils from "./utils.js";
import * as Action from "./action.js";

const Belief = JSson.Belief
const Desire = JSson.Desire
const Plan = JSson.Plan
const Agent = JSson.Agent
const Environ = JSson.Environment

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
    Sensing.ME.x = data.x;
    Sensing.ME.y = data.y;
    //FOR THE PADDED MAP
    Sensing.agentCell.x = data.x+1;
    Sensing.agentCell.y = data.y+1;
    Sensing.ME.score = data.score;
});


//MAIN LOOP
async function ARE_YOU_WINNING_SON(){
    console.log('Initialize...');

    let standard = 0
    Environment.initializePDMAP();
    console.log('Almost ready...');

    Environment.computeConnectedSet(Sensing.agentCell,Environment.PDMAP);
    console.log('Connected set of cells: ', Environment.connectedSet);
    console.log('Ok, lets win this!');

    while(true){
        
        let dir = Utils.intToMove(standard)
        console.log('trying to move ', dir)
        await Action.move(dir)
            .then((dir)=>console.log('move ' + dir))
            .catch(function(dir){
                console.log('failed to move ' + dir)
                standard += 1
            });
        await Action.pickup();
        await new Promise( res => setTimeout(res, 900) ); // wait 1 sec
        Environment.printPDMap();
        let tSta = {x:1,y:3};
        let tEnd = {x:2,y:10};
        console.log(Sensing.astar(tSta,tEnd));
            
    }
}


//INITIALIZE THE BELIEFS
const beliefs = {
    ...Belief('me', { x: Sensing.agentCell.x, y:Sensing.agentCell.y }),
    ...Belief('map', Environment.PDMAP)
}

const desires = {
    ...Desire('move_right', beliefs => {
        const nextCell = beliefs.me.x
        
        return 'move_right';
    })
    
}

const plans = [
    Plan(intentions => intentions.move_right, () => [ { action: 'move right' } ])
]

const state = {}
const agents = new Agent('agent_dumb', beliefs, desires, plans);

    
const updateState = (actions, agentId, currentState) => {
    const stateUpdate = {}
    actions.forEach(action => {
      stateUpdate[agentId] = {
        keyBelief: action.find(action => action.announce !== undefined).announce
      }
    })
    return stateUpdate
  }

  const stateFilter = state => state

  const environment = new Environ(
    agents,
    state,
    updateState,
    stateFilter
  )

  environment.run(1)