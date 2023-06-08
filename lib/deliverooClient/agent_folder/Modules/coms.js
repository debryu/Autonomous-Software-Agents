
import * as connection from "./connection.js";
import { coms2parcels } from "./parcel.js";

/* MODULE TO HANDLE COMMUNICATIONS 
---------------------------------------------------------------
*/

export var teammate = null;
export var agentsAreReady = false;

export async function shout(msg){
    return new Promise( (success) => {
        connection.socket.emit( 'shout', msg, async ( status ) =>  {
            success( status );
        } );
    } );
}

export async function say(msg, toId){
    return new Promise( (success) => {
        connection.socket.emit( 'say', toId, msg, async ( status ) =>  {
            success( status );
        } );
    } );
}

export async function ask(msg, toId){
    let ans = new Promise( (success) => {
        connection.socket.emit( 'ask', toId, msg, async ( reply ) =>  {
            success( reply );
        } );
    } );
}

var par = false
export function onMsg () {
    connection.socket.on('msg', (id, name, msg, reply) => {
        let answer = 'msg received '+name+'.';
        if ((msg.substring(0, 6) == '\u0015' || msg == 'neo')&& teammate == null){ //get teammate id when received a specific msg
            teammate = id;
            agentsAreReady = true;
            shout('neo');
            par = true
        }else if (teammate == id && msg.lenght > 6)
            coms2parcels(msg); //Add parcels to the array
    });
}