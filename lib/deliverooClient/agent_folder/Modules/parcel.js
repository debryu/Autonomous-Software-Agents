export var parcelsArray = []
var decay = Infinity;

var simulation = false;

function inParcelsArray(parcel){
  for(let i=0; i<parcelsArray.length; i++){
    if(parcelsArray[i].id == parcel.id)
      return i;
  }
  return false;
}

function updateRewards(){
  if (decay != Infinity){
    //console.log(parcelsArray[0])
    for (let i=0; i<parcelsArray.length; i++){
      if ((Date.now() - parcelsArray[i].time)>= decay*1000){
            parcelsArray[i].reward = parcelsArray[i].reward -1*Math.floor((Date.now() - parcelsArray[i].time)/(decay*1000));
            parcelsArray[i].time = new Date();
      }
      if (parcelsArray[i].reward<= 0)
        parcelsArray.splice(i,1)
    }
    //console.log("UPDAPDASDASFNA", parcelsArray[0])
  }
}

export function updateParcelArray(pp){
  //console.log(pp);
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

  //Update rewards:
  updateRewards();

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

//TODO
/*
export function updateParcelArray(pp){
  //console.log(pp);
  //Clear the array
  //parcelsArray = [];
  //Add again every parcel

  let now = new Date();

  for(let i = 0; i < pp.length; i++){
    let x = inParcels(parcelsArray, pp[i].id); //check if parcel is already on the array
    if (typeof x== "number"){
        parcelsArray[x].reward = pp[i].reward; // Update belief of reward
        if(pp.carriedBy != null)
          parcelsArray[x].carriedBy = pp[i].carriedBy; // Update if parcel is taken by enemy
        
    }else{  //add the new parcel to the array
        //Only push the parcel if its an integer to avoid bugged parcels
        if(Number.isInteger(pp[i].x) && Number.isInteger(pp[i].y)){
          pp[i].date = new Date(); // Add current date to each parcel when identified
          parcelsArray.push(pp[i]);
        }
    }

  }
  parcelsArray = parcelsArray.filter(p => p.reward > 0); //remove rewards <= 0
}
*/
  