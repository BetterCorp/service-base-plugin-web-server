import { IWebServerConfig, IWebServerConfigServer } from './lib';

export default (pluginName: string, existingPluginConfig: any): IWebServerConfig => {
  let newConfig: IWebServerConfig = {
    host: "0.0.0.0",
    httpPort: 80,
    server: IWebServerConfigServer.http,
    httpToHttpsRedirect: true,
    httpsPort: 443,
    httpsCert: null,
    httpsKey: null
  };
  return newConfig;
};