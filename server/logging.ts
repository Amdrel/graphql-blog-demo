import { Environment } from './utils';
import { Logger, transports } from 'winston';

let selectedTransports;

if (Environment.getDeploymentEnv() === Environment.DeploymentEnv.Testing) {
  selectedTransports = [
    new transports.Console({ name: 'error-console', level: 'error' }),
  ];
} else {
  selectedTransports = [
    new transports.Console({ name: 'error-console', level: 'error' }),
    new transports.Console({ name: 'info-console', level: 'info' }),
  ];
}

const logger = new Logger({
  level: 'info',
  transports: selectedTransports,
});

export { logger };
