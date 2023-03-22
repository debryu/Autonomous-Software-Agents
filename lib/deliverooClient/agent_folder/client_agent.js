import { io } from "socket.io-client";
import * as config from "./config.js";

var moves =[]
var ok = []
var onesArray = Array.from({ length: 10 }, () => Array(10).fill(1)); //10x10
//var deliver = Array.from({ length: 10 }, () => Array(10).fill(0)); //10x10
var once = true;
var parcelsArray = []

var socket = io( config.host, {
    extraHeaders: {
        'x-token': config.token
    },
    // query: {
    //     name: "scripted",
    // }
});

socket.on("connect", () => {
    console.log( "socket connect", socket.id ); // x8WIv7-mJelg7on_ALbxc
});

socket.on("disconnect", () => {
    console.log( "socket disconnect", socket.id ); // x8WIv7-mJelg7on_ALbxc
});

socket.on("you", ({id, name, x, y, score}) => {
    //console.log("you", {id, name, x, y, score})
});

function getMap(x,y,deliv){
    onesArray[x][y] = 0;
    if (deliv)
        onesArray[x][y] = 2;
}

function findParcel(pp){
    if parcelsArray
    id = pp.id;
    x = pp.x;
    y = pp.y;
    carriedBy = pp.carriedBy;
    reward = pp.reward;

    parcelsArray.push();
    //return
}

//socket.on( 'agents sensing', aa => console.log(aa) ) // [ {}, {id, x, y, score}]
socket.on( 'parcels sensing', pp => findParcel(pp[0]) ) // [ {}, {id, x, y, carriedBy, reward}]
socket.on( 'tile', (x,y,deliv) => getMap(x,y,deliv))//console.log(x,y,deliv) ) // [ {}, {id, x, y, carriedBy, reward}]



async function randomlyMove () {
    
    var direction_index = [ Math.floor(Math.random()*4) ]

    function getDirection () {
        if (direction_index > 3)
            direction_index = direction_index % 4;

        var x = [ 'up', 'right', 'down', 'left' ][ direction_index ];
        moves.push(x)
        return x
    }

    while ( true ) {

        let direction = [ 'up', 'right', 'down', 'left' ][ (direction_index) % 4 ]

        await new Promise( (success, reject) => socket.emit('move', getDirection(), async (status) =>  {
            if (status) {
        
                direction_index += [0,1,3][ Math.floor(Math.random()*3) ]; // may change direction but not going back

                ok.push(true)
                console.log( 'moved', direction, 'next move', direction_index )

                await new Promise( res => setTimeout(res, 100) ); // wait 0.1 sec
                socket.emit( 'putdown' );
                
                await new Promise( res => setTimeout(res, 100) ); // wait 0.1 sec
                socket.emit( 'pickup' );

                console.log("Stored moves: ", moves)
                console.log("Correct moves: ", ok)
                if (once){
                    console.log("MAp" ,onesArray)
                    once = false;
                }
                
                success();

            } else {
                
                reject();

            }
        } ) ).catch( async () => {

            direction_index += Math.floor(Math.random()*4); // change direction if failed going straigth

            ok.push(false)
            console.log( 'failed move', direction, 'next move', getDirection() )

        } );

        await new Promise( res => setTimeout(res, 100) ); // wait 0.1 sec; if stucked do not block the program in infinite loop


    }
}

randomlyMove()