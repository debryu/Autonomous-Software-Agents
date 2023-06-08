import * as Parcel from './parcel.js';
import * as Env from './env.js';
import * as Sensing from "./sensing.js";
import * as Action from "./action.js";
import * as Planner from "../planner.js";
import * as Connection from "./connection.js";
import * as Coms from "./coms.js";
import * as Pddl from '../PDDLplanner.js';
import * as Main from '../mainframe.js';


// Variable to handle the agent's state
export var active = true;

// Not used, it has been replaced by the agent-deliverer behaviour
var emergency = false;

// Variable to handle problem during planning
// If true, the agent will deliver the parcels in the backpack
// before continuing with any plan
var problemDuringPlanning = false;

// Setter function
export function setActive(value){
    active = value;
}

// Select the intention of the agent
export async function intentSelection(){

    // First exchange the agent ids with the teammate
    if(!Coms.agentsAreReady){
        console.log('Exchange information between agents');
        return 'social-agent';
    }

    // If the agent is in emergency mode, set the emergency behaviour
    // Not used anymore
    // Substituted by the agent-deliverer
    if(emergency){
        console.log('EMERGENCY MODE');
        return 'agent-emergency';
    }

    // If the agent replanned, set the replan behaviour
    if(problemDuringPlanning){
        console.log('Got some PROBLEM DURING PLANNING, delivering...');
        return 'agent-deliverer';
    }

    // Detect if the agents are in the single tunnel scenario
    // If so, execute the jones agent
    if(Sensing.isSingleTunnel()){
        console.log('Single tunnel scenario detected!');
        console.log('EXECUTING JONES');
        return 'agent-jones';
    }

    // Otherwise set the normal behaviour (ACO)
    return 'agent-smith';
}

// Execute the intention
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

        case 'agent-deliverer':
            await delivererAgent();
            break;

        default:
          console.log('DUNNO WHICH AGENT TO RUN');
          break;
      }
}

// Agent using ACO algorithm to plan, pickup and deliver parcels 
export async function smith(){
    while(active){
        let reachCellPath;
        console.log(Connection.getMapConf());
        // Check if there are parcels in the backpack
        // If there are, and if the score is at least 10, go to the nearest delivery cell
        console.log('Backpack Bounty: ', Parcel.backpackBounty);
        if(Parcel.backpackBounty > 10){
            blockIntention();
            problemDuringPlanning = true;
            break;
        }

        Env.printPDMap();
        Parcel.updateRewards(Parcel.parcelsArray);
        let plan = Planner.plan();
        if(!plan){
            console.log('No valid plan found! \nusing PDDL to explore');
            let mode;
            if(Main.tunnelRatio > 0.3)
                mode = 1; // Only visit dead ends
            else
                mode = 0; // Visit all the connected cells
            let pddlStuff = Sensing.astar(Sensing.agentCell,Action.randomExplore(mode));
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
    }
}

// Agent delivering parcels to any delivery cell
export async function delivererAgent(){
    while(active){
        console.log('Backpack Items: ', Parcel.backpackItems, Parcel.backpack)
        if(Parcel.backpackItems == 0){
            blockIntention();
            problemDuringPlanning = false;
            break;
        }

        // Go to a delivery cell
        console.log(Main.accessibleDC[0])

        // try all the delivery cells
        for(let i = 0; i<Main.accessibleDC.length; i++){
            let deliveryCell = Main.accessibleDC[0]
            let path = Sensing.astar(Sensing.agentCell,deliveryCell);
            console.log('Going to delivery cell: ',path);

            // Print the pdmap
            Env.printPDMap();
            
            if(path !== 'failed'){
                try{
                    await Action.goTo(path,false,Parcel.parcelsArrayBounty);
                    console.log('Delivered, emptying backpack');
                    Parcel.updateParcelArray([]);
                }
                catch(err){
                    console.log('err', err);
                    break;
                }
            }
        }
    }
}


// Agent collaborating with the teammate to deliver parcels in the tunnel scenario
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
    //let indx = gotos.indexOf(Main.accessibleDC[0]); Quote: JS compares the references of dictionaries not their contents so this doesnt work
    var delivery = gotos.filter(coord => coord.x == Main.accessibleDC[0].x && coord.y == Main.accessibleDC[0].y ); //get the delivery cell
    console.log(delivery);
    //In the case there are branches in the tunnel go to the furthest one from the delivery:
    const farthestCell = Sensing.farthestCell(gotos, delivery[0]);

    var candeliver= false//Sensing.canReachDeliveryCell();

    while(active){

        if(candeliver){ 
            try{
            console.log(Sensing.canReachDeliveryCell())
            pddlStuff = Sensing.astar(Sensing.agentCell,delivery[0]);
            try{
                await Action.goToJones(pddlStuff);
            }catch(err){
                console.log(err,'error');
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
            //console.log(lastmove)
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
            
            try{
                await Action.goToJones(pddlStuff);
            }catch(err){
                console.log(err,'error');
                //break;
            }
            //Add drop parcel and move one cell back !!
            await Action.putdown();
            
        }
    }
}

// Used to test the agents
export async function debuggerAgent(){
    while(active){
        await new Promise(res => setTimeout(res, 500));
        blockIntention();
    }
}

// Used when there is an emergency (WIP)
export async function emergencyAgent(){
    while(active){
        console.log('EMERGENCY AGENT');
        console.log('IDLE for 5 seconds, you should interrupt and re-run the agent');
        await new Promise(res => setTimeout(res, 5000));
        blockIntention();
    }
}

// This is the agent that exchanges the information with the other agent
// And setups the agents communication
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


// This function is used to force the agent to block its intention
/*
export async function intentionRevision(setEmergency = false){
    let needToRevise = false;

    if (needToRevise)
        blockIntention(setEmergency);
}
*/

export async function blockIntention(setEmergency = false){
    active = false;
    emergency = false;
    if(setEmergency)
        emergency = true;
}


