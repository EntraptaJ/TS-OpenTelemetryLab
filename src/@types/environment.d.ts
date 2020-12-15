declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPNSENSE_KEY: string;

      OPNSENSE_SECRET: string;

      /**
       * Hostname to access OPNSense
       */
      OPNSENSE_URL: string;

      NODE_ENV: 'development' | 'production';
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
