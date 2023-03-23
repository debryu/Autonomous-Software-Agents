export var parcelsArray = []

export class Parcel {
    constructor(id, x, y, carriedBy, reward) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.carriedBy = carriedBy;
      this.reward = reward;
    }
  
    // Getter for id
    get id() {
      return this._id;
    }
  
    // Setter for id
    set id(value) {
      this._id = value;
    }
  
    // Getter for x
    get x() {
      return this._x;
    }
  
    // Setter for x
    set x(value) {
      this._x = value;
    }
  
    // Getter for y
    get y() {
      return this._y;
    }
  
    // Setter for y
    set y(value) {
      this._y = value;
    }
  
    // Getter for carriedBy
    get carriedBy() {
      return this._carriedBy;
    }
  
    // Setter for carriedBy
    set carriedBy(value) {
      this._carriedBy = value;
    }
  
    // Getter for reward
    get reward() {
      return this._reward;
    }
  
    // Setter for reward
    set reward(value) {
      this._reward = value;
    }
  }


function inParcels(array,parcel_id){
    const myObject = array.find(obj => obj.id === parcel_id);
    if (myObject) {
        let i = array.indexOf(myObject);
        console.log(`The object with id ${myObject.id} exists in the array`, i);
        console.log(myObject);
        return i;
    }else{
        console.log(`The object with id ${parcel_id} does not exist in the array`);
        return false;
    }
}

function updateReward(){
    //let aux = parcelsArray.slice(); //make a copy of the array
    //reduce the reward of the parcels by one
    for (let i = 0; i < parcelsArray.length; i++) {
      parcelsArray[i].reward = parcelsArray[i].reward - 1; // reduce the reward by 1 sec
      //if (aux[i].reward <= 0) {
      //  console.log("Removed parcel ", aux[i].id)
      //  aux.splice(i,1); // remove the parcel
      //}
    }
    parcelsArray = parcelsArray.filter(p => p.reward > 0); //remove rewards <= 0
    //parcelsArray = aux.slice();
}

setInterval(updateReward, 1000);

export function findParcel(pp){
    if(pp != undefined){
      if(pp.id != null){ //just to be sure
        console.log("")
        let i = inParcels(parcelsArray, pp.id);
        //console.log("ASFASFD");
        if (typeof i== "number"){
            //console.log("agdnjsks");
            parcelsArray[i].reward = pp.reward; // Update belief of reward
            if(pp.carriedBy != null)
              parcelsArray[i].carriedBy = pp.carriedBy; // Update if parcel is taken by enemy
            
        }else{  //add the new parcel to the array
            let p = new Parcel(pp.id, pp.x, pp.y, pp.carriedBy, pp.reward);
            //console.log("HRERE", p);
            parcelsArray.push(p);
            console.log(parcelsArray);
        }
      }
    }
    
    //return
}
  