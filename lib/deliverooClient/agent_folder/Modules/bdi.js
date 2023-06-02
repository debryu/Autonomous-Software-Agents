import * as Parcel from './parcel.js';
import * as Env from './env.js';
import * as Sensing from "./sensing.js";
import * as Action from "./action.js";
import * as Planner from "../planner.js";
import * as Connection from "./connection.js";
import * as Coms from "./coms.js";
import * as Pddl from '../PDDLplanner.js';
import * as Main from '../mainframe.js';


export var characters = [];
characters.push('agent-smith');
characters.push('agent-jones');
characters.push('agent-brown');
characters.push('agent-dumb');
characters.push('agent-debugger');
export var active = true;
var emergency = false;

export function setActive(value){
    active = value;
}

export async function intentSelection(){

    // First exchange the agent ids with the teammate
    if(!Coms.agentsAreReady){
        console.log('Exchange information between agents');
        return 'social-agent';
    }
    if(emergency){
        console.log('EMERGENCY MODE');
        return 'agent-emergency';
    }

    // First detect if the agents are in the single tunnel scenario
    if(Sensing.isSingleTunnel()){
        console.log('Single tunnel scenario detected!');
        console.log('EXECUTING JONES');
        return 'agent-jones';
    }
    //Sensing.calculateTunnelRatio();
    return 'agent-smith';
}

export async function intentExecution(character){
    switch (character) {
        case 'agent-smith':
            await smith();
            break;


        // This is only used for testing purposes
        case 'agent-debugger':
            await debuggerAgent();
            break;
        
        case 'agent-jones':
            await jones();
            break;

        case 'agent-emergency':
            await emergencyAgent();
            break;

        case 'social-agent':
            await socialAgent();
            break;

        /*
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
            //Pddl.initPDDL(Action.randomExplore());
            //let pddlStuff = await Pddl.getPlan();
            let pddlStuff = Sensing.astar(Sensing.agentCell,Action.randomExplore());
            console.log('agent position',Sensing.agentCell);

            //let plength = Parcel.parcelsArray.length;
            await new Promise(res => setTimeout(res, 10));
            try{
                await Action.goTo(pddlStuff);
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
        //blockIntention();
    }
}

export async function jones(){
    let pddlStuff;
    var gotos = Sensing.dEndsFinder(Main.connectedCells);//Get dead ends of current tunnel
    console.log(gotos)
    //4 random initial moves
    try{
    await Action.move('up');
    await Action.move('down');
    await Action.move('left');
    await Action.move('right');
    }catch(err){
        console.log(err);
    }
    console.log(Main.accessibleDC[0], gotos);
    //let indx = gotos.indexOf(Main.accessibleDC[0]); Quote: JS compares the references of dictionaries not their contents FUCK JS
    var delivery = gotos.filter(coord => coord.x == Main.accessibleDC[0].x && coord.y == Main.accessibleDC[0].y ); //get the delivery cell
    console.log(delivery);
    //In the case there are branches in the tunnel go to the furthest one from the delivery:
    const farthestCell = Sensing.farthestCell(gotos, delivery[0]);
    console.log("SADASDAD", farthestCell);

    var candeliver= false//Sensing.canReachDeliveryCell();

    while(active){

        if(candeliver){ 
            try{
            console.log(Sensing.canReachDeliveryCell())
            //asdas=-aa
            //Agent can deliver so go to delivery cell
            //Pddl.initPDDL(delivery[0]);
            //pddlStuff = await Pddl.getPlan();
            pddlStuff = Sensing.astar(Sensing.agentCell,delivery[0]);
            console.log('aSSADSA', pddlStuff);
            try{
                await Action.goToJones(pddlStuff);
            }catch(err){
                console.log(err,'error');
                //break;
            }
            console.log(pddlStuff);
            //Now try to go to the other end of the tunnel
            pddlStuff = Sensing.astar(Sensing.agentCell, farthestCell,true);
            console.log('a*', pddlStuff);
            try{
                await Action.goToJones(pddlStuff);
            }catch(err){

                //var lastmove = err;
                console.log('Reached teammate');
                var lastmove = err.variable;
            }
            console.log(lastmove)
            //Repeat last move to get the parcel
            await new Promise(res => setTimeout(res, 50)); //wait for a little bit
            
            var rep = true;
            var attp = 0;
            do{
            try{
                await Action.move([lastmove]);
                rep = false;
            }catch{
                console.log('ERROR ');
                attp++;
            }
            }while(rep && attp < 5)
        }catch(idk){
            console.log('failed', idk);
        }

        }else{//This agent brings the parcel to the other agent
            //Pddl.initPDDL(farthestCell); //Go to the end of the tunnel
            //pddlStuff = await Pddl.getPlan();
            //await new Promise(res => setTimeout(res, Env.manualMovementDuration*1000));
            console.log('PICEKREE', farthestCell)
            pddlStuff = Sensing.astar(Sensing.agentCell, farthestCell);
            console.log(pddlStuff)
            try{
                await Action.goToJones(pddlStuff);
            }
            catch(err){
                console.log(err,'Failed');
                //break;
            }

            //Go towards teammate
            pddlStuff = Sensing.astar(Sensing.agentCell, delivery[0],true); //Try to go to the delivery
            console.log('TO tsdssdd',pddlStuff)
            
            try{
                await Action.goToJones(pddlStuff);
            }catch(err){
                console.log(err,'error');
                //break;
            }
            //Add drop parcel and move one cell back !!
            await Action.putdown();
            
        }

        //await new Promise(res => setTimeout(res, 500));
        //blockIntention();
    }
}

export async function debuggerAgent(){
    while(active){
        await new Promise(res => setTimeout(res, 500));
        blockIntention();
    }
}

export async function emergencyAgent(){
    

}

export async function socialAgent(){
    Coms.onMsg();
    while(active){
        Coms.shout('\u0015');
        await new Promise(res => setTimeout(res, 1000));
        if(Coms.agentsAreReady)
            blockIntention();
    }
}
/**---------------------------------------------------------------
 * 
 * END OF AGENTS
 * 
 -----------------------------------------------------------------*/

export async function intentionRevision(setEmergency = false){
    let needToRevise = false;

    if (needToRevise)
        blockIntention(setEmergency);
}


export async function blockIntention(setEmergency = false){
    active = false;
    emergency = false;
    if(setEmergency)
        emergency = true;
}


