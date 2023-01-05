const Transport = require('winston-transport');
const fs = require('fs');


class PowershellTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.filename = opts.filename;
  }

  async log(info, callback) {
    info = {...info};
    setImmediate(async () => {
      const date = info.timestamp.split(' ')[0];
      const time = info.timestamp.split(' ')[1];
      let severity;
      switch (info.level) {
        case 'info':
          severity = 1;
          break;
        case 'warn':
          severity = 2;
          break;
        case 'error':
          severity = 3;
          break;

        default:
          severity = 1;
          break;
      }
      const message = info.message;
      const component = info.label;
      const context = info.function;
      const file = info.file;

      info.message =`<![LOG[${message}]LOG]!><time=\"${time}\" date=\"${date}\" component=\"${component}\" context=\"${context}\" type=\"${severity}\" file=\"${file}\"`;

      try {
        fs.writeFileSync(this.filename, info.message);
      } catch (err) {
        console.error(err);
      }
      // return info;
    });

    // Perform the writing to the remote service
    callback();
  }
};

module.exports = {
  PowershellTransport,
};
