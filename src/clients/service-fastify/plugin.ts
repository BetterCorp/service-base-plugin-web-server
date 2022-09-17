import { ServiceCallable, ServicesClient } from "@bettercorp/service-base";
import {
  FastifyBaseLogger,
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyPluginOptions,
  FastifyRegisterOptions,
  FastifySchema,
  FastifyTypeProviderDefault,
  RawServerBase,
  RawServerDefault,
  RouteHandlerMethod,
} from "fastify";
import {
  FastifyHeadersWithIP,
  FastifyRequestInterface,
} from "../../plugins/service-fastify/lib";
import { FastifyWebServerConfig } from "../../plugins/service-fastify/sec.config";
import { fastifyCallableMethods } from "../../plugins/service-fastify/plugin";
import { IncomingMessage, ServerResponse } from "http";
import { Http2ServerRequest, Http2ServerResponse } from "http2";

export class fastify
  extends ServicesClient<
    ServiceCallable,
    ServiceCallable,
    ServiceCallable,
    ServiceCallable,
    fastifyCallableMethods,
    FastifyWebServerConfig
  >
  implements fastifyCallableMethods
{
  public override readonly _pluginName: string = "service-fastify";
  public override readonly initAfterPlugins: string[] = ["service-fastify"];
  public override readonly runBeforePlugins: string[] = ["service-fastify"];

  public async register(
    plugin:
      | FastifyPluginCallback<
          FastifyPluginOptions,
          RawServerDefault,
          FastifyTypeProviderDefault
        >
      | FastifyPluginAsync<
          FastifyPluginOptions,
          RawServerDefault,
          FastifyTypeProviderDefault
        >
      | Promise<{
          default: FastifyPluginCallback<
            FastifyPluginOptions,
            RawServerDefault,
            FastifyTypeProviderDefault
          >;
        }>
      | Promise<{
          default: FastifyPluginAsync<
            FastifyPluginOptions,
            RawServerDefault,
            FastifyTypeProviderDefault
          >;
        }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions> | undefined
  ): Promise<void> {
    await this._plugin.callPluginMethod("register", plugin, opts);
  }
  public async head<
    Body = any,
    Params = unknown,
    Querystring = unknown,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      IncomingMessage | Http2ServerRequest,
      ServerResponse<IncomingMessage> | Http2ServerResponse,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      FastifyBaseLogger
    >
  ): Promise<void> {
    await this._plugin.callPluginMethod("head", path, handler as any);
  }
  public async get<
    Body = any,
    Params = unknown,
    Querystring = unknown,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      IncomingMessage | Http2ServerRequest,
      ServerResponse<IncomingMessage> | Http2ServerResponse,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      FastifyBaseLogger
    >
  ): Promise<void> {
    await this._plugin.callPluginMethod("get", path, handler as any);
  }
  public async post<
    Body = any,
    Params = unknown,
    Querystring = unknown,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      IncomingMessage | Http2ServerRequest,
      ServerResponse<IncomingMessage> | Http2ServerResponse,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      FastifyBaseLogger
    >
  ): Promise<void> {
    await this._plugin.callPluginMethod("post", path, handler as any);
  }
  public async put<
    Body = any,
    Params = unknown,
    Querystring = unknown,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      IncomingMessage | Http2ServerRequest,
      ServerResponse<IncomingMessage> | Http2ServerResponse,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      FastifyBaseLogger
    >
  ): Promise<void> {
    await this._plugin.callPluginMethod("put", path, handler as any);
  }
  public async delete<
    Body = any,
    Params = unknown,
    Querystring = unknown,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      IncomingMessage | Http2ServerRequest,
      ServerResponse<IncomingMessage> | Http2ServerResponse,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      FastifyBaseLogger
    >
  ): Promise<void> {
    await this._plugin.callPluginMethod("delete", path, handler as any);
  }
  public async patch<
    Body = any,
    Params = unknown,
    Querystring = unknown,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      IncomingMessage | Http2ServerRequest,
      ServerResponse<IncomingMessage> | Http2ServerResponse,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      FastifyBaseLogger
    >
  ): Promise<void> {
    await this._plugin.callPluginMethod("patch", path, handler as any);
  }
  public async options<
    Body = any,
    Params = unknown,
    Querystring = unknown,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      IncomingMessage | Http2ServerRequest,
      ServerResponse<IncomingMessage> | Http2ServerResponse,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      FastifyBaseLogger
    >
  ): Promise<void> {
    await this._plugin.callPluginMethod("options", path, handler as any);
  }
  public async all<
    Body = any,
    Params = unknown,
    Querystring = unknown,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      IncomingMessage | Http2ServerRequest,
      ServerResponse<IncomingMessage> | Http2ServerResponse,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      unknown,
      FastifySchema,
      FastifyTypeProviderDefault,
      FastifyBaseLogger
    >
  ): Promise<void> {
    await this._plugin.callPluginMethod("all", path, handler as any);
  }
}
