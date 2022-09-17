import {
  FastifyInstance, RequestGenericInterface,
  RequestParamsDefault, RequestQuerystringDefault
} from 'fastify';
import { IncomingHttpHeaders } from 'http';

export interface FastifyHeadersWithIP extends IncomingHttpHeaders {
  ip: string;
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