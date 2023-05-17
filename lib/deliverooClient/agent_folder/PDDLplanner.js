import { onlineSolve, PddlDomain, PddlAction, PddlExecutor, PddlProblem, Planner, Beliefset } from "../../pddlClient/index.js";

Planner.doPlan = onlineSolve;
/*
class mUp extends PddlAction {

    parameters = 'agent cUp cCurrent'
    precondition = [ 'clear cUp', 'not clear cCurrent']
    effect = [ 'moved-up agent', 'not clear cUp' ]

    async exec (...args) {
        console.log( 'mUp', ...args )
    }

}

class wander extends PddlAction {

    parameters = 'a p'
    precondition = [ 'cleara a' , 'clearp p' ]
    effect = [ 'not clearp p', 'cleara a']

    async exec (...args) {
        console.log( 'wandering about...', ...args )
    }

}

const mmUp = new mUp();
const wwander = new wander();

console.log( mmUp.toPddlString(), wwander.toPddlString() );

const myBeliefset = new Beliefset()
myBeliefset.declare( 'cleara pArr' );
myBeliefset.declare( 'clearp plan' );

const myGoal = [ 'not (clearp plan)' ]

var pddlDomain = new PddlDomain( 'deliveroo', wwander )

var pddlProblem = new PddlProblem()
pddlProblem.addObject(...myBeliefset.objects) //'a', 'b'
pddlProblem.addInit(...myBeliefset.entries.filter( ([fact,value])=>value ).map( ([fact,value])=>fact ))//(...beliefs.literals)
pddlProblem.addGoal(...myGoal)

console.log(pddlProblem.content)

var plan = await onlineSolve(pddlDomain, pddlProblem);
console.log(plan);
*/

class explore extends PddlAction {
    parameters = 'hasPlan seen1p'
    precondition = [ 'clear hasPlan', 'clear seen1p']
    effect = [ 'plan hasPlan', 'clear seen1p' ,'plan alwaysReplan']
    async exec (...args) {
        console.log( 'explore', ...args )
    }
}
const eexplore = new explore();
console.log(eexplore.toPddlString())

class changePlanner extends PddlAction {
    parameters = 'emStuck emScore'
    precondition = [ 'alarm emStuck', 'alarm emScore']
    effect = [ 'clear emStuck', 'clear emScore']
    operation = 'or'
    async exec (...args) {
        console.log( 'changePlanner', ...args )
    }
}
const changeP = new changePlanner();
console.log(changeP.toPddlString())

class getPlan extends PddlAction {
    parameters = 'hasPlan seen1p'
    precondition = ['mem seen1p']
    effect = [ 'plan hasPlan', 'mem seen1p']
    operation = 'and'
    async exec (...args) {
        console.log( 'changePlanner', ...args )
    }
}
const getPlann = new getPlan();
console.log(getPlann.toPddlString())

const myBeliefset = new Beliefset()

myBeliefset.declare( 'clear hasPlan');
myBeliefset.declare( 'clear seen1p');
myBeliefset.declare( 'alarm emStuck');
myBeliefset.declare( 'clear emScore');
myBeliefset.declare( 'clear alwaysReplan');

const myGoal = [ 'plan hasPlan', 'clear seen1p', 'clear emStuck', 'clear emScore']

var pddlDomain = new PddlDomain( 'deliveroo', eexplore , changeP)
var pddlProblem = new PddlProblem()
pddlProblem.addObject(...myBeliefset.objects) //'a', 'b'
pddlProblem.addInit(...myBeliefset.entries.filter( ([fact,value])=>value ).map( ([fact,value])=>fact ))//(...beliefs.literals)
pddlProblem.addGoal(...myGoal)

console.log(pddlProblem.content)

var plan = await onlineSolve(pddlDomain, pddlProblem);
console.log(plan);