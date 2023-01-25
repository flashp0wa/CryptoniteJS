const winston = require('winston');
const chalk = require('chalk');
const {Discord} = require('../DiscordAPI/DiscordWinstonTransport');
require('winston-daily-rotate-file');

const pretty = winston.format((info) => {
  if (info.level === 'info') {
    info.message = `${chalk.yellow([info.timestamp])} | ${chalk.green(info.level.replace(/^./, (str) => str.toUpperCase()))} | ${chalk.blue(info.senderFunction)} | ${chalk.grey(info.file)} | ${chalk.magenta(info.label)} | ${chalk.green(info.message)}`;
    return info;
  }
  if (info.level === 'error') {
    info.message = `${chalk.yellow([info.timestamp])} | ${chalk.red(info.level.replace(/^./, (str) => str.toUpperCase()))} | ${chalk.blue(info.senderFunction)} | ${chalk.grey(info.file)} | ${chalk.magenta(info.label)} | ${chalk.red(info.message)}`;
    return info;
  }
  if (info.level === 'warn') {
    info.message = `${chalk.yellow([info.timestamp])} | ${chalk.yellowBright(info.level.replace(/^./, (str) => str.toUpperCase()))} | ${chalk.blue(info.senderFunction)} | ${chalk.grey(info.file)} | ${chalk.magenta(info.label)} | ${chalk.yellowBright(info.message)}`;
    return info;
  }
});
const discordFilter = winston.format((info) => {
  return info.discord ? info : false;
});
const ApplicationLog = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.CRY_LOG_LEVEL,
      format: winston.format.combine(
          pretty(),
          winston.format.printf((info) => {
            return info.message;
          }),
      ),
    }),
    new Discord({format: discordFilter()}),
    new winston.transports.DailyRotateFile({
      filename: `./Log/Application-%DATE%.log`,
      datePattern: 'YYYY',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.json(),
    }),
  ], format: winston.format.combine(
      winston.format.label({
        label: 'Application',
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
  ),
});
const TraderLog = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.CRY_LOG_LEVEL,
      format: winston.format.combine(
          pretty(),
          winston.format.printf((info) => {
            return info.message;
          }),
      ),
    }),
    new Discord({format: discordFilter()}),
    new winston.transports.DailyRotateFile({
      filename: `./Log/Trader-%DATE%.log`,
      datePattern: 'YYYY',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.json(),
    }),
  ], format: winston.format.combine(
      winston.format.label({
        label: 'Trader',
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
  ),
});
const SupportResistanceCandleTreeLog = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.CRY_LOG_LEVEL,
      format: winston.format.combine(
          pretty(),
          winston.format.printf((info) => {
            return info.message;
          }),
      ),
    }),
    new Discord({format: discordFilter()}),
    new winston.transports.DailyRotateFile({
      filename: `./Log/SupportResistanceCandleTreeLog-%DATE%.log`,
      datePattern: 'YYYY',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.json(),
    }),
  ], format: winston.format.combine(
      winston.format.label({
        label: 'SupportResistanceCandleTreeLog',
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
  ),
});
const DatabaseLog = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.CRY_LOG_LEVEL,
      format: winston.format.combine(
          pretty(),
          winston.format.printf((info) => {
            return info.message;
          }),
      ),
    }),
    new Discord({format: discordFilter()}),
    new winston.transports.DailyRotateFile({
      filename: `./Log/Database-%DATE%.log`,
      datePattern: 'YYYY',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.json(),
    }),
  ], format: winston.format.combine(
      winston.format.label({
        label: 'Database',
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
  ),
});
const QueryProcessorLog = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.CRY_LOG_LEVEL,
      format: winston.format.combine(
          pretty(),
          winston.format.printf((info) => {
            return info.message;
          }),
      ),
    }),
    new Discord({format: discordFilter()}),
    new winston.transports.DailyRotateFile({
      filename: `./Log/QueryProcessorLog-%DATE%.log`,
      datePattern: 'YYYY',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.json(),
    }),
  ], format: winston.format.combine(
      winston.format.label({
        label: 'QueryProcessorLog',
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
  ),
});
const ApiLog = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.CRY_LOG_LEVEL,
      format: winston.format.combine(
          pretty(),
          winston.format.printf((info) => {
            return info.message;
          }),
      ),
    }),
    new Discord({format: discordFilter()}),
    new winston.transports.DailyRotateFile({
      filename: `./Log/Api-%DATE%.log`,
      datePattern: 'YYYY',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.json(),
    }),
  ], format: winston.format.combine(
      winston.format.label({
        label: 'Api',
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
  ),
});
const BncHistoryDownloadLog = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.CRY_LOG_LEVEL,
      format: winston.format.combine(
          pretty(),
          winston.format.printf((info) => {
            return info.message;
          }),
      ),
    }),
    new Discord({format: discordFilter()}),
  ], format: winston.format.combine(
      winston.format.label({
        label: 'BinanceDownload',
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
  ),
});
const StrategyHandlerLog = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.CRY_LOG_LEVEL,
      format: winston.format.combine(
          pretty(),
          winston.format.printf((info) => {
            return info.message;
          }),
      ),
    }),
    new Discord({format: discordFilter()}),
    new winston.transports.DailyRotateFile({
      filename: `./Log/StrategyHandler-%DATE%.log`,
      datePattern: 'YYYY',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.json(),
    }),
  ], format: winston.format.combine(
      winston.format.label({
        label: 'StrategyHandler',
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
  ),
});
const DiscordApiLog = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: process.env.CRY_LOG_LEVEL,
      format: winston.format.combine(
          pretty(),
          winston.format.printf((info) => {
            return info.message;
          }),
      ),
    }),
    new Discord({format: discordFilter()}),
    new winston.transports.DailyRotateFile({
      filename: `./Log/DiscordApi-%DATE%.log`,
      datePattern: 'YYYY',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.json(),
    }),
  ], format: winston.format.combine(
      winston.format.label({
        label: 'DiscordApi',
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
  ),
});

module.exports = {
  ApplicationLog,
  DatabaseLog,
  QueryProcessorLog,
  TraderLog,
  ApiLog,
  SupportResistanceCandleTreeLog,
  BncHistoryDownloadLog,
  StrategyHandlerLog,
  DiscordApiLog,
};
