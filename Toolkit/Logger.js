const winston = require('winston');
const chalk = require('chalk');
const {Discord} = require('../DiscordAPI/DiscordWinstonTransport');

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
    info.message = `${chalk.yellow([info.timestamp])} | ${chalk.yellow(info.level.replace(/^./, (str) => str.toUpperCase()))} | ${chalk.blue(info.senderFunction)} | ${chalk.grey(info.file)} | ${chalk.magenta(info.label)} | ${chalk.red(info.message)}`;
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
    new winston.transports.File({
      filename: `${process.env.CRYPTONITE_ROOT}/Log/Application.log`,
      format: winston.format.json(),
    }),
    new Discord({format: discordFilter()}),
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
    new winston.transports.File({
      filename: `${process.env.CRYPTONITE_ROOT}/Log/Trader.log`,
      format: winston.format.json(),
    }),
    new Discord({format: discordFilter()}),
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
    new winston.transports.File({
      filename: `${process.env.CRYPTONITE_ROOT}/Log/SupportResistanceCandleTreeLog.log`,
      format: winston.format.json(),
    }),
    new Discord({format: discordFilter()}),
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
    new winston.transports.File({
      filename: `${process.env.CRYPTONITE_ROOT}/Log/Database.log`,
      format: winston.format.json(),
    }),
    new Discord({format: discordFilter()}),
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
    new winston.transports.File({
      filename: `${process.env.CRYPTONITE_ROOT}/Log/QueryProcessorLog.log`,
      format: winston.format.json(),
    }),
    new Discord({format: discordFilter()}),
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
    new winston.transports.File({
      filename: `${process.env.CRYPTONITE_ROOT}/Log/Api.log`,
      format: winston.format.json(),
    }),
    new Discord({format: discordFilter()}),
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
    new winston.transports.File({
      filename: `${process.env.CRYPTONITE_ROOT}/Log/StrategyHandler.log`,
      format: winston.format.json(),
    }),
    new Discord({format: discordFilter()}),
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
    new winston.transports.File({
      filename: `${process.env.CRYPTONITE_ROOT}/Log/DiscordApi.log`,
      format: winston.format.json(),
    }),
    new Discord({format: discordFilter()}),
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
