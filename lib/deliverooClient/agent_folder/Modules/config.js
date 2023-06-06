/*

node mainframe.js AgentSmith_0 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhkZTYzMmJiNjYwIiwibmFtZSI6IkFnZW50U21pdGhfMCIsImlhdCI6MTY4NTk3NzExMn0.S9_nuZTVO5k6yQXyMNz4ia8YuJODnJJ8RqF36Mo56XE
node mainframe.js AgentSmith_2 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRlNjMyYmI2NjA0IiwibmFtZSI6IkFnZW50U21pdGhfMiIsImlhdCI6MTY4NTk3NzE3MX0.obnPhigqA-PDznKikl33TIuHdDYg4kvmrkQUIXH12KY


*/ 



// valid locally
let host = "https://deliveroojs.onrender.com/?name=";
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ2Njk5MDUxZGFiIiwibmFtZSI6IlNtaXRoIiwiaWF0IjoxNjg1NjA5NjUxfQ.ynsjBWLewl8tPgy6vZFrTPuen7tZurl-cA4uKE5dVR4';


export { host };
export { token };



/*
import readline from 'readline';

let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let serv = '';
export let host = '';
export let token = '';


export function serverSetup(){
    rl.question("Online (y/n)? ", function(answer) {
    serv = answer;
    if (serv == 'n') {
        host = 'http://localhost:8080';
        token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRhYTAwNjYzZTVhIiwibmFtZSI6IlRoZSBCb3NzIiwiaWF0IjoxNjgwNjIzMzkxfQ.lbw2gSvm8bHSnoUFed0V6OQySNTnEim7S5Rk4ajAsMA';
        //console.log(`host: ${host}, token: ${token}`);
        rl.close();
    } else {
        rl.question('Deliveroojs server number (1,2,3,4): ', function(answer) {
        serv = answer;
        if (serv == 1) {
            serv = '';
        }
        host = `https://deliveroojs${serv}.onrender.com`;
        rl.question('Enter token: ', function(answer) {
            token = answer;
            //console.log(`host: ${host}, token: ${token}`);
            rl.close();
        });
        });
    }
    });
}
*/