
import * as connection from "./connection.js";

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

    if (!(ans.then || ans.catch)){ //only print if answer has been received
        console.log(ans);
        adad-akak
    }
}
