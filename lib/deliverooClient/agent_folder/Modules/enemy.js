import * as Env from './env.js';

export var enemyArray = []; //array with all the enemies
var probPositions = []; //array with enemy movement predictions
var timeout = 6000 //time to erase enemy blocked zones

function lostFOVEnemies(ee){
  if (probPositions.length != 0){
    //console.log(probPositions);
    for (let i=0;i<probPositions.length;i++){
      if (Math.abs(probPositions[i].time - Date.now()) > timeout && !ee.some(en => en.id == probPositions[i].id)){ //if its not currently being seen
        let removed = probPositions.splice(i,1);
        removed = removed[0];
        //console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',removed, Env.PDMAP)
        //console.log(Env.PDMAP[removed.predictionY][removed.predictionX])
        // if(removed.predictionY == 1 || removed.predictionY == Env.PDMAP.length-2 ||
        //   removed.predictionX == 1 || removed.predictionX == gitEnv.PDMAP[0].length-2){
        //   Env.PDMAP[removed.predictionY][removed.predictionX] = 2;
        // }else{//Not a border
        //   Env.PDMAP[removed.predictionY][removed.predictionX] = 0;
        // }
        Env.PDMAP[removed.predictionY][removed.predictionX] = JSON.parse(JSON.stringify(Env.PDMAPbkp[removed.predictionY][removed.predictionX]));

        // if(removed.knownY == 1 || removed.knownY == Env.PDMAP.length-2 ||
        //   removed.knownX == 1 || removed.knownX == Env.PDMAP[0].length-2){
        //   Env.PDMAP[removed.knownY][removed.knownX] = 2;
        // }else{//Not a border
        //   Env.PDMAP[removed.knownY][removed.knownX] = 0;
        // }
        Env.PDMAP[removed.knownY][removed.knownX] = JSON.parse(JSON.stringify(Env.PDMAPbkp[removed.knownY][removed.knownX]));
      }
    }
  }
}

export function updateEnemyArray(eee){
  var ee = JSON.parse(JSON.stringify(eee));
  lostFOVEnemies(ee); //remove out of fov predictions after n seconds
  for(let i = 0; i < ee.length; i++){
    if (Number.isInteger(ee[i].y) && Number.isInteger(ee[i].x) ){
      ee[i].y = ee[i].y + 1; //Add one cause of map padding
      ee[i].x = ee[i].x + 1;
      var x = inEnemyArray(ee[i]); //Check if enemy was seen before, returns its position
      if (typeof x == "number"){ //If seen before
        if(enemyArray[x].x != ee[i].x || enemyArray[x].y != ee[i].y){ //check if the last recorded position is the same as the current
          //console.log("QWERTY 1");
          updateEnemyMap(ee[i], x); 
          enemyProb(ee[i], x);
          //console.log(enemyArray[x].x, enemyArray[x].y, ee[i].x, ee[i].y);
          enemyArray[x].x = ee[i].x; enemyArray[x].y = ee[i].y; //Update the enemy position in the array
          
        }else{
          //console.log("QWERTY 2", ee[i].x,ee[i].y, enemyArray[x].x, enemyArray[x].y);
          updateEnemyMap(ee[i], false);
          enemyProb(ee[i], false); //guarantee this is called only once per enemy
        }
      }else{                    // new enemy
        //console.log("QWERTY 3");
        enemyArray.push(ee[i]);
        updateEnemyMap(ee[i], false);
        enemyProb(ee[i],x);
      }
    } 
  }
  //console.log(enemyArray)
  //Env.printPDMap()
  //sada= asd
}

