const winston = require('winston');
const chalk = require('chalk');

// const DiscordApiLog = winston.createLogger({
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({
//       filename: `${process.env.CRYPTONITE_ROOT}/Log/`,
//     }),
//   ],
//   format: winston.format.combine(
//       winston.format.label({
//         label: `DiscordAPI`,
//       }),
//       winston.format.timestamp({
//         format: 'YYYY-MM-DD HH:mm:ss.SSS',
//       }),
//       winston.format.printf((info) => {
//         if (info.level === 'info') {
//           return `${chalk.yellow([info.timestamp])} | ${chalk.green(info.level.replace(/^./, (str) => str.toUpperCase()))}  | ${chalk.magenta(info.label)} | ${chalk.green(info.message)} | ${chalk.blue(info.function)} | ${chalk.grey(info.file)}`;
//         }
//         if (info.level === 'error') {
//           return `${chalk.yellow([info.timestamp])} | ${chalk.red(info.level)} | ${chalk.magenta(info.label.replace(/^./, (str) => str.toUpperCase()))} | ${chalk.red(info.message)} | ${chalk.blue(info.function)} | ${chalk.grey(info.file)}`;
//         }
//         if (info.level === 'warn') {
//           return `${chalk.yellow([info.timestamp])} | ${chalk.yellow(info.level)}  | ${chalk.magenta(info.label.replace(/^./, (str) => str.toUpperCase()))} | ${chalk.red(info.message)} | ${chalk.blue(info.function)} | ${chalk.grey(info.file)}`;
//         }
//       }),
//   ),
// });

const DiscordApiLog = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.CRY_LOG_LEVEL,
      format: winston.format.combine(
          winston.format.printf((info) => {
            if (info.level === 'info') {
              return `${chalk.yellow([info.timestamp])} | ${chalk.green(info.level.replace(/^./, (str) => str.toUpperCase()))} | ${chalk.blue(info.senderFunction)} | ${chalk.grey(info.file)} | ${chalk.magenta(info.label)} | ${chalk.green(info.message)}`;
            }
            if (info.level === 'error') {
              return `${chalk.yellow([info.timestamp])} | ${chalk.red(info.level.replace(/^./, (str) => str.toUpperCase()))} | ${chalk.blue(info.senderFunction)} | ${chalk.grey(info.file)} | ${chalk.magenta(info.label)} | ${chalk.red(info.message)}`;
            }
            if (info.level === 'warn') {
              return `${chalk.yellow([info.timestamp])} | ${chalk.yellow(info.level.replace(/^./, (str) => str.toUpperCase()))} | ${chalk.blue(info.senderFunction)} | ${chalk.grey(info.file)} | ${chalk.magenta(info.label)} | ${chalk.red(info.message)}`;
            }
          }),
      ),
    }),
    new winston.transports.File({
      filename: `${process.env.CRYPTONITE_ROOT}/Log/DiscordApi.log`,
      format: winston.format.json(),
    }),
  ], format: winston.format.combine(
      winston.format.label({
        label: 'DiscordAPI',
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
  ),
});

module.exports = {
  DiscordApiLog,
};
