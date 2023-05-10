import { io } from "socket.io-client";
import * as config from "./Modules/config.js";
import * as Parcel from './Modules/parcel.js';
import * as Env from './Modules/env.js';
import * as Sensing from "./Modules/sensing.js";
import * as Action from "./Modules/action.js";
import * as Planner from "./planner.js";
import * as Connection from "./Modules/connection.js";
import { shout } from "./Modules/coms.js";

console.log(config.host, config.token);
export var socket = io( config.host, {
    extraHeaders: {
        'x-token': config.token
    },
});

Connection.turnOnAllSensing();
socket.on("connect", async function(){
    console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc
    //WAIT UNTIL WE GET THE ENTIRE MAP
    //0.1 SECOND THEN GOOOO
    await new Promise(res => setTimeout(res, 100));
    console.log('Connected!')
    console.log('Initialize...');
    console.log(Env.MAP);
    console.log(Env.MAP);
    Env.initializePDMAP();
    Sensing.initializeMHDMAP();
    console.log('Ok, lets win this!');
    await new Promise(res => setTimeout(res, 100));
    //Set the planner dimension
    Planner.setDimension();

    ARE_YOU_WINNING_SON();
});

async function ARE_YOU_WINNING_SON(){

    while(true){        
        //shout('IDK');

        let reachCellPath;
        let path;
        let plan;
        console.log('Free parcels',Parcel.parcelsArray.length);

        Connection.meSensing();

        if (false){//Parcel.parcelsArray.length != 0){
            console.log('A*');
                    //Env.printPDMap();
            Sensing.mhdFinder();
            
            //Env.printMHDMap();
            let tEnd;
            if(Sensing.isCarrying()){
                //console.log('carrying so go to the border')
                let mhdinfo = Sensing.borderPath();
                tEnd = mhdinfo[0];
            }
            else
                tEnd = Sensing.getHighestReward();
            //console.log('end goal',tEnd);
            //Create a set of moves to get to the destination
            path = [tEnd];

            if(path.length ==1){
                console.log(path, Parcel.parcelsArray, Sensing.ME)
                //asdd-sad
            }
            
        }else{
            console.log("Ant Colony")
            plan = Planner.plan();
            path = Planner.fromPathToListOfCells(plan.path);
            console.log(plan, path, Sensing.ME);
            //as-sa
            //console.log('Path retrieved!');
            //console.log('Par array',Parcel.parcelsArray);
            
            //console.log('agent position',Sensing.agentCell);
            //console.log(path);
            //Env.printPDMap();
            //Sensing.ME.score = Connection.agentSensing[1].score; // get current score

        }

        let plength = Parcel.parcelsArray.length //no need to deepcopy
        for(let i = 0; i<path.length; i++){
            //console.log('Going to: ',path[i]);
            await new Promise(res => setTimeout(res, 10));
            reachCellPath = Sensing.astar(Sensing.agentCell,path[i]);
            //console.log(reachCellPath, Sensing.agentCell, Sensing.ME, path)
            //as-sa
            try{
                await Action.goTo(reachCellPath, plength);
            }
            catch(err){
                console.log(err);
                //continue;
                break;
            }

        }

        if (path.length >1){
            console.log('Path completed with score ' + plan.pathScore);
        }

        await new Promise(res => setTimeout(res, 100));
    }
    
    

}