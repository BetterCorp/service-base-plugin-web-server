import { IWebServerListenerHelper } from "./lib";
import express, { Express } from "express";
import * as http from "http";
import * as https from "https";
import { readFileSync } from "fs";
import { hostname } from "os";
import { ServiceCallable, ServicesBase } from "@bettercorp/service-base";
import { IWebServerConfig, IWebServerConfigServer } from "./sec.config";

export class Service
  extends ServicesBase<
    ServiceCallable,
    ServiceCallable,
    ServiceCallable,
    ServiceCallable,
    expressCallableMethods,
    IWebServerConfig
  >
  implements expressCallableMethods
{
  private HTTPExpress!: Express;
  private HTTPSExpress!: Express;
  public override async init(): Promise<void> {
    if ((await this.getPluginConfig()).server === IWebServerConfigServer.http) {
      this.HTTPExpress = express();
      await this.log.info("[HTTP] Server ready: {host}:{httpPort}", {
        host: (await this.getPluginConfig()).host,
        httpPort: (await this.getPluginConfig()).httpPort,
      });
    }
    if (
      (await this.getPluginConfig()).server === IWebServerConfigServer.https
    ) {
      this.HTTPSExpress = express();
      await this.log.info("[HTTPS] Server ready: {host}:{httpsPort}", {
        host: (await this.getPluginConfig()).host,
        httpsPort: (await this.getPluginConfig()).httpsPort,
      });
    }
    this.get("/health", (req: any, res: any) => {
      res.setHeader("Content-Type", "application/json");
      res.send({
        time: new Date().getTime(),
        alive: true,
        clusterId: hostname(),
      });
    });
  }
  public override async run() {
    const self = this;
    if (
      (await this.getPluginConfig()).server === IWebServerConfigServer.http ||
      (await this.getPluginConfig()).server ===
        IWebServerConfigServer.httpAndHttps
    ) {
      http.createServer(this.HTTPExpress).listen(
        (await this.getPluginConfig()).httpPort,
        (await this.getPluginConfig()).host,
        async () =>
          await self.log.info("[HTTP] Listening {host}:{httpPort} for WW!", {
            host: (await self.getPluginConfig()).host,
            httpPort: (await self.getPluginConfig()).httpPort,
          })
      );
      await this.log.info("[HTTP] Server started {host}:{httpPort}", {
        host: (await self.getPluginConfig()).host,
        httpPort: (await self.getPluginConfig()).httpPort,
      });
    }
    if (
      (await this.getPluginConfig()).server === IWebServerConfigServer.https ||
      (await this.getPluginConfig()).server ===
        IWebServerConfigServer.httpAndHttps
    ) {
      let opts: https.ServerOptions = {
        cert: readFileSync((await this.getPluginConfig()).httpsCert!),
        key: readFileSync((await this.getPluginConfig()).httpsKey!),
      };
      https.createServer(opts, this.HTTPSExpress).listen(
        ((await this.getPluginConfig()).httpsPort,
        (await this.getPluginConfig()).host,
        async () =>
          await self.log.info("[HTTPS] Listening {host}:{httpsPort}!", {
            host: (await self.getPluginConfig()).host,
            httpsPort: (await self.getPluginConfig()).httpsPort,
          }))
      );
      await this.log.info("[HTTPS] Server started {host}:{httpsPort}", {
        host: (await self.getPluginConfig()).host,
        httpsPort: (await self.getPluginConfig()).httpsPort,
      });
    }
    if (
      (await this.getPluginConfig()).server ===
        IWebServerConfigServer.httpAndHttps &&
      (await this.getPluginConfig()).httpToHttpsRedirect
    ) {
      this.HTTPExpress.use(async (req: any, res: any) => {
        res.redirect(
          301,
          `https://${req.hostname}:${(await self.getPluginConfig()).httpsPort}${
            req.originalUrl
          }`
        );
      });
      await this.log.info(
        "[HTTP]->[HTTPS] Server redirect: {host}:{httpPort}",
        {
          host: (await this.getPluginConfig()).host,
          httpPort: (await this.getPluginConfig()).httpPort,
        }
      );
    }
  }

  // DYNAMIC HANDLING
  private async getServerToListenTo(): Promise<IWebServerListenerHelper> {
    let serverToListenOn = {
      server: this.HTTPSExpress,
      type: "HTTPS",
    };
    if ((await this.getPluginConfig()).server === IWebServerConfigServer.http) {
      serverToListenOn = {
        server: this.HTTPExpress,
        type: "HTTP",
      };
    }
    return serverToListenOn;
  }
  async use(...handlers: any): Promise<void> {
    let server = await this.getServerToListenTo();
    await this.log.debug(`[${server.type}] initForPlugins [USE]`);
    server.server.use(handlers);
    await this.log.debug(`[${server.type}] initForPlugins [USE] OKAY`);
  }
  async head(path: string, ...handlers: any): Promise<void> {
    let server = await this.getServerToListenTo();
    await this.log.debug(`[${server.type}] initForPlugins [HEAD]${path}`);
    server.server.head(path, handlers);
    await this.log.debug(`[${server.type}] initForPlugins [HEAD] OKAY`);
  }
  async get(path: string, ...handlers: any): Promise<void> {
    let server = await this.getServerToListenTo();
    await this.log.debug(`[${server.type}] initForPlugins [GET]${path}`);
    server.server.get(path, handlers);
    await this.log.debug(`[${server.type}] initForPlugins [GET] OKAY`);
  }
  async post(path: string, ...handlers: any): Promise<void> {
    let server = await this.getServerToListenTo();
    await this.log.debug(`[${server.type}] initForPlugins [POST]${path}`);
    server.server.post(path, handlers);
    await this.log.debug(`[${server.type}] initForPlugins [POST] OKAY`);
  }
  async put(path: string, ...handlers: any): Promise<void> {
    let server = await this.getServerToListenTo();
    await this.log.debug(`[${server.type}] initForPlugins [PUT]${path}`);
    server.server.put(path, handlers);
    await this.log.debug(`[${server.type}] initForPlugins [PUT] OKAY`);
  }
  async delete(path: string, ...handlers: any): Promise<void> {
    let server = await this.getServerToListenTo();
    await this.log.debug(`[${server.type}] initForPlugins [DELETE]${path}`);
    server.server.delete(path, handlers);
    await this.log.debug(`[${server.type}] initForPlugins [DELETE] OKAY`);
  }
  async patch(path: string, ...handlers: any): Promise<void> {
    let server = await this.getServerToListenTo();
    await this.log.debug(`[${server.type}] initForPlugins [PATCH]${path}`);
    server.server.patch(path, handlers);
    await this.log.debug(`[${server.type}] initForPlugins [PATCH] OKAY`);
  }
  async options(path: string, ...handlers: any): Promise<void> {
    let server = await this.getServerToListenTo();
    await this.log.debug(`[${server.type}] initForPlugins [OPTIONS]${path}`);
    server.server.options(path, handlers);
    await this.log.debug(`[${server.type}] initForPlugins [OPTIONS] OKAY`);
  }
  async all(path: string, ...handlers: any): Promise<void> {
    let server = await this.getServerToListenTo();
    await this.log.debug(`[${server.type}] initForPlugins [ALL]${path}`);
    server.server.all(path, handlers);
    await this.log.debug(`[${server.type}] initForPlugins [ALL] OKAY`);
  }

  // HTTP ONLY SERVER
  async httpUse(...handlers: any): Promise<void> {
    if (this.HTTPExpress === undefined) throw "HTTP NOT ENABLED";
    await this.log.debug(`[HTTP_ONLY] initForPlugins [USE]`);
    this.HTTPExpress.use(handlers);
    await this.log.debug(`[HTTP_ONLY] initForPlugins [USE] OKAY`);
  }
  async httpHead(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPExpress === undefined) throw "HTTP NOT ENABLED";
    await this.log.debug(`[HTTP_ONLY] initForPlugins [HEAD]${path}`);
    this.HTTPExpress.head(path, handlers);
    await this.log.debug(`[HTTP_ONLY] initForPlugins [HEAD] OKAY`);
  }
  async httpGet(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPExpress === undefined) throw "HTTP NOT ENABLED";
    await this.log.debug(`[HTTP_ONLY] initForPlugins [GET]${path}`);
    this.HTTPExpress.get(path, handlers);
    await this.log.debug(`[HTTP_ONLY] initForPlugins [GET] OKAY`);
  }
  async httpPost(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPExpress === undefined) throw "HTTP NOT ENABLED";
    await this.log.debug(`[HTTP_ONLY] initForPlugins [POST]${path}`);
    this.HTTPExpress.post(path, handlers);
    await this.log.debug(`[HTTP_ONLY] initForPlugins [POST] OKAY`);
  }
  async httpPut(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPExpress === undefined) throw "HTTP NOT ENABLED";
    await this.log.debug(`[HTTP_ONLY] initForPlugins [PUT]${path}`);
    this.HTTPExpress.put(path, handlers);
    await this.log.debug(`[HTTP_ONLY] initForPlugins [PUT] OKAY`);
  }
  async httpDelete(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPExpress === undefined) throw "HTTP NOT ENABLED";
    await this.log.debug(`[HTTP_ONLY] initForPlugins [DELETE]${path}`);
    this.HTTPExpress.delete(path, handlers);
    await this.log.debug(`[HTTP_ONLY] initForPlugins [DELETE] OKAY`);
  }
  async httpPatch(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPExpress === undefined) throw "HTTP NOT ENABLED";
    await this.log.debug(`[HTTP_ONLY] initForPlugins [PATCH]${path}`);
    this.HTTPExpress.patch(path, handlers);
    await this.log.debug(`[HTTP_ONLY] initForPlugins [PATCH] OKAY`);
  }
  async httpOptions(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPExpress === undefined) throw "HTTP NOT ENABLED";
    await this.log.debug(`[HTTP_ONLY] initForPlugins [OPTIONS]${path}`);
    this.HTTPExpress.options(path, handlers);
    await this.log.debug(`[HTTP_ONLY] initForPlugins [OPTIONS] OKAY`);
  }
  async httpAll(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPExpress === undefined) throw "HTTP NOT ENABLED";
    await this.log.debug(`[HTTP_ONLY] initForPlugins [ALL]${path}`);
    this.HTTPExpress.all(path, handlers);
    await this.log.debug(`[HTTP_ONLY] initForPlugins [ALL] OKAY`);
  }

  // HTTPS ONLY SERVER
  async httpsUse(...handlers: any): Promise<void> {
    if (this.HTTPSExpress === undefined) throw "HTTPS NOT ENABLED";
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [USE]`);
    this.HTTPSExpress.use(handlers);
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [USE] OKAY`);
  }
  async httpsHead(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPSExpress === undefined) throw "HTTPS NOT ENABLED";
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [HEAD]${path}`);
    this.HTTPSExpress.head(path, handlers);
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [HEAD] OKAY`);
  }
  async httpsGet(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPSExpress === undefined) throw "HTTPS NOT ENABLED";
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [GET]${path}`);
    this.HTTPSExpress.get(path, handlers);
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [GET] OKAY`);
  }
  async httpsPost(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPSExpress === undefined) throw "HTTPS NOT ENABLED";
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [POST]${path}`);
    this.HTTPSExpress.post(path, handlers);
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [POST] OKAY`);
  }
  async httpsPut(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPSExpress === undefined) throw "HTTPS NOT ENABLED";
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [PUT]${path}`);
    this.HTTPSExpress.put(path, handlers);
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [PUT] OKAY`);
  }
  async httpsDelete(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPSExpress === undefined) throw "HTTPS NOT ENABLED";
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [DELETE]${path}`);
    this.HTTPSExpress.delete(path, handlers);
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [DELETE] OKAY`);
  }
  async httpsPatch(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPSExpress === undefined) throw "HTTPS NOT ENABLED";
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [PATCH]${path}`);
    this.HTTPSExpress.patch(path, handlers);
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [PATCH] OKAY`);
  }
  async httpsOptions(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPSExpress === undefined) throw "HTTPS NOT ENABLED";
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [OPTIONS]${path}`);
    this.HTTPSExpress.options(path, handlers);
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [OPTIONS] OKAY`);
  }
  async httpsAll(path: string, ...handlers: any): Promise<void> {
    if (this.HTTPSExpress === undefined) throw "HTTPS NOT ENABLED";
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [ALL]${path}`);
    this.HTTPSExpress.all(path, handlers);
    await this.log.debug(`[HTTPS_ONLY] initForPlugins [ALL] OKAY`);
  }
}

export interface expressCallableMethods extends ServiceCallable {
  use(...handlers: any): Promise<void>;
  head(path: string, ...handlers: any): Promise<void>;
  get(path: string, ...handlers: any): Promise<void>;
  post(path: string, ...handlers: any): Promise<void>;
  put(path: string, ...handlers: any): Promise<void>;
  delete(path: string, ...handlers: any): Promise<void>;
  delete(path: string, ...handlers: any): Promise<void>;
  patch(path: string, ...handlers: any): Promise<void>;
  options(path: string, ...handlers: any): Promise<void>;
  all(path: string, ...handlers: any): Promise<void>;

  // HTTP ONLY SERVER
  httpUse(...handlers: any): Promise<void>;
  httpHead(path: string, ...handlers: any): Promise<void>;
  httpGet(path: string, ...handlers: any): Promise<void>;
  httpPost(path: string, ...handlers: any): Promise<void>;
  httpPut(path: string, ...handlers: any): Promise<void>;
  httpDelete(path: string, ...handlers: any): Promise<void>;
  httpPatch(path: string, ...handlers: any): Promise<void>;
  httpOptions(path: string, ...handlers: any): Promise<void>;
  httpAll(path: string, ...handlers: any): Promise<void>;

  // HTTPS ONLY SERVER
  httpsUse(...handlers: any): Promise<void>;
  httpsHead(path: string, ...handlers: any): Promise<void>;
  httpsGet(path: string, ...handlers: any): Promise<void>;
  httpsPost(path: string, ...handlers: any): Promise<void>;
  httpsPut(path: string, ...handlers: any): Promise<void>;
  httpsDelete(path: string, ...handlers: any): Promise<void>;
  httpsPatch(path: string, ...handlers: any): Promise<void>;
  httpsOptions(path: string, ...handlers: any): Promise<void>;
  httpsAll(path: string, ...handlers: any): Promise<void>;
}
