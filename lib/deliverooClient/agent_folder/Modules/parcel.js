import { ME } from "./sensing.js";

export var parcelsArray = [];
export var backpack = [];
export var decay = Infinity;

var simulation = false;

function inParcelsArray(parcel){
  for(let i=0; i<parcelsArray.length; i++){
    if(parcelsArray[i].id == parcel.id){
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

export function updateParcelArray(pp){
  console.log(pp);
  //Clear the array
  //parcelsArray = [];
  let ppc = []
  for (let j=0; j<pp.length;j++){
    let k = inParcelsArray(pp[j])
    if (typeof k != 'number')
      ppc.push(pp[j])
  }
  //Add again every parcel
  for(let i = 0; i < ppc.length; i++){
    //Only push the parcel if its an integer to avoid bugged parcels
    if(Number.isInteger(ppc[i].x) && Number.isInteger(ppc[i].y)){
      //Convert the coordinates to Padded coordinates
      ppc[i].x += 1;
      ppc[i].y += 1;
      ppc[i].time = new Date();
      parcelsArray.push(ppc[i]);
    }
    
  }

  //Remove parcels that are being carried by someone
  //console.log('asdasdasdasd',parcelsArray)
  backpack = parcelsArray.filter(item => item.carriedBy === ME.id);
  parcelsArray = parcelsArray.filter(item => (item.carriedBy === null));
  //console.log('asdasdasdaasdasdasdadsd',parcelsArray)

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

  