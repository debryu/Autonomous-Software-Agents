import { ME } from "./sensing.js";
import { xorDecrypt, xorEncrypt } from "./utils.js";
import * as Coms from "./coms.js";

export var parcelsArray = [];
export var backpack = [];
export var decay = Infinity;
export var parcelsArrayBounty = 0;
export var backpackBounty = 0;

export function setDecay(d){
  decay = d;
}

var simulation = false;

function inParcelsArray(parcel, parray){
  if (parray.length !=0){
    for(let i=0; i<parray.length; i++){
      if(parray[i].id == parcel.id){
        parcel.x +=1;
        parcel.y +=1;
        parcel.time = new Date();
        parray[i] = parcel;//Copy fresher parcel information
        return i;
      }
    }
  }
  return false;
}

export function updateRewards(parray){
  let cumulativeReward = 0;
  if (decay != Infinity){
    //console.log(parcelsArray[0])
    for (let i=0; i<parray.length; i++){
      if ((Date.now() - parray[i].time)>= decay*1000){
            parray[i].reward = parray[i].reward -1*Math.floor((Date.now() - parray[i].time)/(decay*1000));
            parray[i].time = new Date();
            cumulativeReward += parray[i].reward;
      }
      if (parray[i].reward <= 1)
        parray.splice(i,1)
    }
    //console.log("UPDAPDASDASFNA", parcelsArray[0])
  }
  return parray, cumulativeReward;
}

export function updateParcelArray(ppo){
  let pp = JSON.parse(JSON.stringify(ppo));
  //console.log("PARCELS RECEIVED", pp);
  //Clear the array
  //parcelsArray = [];
  let ppc = [];
  for (let j=0; j<pp.length;j++){
    let k = inParcelsArray(pp[j], parcelsArray);
    if (typeof k != 'number')
      ppc.push(pp[j]);
  }
  //Add again every parcel
  //console.log(ppc)
  for(let i = 0; i < ppc.length; i++){
    //Only push the parcel if its an integer to avoid bugged parcels
    if(Number.isInteger(ppc[i].x) && Number.isInteger(ppc[i].y)){
      //Convert the coordinates to Padded coordinates
      ppc[i].x = ppc[i].x + 1;
      ppc[i].y = ppc[i].y + 1;
      ppc[i].time = new Date();
      parcelsArray.push(ppc[i]);
    }
    
  }
  //console.log(parcelsArray)
  //sa-asa

  //Remove parcels that are being carried by someone
  //console.log('asdasdasdasd',parcelsArray)
  backpack = parcelsArray.filter(item => item.carriedBy === ME.id);
  //console.log(parcelsArray.length)
  parcelsArray = parcelsArray.filter(item => (item.carriedBy === null));
  //console.log('asdasdasdaasdasdasdadsd',parcelsArray)
  //console.log(parcelsArray.length)
  //Update rewards:
  parcelsArrayBounty = updateRewards(parcelsArray)[1];
  backpackBounty = updateRewards(backpack)[1];

  if(simulation){
    //{id, x, y, carriedBy, reward}
      parcelsArray = [
        {id:'one', x:9, y:7, carriedBy:'me', reward:10},
        {id:'two', x:7, y:7, carriedBy:'me', reward:10},
        {id:'one', x:6, y:9, carriedBy:'me', reward:10},
        
        {id:'two', x:6, y:5, carriedBy:'me', reward:10},
        {id:'one', x:6, y:4, carriedBy:'me', reward:10},
        {id:'two', x:6, y:3, carriedBy:'me', reward:10},
        {id:'one', x:6, y:2, carriedBy:'me', reward:10},
        {id:'two', x:7, y:2, carriedBy:'me', reward:10},
        {id:'one', x:7, y:2, carriedBy:'me', reward:10},
        {id:'two', x:7, y:3, carriedBy:'me', reward:10},
        {id:'one', x:7, y:4, carriedBy:'me', reward:10},
        {id:'two', x:7, y:5, carriedBy:'me', reward:10},
        {id:'one', x:7, y:6, carriedBy:'me', reward:10},
        {id:'two', x:7, y:7, carriedBy:'me', reward:10}
        
      ];
  }
}

export function getAllCoord(array){
  let coord = [];
  for (let i=0;i<array.length;i++){
    coord.push({'x':array[i].x,'y':array[i].y})
  }
  return coord
}

//Receive parcels from coms
export function coms2parcels(msg){
    let decr = xorDecrypt(msg,xorkey);
    decr = JSON.parse(decr);
    decr = updateRewards(decr)[1];
    for (let i=0;i<decr.length;i++){
        let k = inParcelsArray(decr[i],parcelsArray)
        if (typeof k != 'number')
          parcelsArray.push(decr[i]);
        else{//just had to do this
          parcelsArray[k].x = parcelsArray[k].x-1;
          parcelsArray[k].y = parcelsArray[k].y-1;
        }
    }
}


//Agent Jones
export var seenParcels = [];
export var transmittedP = [];
const xorkey = 'Neo';
const thr = 4;
export function watcher(ppo){
  let k;
  let tosend = [];
  let pp = JSON.parse(JSON.stringify(ppo));

  pp = pp.filter(item => item.reward >= thr);
  pp = pp.filter(item => item.carriedBy == null);
  console.log('ASDASDASDADS', pp);
  for (let i=0;i<pp.length;i++){
    k = inParcelsArray(pp[i], seenParcels);
    if (typeof k != 'number'){ //aka not registered so we format the data correctly
      pp[i].x = pp[i].x + 1;
      pp[i].y = pp[i].y + 1;
      pp[i].time = new Date();
      seenParcels.push(pp[i])
    }
  }
  console.log('BBBBBBBBBBB', seenParcels);
  //Transmit collected data:
  //Check if the received parcel data was alreay transmitted before
  for (let i=0;i<seenParcels.length;i++){
    k = inParcelsArray(seenParcels[i], transmittedP);
    if (typeof k != 'number'){ //aka not registered
      tosend.push(seenParcels[i]);
    }else{//just had to do this
      transmittedP[k].x = transmittedP[k].x-1;
      transmittedP[k].y = transmittedP[k].y-1;
    }
  }
  console.log('cccccccccccc', transmittedP)
  //Send the data
  if (tosend.length != 0){
    let jsonString = JSON.stringify(tosend);
    let encDat = xorEncrypt(jsonString, xorkey);
    Coms.shout(encDat);
    //Add them to the sent list
    transmittedP.push(...tosend);
    console.log('SENT DATA OF ', tosend.length, 'PARCELS');
    console.log('sssss', tosend);
  }
  console.log('ddddddddddd', transmittedP)
}