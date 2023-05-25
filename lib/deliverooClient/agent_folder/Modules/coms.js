
import * as connection from "./connection.js";

export var chitchat = false;

export async function shout(msg){
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

export function onMsg () {
    connection.socket.on('msg', (id, name, msg, reply) => { //idk hwat reply does, so im manually sending an answer
        console.log("new msg received from",id, name+':', msg);
        let answer = 'hello '+name+', here is reply.js as bigPC. Do you need anything?';
        console.log("my reply: ", answer) ;
        if (chitchat)
            say(answer,id); //try { reply(answer) } catch { (error) => console.error(error) }
            chitchat = false;
    });
}
