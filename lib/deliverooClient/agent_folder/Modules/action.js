import * as connection from "./connection.js";
import * as config from "./config.js";
import * as Sensing from "./sensing.js";
import { findDeadEnds, findDeadEndsInArray, moveToInt } from "./utils.js";
import * as Env from "./env.js";
import * as Parcel from "./parcel.js";
import * as Planner from "./planner.js";
import { lostFOVEnemies } from "./enemy.js";
import * as Main from "../mainframe.js";

// Set the replanning penalty (how much the difference must be greater than to replan)
export var replanningPenalty = 50;

// Set the number of tries the agent can do before giving up
const allowedTries = 4;

// Set the number of moves to survey
// The agent will count the time it takes to move from one block to another
// After that amount of moves, it will set variable using setMovDuration()
//  as the mean of the times collected

var numberOfMovesForSurvey = 10; 
var surveying = true;

// Array where the times will be stored
var times = [];

// Explore a random cell
// mode = 0 -> explore a random cell in the map
// mode = 1 -> explore only dead ends   
// else -> explore only the connected component

export function randomExplore(mode = 'old'){
    if(mode == 0){
        Env.setOcells(Main.connectedCells);
    }
    else if(mode == 1){
        let deadEnds = findDeadEndsInArray(Main.connectedCells);
        console.log("deadEnds: ", deadEnds)
        Env.setOcells(deadEnds);
    }
    else{
        for(let i=0;i<Env.PDmapDimension.x;i++){
            for(let j=0;j<Env.PDmapDimension.y;j++){
                if (Env.PDMAP[j][i] == 0){
                    Env.Ocells.push(Planner.createUniqueID(i,j));
                }
            }
        }

        let num = Env.Ocells.length;
        num = Math.floor(Math.random()*num);
        let destination = Planner.cellFromUniqueID(Env.Ocells[num]);
        return destination;
    }
    //console.log("Ocells: ", Env.Ocells)
    let num = Env.Ocells.length;
    num = Math.floor(Math.random()*num);
    let destination = Env.Ocells[num];
    console.log("destination: ", destination)
    return destination;
}


// Move function
// Takes as an input the direction to move to
// and the number of tries the agent already performed
export async function move(direction, tries = 0){
    return new Promise(function(resolved,rejected){
        //Update beliefs
        lostFOVEnemies([]);
        connection.socket.emit('move', direction, async function(serverResponse){
            if(serverResponse){
                await putdown();
                await pickup();
                resolved(direction);
            }
            else{
                let err = {direction: direction, tries: tries};
                rejected(err); 
            }
        });
    });
}

// Pick up function
export async function pickup(){
    await new Promise( res => setTimeout(res, 10) ); // wait 0.1 sec
    connection.socket.emit( 'pickup' );
    //
}

// Put down function
export async function putdown(){
    await new Promise( res => setTimeout(res, 10) ); // wait 0.1 sec
    connection.socket.emit( 'putdown' );
}

// Go to function
// Takes as an input the path to follow
// if to use or not the pddl planner
// the start reward (the items in the backpack)
// and the number of tries the agent already performed
export async function goTo(path, pddl, startReward, numtries=0){
    let moves;
    Parcel.updateRewards(Parcel.parcelsArray);

    if(startReward === 123456789){
        moves = path;
    }
    else{
        if (!pddl){
            
            moves = Sensing.convertPathToMoves(path);
        }else{
            [moves,path] = path;
        }
        Env.pathMap(path, Parcel.parcelsArray);
        Env.printPath();
    }
    
    for(let i = 0; i<moves.length; i++){
        // Condition for replanning -> startReward are the items in the backpack
        // So only replan if New seen parcels have greater value than current carring reward
        if (Parcel.parcelsArrayBounty > startReward + replanningPenalty){ //new parcel was seen during movement
            console.log('\n RECALCULATING... \n', Parcel.parcelsArrayBounty, startReward , replanningPenalty);
            return new Error('idk');
        }else{
            try{
                await retryAction(() => move(moves[i],numtries));
            }
            catch(err){
                return new Error(err);
            }
        }
    }
}

// Custom goTo function for Jones
export async function goToJones(path, pddl){
    //console.log('Path:',path);
    let moves;
    
    Parcel.updateRewards(Parcel.parcelsArray);
    //console.log(' ASDASDASDASDASDASD YESYYESYESYES');
    if (!pddl){
        
        moves = Sensing.convertPathToMoves(path);
        //console.log('moves', moves);
    }else{
        [moves,path] = path;
    }
    Env.pathMap(path, Parcel.parcelsArray);
    Env.printPath();

    //console.log('parcel', Parcel.parcelsArray);
    
    //console.log('Number of Moves:',moves.length);
    for (var i = 0; i < moves.length; i++) {
        try {
          await retryAction(() => move(moves[i], 3));
        } catch (err) {
          console.log('Giving up with err', err);
          const error = new Error('Last move:');
          error.variable = moves[i];
          throw error;
        }
    }
    //return moves[i]
}

// retry the action 8 times before giving up
async function retryAction(action) {
    try {
        let startTime = Date.now();
        const result = await action();
        let delta = Date.now() - startTime;
        // This is used to calculate the time it takes to move from one block to another
        // and it's only done when surveying (the first N moves)
        if(surveying){
            times.push(delta);

            // If enough times have been collected, compute the mean
            if(times.length > numberOfMovesForSurvey){
                // Compute the mean of the times
                let avg = times.reduce((a, b) => a + b, 0) / times.length;
                // Convert to seconds
                Env.setMovDuration(avg/1000);
                surveying = false;
            }
        }
        return result;

    } catch (error) {
      console.error(`Action failed with error: ${error.direction} ${error.tries}. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, Env.manualMovementDuration));
      console.log('Retrying...');

      // If the agent has not tried 8 times yet, retry
      if(error.tries < allowedTries){
        console.log('Retry');
        return retryAction(() => move(error.direction, error.tries + 1));
      }
      // Otherwise give up
      else{
        throw new Error('Give up');
      }
        
    }
  }

