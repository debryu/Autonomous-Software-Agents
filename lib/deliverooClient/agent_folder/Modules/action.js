import { io } from "socket.io-client";
import * as config from "./config.js";
<<<<<<< HEAD:lib/deliverooClient/agent_folder/action.js
import * as main from "./agent_dumb.js";
=======
>>>>>>> main:lib/deliverooClient/agent_folder/Modules/action.js
import * as Sensing from "./sensing.js";

/*
export async function move(direction){
    return new Promise(function(resolved,rejected){
        main.socket.emit('move', direction, async function(serverResponse){
            if(serverResponse)
                resolved(direction);
            else
                rejected(direction);
        });
    });
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
<<<<<<< HEAD:lib/deliverooClient/agent_folder/action.js
    

}
=======
}
*/
>>>>>>> main:lib/deliverooClient/agent_folder/Modules/action.js
