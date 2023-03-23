export class Enemy {
    constructor(id, x,y, carriedBy, reward) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.carriedBy = carriedBy;
      this.reward = reward;
    }
    
    toString() {
      console.log(this.id, this.x, this.y, this.carriedBy, this.reward);
    }

    get id(){
        return this.id;
    }

    set reward(reward){
        this.reward = reward;
    }
    get reward(){
        return this.reward;
    }

  }