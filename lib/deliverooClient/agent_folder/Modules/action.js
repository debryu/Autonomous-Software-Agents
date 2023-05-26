import * as connection from "./connection.js";
import * as config from "./config.js";
import * as Sensing from "./sensing.js";
import { findDeadEnds, moveToInt } from "./utils.js";
import * as Env from "./env.js";
import * as Parcel from "./parcel.js";

export var replanningPenalty = 5;
var numberOfMovesForSurvey = 10; 
var surveying = true;
var times = [];

export async function move(direction, tries = 0){
    //console.log('MOVING');
    return new Promise(function(resolved,rejected){
        //console.log('asking the server to move ' + direction);
        connection.socket.emit('move', direction, async function(serverResponse){
            if(serverResponse){
                //console.log('Move accepted: ' + direction);
                await putdown();
                await pickup();
                resolved(direction);
            }
            else{
                //console.log('NO SERVER RESPONSE');
                //console.log('Move rejected: ' + direction + ' ' + tries);
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
    //connection.socket.emit( 'putdown' ,async function(response){
    //     console.log("sdad", response);
    // }
    // );
    // console.log('put')
}

export async function goTo(path, pddl, startReward){

    //console.log('Path:',path);
    let moves;
    
    Parcel.updateRewards(Parcel.parcelsArray);
    //console.log(' ASDASDASDASDASDASD ASDASD');

    if(startReward === 123456789){
        //console.log(' ASDASDASDASDASDASD NONONONONON');
        moves = path;
        //console.log('moves', moves);
    }
    else{
        //console.log(' ASDASDASDASDASDASD YESYYESYESYES');
        if (!pddl){
            
            moves = Sensing.convertPathToMoves(path);
            //console.log('moves', moves);
        }else{
            [moves,path] = path;
        }
        Env.pathMap(path, Parcel.parcelsArray);
        Env.printPath();
    }

    //console.log('parcel', Parcel.parcelsArray);
    
    //console.log('Number of Moves:',moves.length);
    for(let i = 0; i<moves.length; i++){
        //console.log('Move:',moves[i]);

        // Condition for replanning
        if (Parcel.parcelsArrayBounty > startReward + replanningPenalty){ //new parcel was seen during movement
            console.log('\n RECALCULATING... \n', Parcel.parcelsArrayBounty, startReward , replanningPenalty);
            return new Error('idk');
        }else{
            try{
                //console.log(' ASDASDASDASDASDASD LLLLLLLL');
                //console.log('Moving',moves[i]);
                await retryAction(() => move(moves[i],0));
            }
            catch(err){
                //console.log('Giving up with err ',err);
                return new Error(err);
            }
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
                //console.log('Average time for a move:',avg);
                surveying = false;
            }

        }
        //console.log(delta)
        return result;

    } catch (error) {
      console.error(`Action failed with error: ${error.direction} ${error.tries}. Retrying...`);

      //TODO: Set the time based on the clock of the server
      //await new Promise((resolve) => setTimeout(resolve, 500));
      await new Promise((resolve) => setTimeout(resolve, Env.manualMovementDuration));
      //console.log('Retrying...');
      if(error.tries < 3){
        console.log('Retry');
        return retryAction(() => move(error.direction, error.tries + 1));
      }
      else{
        throw new Error('Give up');
      }
        
    }
  }

