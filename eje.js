const { spawn }= require('child_process');
const process = spawn('bash');

process.stdin.end('cd .. && ls');

process.stdout.on('data', (data)=> {
    console.log(data.toString());
})

process.stderr.on('data', (data)=> {
    console.log(data.toString());
})

process.on('close', (data)=> {
    console.log(data);
})