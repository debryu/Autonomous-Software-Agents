
import * as connection from "./connection.js";

export async function shout(msg){
    connection.socket.emit( 'shout' , msg);
}




