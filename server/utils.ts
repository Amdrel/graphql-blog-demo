/**
 * Enumeration of all supported deployment environments.
 */
export enum DeploymentEnv {
  Development,
  Testing,
  QA,
  Production,
}

/**
 * Reads the 'NODE_ENV' environment variable to determine what the current
 * deployment environment is.
 *
 * Certain features may be disabled under certain environments by using the
 * value returned by this function.
 */
export function getDeploymentEnv(): DeploymentEnv {
  const env: string = (process.env.NODE_ENV || '').toLowerCase();

  if (env === '' || env === 'development') {
    return DeploymentEnv.Development;
  } else if (env === 'testing') {
    return DeploymentEnv.Testing;
  } else if (env === 'qa') {
    return DeploymentEnv.QA;
  } else if (env === 'production') {
    return DeploymentEnv.Production;
  }

  throw new Error(`Unsupported NODE_ENV specified.`);
}
