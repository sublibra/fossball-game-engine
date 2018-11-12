const mysql = require('mysql');
const configuration = require('./config.js');
const fs = require('fs');
const enigma = require('enigma.js');
const schema = require('enigma.js/schemas/3.2.json');
const WebSocket = require('ws');

const mysqlConnectionSettings = {
  qType: 'jdbc', // the name we defined as a parameter to engine in our docker-compose.yml
  qName: 'jdbc',
  qConnectionString: `CUSTOM CONNECT TO "provider=jdbc;driver=mysql;host=${configuration.mysql_host};port=3306;database=${configuration.mysql_database}"`,
  qUserName: configuration.mysql_user,
  qPassword: configuration.mysql_password,
};

const script = fs.readFileSync('./coreapp/loadscript.qvs', 'UTF8');

let session;

const createApp = async () => {
  console.log(`ws://${configuration.engineUrl}/app/`);
  try {
    console.log('Creating app on engine.');
    session = enigma.create({
      schema,
      url: `ws://${configuration.engineUrl}/app/`,
      createSocket: url => new WebSocket(url),
    });
    const qix = await session.open();
    let app;
    //await qix.createApp(configuration.appName);
    app = await qix.openDoc(configuration.appName);
    console.log('Creating connection to database');
    //await app.createConnection(mysqlConnectionSettings);
    console.log('Set script', script);
    await app.setScript(script);
    console.log('Do reload');
    await app.doReload();
  } catch (err) {
    console.log('Unable to open session', err);
  }
}
  createApp();