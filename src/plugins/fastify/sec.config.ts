import { IWebServerConfig, IWebServerConfigServer } from './lib';

export default (pluginName: string, existingPluginConfig: any): IWebServerConfig => {
  let newConfig: IWebServerConfig = {
    host: "0.0.0.0",
    httpPort: 80,
    server: IWebServerConfigServer.http,
    httpToHttpsRedirect: true,
    httpsPort: 443,
    httpsCert: null,
    httpsKey: null,
    //http2: true
    cors: {
      enabled: false,
      options: {
        origin: true,
        allowedHeaders: 'content-type',
        methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        credentials: false,
        maxAge: 13000,
        preflightContinue: false,
        optionsSuccessStatus: 200,
        preflight: true,
        strictPreflight: false
      }
    },
    rateLimit: {
      enabled: false,
      options: {
        max: 500,
        timeWindow: '15 minute'
      }
    }
  };
  return newConfig;
};