export function updateEnemyMap(enemy, seen){
  //Update the PD map based on the agents position
  //console.log(Env.PDMAP[3][1], Env.PDMAP[1][3], enemy)
  if(typeof seen == 'number'){
    //Unlock previous enemy position, checking if it was a border or not
    // if(enemyArray[seen].y == 1 || enemyArray[seen].y == Env.PDMAP.length-2 ||
    //   enemyArray[seen].x == 1 || enemyArray[seen].x == Env.PDMAP[0].length-2){
    //   Env.PDMAP[enemyArray[seen].y][enemyArray[seen].x] = 2;
    // }else{//Not a border
    //   Env.PDMAP[enemyArray[seen].y][enemyArray[seen].x] = 0;
    // }
    Env.PDMAP[enemyArray[seen].y][enemyArray[seen].x] = JSON.parse(JSON.stringify(Env.PDMAPbkp[enemyArray[seen].y][enemyArray[seen].x]));
    
    //console.log(Env.PDMAP[enemyArray[seen].y][enemyArray[seen].y]);
  }
  //console.log("asdasdasdsadad", seen)
  
    Env.PDMAP[enemy.y][enemy.x] = 3;

}

function inEnemyArray(enemy){
  for(let i=0; i<enemyArray.length; i++){
    if(enemyArray[i].id == enemy.id)
      return i;
  }
  return false;
}

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
  //console.log(probs, neigh);

  var max = 0;
  for( let i=0;i<4;i++){
    if (neigh[i] == 1 || neigh[i] == 'X'){
      probs[i] = 0; //remove blocked cells
    }
    if (probs[i]>max)
      max = probs[i];
  }
  //console.log(probs, max)

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
  //console.log(probs, futEnemy, ee, idk[probs.indexOf(max/4)]);

  //Store the changes to remove them if not correct in the future
  //let now = new Date();
  ///*
  //console.log('Not empty array ', probPositions);
  if (!probPositions.some(obj => obj.id === ee.id)) { //check if enemy wasn't previously registered
    //console.log('NEW ENEMY');
    probPositions.push({predictionX:futEnemy.x, predictionY:futEnemy.y, knownX:ee.x, knownY:ee.y, id:ee.id, time:new Date()}); //add new enemy
  }else{
    //If a prediction for an enemy was registered in the past and it's position has changed
    //console.log('OLD ENEMY');
    if(probPositions.some(obj => obj.id === ee.id && (obj.knownX != ee.x || obj.knownY != ee.y))){ 
      var oldp = probPositions.splice(probPositions.findIndex(obj => obj.id === ee.id), 1) //remove old prediction
      //console.log("Removed", oldp, probPositions);
      if (oldp != undefined && oldp != null){ //check if undefined null or empty
        // if(oldp[0].predictionY == 1 || oldp[0].predictionY == Env.PDMAP.length-2 ||
        //   oldp[0].predictionX == 1 || oldp[0].predictionX == Env.PDMAP[0].length-2){
        //   Env.PDMAP[oldp[0].predictionY][oldp[0].predictionX] = 2;
        // }else{//Not a border
        //   Env.PDMAP[oldp[0].predictionY][oldp[0].predictionX] = 0;
        // }
        Env.PDMAP[oldp[0].predictionY][oldp[0].predictionX] = JSON.parse(JSON.stringify(Env.PDMAPbkp[oldp[0].predictionY][oldp[0].predictionX]));
        Env.PDMAP[ee.y][ee.x] = 3; //lock again current enemy position
      }
      //updateEnemyMap([{x:oldp[0].predictionX, y:oldp[0].predictionY}],0,true)
      
      probPositions.push({predictionX:futEnemy.x, predictionY:futEnemy.y, knownX:ee.x, knownY:ee.y, id:ee.id, time:new Date()}); //add new prediction
    }
  }
  //probPositions.push({predictionX:futEnemy.x, predictionY:futEnemy.y, knownX:ee.x, knownY:ee.y, id:ee.id, time:new Date()})
  //console.log(probPositions);
  //Fix wrong predictions if necessary
  //fixPredictions();
  //*/
}

function getNeigh(matrix, x, y) {//get the neigbours of a cell
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