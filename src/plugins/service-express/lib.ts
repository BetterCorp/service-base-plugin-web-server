import { Express } from 'express';

export enum IWebServerConfigServer {
  http = "http",
  https = "https",
  httpAndHttps = "dual",
}
export interface IWebServerConfig {
  host: string,
  server: IWebServerConfigServer;
  httpPort: number;
  httpToHttpsRedirect: boolean;
  httpsPort: number;
  httpsCert: string | null;
  httpsKey: string | null;
}
export interface IWebServerInitPlugin {
  arg1: any;
  arg2?: any;
}
export interface IWebServerListenerHelper {
  server: Express;
  type: string;
}