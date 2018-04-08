export namespace Environment {
  /**
   * Enumeration of all supported deployment environments.
   */
  export enum DeploymentEnv {
    Development = 'development',
    Testing = 'testing',
    QA = 'qa',
    Production = 'production',
  }

  /**
   * Reads the 'NODE_ENV' environment variable to determine what the current
   * deployment environment is.
   *
   * Certain features may be disabled under certain environments by using the
   * value returned by this function.
   *
   * If no environment is specified, it will be set to 'development'.
   */
  export function getDeploymentEnv(): DeploymentEnv {
    const env: string = (process.env.NODE_ENV || '').toLowerCase();

    if (env === '') {
      return DeploymentEnv.Development;
    }

    if (env === DeploymentEnv.Development) {
      return DeploymentEnv.Development;
    } else if (env === DeploymentEnv.Testing) {
      return DeploymentEnv.Testing;
    } else if (env === DeploymentEnv.QA) {
      return DeploymentEnv.QA;
    } else if (env === DeploymentEnv.Production) {
      return DeploymentEnv.Production;
    }

    throw new Error(`Unsupported NODE_ENV specified.`);
  }
}
