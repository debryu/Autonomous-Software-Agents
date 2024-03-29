The authors are **Nicola Debole** and **Mateo Rodriguez**.
This work is the project for the **Autonomous Software Agents** course at the **University of Trento**. 

# Usage

First clone the repository 
```bash
git clone https://github.com/debryu/Autonomous-Software-Agents.git
```
Then move inside the folder and run
```bash
npm install
```
find the file  ```mainframe.js``` located in ```lib/deliverooClient/agent_folder/mainframe.js```
and in the same path from the terminal run
```bash
node mainframe.js "CHOOSE A NAME FOR THE AGENT" "TOKEN"
```

**Example** you can run separately this two commands:
```bash
node mainframe.js AgentSmith_0 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjhkZTYzMmJiNjYwIiwibmFtZSI6IkFnZW50U21pdGhfMCIsImlhdCI6MTY4NTk3NzExMn0.S9_nuZTVO5k6yQXyMNz4ia8YuJODnJJ8RqF36Mo56XE
```

```bash

node mainframe.js AgentSmith_2 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRlNjMyYmI2NjA0IiwibmFtZSI6IkFnZW50U21pdGhfMiIsImlhdCI6MTY4NTk3NzE3MX0.obnPhigqA-PDznKikl33TIuHdDYg4kvmrkQUIXH12KY
```
---

The token can be retrieved by connecting to https://deliveroojs.onrender.com/ and filling with the name of the agent when asked. 

You need to run two different agents otherwise the first one will just wait endlessly for the other.

# Flowchart
A flowchart of a simplified version of our code to better understand it at first glance.
![Basic flowchart](flowchart.png)

# Features
- Ant Colony Optimization (ACO)
- PDDL
- Beliefs-Desire-Intention (BDI)
