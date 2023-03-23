export var M = [
    [2, 2, 0, 2, 0, 2, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 1, 0, 1, 0, 1, 0, 1, 0, 2],
    [2, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [2, 1, 0, 1, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 1, 0, 1, 1, 1, 0, 1, 1, 0],
    [2, 1, 0, 1, 0, 0, 0, 1, 1, 0],
    [2, 2, 0, 0, 0, 2, 0, 2, 2, 0]
]


/* dim has to have this structure:

const map_dimension = {
    x: 10,
    y: 10
};

----------------------------------------*/
export function printMap(matrix, dim){
    console.log("--------  [MAP]  ---------");
    for (let i=0; i<dim.x; i++){
        let scanLine = "  ";
        for (let j=0; j<dim.y; j++){
            let color = 31
            if(M[i][j] == 2)
                //red
                color = 31
            else if (M[i][j] == 0)
                //green
                color = 32
            else
                //gray
                color = 30

            scanLine = scanLine + " " + colorizeString(M[i][j].toString(), color);
        }
        console.log(scanLine);
    }
    console.log("--------------------------");
}

//input a string and a number (for the color) and output a string 
// that will be coloured in a console log.
function colorizeString(text, color){
    // RED   = 31
    // GREEN = 32
    return '\u001b[' + color + 'm' + text + '\u001b[0m';
}