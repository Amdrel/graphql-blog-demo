const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Reads the config file (yaml) and returns its contents as an object. This is
 * copied from config.ts so that module can continue to return the config as
 * the default object.
 */
function readFullConfig() {
  const configPath = path.join(__dirname, './config/config.yaml');
  const configContent = fs.readFileSync(configPath, 'utf-8');

  const config = yaml.safeLoad(configContent);
  if (config == null) {
    throw new Error(`Unable to parse yaml config file.`);
  }

  return config;
}

const config = readFullConfig();
const connectionConfigs = {};

if ('development' in config) {
  connectionConfigs.development = config.development.knex;
}
if ('testing' in config) {
  connectionConfigs.testing = config.testing.knex;
}
if ('staging' in config) {
  connectionConfigs.staging = config.staging.knex;
}
if ('production' in config) {
  connectionConfigs.production = config.production.knex;
}

module.exports = connectionConfigs;
