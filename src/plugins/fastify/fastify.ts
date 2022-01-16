import { CPluginClient } from '@bettercorp/service-base/lib/interfaces/plugins';
import {
  ContextConfigDefault, FastifyInstance, FastifyPluginAsync,
  FastifyPluginCallback, FastifyPluginOptions, FastifyRegisterOptions,
  RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerBase,
  RequestParamsDefault,
  RequestQuerystringDefault, RouteHandlerMethod
} from 'fastify';
import { FastifyHeadersWithIP, FastifyRequestInterface, IWebServerConfig } from './lib';

export class fastify extends CPluginClient<IWebServerConfig> {
  public readonly _pluginName: string = "fastify";

  async getServerInstance(): Promise<FastifyInstance> {
    return await this.initForPlugins<any, FastifyInstance>('getServerInstance');
  }
  async all<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(path: string, handler: RouteHandlerMethod<
    RawServerBase,
    RawRequestDefaultExpression<RawServerBase>,
    RawReplyDefaultExpression<RawServerBase>,
    FastifyRequestInterface<Body, Params, Querystring, Headers>,
    ContextConfigDefault>
  ): Promise<void> {
    await this.initForPlugins<any>('all', path, handler);
  };
  async get<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(path: string, handler: RouteHandlerMethod<
    RawServerBase,
    RawRequestDefaultExpression<RawServerBase>,
    RawReplyDefaultExpression<RawServerBase>,
    FastifyRequestInterface<Body, Params, Querystring, Headers>,
    ContextConfigDefault>
  ): Promise<void> {
    await this.initForPlugins<any>('get', path, handler);
  };
  async post<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(path: string, handler: RouteHandlerMethod<
    RawServerBase,
    RawRequestDefaultExpression<RawServerBase>,
    RawReplyDefaultExpression<RawServerBase>,
    FastifyRequestInterface<Body, Params, Querystring, Headers>,
    ContextConfigDefault>
  ): Promise<void> {
    await this.initForPlugins<any>('post', path, handler);
  };
  async put<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(path: string, handler: RouteHandlerMethod<
    RawServerBase,
    RawRequestDefaultExpression<RawServerBase>,
    RawReplyDefaultExpression<RawServerBase>,
    FastifyRequestInterface<Body, Params, Querystring, Headers>,
    ContextConfigDefault>
  ): Promise<void> {
    await this.initForPlugins<any>('put', path, handler);
  };
  async delete<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(path: string, handler: RouteHandlerMethod<
    RawServerBase,
    RawRequestDefaultExpression<RawServerBase>,
    RawReplyDefaultExpression<RawServerBase>,
    FastifyRequestInterface<Body, Params, Querystring, Headers>,
    ContextConfigDefault>
  ): Promise<void> {
    await this.initForPlugins<any>('delete', path, handler);
  };
  async patch<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(path: string, handler: RouteHandlerMethod<
    RawServerBase,
    RawRequestDefaultExpression<RawServerBase>,
    RawReplyDefaultExpression<RawServerBase>,
    FastifyRequestInterface<Body, Params, Querystring, Headers>,
    ContextConfigDefault>
  ): Promise<void> {
    await this.initForPlugins<any>('patch', path, handler);
  };
  async options<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(path: string, handler: RouteHandlerMethod<
    RawServerBase,
    RawRequestDefaultExpression<RawServerBase>,
    RawReplyDefaultExpression<RawServerBase>,
    FastifyRequestInterface<Body, Params, Querystring, Headers>,
    ContextConfigDefault>
  ): Promise<void> {
    await this.initForPlugins<any>('options', path, handler);
  };
  async head<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(path: string, handler: RouteHandlerMethod<
    RawServerBase,
    RawRequestDefaultExpression<RawServerBase>,
    RawReplyDefaultExpression<RawServerBase>,
    FastifyRequestInterface<Body, Params, Querystring, Headers>,
    ContextConfigDefault>
  ): Promise<void> {
    await this.initForPlugins<any>('head', path, handler);
  };
  async register(plugin: FastifyPluginCallback<FastifyPluginOptions> | FastifyPluginAsync<FastifyPluginOptions> | Promise<{ default: FastifyPluginCallback<FastifyPluginOptions>; }> | Promise<{ default: FastifyPluginAsync<FastifyPluginOptions>; }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions>) {
    await this.initForPlugins<any>('register', plugin, opts);
  };
}