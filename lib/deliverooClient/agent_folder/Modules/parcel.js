export var parcelsArray = []

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
      //pp[i].x = pp[i].x+1; pp[i].y = pp[i].y+1; 
      parcelsArray.push(pp[i]);
    }
    
  }
}
  