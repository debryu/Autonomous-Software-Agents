//Define a AC planner
//This planner is used to plan the actions of the agent
//Every parcel is considered as a node, and also all delivery cells are nodes
//The planner gets as input all the possible nodes the agent can reach
//Every plan must end with a delivery cell

//The planner will return a plan that will be executed by the agent

import * as Sensing from './Modules/sensing.js';
import * as Parcel from './Modules/parcel.js';
import * as Env from './Modules/env.js';
import * as Connection from "./Modules/connection.js";

//Parameters of the Ant Colony algorithm
/*----------------------------------------
pop_size = 1000 seems to converge most of the time


-----------------------------------------*/
// const pop_size = 10; // Population size
// const alpha = 0.1; // Importance of pheromone
// const beta = 0.1; // Importance of distance
// const explorationRate = 1; // Exploration rate
// const evaporationRate = 0.9; // Evaporation rate
// const persistance = 1 - evaporationRate; // Persistance of pheromone
// const iterations = 2; // Number of iterations
// var maxPheromone = 10; // Maximum pheromone value
// var minPheromone = 1; // Minimum pheromone value

const pop_size = 500; // Population size
const alpha = 1; // Importance of pheromone
const beta = 1; // Importance of distance
const explorationRate = 0.1; // Exploration rate
const evaporationRate = 0.1; // Evaporation rate
const persistance = 1 - evaporationRate; // Persistance of pheromone
const iterations = 20; // Number of iterations
var maxPheromone = 10; // Maximum pheromone value
var minPheromone = 1; // Minimum pheromone value

var dim_x = 10;
export function setDimension(){
    dim_x = Env.PDmapDimension.x;
}

// Gamma variable
// It is used to count the seconds it takes the parcel to decay
// This is set as 0 by default
// Can be found in Env.mapConfig.PARCEL_DECADING_INTERVAL
var gamma = 0;

export function initializeGammaAs(value){
    //gamma = Env.mapConfig.PARCEL_DECADING_INTERVAL;
        if(value === 'infinite')
            gamma = 0;
        else
            gamma = 1/gamma;

    // For simulation purposes, you can set gamma here to a choosen value
    //gamma = 0.5; 
}



export function plan(min_rew_threshold = 0, delivery_cutoff = 1){
    //First create the graph of all possible nodes to visit
    //createGraph() returns a list of 
    // 0: all the nodes
    // 1: only the delivery nodes
    // 2: only the parcel nodes
    //let graph = createGraph(delivery_cutoff)[0];

    // Add the possibility to cutoff a fraction of the delivery nodes if they are too many
    let graph = createGraph(delivery_cutoff)[3];


    // Check if the graph is empty, and in that case return fals
    if(graph.length == 0){
        console.log('The graph is empty \nAborting...');
        return false;
    }

    //console.log('custom nodes',graph);
    //console.log('parcels', Parcel.parcelsArray);
    //Then retrieve the current agent position
    let agentPosition = {x: Sensing.agentCell.x, y: Sensing.agentCell.y, idx: 0, delivery: false, score: 0, id: createUniqueID(Sensing.agentCell.x,Sensing.agentCell.y)};

    //Now run the Ant Colony algorithm to find the best path
    let ant = AntColony(graph, agentPosition)[0];
    //let path = AntColony(graph, agentPosition)[0].path;
    //print every element in the graph
    /*
    for(let i = 0; i < graph.length; i++){
        console.log(graph[i]);
    }
    */


    // Check if the path score is above a certain threshold
    if(ant.pathScore >= min_rew_threshold){
        return ant;
    }
    else{
        //console.log(ant.path);
        console.log('The path score is too low with value ' + ant.pathScore + '\nAborting...');
        return false;
    }
}

//Implement an Ant Colony algorithm to find the best path
function AntColony(graph, agentPosition){
    //The list of all possible paths are stored in the graph variable
    //Each node is connected to all the other nodes

    // Initialize the ant colony
    const antCount = pop_size/* number of ants */;
    let ants = [];
    for (let i = 0; i < antCount; i++) {
        ants.push({
            currentNode: agentPosition,
            path: [agentPosition],
            pathLength: 0,
            pathScore: 0,
        });
    }

    //Initialize the pheromone trails
    //Dimension of the pheromone trails is the same as the graph +1 because of the starting position 
    const pheromoneTrails = Array.from({ length: graph.length +1}, () => Array(graph.length +1).fill(100000));
    

    //Run the algorithm for a number of iterations
    for (let i = 0; i < iterations; i++) {
        moveAnts(ants,pheromoneTrails,graph);
        computeFitness(ants);
        updatePheromoneTrail(pheromoneTrails, ants, graph);
    }
    
    return ants;
}

