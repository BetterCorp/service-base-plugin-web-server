export interface IWebServerConfig {
  host: string,
  http: boolean;
  httpPort: number;
  https: boolean;
  httpsPort: number;
  httpsCert: string | null;
  httpsKey: string | null;
  httpAndHttps: boolean;
  httpAutoRedirect: boolean;
}
export interface IWebServerInitPlugin {
  arg1: any;
  arg2?: any;
}