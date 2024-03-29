import { onlineSolve, PddlDomain, PddlAction, PddlExecutor, PddlProblem, Planner, Beliefset } from "../../../pddlClient/index.js";
import * as Env from './env.js';
import { agentCell } from "./sensing.js";

Planner.doPlan = onlineSolve;
var pddlDomain;
var pddlProblem;
var myGoal;

export function initPDDL(coord, incEnemies=true){
    var myBeliefset = new Beliefset();

    let x=0;
    let y=0;

    //Get all the walkable cells from the map
    for(let i=0;i<Env.mapDimension.x;i++){
        for(let j=0;j<Env.mapDimension.y;j++){
            if ((Env.PDMAP[j+1][i+1] != 1 && Env.PDMAP[j+1][i+1] != 3 && incEnemies) || (Env.PDMAP[j+1][i+1] != 1 && !incEnemies)){
                y = j+1;
                x = i+1;
                if(y-1 >= 1)
                    myBeliefset.declare( 'on-top-of c'+x.toString()+'x'+y.toString() +' c'+x.toString() + 'x' +(y-1).toString());  
                if(y+1 <=20)
                    myBeliefset.declare( 'on-btm-of c'+x.toString()+'x'+y.toString() +' c'+x.toString() + 'x' +(y+1).toString());  
                if(x-1 >= 1)
                    myBeliefset.declare( 'on-right-of c'+x.toString()+'x'+y.toString() +' c'+(x-1).toString() + 'x' +y.toString());  
                if(x+1 <=20)
                    myBeliefset.declare( 'on-left-of c'+x.toString()+'x'+y.toString() +' c'+(x+1).toString() + 'x' +y.toString());  
            }   
            
        }
    }
    
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

    //Declare current position and goal
    myGoal = [ 'on c'+coord.x + 'x' + coord.y ];
    myBeliefset.declare( 'on c' + agentCell.x + 'x' + agentCell.y ); 

    pddlProblem = new PddlProblem();
    pddlProblem.addObject(...myBeliefset.objects); //'a', 'b'
    pddlProblem.addInit(...myBeliefset.entries.filter( ([fact,value])=>value ).map( ([fact,value])=>fact ));//(...beliefs.literals)
    pddlProblem.addGoal(...myGoal);

    const up = new mUp();
    const dw = new mDw();
    const lf = new mLf();
    const rg = new mRg();

    pddlDomain = new PddlDomain( 'deliveroo', up, dw,lf,rg);
}


export async function getPlan(){
    let plan = await onlineSolve(pddlDomain, pddlProblem);
    let fplan = plan.map(obj => {
        let action = obj.action;
        action = action.replace('mrg', 'right');
        action = action.replace('mup', 'up');
        action = action.replace('mlf', 'left');
        action = action.replace('mdw', 'down');
        return action;
      });

    let coordinates = plan.map(obj => {
        const [coord1, coord2] = obj.args;
        const [x1, y1] = coord1.substring(1).split("x");
        const [x2, y2] = coord2.substring(1).split("x");
        return { x: Number(x1), y: Number(y1) };
      });
    
    return [fplan, coordinates];
}