//Compute the fitness of each ant
function computeFitness(ants) {
    for (let i = 0; i < ants.length; i++) {
      const ant = ants[i];


      ant.pathScore = evaluatePath(ant.path);
      //console.log("ant path: " + ant.path + " score: " + ant.pathScore);
    }
}

function evaluatePath(path){
    let score = 0;
    let score_mateo = 0;
    //Variable to check if the ant has delivered
    let delivered = false;
    //Initialize time to 0
    let time = 0;
    let time_mateo = 0;
    
    //Evaluate the path
    //Check every node (except the last one, since it should have already delivered there) in the path
    for(let i = 0; i < path.length - 1; i++){
        //console.log(path[i])
        //Update the time
        //For now, it is just the distance between the two nodes
        // Multiply the time by the time it takes for a parcel to drop by 1
        // Found in PARCEL_DECADING_INTERVAL

        //console.log(Env.mapConfig.PARCEL_DECADING_INTERVAL)
        //console.log('gamma',gamma);

        let partial_time = Sensing.travelTime(cellFromUniqueID(path[i].id),cellFromUniqueID(path[i+1].id))*gamma;
        time += partial_time;
        //If the node is a delivery node, then the path is correct
        
        
        if(path[i+1].delivery){
            score -= time;
            //console.log('subtracting ' + time + ' from score');
            delivered = true;
            break;
        }
        //If the node is a parcel node, then we need to check if the parcel is in the agent's inventory
        else{
            //if(i == 1)
            //console.log('before',path, i, score, time);

            score -= partial_time;
            //Add the score of the parcel
            score += (path[i+1].score - time);
            score_mateo += path[i+1].score;
            //Subtract the time it will take to deliver the parcel
            //score -= time;
            //if (i == 1)
            //console.log('ghjhgfdfghjhygtfdv');

            
        }
        //if(i == 1)
            //console.log('after',path, i, score, time);
    }

    //If the ant has delivered, then return the score
    //Optional 
    //Normalize the score by the length of the path
    //console.log(score_mateo - time*(path.length-2),score_mateo, time);
    if(delivered){ //&& (Sensing.ME.score != Connection.agentSensing[1].score)){
        return score_mateo - time*(path.length-2);
        //return score;
    }

    //Else return -1
    else{
        //console.log('The ant never delivered');
        return 0;
    }
    
}


// Assign probabilities to each node
function calculateProbabilities(ant, pheromoneTrails, graph) {
    const probabilities = [];
    let total = 0;
    for (let i = 0; i < graph.length; i++) {
        //Check if the node has already been visited
        let visited = false;
        for(let j = 0; j < ant.path.length; j++){
            //console.log(graph[i].id + ' ' + ant.path[j].id);
            if(graph[i].id === ant.path[j].id){
                visited = true;
                break;
            }
        }
        if(visited){
            //console.log('skipping ' + graph[i].id);
            probabilities.push(0);
            //console.log(probabilities);
            continue;
        }
        //If the node has been visited, then the probability is 0
        
        //console.log('ant',ant);
        //console.log('graph',graph[i]);
        //console.log('pheromoneTrails',pheromoneTrails);
        //console.log('graph lenght',graph.length);
        const pheromone = pheromoneTrails[ant.currentNode.idx][graph[i].idx];
        //console.log(ant)
        //console.log(cellFromUniqueID(ant.currentNode.id))

        //The heuristic is a measure of how good the selected node is
        /* First idea:
            const heuristic = ant.currentNode.score - Sensing.admissible_heuristic(cellFromUniqueID(ant.currentNode.id),cellFromUniqueID(graph[i].id));
        */
        const heuristic = graph[i].score - Sensing.travelTime(cellFromUniqueID(ant.currentNode.id),cellFromUniqueID(graph[i].id));

        //Compute the probability of selecting the node
        const probability = Math.pow(pheromone, alpha) * Math.pow(heuristic, beta);
        //console.log('pheromone: ' + pheromone + ' heuristic: ' + heuristic + ' prob: ' + probability);
        probabilities.push(probability);
        total += probability;

        //console.log('phero: ' + pheromone + ' heur:' + heuristic + ' prob: ' + probability );
    }
    for (let i = 0; i < probabilities.length; i++) {
      probabilities[i] /= total;
    }
    //console.log('probs:' + probabilities);
    return probabilities;
}

