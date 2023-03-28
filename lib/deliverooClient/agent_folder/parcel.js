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


function inParcels(array,parcel_id){
    const myObject = array.find(obj => obj.id === parcel_id);
    if (myObject) {
        let i = array.indexOf(myObject);
        //console.log(`The object with id ${myObject.id} exists in the array`, i);
        //console.log(myObject);
        return i;
    }else{
        //console.log(`The object with id ${parcel_id} does not exist in the array`);
        return false;
    }
}

//PROBLEMATIC
function updateReward(){
    for (let i = 0; i < parcelsArray.length; i++) {
      parcelsArray[i].reward = parcelsArray[i].reward - 1; // reduce the reward by 1 sec
    }
    parcelsArray = parcelsArray.filter(p => p.reward > 0); //remove rewards <= 0
    console.log(parcelsArray);
}
setInterval(updateReward, 1000);

export function findParcel(pp){
    if(pp != undefined){
      if(pp.id != null){ //just to be sure

        
        if(pp.carriedBy == Sensing.ME.id && !Sensing.ME.carring){
          Sensing.ME.carring = true; // Track if agent is carring something or not
          //Sensing.ME.cid = pp.id; // store the parcel id
              console.log("CARRINGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG ");
              let mhdinfo = Sensing.borderPath();
              console.log("Distance to closest border:", mhdinfo[1]);
              if (pp.reward - mhdinfo[1] > 0 ){// agent will reach the border with at least rwd =1
                let tStr = Sensing.agentCell;
                console.log(tStr, mhdinfo[0]);
                console.log(Sensing.astar(tStr, mhdinfo[0]));
              }else{
                console.log("Parcel delivery too far", pp.reward, pp.id);
              }
              
              //console.log(parcelsArray);
          //Sensing.bordersArray.length=0;
        }
        if(parcelsArray.every(parcel => parcel.carriedBy != Sensing.ME.carring)){ // check if i'm no longer carring a parcel
          Sensing.ME.carring = false;
          //Sensing.ME.cid
        }

        //console.log("") // magically make the code work
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
        }
      }
    }
    
    //return
}
  