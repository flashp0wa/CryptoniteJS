'use strict';
require('dotenv').config({path: './'});

async function load() {

    const {getDatabase} = require('./Classes/Database');
    const db = await getDatabase();
    db.connect();
    
    console.log(`${process.env.DB_USER}`);
    
    const res = await db.singleRead('select * from cry_setting_application');

    for (const row of res) {
        process.env[row.settingKey] = row.settingValue;
        console.log(`${row.settingKey} = ${row.settingValue}`);
    }


};

module.exports = {
    load,
}