async function load() {
    require('dotenv').config({path: '.env'});

    const {getDatabase} = require('./Classes/Database');
    const db = await getDatabase();
    db.connect();

    async function loadEnv() {
        const res = await db.singleRead('select * from cry_setting_application');

        for (const row of res) {
            process.env[row.settingKey] = row.settingValue;
        }
  }
};

module.exports = {
    load,
}