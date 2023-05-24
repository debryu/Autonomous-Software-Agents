import { ME } from "./sensing.js";

export var parcelsArray = [];
export var backpack = [];
export var decay = 1;
var trash = []

var simulation = false;

function inParcelsArray(parcel){
  for(let i=0; i<parcelsArray.length; i++){
    if(parcelsArray[i].id == parcel.id){
      parcel.x +=1;
      parcel.y +=1;
      parcelsArray[i] = parcel;//Copy newer parcel information
      return i;
    }
  }
  return false;
}

function updateRewards(parray){
  if (decay != Infinity){
    //console.log(parcelsArray[0])
    for (let i=0; i<parray.length; i++){
      if ((Date.now() - parray[i].time)>= decay*1000){
            parray[i].reward = parray[i].reward -1*Math.floor((Date.now() - parray[i].time)/(decay*1000));
            parray[i].time = new Date();
      }
      if (parray[i].reward<= 0)
        parray.splice(i,1)
    }
    //console.log("UPDAPDASDASFNA", parcelsArray[0])
  }
  return parray
}

export function updateParcelArray(ppo){
  let pp = JSON.parse(JSON.stringify(ppo));

  //console.log("PARCELS RECEIVED", pp);
  //Clear the array
  //parcelsArray = [];
  let ppc = []
  for (let j=0; j<pp.length;j++){
    let k = inParcelsArray(pp[j])
    if (typeof k != 'number')
      ppc.push(pp[j])
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
  updateRewards(parcelsArray);
  updateRewards(backpack);

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