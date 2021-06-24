require('dotenv').config()
const fs = require('fs');
const {Client} = require('whatsapp-web.js');
const schedule = require('node-schedule');
const codigoQr = require('qrcode-terminal');

const receptor = process.env.TELEFONO //numero que va a recibir mensaje;
const formatoCron = process.env.CRON //formato de schedule https://www.npmjs.com/package/node-schedule;
let botListo = false;

const SESION = './session.json';
let sesionCfg;

if (fs.existsSync(SESION)) {
    sesionCfg = require(SESION);
}

const cliente = new Client({puppeteer: {headless: true}, session: sesionCfg});

cliente.initialize();

cliente.on('qr', (qr) => {
    codigoQr.generate(qr)
});

cliente.on('authenticated', (sesion) => {
    sesionCfg = sesion;
    fs.writeFile(SESION, JSON.stringify(sesion), function (error) {
        if (error) {
            console.error(error);
        }
    });
});

cliente.on('auth_failure', msg => {
    console.error('Autenticacion fallida :(', msg);
});

const listaMensajes = [
    'Buenos días, que tengas un bonito día :) ❤️',
    'Buenos días 🤠️',
    'Buenos días 🔥️',
    'Hola buen dia 😃️',
];

function getRandomArbitrary(minimo, maximo) {
    return Math.random() * (maximo - minimo) + minimo;
}

cliente.on('ready', () => {
    console.log('Conexion lista!');
    botListo = true;
    // client.getContacts().then(contactos => console.log('contactos: ', contactos))
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
//const cron = schedule.scheduleJob('* * * * * *', () => {
const cron = schedule.scheduleJob(formatoCron, () => {
    if (!botListo) {
        console.error("El usuario no esta listo");
        process.exit(1);
    }

    const random = Math.round(getRandomArbitrary(0, listaMensajes.length));
    cliente.sendMessage(`${receptor}@c.us`, listaMensajes[random]).then((response) => {
        if (response.id.fromMe) {
            console.log("Mensaje enviado :D");
        }
    });
});
