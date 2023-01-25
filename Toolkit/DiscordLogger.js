const winston = require('winston');
const chalk = require('chalk');
require('winston-daily-rotate-file');

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
              return `${chalk.yellow([info.timestamp])} | ${chalk.yellowBright(info.level.replace(/^./, (str) => str.toUpperCase()))} | ${chalk.blue(info.senderFunction)} | ${chalk.grey(info.file)} | ${chalk.magenta(info.label)} | ${chalk.yellowBright(info.message)}`;
            }
          }),
      ),
    }),
    new winston.transports.DailyRotateFile({
      filename: `./Log/DiscordApi-%DATE%.log`,
      datePattern: 'YYYY',
      maxSize: '20m',
      maxFiles: '14d',
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
