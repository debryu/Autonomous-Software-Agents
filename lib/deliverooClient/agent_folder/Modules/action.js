import * as connection from "./connection.js";
import * as config from "./config.js";
import * as Sensing from "./sensing.js";
import { findDeadEnds, moveToInt } from "./utils.js";
import * as Env from "./env.js";
import * as Parcel from "./parcel.js";
import * as Planner from "../planner.js";
import { lostFOVEnemies } from "./enemy.js";

export var replanningPenalty = 50;
var numberOfMovesForSurvey = 10; 
var surveying = true;
var times = [];

export function randomExplore(){
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

export async function pickup(){
    await new Promise( res => setTimeout(res, 10) ); // wait 0.1 sec
    connection.socket.emit( 'pickup' );
    //
}

export async function putdown(){
    await new Promise( res => setTimeout(res, 10) ); // wait 0.1 sec
    connection.socket.emit( 'putdown' );
}

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



export async function goToJones(path, pddl){
    let moves;
    Parcel.updateRewards(Parcel.parcelsArray);
    if (!pddl){
        moves = Sensing.convertPathToMoves(path);
    }else{
        [moves,path] = path;
    }
    Env.pathMap(path, Parcel.parcelsArray);
    Env.printPath();

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
}

async function retryAction(action) {
    try {
        let startTime = Date.now();
        const result = await action();
        let delta = Date.now() - startTime;
        if(surveying){
            times.push(delta);
            if(times.length > numberOfMovesForSurvey){
                let avg = times.reduce((a, b) => a + b, 0) / times.length;
                Env.setMovDuration(avg/1000);
                surveying = false;
            }
        }
        return result;

    } catch (error) {
      console.error(`Action failed with error: ${error.direction} ${error.tries}. Retrying...`);
      await new Promise((resolve) => setTimeout(resolve, Env.manualMovementDuration));
      console.log('Retrying...');
      if(error.tries < 8){
        console.log('Retry');
        return retryAction(() => move(error.direction, error.tries + 1));
      }
      else{
        throw new Error('Give up');
      }
        
    }
  }

