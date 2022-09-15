import {
  FastifyInstance, RequestGenericInterface,
  RequestParamsDefault, RequestQuerystringDefault
} from 'fastify';
import { FastifyCorsOptions } from '@fastify/cors';
import { RateLimitOptions } from '@fastify/rate-limit';
import { IncomingHttpHeaders } from 'http';

export interface FastifyHeadersWithIP extends IncomingHttpHeaders {
  ip: string;
}

export enum IWebServerConfigServer {
  http = "http",
  https = "https",
  httpAndHttps = "dual",
}
export interface FastifyCors {
  enabled: boolean;
  options: FastifyCorsOptions;
}
export interface FastifyRateLimit {
  enabled: boolean;
  options: RateLimitOptions;
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
  cors: FastifyCors;
  rateLimit: FastifyRateLimit;
  ipRewrite: boolean;
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
  Headers = FastifyHeadersWithIP
  > extends RequestGenericInterface {
  Body?: Body;
  Querystring?: Querystring;
  Params?: Params;
  Headers?: Headers;
}