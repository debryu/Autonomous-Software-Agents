import * as Sensing from "./sensing.js"

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
      //If the parcel is not carried by anyone or it is carried by me, add it
      if(pp[i].carriedBy == null || pp[i].carriedBy == Sensing.ME.id)
        parcelsArray.push(pp[i]);
    }
    
  }
}


  