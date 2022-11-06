import {
  FastifyHeadersWithIP,
  FastifyRequestInterface,
  IWebServerListenerHelper,
} from "./lib";
import { readFileSync } from "fs";
import {
  ContextConfigDefault,
  fastify,
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyPluginOptions,
  FastifyRegisterOptions,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RequestParamsDefault,
  RequestQuerystringDefault,
  RouteHandlerMethod,
} from "fastify";
import fastifyBsbLogger from "./logger";
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyIP from "./ipHandlerPlugin";
import { hostname } from "os";
import { Server as HServer } from "http";
import { Server as HSServer } from "https";
import { ServiceCallable, ServicesBase } from "@bettercorp/service-base";
import { FastifyWebServerConfig, IWebServerConfigServer } from "./sec.config";

export interface fastifyCallableMethods {
  register(
    plugin:
      | FastifyPluginCallback<FastifyPluginOptions>
      | FastifyPluginAsync<FastifyPluginOptions>
      | Promise<{ default: FastifyPluginCallback<FastifyPluginOptions> }>
      | Promise<{ default: FastifyPluginAsync<FastifyPluginOptions> }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions>
  ): Promise<void>;
  head<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void>;
  get<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void>;
  post<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void>;
  put<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void>;
  delete<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void>;
  patch<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void>;
  options<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void>;
  all<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void>;
}

