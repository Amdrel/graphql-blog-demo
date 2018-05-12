import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as yaml from 'js-yaml';
import { Environment } from './utils';

/**
 * Reads the config file (yaml) and returns its contents as an object.
 */
function readFullConfig(): any {
  const configPath = path.join(process.cwd(), './config/config.yaml');
  const configContent = fs.readFileSync(configPath, 'utf-8');

  const config = yaml.safeLoad(configContent);
  if (config == null) {
    throw new Error(`Unable to parse yaml config file.`);
  }

  return config;
}

/**
 * Reads the config file (yaml) and returns its contents as an object. Unlike
 * readFullConfig, this function returns only the config relevant to the
 * deployment environment.
 */
function readConfig(): any {
  const config = readFullConfig();

  // Makes sure the top-level key for the current environment exists as multiple
  // environment configs can be stored in the same file.
  //
  // Ideally there would only be one key in a production setup, but it's nice
  // being able to use the same config for both integration testing and manual
  // testing during development.
  const env = Environment.getDeploymentEnv();
  if (!(env in config)) {
    throw new Error(`Unable to find config for chosen environment: '${env}'.`);
  }

  return (config as any)[env];
}

const config = readConfig();
export = config;
