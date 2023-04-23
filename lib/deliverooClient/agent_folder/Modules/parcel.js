export var parcelsArray = []

var simulation = false;

function inParcelsArray(parcel){
  for(let i=0; i<parcelsArray.length; i++){
    if(parcelsArray[i].id == parcel.id)
      return i;
  }
  return false;
}

export function updateParcelArray(pp){
  //console.log(pp);
  //Clear the array
  parcelsArray = [];
  //Add again every parcel
  for(let i = 0; i < pp.length; i++){
    //Only push the parcel if its an integer to avoid bugged parcels
    if(Number.isInteger(pp[i].x) && Number.isInteger(pp[i].y)){
      //Convert the coordinates to Padded coordinates
      pp[i].x += 1;
      pp[i].y += 1;
      parcelsArray.push(pp[i]);
    }
    
  }

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
  