//Roulette selection
function rouletteSelection(probabilities) {
    //generate a random number from 0 to 1
    let random = Math.random();
    let sum = 0;
    for (let i = 0; i < probabilities.length; i++) {
      sum += probabilities[i];
      //console.log('random: ' + random + ' sum: ' + sum + ' prob: ' + probabilities[i]);
      if (random <= sum) {
        return i;
      }
    }
    return probabilities.length - 1;
}

// Move the ants
function moveAnts(ants,pheromoneTrails,graph) {
    for (let i = 0; i < ants.length; i++) {
      const ant = ants[i];

      //Check if the ant has already delivered
      //If it has, do nothing
      if(!ant.path[ant.path.length - 1].delivery){
        const probabilities = calculateProbabilities(ant, pheromoneTrails, graph);
        const nodeIndex = rouletteSelection(probabilities);
        
        //console.log(ant.path);
        //console.log('index ' + nodeIndex + ' ' + graph[nodeIndex].id);
        ant.pathLength += Sensing.admissible_heuristic(cellFromUniqueID(graph[nodeIndex].id),cellFromUniqueID(ant.currentNode.id))/* calculate distance from previous node to current node */;
        ant.currentNode = graph[nodeIndex];
        ant.path.push(ant.currentNode);
        }
    }
}

//We are using a variation of the AC algorithm (The Min-Max Ant System)
//There is only one pheromone update at the end of each iteration:
// the best solution is updated with a high pheromone value

function updatePheromoneTrail(pheromoneTrails, ants, graph) {
    //Sort the ants based on the path score
    ants.sort((a, b) => b.pathScore - a.pathScore);
    //Pick the best ant
    let bestAnt = ants[0];
    //Pick the best path from the ant
    let bestPath = bestAnt.path;
    let bestScore = bestAnt.pathScore;
    if(bestScore <= 0)
        bestScore = 1;


        
    //Local update of the pheromone
    //For each path of each ant, update the pheromone trail
    for (let i = 0; i < ants.length; i++) {
        //For each ant, update the edges the ant took
        for(let p = 0; p < ants[i].path.length - 1; p++){
            let node = ants[i].path[p];
            let nextNode = ants[i].path[p+1];
            pheromoneTrails[node.idx][nextNode.idx] = persistance * pheromoneTrails[node.idx][nextNode.idx] + evaporationRate * minPheromone;
        }
    }


    
    //Global update of the pheromone
    for(let i = 0; i < bestPath.length - 1; i++){
        let node = bestPath[i];
        let nextNode = bestPath[i+1];
        pheromoneTrails[node.idx][nextNode.idx] = persistance * pheromoneTrails[node.idx][nextNode.idx] + evaporationRate * bestAnt.pathScore;
    }

    //console.log(maxPheromone + ' phero levels ' + minPheromone)
    //Bound the pheromone values between minPheromone and maxPheromone
    for (let i = 0; i < pheromoneTrails.length; i++) {
        for (let j = 0; j < pheromoneTrails[i].length; j++) {
            if(pheromoneTrails[i][j] > maxPheromone){
                pheromoneTrails[i][j] = maxPheromone;
            }
            if(pheromoneTrails[i][j] < minPheromone){
                pheromoneTrails[i][j] = minPheromone;
            }
        }
    }

    //Compute the minPheromone and maxPheromone values (based on iteration)
    //Compute them like in the paper 
    // MAX –MIN Ant System
    // Thomas Stutzle and Holger H. Hoos
    maxPheromone = (1.0 / evaporationRate) * (bestScore);
    //calculate the n-square root of explorationRate
    let p = Math.pow(explorationRate, 1.0 / graph.length);
    minPheromone = (maxPheromone * (1-p))/(((graph.length/2)-1)*p);

    //console.log("minPheromone: " + minPheromone + " maxPheromone: " + maxPheromone);
}

//Create a unique ID for each cell
//To do that, sum the x coordinate with y*max_x_dimension
//Example x=1, y=2, max_x=8, max_y=14
//1+2*9 = 19
//So x = 19%9 = 1, y = 19-x/9 = 2
export function createUniqueID(x,y){
    return x+y*dim_x;
}

//The opposite function
function cellFromUniqueID(ID){
    let x = ID%dim_x;
    let y = (ID-x)/dim_x;
    return {x: x, y: y};
}

