
//input a string and a number (for the color) and output a string 
// that will be coloured in a console log.
export function colorizeString(text, color){
    // RED   = 31
    // GREEN = 32
    return '\u001b[' + color + 'm' + text + '\u001b[0m';
}