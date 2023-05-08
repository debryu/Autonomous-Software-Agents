import * as connection from "./connection.js";
import * as config from "./config.js";
import * as Sensing from "./sensing.js";
import { createPlan } from "../clean_agent.js";

export async function move(direction){
    return new Promise(function(resolved,rejected){
        connection.socket.emit('move', direction, async function(serverResponse){
            if(serverResponse){
                console.log('Move accepted: ' + direction);
                await putdown();
                await pickup();
                resolved(direction);
            }
            else{
                console.log('Move rejected: ' + direction);
                rejected(direction);
            }
        });
    });
}

export async function pickup(){
    await new Promise( res => setTimeout(res, 10) ); // wait 0.1 sec
    connection.socket.emit( 'pickup' );
}

export async function putdown(){
    await new Promise( res => setTimeout(res, 10) ); // wait 0.1 sec
    connection.socket.emit( 'putdown' );
}

export async function goTo(path){
    console.log('Path:',path);
    let moves = Sensing.convertPathToMoves(path);
    console.log('Moves:',moves);
    for(let i = 0; i<moves.length; i++){
        //console.log('Move:',moves[i]);
        await retryAction(() => move(moves[i]));
    }
}

async function retryAction(action) {
    try {
      const result = await action();
      return result;
    } catch (error) {
      console.error(`Action failed with error: ${error}. Retrying in 1 second...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return retryAction(action);
    }
  }

