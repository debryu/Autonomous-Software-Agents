import * as Env from './env.js';

/*
ENEMY MODULE
It's responsible for keeping track of the enemies
---------------------------------------------------------------
*/


export var enemyArray = []; //array with all the enemies
var probPositions = []; //array with enemy movement predictions
var timeout = 1000 //time to erase enemy blocked zones

// This function is responsible for adding the enemies to the agent
// beliefs and memory. 
// It also blocks the cells where the enemy will go next
// Takes as an input the array of enemies sensed by the agent
export function lostFOVEnemies(ee){
  if (probPositions.length != 0){
    for (let i=0;i<probPositions.length;i++){
      // If the prediction is outdated remove it
      if (Math.abs(probPositions[i].time - Date.now()) > timeout && !ee.some(en => en.id == probPositions[i].id)){ //if its not currently being seen
        let removed = probPositions.splice(i,1);
        removed = removed[0];
        // Prevents the original MAP from being changed (deepcopy)
        Env.PDMAP[removed.predictionY][removed.predictionX] = JSON.parse(JSON.stringify(Env.PDMAPbkp[removed.predictionY][removed.predictionX]));
        Env.PDMAP[removed.knownY][removed.knownX] = JSON.parse(JSON.stringify(Env.PDMAPbkp[removed.knownY][removed.knownX]));
      }
    }
  }
}

// Update the enemy array with the new information received
export function updateEnemyArray(eee){
  // Deepcopy the enemy (eee) array
  var ee = JSON.parse(JSON.stringify(eee));
  lostFOVEnemies(ee); //remove out of fov predictions after n seconds
  for(let i = 0; i < ee.length; i++){
    if (Number.isInteger(ee[i].y) && Number.isInteger(ee[i].x) ){
      ee[i].y = ee[i].y + 1; //Add one cause of map padding
      ee[i].x = ee[i].x + 1;
      var x = inEnemyArray(ee[i]); //Check if enemy was seen before, returns its position
      if (typeof x == "number"){ //If seen before
        if(enemyArray[x].x != ee[i].x || enemyArray[x].y != ee[i].y){ //check if the last recorded position is the same as the current
          updateEnemyMap(ee[i], x); 
          enemyProb(ee[i], x);
          enemyArray[x].x = ee[i].x; enemyArray[x].y = ee[i].y; //Update the enemy position in the array
          
        }else{
          updateEnemyMap(ee[i], false);
          enemyProb(ee[i], false); //guarantee this is called only once per enemy
        }
      }else{                    // new enemy
        enemyArray.push(ee[i]);
        updateEnemyMap(ee[i], false);
        enemyProb(ee[i],x);
      }
    } 
  }
}

export function updateEnemyMap(enemy, seen){
  //Update the PD map based on the agents position
  if(typeof seen == 'number'){
    //Unlock previous enemy position, checking if it was a border or not
    Env.PDMAP[enemyArray[seen].y][enemyArray[seen].x] = JSON.parse(JSON.stringify(Env.PDMAPbkp[enemyArray[seen].y][enemyArray[seen].x]));
  }
    Env.PDMAP[enemy.y][enemy.x] = 3;
}

// Check if the enemy was seen before
function inEnemyArray(enemy){
  for(let i=0; i<enemyArray.length; i++){
    if(enemyArray[i].id == enemy.id)
      return i;
  }
  return false;
}

// This function is responsible for predicting the enemy movement
function enemyProb(ee, x){//receives the current knowledge of the enemy and it's position in the memory array

  let dir = -1;
  let probs = [1,1,1,1];//[1/4, 1/4, 1/4, 1/4]; // Right Left Up Down
  let neigh = getNeigh(Env.PDMAP, ee.x, ee.y);
  let idk = ['r','l','u','d'];

  //This basically consideres that current direction is more likey to be maintained
  if (typeof x== "number"){ //only if there is previous record of enemy
    if(ee.x-enemyArray[x].x != 0){// moved in x
      if(ee.x-enemyArray[x].x >= 1){// moved right
        dir=0;
        probs[1] = 0.5; probs[0] = 1.5;
      }else{ // moved left
        dir=1;
        probs[0] = 0.5; probs[1] = 1.5;
      }
    }else{ // moved in y
      if(ee.y-enemyArray[x].y >= 1){// moved up
        dir=2;
        probs[3] = 0.5; probs[2] = 1.5;
      }else{ // moved down
        dir=3;
        probs[2] = 0.5; probs[3] = 1.5;
      }
    }
  } 
  var max = 0;
  for( let i=0;i<4;i++){
    if (neigh[i] == 1 || neigh[i] == 'X'){
      probs[i] = 0; //remove blocked cells
    }
    if (probs[i]>max)
      max = probs[i];
  }

  //Block the cell with highest prob
  var futEnemy = {x:ee.x, y:ee.y}; //declare the future enemy with the current enemy knowledge
  if (!hasDuplicates(probs, max)){ //Only make a prediction if there is a cell with higher prob than all the others
    switch(probs.indexOf(max)){
      case 0: //right
        futEnemy.x = futEnemy.x+1;
        break;
      case 1: //left
        futEnemy.x = futEnemy.x-1;
        break;
      case 2: //up
        futEnemy.y = futEnemy.y+1;
        break;
      case 3: // down
        futEnemy.y = futEnemy.y-1;
        break;
    }
    updateEnemyMap(futEnemy,false)
  }

  probs = probs.map((num) => num / 4);  
  //Store the changes to remove them if not correct in the future
  if (!probPositions.some(obj => obj.id === ee.id)) { //check if enemy wasn't previously registered
    probPositions.push({predictionX:futEnemy.x, predictionY:futEnemy.y, knownX:ee.x, knownY:ee.y, id:ee.id, time:new Date()}); //add new enemy
  }else{
    //If a prediction for an enemy was registered in the past and it's position has changed
    if(probPositions.some(obj => obj.id === ee.id && (obj.knownX != ee.x || obj.knownY != ee.y))){ 
      var oldp = probPositions.splice(probPositions.findIndex(obj => obj.id === ee.id), 1) //remove old prediction
      if (oldp != undefined && oldp != null){ //check if undefined null or empty
        Env.PDMAP[oldp[0].predictionY][oldp[0].predictionX] = JSON.parse(JSON.stringify(Env.PDMAPbkp[oldp[0].predictionY][oldp[0].predictionX]));
        Env.PDMAP[ee.y][ee.x] = 3; //lock again current enemy position
      }
      probPositions.push({predictionX:futEnemy.x, predictionY:futEnemy.y, knownX:ee.x, knownY:ee.y, id:ee.id, time:new Date()}); //add new prediction
    }
  }
}

// Get the neigbours of a cell
function getNeigh(matrix, x, y) { //Takes as an input the map and the coordinates of the cell
  const adjacentValues = [];
  adjacentValues.push(matrix[y][x + 1]);
  adjacentValues.push(matrix[y][x - 1]);
  adjacentValues.push(matrix[y + 1][x]);
  adjacentValues.push(matrix[y - 1][x]);
  return adjacentValues; //R L U D
}

function hasDuplicates(arr, val) {
  return arr.filter(item => item === val).length > 1;
}