import { SecConfig } from "@bettercorp/service-base";

export enum IWebServerConfigServer {
  http = "http",
  https = "https",
  httpAndHttps = "dual",
}
export interface IWebServerConfig {
  host: string; // Host: 127.0.0.1/0.0.0 type host definition
  server: IWebServerConfigServer; // Server Type: HTTP/HTTPS or both
  httpPort: number; // HTTP Server Port: If using the HTTP server, the port to bind to
  httpToHttpsRedirect: boolean; // HTTP to HTTPS redirect: If you are using both HTTP and HTTPS, then we can automatically redirect HTTP to HTTPS
  httpsPort: number; // HTTPS Server Port: If using the HTTPS server, the port to bind to
  httpsCert: string | null; // HTTPS Cert File: The full path for the HTTP certificate file
  httpsKey: string | null; // HTTPS Cert Key File: The full path for the HTTP certificate key file
}

export class Config extends SecConfig<IWebServerConfig> {
  migrate(
    mappedPluginName: string,
    existingConfig: IWebServerConfig
  ): IWebServerConfig {
    return {
      host: existingConfig.host !== undefined ? existingConfig.host : "0.0.0.0",
      httpPort:
        existingConfig.httpPort !== undefined ? existingConfig.httpPort : 80,
      server:
        existingConfig.server !== undefined
          ? existingConfig.server
          : IWebServerConfigServer.http,
      httpToHttpsRedirect:
        existingConfig.httpToHttpsRedirect !== undefined
          ? existingConfig.httpToHttpsRedirect
          : true,
      httpsPort:
        existingConfig.httpsPort !== undefined ? existingConfig.httpsPort : 443,
      httpsCert:
        existingConfig.httpsCert !== undefined
          ? existingConfig.httpsCert
          : null,
      httpsKey:
        existingConfig.httpsKey !== undefined ? existingConfig.httpsKey : null,
    };
  }
}
