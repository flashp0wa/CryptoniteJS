const Transport = require('winston-transport');
const {getServerChannel} = require('./DiscordBot.js');


class Discord extends Transport {
  constructor(opts) {
    super(opts);
  }

  async log(info, callback) {
    function discordify(options) {
      let str;
      if (options.obj) {
        str = '\`\`\`yaml\n';
        str += options.message + '\n';
        str += '---------------------\n';
        for (const [key, value] of Object.entries(options.obj)) {
          str += `${key}: ${value}\n`;
        }
        str += '\`\`\`';
      } else if (options.level === 'error') {
        str = '\`\`\`diff\n' + '-';
        str += options.message + '\n' + '\`\`\`';
      } else {
        str = options.message;
      }
      return str;
    }

    setImmediate(async () => {
      if (process.env.CRYPTONITE_ENV !== 'Dev') {
        info.message = discordify({
          obj: info.obj,
          message: info.message,
          level: info.level,
        });
        switch (info.discord) {
          case 'gumiszoba':
            (await getServerChannel(process.env.DSCRD_CHNL_GUMISZOBA)).send(info.message);
            break;
          case 'successful-orders':
            (await getServerChannel(process.env.DSCRD_CHNL_SUCCESSFUL_ORDERS)).send(info.message);
            break;
          case 'failed-orders':
            (await getServerChannel(process.env.DSCRD_CHNL_FAILED_ORDERS)).send(info.message);
            break;
          case 'database-errors':
            (await getServerChannel(process.env.DSCRD_CHNL_DATABASE_ERRORS)).send(info.message);
            break;
          case 'application-errors':
            (await getServerChannel(process.env.DSCRD_CHNL_APPLICATION_ERRORS)).send(info.message);
            break;
          case 'strategy-events':
            (await getServerChannel(process.env.DSCRD_CHNL_STRATEGY_EVENTS)).send(info.message);
            break;
          case 'application-warnings':
            (await getServerChannel(process.env.DSCRD_CHNL_APPLICATION_WARNINGS)).send(info.message);
            break;
          default:
            break;
        }
      }
    });
    // Perform the writing to the remote service
    callback();
  }
};

module.exports = {
  Discord,
};
