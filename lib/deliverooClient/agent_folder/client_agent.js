import { io } from "socket.io-client";
import * as config from "./config.js";
import * as Parcel from './parcel.js';
import * as Environment from './environment.js'
import * as Utils from "./utils.js";
import * as Sensing from "./sensing.js"

/*
1. dont enter border without parcel (mateo)
2. move to block with lowest value in the map (mateo)
3. block parts of the map with 1 exit (nick)
4. PossiblePoints v1 = parcel.reward - distance2parcel - distancefromparcel2border (mateo)
5. Make a route using the updated map (nick)
6. PossiblePoints v2 -> add other playesr closeness to parcel
*/

var moves =[]
var ok = []
var once = true;

const map_dimension = {
    x: 10,
    y: 10
};

var me = {
    x: 0, 
    y:0,
    carring:false
}; 

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
    Sensing.ME.id = id;
    Sensing.ME.name = name;
    Sensing.ME.x = x;
    Sensing.ME.y = y;
    Sensing.ME.score = score;
    //console.log("you", {id, name, x, y, score})
    Sensing.ME.x =x, Sensing.ME.y=y
    Sensing.ME.x =Math.round(x), Sensing.ME.y=Math.round(y);
    //console.log("you", {id, name, x, me, y, score})
});

//socket.on( 'agents sensing', aa => console.log(aa) ) // [ {}, {id, x, y, score}]
socket.on( 'parcels sensing', pp => Parcel.findParcel(pp[0]) ) // [ {}, {id, x, y, carriedBy, reward}]
socket.on( 'tile', (x,y,deliv) => Environment.getMap(x,y,deliv))

async function randomlyMove () {
    
    var direction_index = [ Math.floor(Math.random()*4) ]

    function rdmmove(){
        if (direction_index > 3)
            direction_index = direction_index % 4;

        var x = [ 'up', 'right', 'down', 'left' ][ direction_index ];
        moves.push(x)
        return x
    }

    function getDirection () {
        var x;
        if (Parcel.parcelsArray.length){ // check if not empty
            let closeParcels = Parcel.parcelsArray.filter(p => (Math.abs(p.x - Sensing.ME.x) ==1 && p.y == Sensing.ME.y) || (Math.abs(p.y - Sensing.ME.y) ==1 && p.x == Sensing.ME.x)); //remove r
            if (closeParcels.length){
                
                if (closeParcels[0].x - Sensing.ME.x ==1){ // parcel is at the left
                    //Sensing.ME.x = closeParcels[0].x;
                    return 'right';
                }else if (Sensing.ME.x - closeParcels[0].x ==1){ //parcel is at the right
                    //Sensing.ME.x = closeParcels[0].x;
                    return 'left';
                }else if (closeParcels[0].y - Sensing.ME.y ==1){//parcel is up
                    //Sensing.ME.y = closeParcels[0].y;
                    return 'down';
                }else{ // parcel is down
                    //Sensing.ME.y = closeParcels[0].y;
                    return 'up';
                }
            
            }else
                x= rdmmove();
        }else{
            x= rdmmove();//'up';
        }
        return x;
    }

    while ( true ) {

        

        let direction = [ 'up', 'right', 'down', 'left' ][ (direction_index) % 4 ]

        await new Promise( (success, reject) => socket.emit('move', getDirection(), async (status) =>  {
            if (status) {
        
                direction_index += [0,1,3][ Math.floor(Math.random()*3) ]; // may change direction but not going back

                ok.push(true)
                
                
                await new Promise( res => setTimeout(res, 100) ); // wait 0.1 sec
                socket.emit( 'putdown' );
                
                await new Promise( res => setTimeout(res, 100) ); // wait 0.1 sec
                socket.emit( 'pickup' );

                
                Environment.printMap(Environment.MAP,map_dimension);
                if(Environment.update)
                    Utils.pruneMap();
                
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