// @flow

import split from 'split2';
import prettyjson from 'prettyjson';
import type {
  MessageType,
} from 'roarr';
import {
  formatInvalidInputMessage,
  isRoarrLine,
} from '../utilities';
import type {
  LogFormatterConfigurationType,
} from '../types';

/* eslint-disable quote-props */
const logLevels = {
  '10': 'TRACE',
  '20': 'DEBUG',
  '30': 'INFO',
  '40': 'WARN',
  '50': 'ERROR',
  '60': 'FATAL',
};
/* eslint-enable */

export default (configuration: LogFormatterConfigurationType) => {
  const chalk = configuration.chalk;

  const logLevelColorMap = {
    DEBUG: chalk.gray,
    ERROR: chalk.red,
    FATAL: chalk.red,
    INFO: chalk.cyan,
    TRACE: chalk.gray,
    WARN: chalk.yellow,
  };

  const getLogLevelName = (logLevel: number): string => {
    return logLevels[logLevel] || 'INFO';
  };

  const formatMessage = (message: MessageType): string => {
    let formattedMessage = '';

    formattedMessage = '[' + new Date(message.time).toISOString() + ']';

    if (message.context.logLevel && typeof message.context.logLevel === 'number') {
      const logLevelName = getLogLevelName(message.context.logLevel);

      const logLevelColorName = logLevelColorMap[logLevelName];

      if (!logLevelColorName) {
        throw new Error('Unexpected state.');
      }

      formattedMessage += ' ' + logLevelColorName(logLevelName + ' (' + String(message.context.logLevel) + ')');
    }

    if (message.context.package) {
      formattedMessage += ' (@' + String(message.context.package) + ')';
    }

    if (message.context.namespace) {
      formattedMessage += ' (#' + String(message.context.namespace) + ')';
    }

    formattedMessage += ': ' + message.message + '\n';

    if (message.context) {
      /* eslint-disable no-unused-vars */
      const {
        application: termporary0,
        hostname: termporary1,
        instanceId: termporary2,
        logLevel: termporary3,
        namespace: termporary4,
        package: termporary5,
        package: termporary6,
        ...rest
      } = message.context;

      /* eslint-enable */

      if (Object.keys(rest).length) {
        // eslint-disable-next-line no-console
        formattedMessage += prettyjson.render(rest, {
          noColor: !configuration.useColors,
        }) + '\n\n';
      }
    }

    return formattedMessage;
  };

  return split((line) => {
    if (!isRoarrLine(line)) {
      return line + '\n';
    }

    try {
      return formatMessage(JSON.parse(line));
    } catch (error) {
      return formatInvalidInputMessage(chalk, error, line);
    }
  });
};