export class Service
  extends ServicesBase<
    ServiceCallable,
    ServiceCallable,
    ServiceCallable,
    ServiceCallable,
    fastifyCallableMethods,
    FastifyWebServerConfig
  >
  implements fastifyCallableMethods
{
  private HTTPFastify!: FastifyInstance<HServer>;
  private HTTPSFastify!: FastifyInstance<HSServer>;

  public override async init(): Promise<void> {
    const self = this;
    if ((await self.getPluginConfig()).server === IWebServerConfigServer.http) {
      self.HTTPFastify = fastify({});
      self.HTTPFastify.register(fastifyBsbLogger, self.log);
      self.log.info(
        `[HTTP] Server ready: ${(await self.getPluginConfig()).host}:${
          (await self.getPluginConfig()).httpPort
        }`
      );
    }
    if (
      (await self.getPluginConfig()).server === IWebServerConfigServer.https
    ) {
      self.HTTPSFastify = fastify({
        https: {
          cert: readFileSync((await self.getPluginConfig()).httpsCert!),
          key: readFileSync((await self.getPluginConfig()).httpsKey!),
        },
      });
      self.HTTPSFastify.register(fastifyBsbLogger, self.log);
      self.log.info(
        `[HTTPS] Server ready: ${(await self.getPluginConfig()).host}:${
          (await self.getPluginConfig()).httpsPort
        }`
      );
    }
    if ((await self.getPluginConfig()).cors.enabled) {
      self.log.info(`Enabled CORS Service`);
      self.register(fastifyCors, (await self.getPluginConfig()).cors.options);
    }
    if ((await self.getPluginConfig()).rateLimit.enabled) {
      self.log.info(`Enabled Rate Limit Service`);
      self.register(
        fastifyRateLimit,
        (await self.getPluginConfig()).rateLimit.options
      );
    }
    if ((await self.getPluginConfig()).ipRewrite) {
      self.log.info(`Enabled IP Service`);
      self.register(fastifyIP);
    }
    if ((await self.getPluginConfig()).health) {
      self.get("/health", (req, res) => {
        res.header("Content-Type", "application/json");
        res.code(200).send({
          requestId: req.id,
          /*requestIp: {
            ip: req.ip,
            ips: req.ips
          },*/
          requestHostname: req.hostname,
          time: new Date().getTime(),
          alive: true,
          clusterId: hostname(),
        });
      });
    }
  }
  public override async run(): Promise<void> {
    const self = this;
    self.log.debug(`loaded`);
    if (
      (await self.getPluginConfig()).server === IWebServerConfigServer.http ||
      (await self.getPluginConfig()).server ===
        IWebServerConfigServer.httpAndHttps
    ) {
      self.HTTPFastify.listen(
        {
          host: (await self.getPluginConfig()).host,
          port: (await self.getPluginConfig()).httpPort,
        },
        async () =>
          console.log(
            `[HTTP] Listening ${(await self.getPluginConfig()).host}:${
              (await self.getPluginConfig()).httpPort
            } for WW!`
          )
      );
      self.log.info(
        `[HTTP] Server started ${(await self.getPluginConfig()).host}:${
          (await self.getPluginConfig()).httpPort
        }`
      );
    }
    if (
      (await self.getPluginConfig()).server === IWebServerConfigServer.https ||
      (await self.getPluginConfig()).server ===
        IWebServerConfigServer.httpAndHttps
    ) {
      self.HTTPSFastify.listen(
        {
          host: (await self.getPluginConfig()).host,
          port: (await self.getPluginConfig()).httpsPort,
        },
        async () =>
          console.log(
            `[HTTPS] Listening ${(await self.getPluginConfig()).host}:${
              (await self.getPluginConfig()).httpsPort
            }!`
          )
      );
      self.log.info(
        `[HTTPS] Server started ${(await self.getPluginConfig()).host}:${
          (await self.getPluginConfig()).httpsPort
        }`
      );
    }
    if (
      (await self.getPluginConfig()).server ===
        IWebServerConfigServer.httpAndHttps &&
      (await self.getPluginConfig()).httpToHttpsRedirect
    ) {
      self.HTTPFastify.get("/*", async (req, reply) => {
        reply.redirect(
          301,
          `https://${req.hostname}:${(await self.getPluginConfig()).httpsPort}${
            req.url
          }`
        );
      });
      self.log.info(
        `[HTTP] Server redirect: ${(await self.getPluginConfig()).host}:${
          (await self.getPluginConfig()).httpPort
        }`
      );
    }
  }

  // DYNAMIC HANDLING
  public async getServerInstance(): Promise<
    FastifyInstance<HServer | HSServer>
  > {
    return (await this.getServerToListenTo()).server;
  }
  private async getServerToListenTo(): Promise<IWebServerListenerHelper> {
    let serverToListenOn: IWebServerListenerHelper = {
      server: this.HTTPSFastify,
      type: "HTTPS",
    };
    if ((await this.getPluginConfig()).server === IWebServerConfigServer.http) {
      serverToListenOn = {
        server: this.HTTPFastify,
        type: "HTTP",
      };
    }
    return serverToListenOn;
  }

  public async register(
    plugin:
      | FastifyPluginCallback<FastifyPluginOptions>
      | FastifyPluginAsync<FastifyPluginOptions>
      | Promise<{ default: FastifyPluginCallback<FastifyPluginOptions> }>
      | Promise<{ default: FastifyPluginAsync<FastifyPluginOptions> }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions>
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [USE]`);
    server.server.register(plugin, opts);
    this.log.debug(`[${server.type}] initForPlugins [USE] OKAY`);
  }
  public async head<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [HEAD]${path}`);
    server.server.head(path, handler as any);
    this.log.debug(`[${server.type}] initForPlugins [HEAD] OKAY`);
  }

  public async get<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [GET]${path}`);
    server.server.get(path, handler as any);
    this.log.debug(`[${server.type}] initForPlugins [GET] OKAY`);
  }
  public async post<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [POST]${path}`);
    server.server.post(path, handler as any);
    this.log.debug(`[${server.type}] initForPlugins [POST] OKAY`);
  }
  public async put<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [PUT]${path}`);
    server.server.put(path, handler as any);
    this.log.debug(`[${server.type}] initForPlugins [PUT] OKAY`);
  }
  public async delete<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [DELETE]${path}`);
    server.server.delete(path, handler as any);
    this.log.debug(`[${server.type}] initForPlugins [DELETE] OKAY`);
  }
  public async patch<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [PATCH]${path}`);
    server.server.patch(path, handler as any);
    this.log.debug(`[${server.type}] initForPlugins [PATCH] OKAY`);
  }
  public async options<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [OPTIONS]${path}`);
    server.server.options(path, handler as any);
    this.log.debug(`[${server.type}] initForPlugins [OPTIONS] OKAY`);
  }
  public async all<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [ALL]${path}`);
    server.server.all(path, handler as any);
    this.log.debug(`[${server.type}] initForPlugins [ALL] OKAY`);
  }
}

/*
export class Plugin extends CPlugin<IWebServerConfig> {
  private HTTPFastify!: FastifyInstance<HServer>;
  private HTTPSFastify!: FastifyInstance<HSServer>;

  // HTTP ONLY SERVER
  httpRegister(
    plugin:
      | FastifyPluginCallback<FastifyPluginOptions>
      | FastifyPluginAsync<FastifyPluginOptions>
      | Promise<{ default: FastifyPluginCallback<FastifyPluginOptions> }>
      | Promise<{ default: FastifyPluginAsync<FastifyPluginOptions> }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions>
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (
        (await self.getPluginConfig()).server === IWebServerConfigServer.https
      )
        return reject("HTTP NOT ENABLED");
      self.log.debug(`[HTTP_ONLY] initForPlugins [USE]`);
      self.HTTPFastify.register(plugin, opts);
      self.log.debug(`[HTTP_ONLY] initForPlugins [USE] OKAY`);
      resolve();
    });
  }
  httpHead<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve) => {
      let server = await self.getServerToListenTo();
      self.log.debug(`[${server.type}] initForPlugins [HEAD]${path}`);
      server.server.head(path, handler);
      self.log.debug(`[${server.type}] initForPlugins [HEAD] OKAY`);
      resolve();
    });
  }
  httpGet<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (
        (await self.getPluginConfig()).server === IWebServerConfigServer.https
      )
        return reject("HTTP NOT ENABLED");
      self.log.debug(`[HTTP_ONLY] initForPlugins [GET]${path}`);
      self.HTTPFastify.get(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [GET] OKAY`);
      resolve();
    });
  }
  httpPost<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (
        (await self.getPluginConfig()).server === IWebServerConfigServer.https
      )
        return reject("HTTP NOT ENABLED");
      self.log.debug(`[HTTP_ONLY] initForPlugins [POST]${path}`);
      self.HTTPFastify.post(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [POST] OKAY`);
      resolve();
    });
  }
  httpPut<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (
        (await self.getPluginConfig()).server === IWebServerConfigServer.https
      )
        return reject("HTTP NOT ENABLED");
      self.log.debug(`[HTTP_ONLY] initForPlugins [PUT]${path}`);
      self.HTTPFastify.put(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [PUT] OKAY`);
      resolve();
    });
  }
  httpDelete<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (
        (await self.getPluginConfig()).server === IWebServerConfigServer.https
      )
        return reject("HTTP NOT ENABLED");
      self.log.debug(`[HTTP_ONLY] initForPlugins [DELETE]${path}`);
      self.HTTPFastify.delete(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [DELETE] OKAY`);
      resolve();
    });
  }
  httpPatch<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (
        (await self.getPluginConfig()).server === IWebServerConfigServer.https
      )
        return reject("HTTP NOT ENABLED");
      self.log.debug(`[HTTP_ONLY] initForPlugins [PATCH]${path}`);
      self.HTTPFastify.patch(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [PATCH] OKAY`);
      resolve();
    });
  }
  httpOptions<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (
        (await self.getPluginConfig()).server === IWebServerConfigServer.https
      )
        return reject("HTTP NOT ENABLED");
      self.log.debug(`[HTTP_ONLY] initForPlugins [OPTIONS]${path}`);
      self.HTTPFastify.options(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [OPTIONS] OKAY`);
      resolve();
    });
  }
  httpAll<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (
        (await self.getPluginConfig()).server === IWebServerConfigServer.https
      )
        return reject("HTTP NOT ENABLED");
      self.log.debug(`[HTTP_ONLY] initForPlugins [ALL]${path}`);
      self.HTTPFastify.all(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [ALL] OKAY`);
      resolve();
    });
  }

  // HTTPS ONLY SERVER
  httpsRegister(
    plugin:
      | FastifyPluginCallback<FastifyPluginOptions>
      | FastifyPluginAsync<FastifyPluginOptions>
      | Promise<{ default: FastifyPluginCallback<FastifyPluginOptions> }>
      | Promise<{ default: FastifyPluginAsync<FastifyPluginOptions> }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions>
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if ((await self.getPluginConfig()).server === IWebServerConfigServer.http)
        return reject("HTTPS NOT ENABLED");
      self.log.debug(`[HTTPS_ONLY] initForPlugins [USE]`);
      self.HTTPSFastify.register(plugin, opts);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [USE] OKAY`);
      resolve();
    });
  }
  httpsHead<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if ((await self.getPluginConfig()).server === IWebServerConfigServer.http)
        return reject("HTTPS NOT ENABLED");
      self.log.debug(`[HTTPS_ONLY] initForPlugins [HEAD]${path}`);
      self.HTTPSFastify.head(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [HEAD] OKAY`);
      resolve();
    });
  }
  httpsGet<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if ((await self.getPluginConfig()).server === IWebServerConfigServer.http)
        return reject("HTTPS NOT ENABLED");
      self.log.debug(`[HTTPS_ONLY] initForPlugins [GET]${path}`);
      self.HTTPSFastify.get(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [GET] OKAY`);
      resolve();
    });
  }
  httpsPost<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if ((await self.getPluginConfig()).server === IWebServerConfigServer.http)
        return reject("HTTPS NOT ENABLED");
      self.log.debug(`[HTTPS_ONLY] initForPlugins [POST]${path}`);
      self.HTTPSFastify.post(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [POST] OKAY`);
      resolve();
    });
  }
  httpsPut<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if ((await self.getPluginConfig()).server === IWebServerConfigServer.http)
        return reject("HTTPS NOT ENABLED");
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PUT]${path}`);
      self.HTTPSFastify.put(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PUT] OKAY`);
      resolve();
    });
  }
  httpsDelete<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if ((await self.getPluginConfig()).server === IWebServerConfigServer.http)
        return reject("HTTPS NOT ENABLED");
      self.log.debug(`[HTTPS_ONLY] initForPlugins [DELETE]${path}`);
      self.HTTPSFastify.delete(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [DELETE] OKAY`);
      resolve();
    });
  }
  httpsPatch<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if ((await self.getPluginConfig()).server === IWebServerConfigServer.http)
        return reject("HTTPS NOT ENABLED");
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PATCH]${path}`);
      self.HTTPSFastify.patch(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PATCH] OKAY`);
      resolve();
    });
  }
  httpsOptions<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if ((await self.getPluginConfig()).server === IWebServerConfigServer.http)
        return reject("HTTPS NOT ENABLED");
      self.log.debug(`[HTTPS_ONLY] initForPlugins [OPTIONS]${path}`);
      self.HTTPSFastify.options(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [OPTIONS] OKAY`);
      resolve();
    });
  }
  httpsAll<
    Body = any,
    Params = RequestParamsDefault,
    Querystring = RequestQuerystringDefault,
    Headers = FastifyHeadersWithIP
  >(
    path: string,
    handler: RouteHandlerMethod<
      RawServerBase,
      RawRequestDefaultExpression<RawServerBase>,
      RawReplyDefaultExpression<RawServerBase>,
      FastifyRequestInterface<Body, Params, Querystring, Headers>,
      ContextConfigDefault
    >
  ): Promise<void> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      if ((await self.getPluginConfig()).server === IWebServerConfigServer.http)
        return reject("HTTPS NOT ENABLED");
      self.log.debug(`[HTTPS_ONLY] initForPlugins [ALL]${path}`);
      self.HTTPSFastify.all(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [ALL] OKAY`);
      resolve();
    });
  }
}
*/
