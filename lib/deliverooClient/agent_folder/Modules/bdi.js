import * as Parcel from './parcel.js';
import * as Env from './env.js';
import * as Sensing from "./sensing.js";
import * as Action from "./action.js";
import * as Planner from "../planner.js";
import * as Connection from "./connection.js";
import * as Coms from "./coms.js";
import * as Pddl from '../PDDLplanner.js';


export var characters = [];
characters.push('agent-smith');
characters.push('agent-jones');
characters.push('agent-brown');
characters.push('agent-dumb');
characters.push('agent-debugger');
export var active = true;

export function setActive(value){
    active = value;
}

export async function intentSelection(){
    //Sensing.calculateTunnelRatio();
    return 'agent-debugger';
}

export async function intentExecution(character){
    switch (character) {
        case 'agent-smith':
            await smith();
            break;

        case 'agent-debugger':
            await debuggerAgent();
            break;
        /*
        case 'agent-jones':
            await jones();
            break;
      
        case 'agent-brown':
            await brown();
            break;
        
        case 'agent-dumb':
            await dumb();
            break;
        */
        default:
          console.log('DUNNO WHICH AGENT TO RUN');
          break;
      }
}

export async function smith(){
    while(active){
        let reachCellPath;
        //let p2send =JSON.parse(JSON.stringify(Parcel.parcelsArray));
        console.log(Connection.getMapConf());
        Env.printPDMap();
        //Coms.say('copy acer copy!', '75194fded80');
        //console.log(ans);
        //console.log('parcel', Parcel.parcelsArray);
        //console.log("TUNNELS!!", tunnels, tunnels.length);
        Parcel.updateRewards(Parcel.parcelsArray);
        let plan = Planner.plan();
        if(!plan){
            console.log('No valid plan found! \nusing PDDL to explore');
            
            //await new Promise(res => setTimeout(res, 3000));
            Pddl.initPDDL(Action.randomExplore());
            let pddlStuff = await Pddl.getPlan();
            console.log('agent position',Sensing.agentCell);

            //let plength = Parcel.parcelsArray.length;
            await new Promise(res => setTimeout(res, 10));
            try{
                await Action.goTo(pddlStuff, true);
            }
            catch(err){
                console.log(err);
                break;
            }

        }
        else{
            let path = Planner.fromPathToListOfCells(plan.path);
            console.log('Path retrieved!');
            //console.log('Par array',Parcel.parcelsArray);
            console.log('Free parcels',Parcel.parcelsArray.length);
            console.log('agent position',Sensing.agentCell);
            console.log(path);
            
            // for (let i=0;i<path.length;i++){
            //     const index = Parcel.parcelsArray.findIndex(item => item.x == path[i].x && item.y == path[i].y);
            //     if (index != -1){ //Path node is a parcel node
            //         p2send.filter(item => item != Parcel.parcelsArray[index]); //dont send this data
            //     }
            // }
            // p2send.forEach(obj => {
            //     obj.x = obj.x -1;
            //     obj.y = obj.y -1;
            //   });
            // Parcel.watcher(p2send);

            //Sensing.ME.score = Connection.agentSensing[1].score; // get current score
            let plength = Parcel.parcelsArray.length;
            for(let i = 0; i<path.length; i++){
                console.log('Going to: ',path[i]);
                await new Promise(res => setTimeout(res, 10));
                reachCellPath = Sensing.astar(Sensing.agentCell,path[i]);
                try{
                    let tempScore = Parcel.parcelsArrayBounty + Parcel.backpackBounty;
                    await Action.goTo(reachCellPath, false, tempScore);
                }
                catch(err){
                    console.log(err);
                    break;
                }

            }
            
            console.log('Path completed with score ' + plan.pathScore);
            await new Promise(res => setTimeout(res, 100));
        }
        plan = null;
        blockIntention();
    }
}

export async function debuggerAgent(){
    while(active){
        await new Promise(res => setTimeout(res, 500));
        blockIntention();
    }
}

export async function intentionRevision(){
    let needToRevise = false;

    if (needToRevise)
        blockIntention();
}

export async function blockIntention(){
    active = false;
}