function createGraph(delivery_cutoff){
    //Create a list of all nodes available
    let nodes = [];
    //Also redundant variables for only parcels and only delivery cells
    let parcelNodes = [];
    let deliveryNodes = [];

    //We also add the ID of the cell to the node to make it easier to find it
    //The ID is created by summing the x coordinate with y*max_x_dimension
    //max_x_dimension is increased by one since the counting starts from 0 but it doesn't matter if it
    //is increased by one

    //Keep track of the index of the node in the nodes array
    let index = 1;

    //First add all the delivery zones
    //Top row
    for(let i=1; i<Env.PDmapDimension.x-1; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[Env.PDmapDimension.x-2][i] != 1){
            //Check if the cell is a delivery cell 
            if(Env.PDMAP[Env.PDmapDimension.x-2][i] == 2){
                let cell = {x: i, y: Env.PDmapDimension.x-2, idx: index, delivery: true, score: 0, id: createUniqueID(i,Env.PDmapDimension.x-2)};
                index += 1;
                nodes.push(cell);
                deliveryNodes.push(cell);
            }
        }
    }
    
    //Bottom row
    for(let i=1; i<Env.PDmapDimension.x-1; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[1][i] != 1){
            //Check if the cell is a delivery cell
            if(Env.PDMAP[1][i] == 2){
                let cell = {x: i, y: 1, idx:index, delivery: true, score: 0, id: createUniqueID(i,1)};
                index += 1;
                nodes.push(cell);
                deliveryNodes.push(cell);
            }
        }
    }

    //Left column
    for(let i=2; i<Env.PDmapDimension.y-2; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[i][1] != 1){
            //Check if the cell is a delivery cell
            if(Env.PDMAP[i][1] == 2){
                let cell = {x: 1, y: i, idx: index, delivery: true, score: 0, id: createUniqueID(1,i)};
                index += 1;
                nodes.push(cell);
                deliveryNodes.push(cell);
            }
        }
    }

    //Right column
    for(let i=2; i<Env.PDmapDimension.y-2; i++){
        //Check if the cell is not a blocked cell
        if(Env.PDMAP[i][Env.PDmapDimension.y-2] != 1){
            //Check if the cell is a delivery cell
            if(Env.PDMAP[i][Env.PDmapDimension.y-2] == 2){
                let cell = {x: Env.PDmapDimension.y-2, y: i, idx: index, delivery: true, score: 0, id: createUniqueID(Env.PDmapDimension.y-2,i)};
                index += 1;
                nodes.push(cell);
                deliveryNodes.push(cell);
            }
        }
    }

    //Now add all the parcels
    for(let i=0; i< Parcel.parcelsArray.length; i++){
        let parcel = Parcel.parcelsArray[i];

        //First check if the parcel is in cell that has been already added as a node
        //This can happen when two or more parcels are in the same cell
        let node = nodes.find(node => node.x == parcel.x && node.y == parcel.y);
        if(node != undefined){
            //If it is, then just add the reward to the existing node
            node.score += parcel.reward;
            //And skip the rest of the loop
            continue;
        }

        //Otherwise proceed as usual
        let cell = {x: parcel.x, y: parcel.y, idx: index, delivery: false, score: parcel.reward, id: createUniqueID(parcel.x,parcel.y)};
        index += 1;
        nodes.push(cell);
        parcelNodes.push(cell);
    }



    /* EXPERIMENT
    
    ADD ONLY SOME DELIVERY ZONES
    ADD MORE CELLS (THAT ARE OF PARTICULAR INTEREST)
    
    */

    let customNodes = [];

    // Count the number of delivery nodes
    let deliveryNodesCount = deliveryNodes.length;
    // Get a partial count of the delivery nodes
    let partialDeliveryNodesCount = Math.floor(deliveryNodesCount * delivery_cutoff);
    // Sort the delivery nodes by the manhattan distance from the agent
    deliveryNodes.sort((a, b) => Sensing.admissible_heuristic(Sensing.agentCell, a) - Sensing.admissible_heuristic(Sensing.agentCell, b));
    // Add the top partialDeliveryNodesCount delivery nodes to the partialNodes array
    for(let i = 0; i < partialDeliveryNodesCount; i++){
        customNodes.push(deliveryNodes[i]);
    }

    // Add all the parcel nodes to the customNodes array
    for(let i = 0; i < parcelNodes.length; i++){
        customNodes.push(parcelNodes[i]);
    }



    //console.log("Nodes: " + nodes.length + " index: " + index);
    console.log("Delivery nodes: ", deliveryNodes.length);
    return [nodes,parcelNodes,deliveryNodes,customNodes];
}

export function fromPathToListOfCells(path){
    let cells = [];
    for(let i=0; i<path.length; i++){
        let cell = {x: path[i].x, y: path[i].y};
        cells.push(cell);
    }
    return cells;
}