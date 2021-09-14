import {
  FastifyInstance, RequestGenericInterface, RequestHeadersDefault,
  RequestParamsDefault, RequestQuerystringDefault
} from 'fastify';

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
  //http2: boolean;
}
export interface IWebServerInitPlugin {
  arg1: any;
  arg2?: any;
}
export interface IWebServerListenerHelper {
  server: FastifyInstance;
  type: string;
}
export interface FastifyRequestInterface<
  Body = any,
  Params = RequestParamsDefault,
  Querystring = RequestQuerystringDefault,
  Headers = RequestHeadersDefault
  > extends RequestGenericInterface {
  Body?: Body;
  Querystring?: Querystring;
  Params?: Params;
  Headers?: Headers;
}