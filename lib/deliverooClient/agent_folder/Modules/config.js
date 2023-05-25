
// valid locally

//let host = "http://localhost:8080";
//let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRhYTAwNjYzZTVhIiwibmFtZSI6IlRoZSBCb3NzIiwiaWF0IjoxNjgwNjIzMzkxfQ.lbw2gSvm8bHSnoUFed0V6OQySNTnEim7S5Rk4ajAsMA'
//let host = "http://localhost:8080";
//let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRhYTAwNjYzZTVhIiwibmFtZSI6IlRoZSBCb3NzIiwiaWF0IjoxNjgwNjIzMzkxfQ.lbw2gSvm8bHSnoUFed0V6OQySNTnEim7S5Rk4ajAsMA'

///*
//let host = "https://deliveroojs2.onrender.com";
//let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI1NTQyOWM4OTUxIiwibmFtZSI6Indhc2QiLCJpYXQiOjE2ODQ5MTYyODN9.8fcqL7G_-ODJKZY2qmbzoiX9wuvJNLAeVQkNhHt4up0'
//*/
//let host = 'https://deliveroojs.onrender.com';
//let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImQ5MWEyNDRlZWMzIiwibmFtZSI6ImFzZCIsImlhdCI6MTY4NDgzNzA0Nn0.OFCzwduYY8zP-86vsriD6eCmbV5omNf61Oj1OBArSa4'
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhlZGE0NTQzOGJmIiwibmFtZSI6ImxvbCIsImlhdCI6MTY4NDkyMDI2MH0._HoMHFoWzKlbxnMyw9j_dFJfBirg2nsZfsU8o_0wH5c
let host = "https://deliveroojs2.onrender.com";
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhlZGE0NTQzOGJmIiwibmFtZSI6ImxvbCIsImlhdCI6MTY4NDkyMDI2MH0._HoMHFoWzKlbxnMyw9j_dFJfBirg2nsZfsU8o_0wH5c'


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