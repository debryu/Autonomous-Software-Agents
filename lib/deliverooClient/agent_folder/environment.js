


export var MAP = Array.from({ length: 10 }, () => Array(10).fill(1));

export function getMap(x,y,deliv){
    MAP[x][y] = 0;
    if (deliv)
        MAP[x][y] = 2;

}

