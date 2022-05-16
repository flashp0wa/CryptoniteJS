const winston = require('winston');

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
      winston.format.printf((info) => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`),
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
      winston.format.printf((info) => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`),
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
      winston.format.printf((info) => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`),
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
      winston.format.printf((info) => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`),
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
      winston.format.printf((info) => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`),
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
        label: `API🏷️`,
      }),
      winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss',
      }),
      winston.format.printf((info) => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`),
  ),
});


module.exports = {
  ApplicationLog,
  DatabaseLog,
  QueryProcessorLog,
  TraderLog,
  ApiLog,
  BncHistoryDownloadLog,
};
