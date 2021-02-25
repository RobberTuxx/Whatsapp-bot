require('dotenv').config()
const fs = require('fs');
const { Client } = require('whatsapp-web.js');
const schedule = require('node-schedule');
var qrcode = require('qrcode-terminal');

const recipient = '5219512328188' //numero que va a recibir mensaje;
const scheduleTime = "30 51 21 * * *" //formato de shcedule https://www.npmjs.com/package/node-schedule;
let isReady = false;

const SESSION_FILE_PATH = './session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: {headless:true  }, session: sessionCfg });

client.initialize();

client.on('qr', (qr) => {
    qrcode.generate(qr)
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

// TODO: Add more messages
const goodDays = [
    'Buenos días, que tengas un día bonito:) ❤️',
];

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

client.on('ready', () => {
    console.log('Listo, esperando Scheduler');
    isReady = true;
   // client.getContacts().then(users => console.log('contactos: ', users))

});

/*
                                ┌───────────── segundo (0 - 59)
                                │ ┌───────────── minuto (0 - 59)
                                │ │ ┌───────────── hora (0 - 23)
                                │ │ │ ┌───────────── dia (1 - 31)
                                │ │ │ │ ┌───────────── mes (1 - 12)
                                │ │ │ │ │ ┌────────────── dia de la semana (0-7)
                                │ │ │ │ │ |
                                │ │ │ │ │ |                  */
//var j = schedule.scheduleJob('* * * * * *', () => {
var j = schedule.scheduleJob(scheduleTime, () => {

    if(!isReady){
        console.error("User not ready");
        process.exit(1);
    }

    let y = Math.round(getRandomArbitrary(0, goodDays.length));
    client.sendMessage(`${recipient}@c.us`,goodDays[y]).then((response)=>{
        if(response.id.fromMe){
            console.log("done");
        }
    });
});
