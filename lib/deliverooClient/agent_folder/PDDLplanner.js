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

/*
class explore extends PddlAction {
    parameters = 'hasPlan seen1p'
    precondition = [ 'clear hasPlan', 'clear seen1p']
    effect = [ 'plan exp', 'clear seen1p' ,'plan alwaysReplan']
    async exec (...args) {
        console.log( 'explore', ...args )
    }
}
const eexplore = new explore();
console.log(eexplore.toPddlString())

class changePlanner extends PddlAction {
    parameters = 'emStuck emScore'
    precondition = [ 'alarm emStuck', 'alarm emScore']
    effect = [ 'clear emStuck', 'clear emScore', 'plan chngPlan']
    operation = 'or'
    async exec (...args) {
        console.log( 'changePlanner', ...args )
    }
}
const changeP = new changePlanner();
console.log(changeP.toPddlString())

class stopExplore extends PddlAction {
    parameters = 'seen1p pDecay alwaysReplan exp'
    precondition = ['mem seen1p', 'conf pDecay', 'plan alwaysReplan', 'plan exp']
    effect = [ 'clear alwaysReplan', 'plan chngPlan', 'clear exp']
    operation = 'and'
    async exec (...args) {
        console.log( 'changePlanner', ...args )
    }
}
const stopExplore = new getPlan();
console.log(stopExplore.toPddlString())

const myBeliefset = new Beliefset()

myBeliefset.declare( 'clear hasPlan');
myBeliefset.declare( 'clear seen1p');
myBeliefset.declare( 'clear emStuck');
myBeliefset.declare( 'clear emScore');
myBeliefset.declare( 'clear alwaysReplan');
myBeliefset.declare( 'conf pDelay');
myBeliefset.declare( 'clear exp');
myBeliefset.declare( 'clear chgPlan');

const myGoal = [ 'plan chngPlan', 'clear seen1p', 'clear emStuck', 'clear emScore']

var pddlDomain = new PddlDomain( 'deliveroo', eexplore , changeP)
var pddlProblem = new PddlProblem()
pddlProblem.addObject(...myBeliefset.objects) //'a', 'b'
pddlProblem.addInit(...myBeliefset.entries.filter( ([fact,value])=>value ).map( ([fact,value])=>fact ))//(...beliefs.literals)
pddlProblem.addGoal(...myGoal)

console.log(pddlProblem.content)

var plan = await onlineSolve(pddlDomain, pddlProblem);
console.log(plan);
*/

const myBeliefset = new Beliefset()

export var mapDimension = {
    x: 20,
    y: 20
}

export var PDMAP = Array.from({ length: mapDimension.y+2 }, () => Array(mapDimension.x+2).fill(0));
console.log(PDMAP)

let x=0;
let y=0;

for(let i=0;i<mapDimension.x;i++){
    for(let j=0;j<mapDimension.y;j++){
        //console.log(i,j)
        if (PDMAP[j+1][i+1] != 1 && PDMAP[j+1][i+1] != 2 && PDMAP[j+1][i+1] != 3){
            y = j+1;
            x = i+1;
            //console.log(x,y)
            //console.log( 'tile c'+x.toString()+','+y.toString());  
            if(y-1 >= 1)
                myBeliefset.declare( 'on-top-of c'+x.toString()+'x'+y.toString() +' c'+x.toString() + 'x' +(y-1).toString());  
            if(y+1 <=20)
                myBeliefset.declare( 'on-btm-of c'+x.toString()+'x'+y.toString() +' c'+x.toString() + 'x' +(y+1).toString());  
            if(x-1 >= 1)
                myBeliefset.declare( 'on-right-of c'+x.toString()+'x'+y.toString() +' c'+(x-1).toString() + 'x' +y.toString());  
            if(x+1 <=20)
                myBeliefset.declare( 'on-left-of c'+x.toString()+'x'+y.toString() +' c'+(x+1).toString() + 'x' +y.toString());  
            
            // if(y =2)
            //     break
        }   
        
    }
    // if(i =2)
    //     break;
}
myBeliefset.declare( 'on c1x1' ); 
class mUp extends PddlAction {
    parameters = 'currentCell nextCell'
    precondition = ['on-top-of nextCell currentCell', 'on-btm-of currentCell nextCell', 'on currentCell']
    effect = ['clear currentCell', 'on nextCell']
    async exec (...args) {
        console.log( 'changePlanner', ...args )
    }
}

class mDw extends PddlAction {
    parameters = 'currentCell nextCell'
    precondition = ['on-btm-of nextCell currentCell', 'on-top-of currentCell nextCell', 'on currentCell']
    effect = [ 'clear currentCell', 'on nextCell' ]
    async exec (...args) {
        console.log( 'changePlanner', ...args )
    }
}

class mLf extends PddlAction {
    parameters = 'currentCell nextCell'
    precondition = ['on-left-of nextCell currentCell', 'on-right-of currentCell nextCell', 'on currentCell']
    effect = [ 'clear currentCell', 'on nextCell' ]
    async exec (...args) {
        console.log( 'changePlanner', ...args )
    }
}

class mRg extends PddlAction {
    parameters = 'currentCell nextCell'
    precondition = ['on-right-of nextCell currentCell', 'on-left-of currentCell nextCell', 'on currentCell']
    effect = [ 'clear currentCell', 'on nextCell' ]
    async exec (...args) {
        console.log( 'changePlanner', ...args )
    }
}

const myGoal = [ 'on c8x8' ]

var pddlProblem = new PddlProblem()
pddlProblem.addObject(...myBeliefset.objects) //'a', 'b'
pddlProblem.addInit(...myBeliefset.entries.filter( ([fact,value])=>value ).map( ([fact,value])=>fact ))//(...beliefs.literals)
pddlProblem.addGoal(...myGoal)

const up = new mUp();
const dw = new mDw();
const lf = new mLf();
const rg = new mRg();

console.log(up.toPddlString());
console.log(dw.toPddlString())
console.log(lf.toPddlString())
console.log(rg.toPddlString());
console.log(pddlProblem.content)




var pddlDomain = new PddlDomain( 'deliveroo', up, dw,lf,rg)
console.log(pddlDomain.content)

var plan = await onlineSolve(pddlDomain, pddlProblem);
console.log(plan);