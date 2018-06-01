// MIT License
//
// Copyright (c) 2018 Walter Kuppens
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

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
