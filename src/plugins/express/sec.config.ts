import { IWebServerConfig } from './config';

export default (pluginName: string, existingPluginConfig: any): IWebServerConfig => {
  let newConfig: IWebServerConfig = {
    host: "0.0.0.0",
    http: true,
    httpPort: (existingPluginConfig || {}).port || 80,
    https: false,
    httpsPort: 443,
    httpsCert: null,
    httpsKey: null,
    httpAndHttps: false,
    httpAutoRedirect: true
  };
  return newConfig;
};