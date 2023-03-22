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


export function printMap(matrix, dim){
    console.log("--------  [MAP]  ----------");
    for (let i=0; i<dim; i++){
        let scanLine = "  ";
        let test = ['%cThis text is red!%cThis red', 'color: red', 'color: green'];
        for (let j=0; j<dim; j++){
            let color = 31
            if(M[i][j] == 2)
                color = 31
            else if (M[i][j] == 0)
                color = 32
            else
                color = 30

            scanLine = scanLine + " " + colorizeString(M[i][j].toString(), color);
        }
        console.log(scanLine);
    }
    console.log("--------------------------");
}

// RED   = 31
// GREEN = 32
function colorizeString(text, color){
    return '\u001b[' + color + 'm' + text + '\u001b[0m';
}