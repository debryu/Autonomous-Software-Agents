
import * as connection from "./connection.js";
import { coms2parcels } from "./parcel.js";

export var teammate = null;
export var agentsAreReady = false;

export async function shout(msg){
    console.log('shoutingg', msg)
    //connection.socket.emit( 'shout' , msg);
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
    connection.socket.on('msg', (id, name, msg, reply) => { //idk hwat reply does, so im manually sending an answer
        console.log("new msg received from",id, name+':', msg);
        let answer = 'msg received '+name+'.';
        console.log("my reply: ", answer) ;
        console.log(msg.substring(0,6), teammate);
        if ((msg.substring(0, 6) == '\u0015' || msg == 'neo')&& teammate == null){ //get teammate id when received a specific msg
            teammate = id;
            agentsAreReady = true;
            console.log('here', msg.substring(0, 6))
            shout('neo');
            par = true
        }else if (teammate == id && msg.lenght > 6)
            coms2parcels(msg); //Add parcels to the array
            //say(answer,id);
    });
}