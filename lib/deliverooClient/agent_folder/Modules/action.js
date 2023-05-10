import * as connection from "./connection.js";
import * as config from "./config.js";
import * as Sensing from "./sensing.js";
import { findDeadEnds, moveToInt } from "./utils.js";
import * as Env from "./env.js";
import { parcelsArray } from "./parcel.js";

export async function move(direction, tries = 0){
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

export async function goTo(path, plength){
    Env.pathMap(path);
    Env.printPath();
    //console.log('Path:',path);
    let moves = Sensing.convertPathToMoves(path);
    console.log('Number of Moves:',moves.length);
    for(let i = 0; i<moves.length; i++){
        //console.log('Move:',moves[i]);
        if (parcelsArray.length > plength){ //new parcel was seen during movement
            return new Error('idk');
        }else{
            try{
                await retryAction(() => move(moves[i],0));
            }
            catch(err){
                console.log('Giving up with err ',err);
                return new Error(err);
            }
        }
    }
}

async function retryAction(action) {
    try {
      const result = await action();
      return result;
    } catch (error) {
      console.error(`Action failed with error: ${error.direction} ${error.tries}. Retrying in 0.2 second...`);
      await new Promise((resolve) => setTimeout(resolve, 200));
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

