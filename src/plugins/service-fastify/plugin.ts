import {
  FastifyNoBodyRequestHandler,
  FastifyRequestHandler,
  IWebServerListenerHelper,
} from "./lib";
import { readFileSync } from "fs";
import {
  fastify,
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyPluginOptions,
  FastifyRegisterOptions,
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
import { IDictionary } from "@bettercorp/tools/lib/Interfaces";

export interface fastifyCallableMethods {
  addHealthCheck(
    pluginName: string,
    checkName: string,
    handler: { (): Promise<boolean> }
  ): Promise<void>;
  register(
    plugin:
      | FastifyPluginCallback<FastifyPluginOptions>
      | FastifyPluginAsync<FastifyPluginOptions>
      | Promise<{ default: FastifyPluginCallback<FastifyPluginOptions> }>
      | Promise<{ default: FastifyPluginAsync<FastifyPluginOptions> }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions>
  ): Promise<void>;
  head<Path extends string>(
    path: Path,
    handler: FastifyNoBodyRequestHandler<Path>
  ): Promise<void>;
  get<Path extends string>(
    path: Path,
    handler: FastifyNoBodyRequestHandler<Path>
  ): Promise<void>;
  post<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void>;
  put<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void>;
  delete<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void>;
  patch<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void>;
  options<Path extends string>(
    path: Path,
    handler: FastifyNoBodyRequestHandler<Path>
  ): Promise<void>;
  all<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
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
  private HealthChecks: IDictionary<{
    (): Promise<boolean>;
  }> = {};
  async addHealthCheck(
    pluginName: string,
    checkName: string,
    handler: () => Promise<boolean>
  ): Promise<void> {
    if (Object.keys(this.HealthChecks).length >= 10)
      throw "Cannot add more than 10 health checks";
    const key = `${pluginName}-${checkName}`;
    if (this.HealthChecks[key] != undefined)
      throw "Cannot set health check where one alread exists";
    this.HealthChecks[key] = handler;
  }

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
      self.HTTPFastify.setErrorHandler((error, request, reply) => {
        self.log.error(error);
        reply.status(500).send("SERVER ERROR");
      });
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
      self.HTTPSFastify.setErrorHandler((error, request, reply) => {
        self.log.error(error);
        reply.status(500).send("SERVER ERROR");
      });
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
      self.register(fastifyIP, {
        cloudflareWarpTraefikPlugin: (await self.getPluginConfig())
          .usingCloudflareWarpTraefikPlugin,
      });
    }
    if ((await self.getPluginConfig()).health) {
      self.get("/health", async (params, query, req, res) => {
        let checkResults: IDictionary<boolean> = {};
        for (let key of Object.keys(self.HealthChecks)) {
          checkResults[key] = await Promise.race<boolean>([
            new Promise((resolve) =>
              self.HealthChecks[key]()
                .then((x) => resolve(x))
                .catch(() => resolve(false))
            ),
            new Promise((resolve) => setTimeout(() => resolve(false), 500)),
          ]);
        }
        res.header("Content-Type", "application/json");
        res.code(200).send({
          requestId: req.id,
          checks: checkResults,
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
        async (err, address) =>
          err
            ? self.log.fatal(err)
            : self.log.info(`[HTTP] Listening ${address} for WW!`)
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
        async (err, address) =>
          err
            ? self.log.fatal(err)
            : self.log.info(`[HTTPS] Listening ${address}!`)
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
  public async head<Path extends string>(
    path: Path,
    handler: FastifyNoBodyRequestHandler<Path>
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [HEAD]${path}`);
    server.server.head(
      path,
      async (req, reply) =>
        await handler(req.params as any, req.query, req, reply)
    );
    this.log.debug(`[${server.type}] initForPlugins [HEAD] OKAY`);
  }

  public async get<Path extends string>(
    path: Path,
    handler: FastifyNoBodyRequestHandler<Path>
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [GET]${path}`);
    server.server.get(
      path,
      async (req, reply) =>
        await handler(req.params as any, req.query, req, reply)
    );
    this.log.debug(`[${server.type}] initForPlugins [GET] OKAY`);
  }
  public async post<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [POST]${path}`);
    server.server.post(
      path,
      async (req, reply) =>
        await handler(req.params as any, req.query, req.body, req, reply)
    );
    this.log.debug(`[${server.type}] initForPlugins [POST] OKAY`);
  }
  public async put<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [PUT]${path}`);
    server.server.put(
      path,
      async (req, reply) =>
        await handler(req.params as any, req.query, req.body, req, reply)
    );
    this.log.debug(`[${server.type}] initForPlugins [PUT] OKAY`);
  }
  public async delete<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [DELETE]${path}`);
    server.server.delete(
      path,
      async (req, reply) =>
        await handler(req.params as any, req.query, req.body, req, reply)
    );
    this.log.debug(`[${server.type}] initForPlugins [DELETE] OKAY`);
  }
  public async patch<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [PATCH]${path}`);
    server.server.patch(
      path,
      async (req, reply) =>
        await handler(req.params as any, req.query, req.body, req, reply)
    );
    this.log.debug(`[${server.type}] initForPlugins [PATCH] OKAY`);
  }
  public async options<Path extends string>(
    path: Path,
    handler: FastifyNoBodyRequestHandler<Path>
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [OPTIONS]${path}`);
    server.server.options(
      path,
      async (req, reply) =>
        await handler(req.params as any, req.query, req, reply)
    );
    this.log.debug(`[${server.type}] initForPlugins [OPTIONS] OKAY`);
  }
  public async all<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void> {
    let server = await this.getServerToListenTo();
    this.log.debug(`[${server.type}] initForPlugins [ALL]${path}`);
    server.server.all(
      path,
      async (req, reply) =>
        await handler(req.params as any, req.query, req.body, req, reply)
    );
    this.log.debug(`[${server.type}] initForPlugins [ALL] OKAY`);
  }
}
