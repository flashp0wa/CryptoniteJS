const winston = require('winston');
const chalk = require('chalk');

const ApplicationLog = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '../Log',
    }),
  ],
  format: winston.format.combine(
      winston.format.label({
        label: `Application🏷️`,
      }),
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      winston.format.printf((info) => {
        if (info.level === 'info') {
          return `${chalk.green(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.green(info.message)}`;
        }
        if (info.level === 'error') {
          return `${chalk.red(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
        if (info.level === 'warn') {
          return `${chalk.yellow(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
      }),
  ),
});

const SupportResistanceCandleTreeLog = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '../Log/SupportResistanceCandleTree.log',
    }),
  ],
  format: winston.format.combine(
      winston.format.label({
        label: `SRCandleTree🏷️`,
      }),
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      winston.format.printf((info) => {
        if (info.level === 'info') {
          return `${chalk.green(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.green(info.message)}`;
        }
        if (info.level === 'error') {
          return `${chalk.red(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
        if (info.level === 'warn') {
          return `${chalk.yellow(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
      }),
  ),
});

const DatabaseLog = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'info',
    }),
    new winston.transports.File({
      filename: '../Log',
      level: 'info',
    }),
  ],
  format: winston.format.combine(
      winston.format.label({
        label: `Database🏷️`,
      }),
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      winston.format.printf((info) => {
        if (info.level === 'info') {
          return `${chalk.green(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.green(info.message)}`;
        }
        if (info.level === 'error') {
          return `${chalk.red(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
        if (info.level === 'warn') {
          return `${chalk.yellow(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
      }),
  ),
});

const QueryProcessorLog = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '../Log/QueryProcessor.log ',
    }),
  ],
  format: winston.format.combine(
      winston.format.label({
        label: `Query Processor🏷️`,
      }),
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      winston.format.printf((info) => {
        if (info.level === 'info') {
          return `${chalk.green(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.green(info.message)}`;
        }
        if (info.level === 'error') {
          return `${chalk.red(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
        if (info.level === 'warn') {
          return `${chalk.yellow(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
      }),
  ),
});

const TraderLog = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '../Log/TraderLog.log ',
    }),
  ],
  format: winston.format.combine(
      winston.format.label({
        label: `Trader🏷️`,
      }),
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      winston.format.printf((info) => {
        if (info.level === 'info') {
          return `${chalk.green(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.green(info.message)}`;
        }
        if (info.level === 'error') {
          return `${chalk.red(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
        if (info.level === 'warn') {
          return `${chalk.yellow(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
      }),
  ),
});
const ApiLog = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '../Log/TraderLog.log ',
    }),
  ],
  format: winston.format.combine(
      winston.format.label({
        label: `API🏷️`,
      }),
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      winston.format.printf((info) => {
        if (info.level === 'info') {
          return `${chalk.green(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.green(info.message)}`;
        }
        if (info.level === 'error') {
          return `${chalk.red(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
        if (info.level === 'warn') {
          return `${chalk.yellow(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
      }),
  ),
});
const BncHistoryDownloadLog = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '../Log/BncHistoryDownload.log ',
    }),
  ],
  format: winston.format.combine(
      winston.format.label({
        label: `BinanceDownload🏷️`,
      }),
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      winston.format.printf((info) => {
        if (info.level === 'info') {
          return `${chalk.green(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.green(info.message)}`;
        }
        if (info.level === 'error') {
          return `${chalk.red(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
        if (info.level === 'warn') {
          return `${chalk.yellow(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
      }),
  ),
});
const StrategyHandlerLog = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '../Log/StrategyHandler.log ',
    }),
  ],
  format: winston.format.combine(
      winston.format.label({
        label: `StrategyHandler🏷️`,
      }),
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      winston.format.printf((info) => {
        if (info.level === 'info') {
          return `${chalk.green(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.green(info.message)}`;
        }
        if (info.level === 'error') {
          return `${chalk.red(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
        if (info.level === 'warn') {
          return `${chalk.yellow(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
      }),
  ),
});
const DiscordApiLog = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: '../Log/DiscordApi.log ',
    }),
  ],
  format: winston.format.combine(
      winston.format.label({
        label: `DiscordAPI🏷️`,
      }),
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      winston.format.printf((info) => {
        if (info.level === 'info') {
          return `${chalk.green(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.green(info.message)}`;
        }
        if (info.level === 'error') {
          return `${chalk.red(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
        if (info.level === 'warn') {
          return `${chalk.yellow(info.level)}: ${chalk.magenta(info.label)}: ${chalk.yellow([info.timestamp])}: ${chalk.red(info.message)}`;
        }
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
