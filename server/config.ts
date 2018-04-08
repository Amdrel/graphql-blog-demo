import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Environment } from './utils';

function readConfig(): any {
  const configPath = path.join(__dirname, '../../config/config.yaml');
  const configContent = fs.readFileSync(configPath, 'utf-8');

  const config = yaml.safeLoad(configContent);
  if (config == null) {
    throw new Error(`Unable to parse yaml config file.`);
  }

  const env = Environment.getDeploymentEnv();
  if (env == null || !(env in config)) {
    throw new Error(`Unable to find config for chosen environment: '${env}'.`);
  }

  return (config as any)[env];
}

const config = readConfig();
export = config;
