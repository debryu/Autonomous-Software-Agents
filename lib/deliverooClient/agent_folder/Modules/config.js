/*
CONFIGURATION FILE
-------------------------------------------------------------------------


Copy paste this commands in two different terminals to run the agents:

node mainframe.js AgentSmith_0 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhkZTYzMmJiNjYwIiwibmFtZSI6IkFnZW50U21pdGhfMCIsImlhdCI6MTY4NTk3NzExMn0.S9_nuZTVO5k6yQXyMNz4ia8YuJODnJJ8RqF36Mo56XE

node mainframe.js AgentSmith_2 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRlNjMyYmI2NjA0IiwibmFtZSI6IkFnZW50U21pdGhfMiIsImlhdCI6MTY4NTk3NzE3MX0.obnPhigqA-PDznKikl33TIuHdDYg4kvmrkQUIXH12KY

-------------------------------------------------------------------------
*/ 

const map_number = 2
// Only host is used in the code, token is not used 
let host = "https://deliveroojs" + map_number +".onrender.com/?name=";
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ2Njk5MDUxZGFiIiwibmFtZSI6IlNtaXRoIiwiaWF0IjoxNjg1NjA5NjUxfQ.ynsjBWLewl8tPgy6vZFrTPuen7tZurl-cA4uKE5dVR4';


export { host };
export { token };