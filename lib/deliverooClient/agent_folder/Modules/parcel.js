import * as Sensing from "./sensing.js"

export var parcelsArray = []
const simulation = false;


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

function inParcelsArray(parcel){
  for(let i=0; i<parcelsArray.length; i++){
    if(parcelsArray[i].id == parcel.id)
      return i;
  }
  return false;
}
// ANOTHER OPTION IS TO STORE THE CURRENT DATE IN EACH PARCEL WHEN SEEN/UPDATED AND WHEN WE WANT TO FIND IF ITS STILL
// THERE WE JUST DO THE DIFFERENCE OF THE DATE IN THE PARCEL WITH THE CURRENT DATE INSTEAD OF KEEPING THIS CALL EVERY 
// SECOND
//
//PROBLEMATIC 
/*
function updateReward(){
    for (let i = 0; i < parcelsArray.length; i++) {
      parcelsArray[i].reward = parcelsArray[i].reward - 1; // reduce the reward by 1 sec
    }
    parcelsArray = parcelsArray.filter(p => p.reward > 0); //remove rewards <= 0
    console.log(parcelsArray);
}
setInterval(updateReward, 1000);
*/

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
        if (typeof i == "number"){
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


export function updateParcelArray(pp){
  console.log(pp);
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
        {id:'two', x:6, y:7, carriedBy:'me', reward:10}

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


  