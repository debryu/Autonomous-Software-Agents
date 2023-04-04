export class Enemy {
  constructor(id, x, y, carriedBy, reward) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._carriedBy = carriedBy;
    this._reward = reward;
  }

  get id() {
    return this._id;
  }

  set id(id) {
    this._id = id;
  }

  get x() {
    return this._x;
  }

  set x(x) {
    this._x = x;
  }

  get y() {
    return this._y;
  }

  set y(y) {
    this._y = y;
  }

  get carriedBy() {
    return this._carriedBy;
  }

  set carriedBy(carriedBy) {
    this._carriedBy = carriedBy;
  }

  get reward() {
    return this._reward;
  }

  set reward(reward) {
    this._reward = reward;
  }
}

var enemyArray = [];

export function updateEnemyArray(ee){
  console.log(pp);
  //Clear the array
  enemyArray = [];
  //Add again every enemy
  for(let i = 0; i < ee.length; i++){
    enemyArray.push(pp[i]);
  }
  console.log(enemyArray);
}

export function findEnemy(ee){
}
