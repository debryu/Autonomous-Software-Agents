import { io } from "socket.io-client";
import * as config from "./config.js";
//import * as main from "../agent_dumb.js";
import * as main from "../clean_agent.js";
import * as Sensing from "./sensing.js";

    ///*
    export async function move(direction){
        return new Promise(function(resolved,rejected){
            main.socket.emit('move', direction, async function(serverResponse){
                if(serverResponse)
                    resolved(direction);
                else
                    rejected(direction);
            });
        }).catch(err => console.error(err)); // Was causing an error if not using catch
    }

export async function pickup(){
    await new Promise( res => setTimeout(res, 80) ); // wait 0.1 sec
    main.socket.emit( 'pickup' );
}

export async function putdown(){
    await new Promise( res => setTimeout(res, 80) ); // wait 0.1 sec
    main.socket.emit( 'putdown' );
}

export async function goTo(path){
    let moves = Sensing.convertPathToMoves(path);
    for(let i = 0; i<moves.length; i++){
        await move(moves[0]);
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
//*/