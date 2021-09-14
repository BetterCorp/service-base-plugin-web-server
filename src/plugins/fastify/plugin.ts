import { CPlugin } from '@bettercorp/service-base/lib/ILib';
import { IWebServerConfig, IWebServerConfigServer, IWebServerListenerHelper } from './lib';
//import fastify from 'fastify';
import { readFileSync } from 'fs';
import { fastify, FastifyInstance, FastifyPluginAsync, FastifyPluginCallback, FastifyPluginOptions, FastifyRegisterOptions, FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';
import fastifyBsbLogger from './logger';

export class Plugin extends CPlugin<IWebServerConfig> {
  private HTTPFastify!: FastifyInstance;
  private HTTPSFastify!: FastifyInstance;
  public readonly initIndex: number = Number.MIN_SAFE_INTEGER;
  init(): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) {
        self.HTTPFastify = fastify({});
        self.HTTPFastify.register(fastifyBsbLogger, {
          uSelf: self
        });
        self.log.info(`[HTTP] Server ready: ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpPort }`);
      }
      if (self.getPluginConfig().server === IWebServerConfigServer.https) {
        self.HTTPSFastify = fastify({
          https: {
            cert: readFileSync(self.getPluginConfig().httpsCert!),
            key: readFileSync(self.getPluginConfig().httpsKey!)
          }
        });
        self.HTTPSFastify.register(fastifyBsbLogger, {
          uSelf: self
        });
        self.log.info(`[HTTPS] Server ready: ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpsPort }`);
      }
      resolve();
    });
  }
  public readonly loadedIndex: number = Number.MAX_SAFE_INTEGER;
  loaded(): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      self.log.debug(`loaded`);
      if (self.getPluginConfig().server === IWebServerConfigServer.http || self.getPluginConfig().server === IWebServerConfigServer.httpAndHttps) {
        self.HTTPFastify.listen(self.getPluginConfig().httpPort, self.getPluginConfig().host, () =>
          console.log(`[HTTP] Listening ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpPort } for WW!`));
        self.log.info(`[HTTP] Server started ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpPort }`);
      }
      if (self.getPluginConfig().server === IWebServerConfigServer.https || self.getPluginConfig().server === IWebServerConfigServer.httpAndHttps) {
        self.HTTPSFastify.listen(self.getPluginConfig().httpsPort, self.getPluginConfig().host, () =>
          console.log(`[HTTPS] Listening ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpsPort }!`));
        self.log.info(`[HTTPS] Server started ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpsPort }`);
      }
      if (self.getPluginConfig().server === IWebServerConfigServer.httpAndHttps && self.getPluginConfig().httpToHttpsRedirect) {
        self.HTTPFastify.get('/*', (req: FastifyRequest, reply: FastifyReply) => {
          reply.redirect(301, `https://${ req.hostname }:${ self.getPluginConfig().httpsPort }${ req.url }`);
        });
        self.log.info(`[HTTP] Server redirect: ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpPort }`);
      }
      resolve();
    });
  }

  // DYNAMIC HANDLING
  public async getServerInstance(): Promise<FastifyInstance> {
    return this.getServerToListenTo().server;
  }
  private getServerToListenTo(): IWebServerListenerHelper {
    let serverToListenOn = {
      server: this.HTTPSFastify,
      type: "HTTPS"
    };
    if (this.getPluginConfig().server === IWebServerConfigServer.http) {
      serverToListenOn = {
        server: this.HTTPFastify,
        type: "HTTP"
      };
    }
    return serverToListenOn;
  }
  register(plugin: FastifyPluginCallback<FastifyPluginOptions> | FastifyPluginAsync<FastifyPluginOptions> | Promise<{ default: FastifyPluginCallback<FastifyPluginOptions>; }> | Promise<{ default: FastifyPluginAsync<FastifyPluginOptions>; }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions>): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [USE]`);
      server.server.register(plugin, opts);
      self.log.debug(`[${ server.type }] initForPlugins [USE] OKAY`);
      resolve();
    });
  }
  head(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [HEAD]${ path }`);
      server.server.head(path, handler);
      self.log.debug(`[${ server.type }] initForPlugins [HEAD] OKAY`);
      resolve();
    });
  }
  get(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [GET]${ path }`);
      server.server.get(path, handler);
      self.log.debug(`[${ server.type }] initForPlugins [GET] OKAY`);
      resolve();
    });
  }
  post(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [POST]${ path }`);
      server.server.post(path, handler);
      self.log.debug(`[${ server.type }] initForPlugins [POST] OKAY`);
      resolve();
    });
  }
  put(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [PUT]${ path }`);
      server.server.put(path, handler);
      self.log.debug(`[${ server.type }] initForPlugins [PUT] OKAY`);
      resolve();
    });
  }
  delete(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [DELETE]${ path }`);
      server.server.delete(path, handler);
      self.log.debug(`[${ server.type }] initForPlugins [DELETE] OKAY`);
      resolve();
    });
  }
  patch(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [PATCH]${ path }`);
      server.server.patch(path, handler);
      self.log.debug(`[${ server.type }] initForPlugins [PATCH] OKAY`);
      resolve();
    });
  }
  options(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [OPTIONS]${ path }`);
      server.server.options(path, handler);
      self.log.debug(`[${ server.type }] initForPlugins [OPTIONS] OKAY`);
      resolve();
    });
  }
  all(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [ALL]${ path }`);
      server.server.all(path, handler);
      self.log.debug(`[${ server.type }] initForPlugins [ALL] OKAY`);
      resolve();
    });
  }

  // HTTP ONLY SERVER
  httpRegister(plugin: FastifyPluginCallback<FastifyPluginOptions> | FastifyPluginAsync<FastifyPluginOptions> | Promise<{ default: FastifyPluginCallback<FastifyPluginOptions>; }> | Promise<{ default: FastifyPluginAsync<FastifyPluginOptions>; }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions>): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [USE]`);
      self.HTTPFastify.register(plugin, opts);
      self.log.debug(`[HTTP_ONLY] initForPlugins [USE] OKAY`);
      resolve();
    });
  }
  httpHead(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [HEAD]${ path }`);
      server.server.head(path, handler);
      self.log.debug(`[${ server.type }] initForPlugins [HEAD] OKAY`);
      resolve();
    });
  }
  httpGet(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [GET]${ path }`);
      self.HTTPFastify.get(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [GET] OKAY`);
      resolve();
    });
  }
  httpPost(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [POST]${ path }`);
      self.HTTPFastify.post(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [POST] OKAY`);
      resolve();
    });
  }
  httpPut(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [PUT]${ path }`);
      self.HTTPFastify.put(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [PUT] OKAY`);
      resolve();
    });
  }
  httpDelete(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [DELETE]${ path }`);
      self.HTTPFastify.delete(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [DELETE] OKAY`);
      resolve();
    });
  }
  httpPatch(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [PATCH]${ path }`);
      self.HTTPFastify.patch(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [PATCH] OKAY`);
      resolve();
    });
  }
  httpOptions(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [OPTIONS]${ path }`);
      self.HTTPFastify.options(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [OPTIONS] OKAY`);
      resolve();
    });
  }
  httpAll(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [ALL]${ path }`);
      self.HTTPFastify.all(path, handler);
      self.log.debug(`[HTTP_ONLY] initForPlugins [ALL] OKAY`);
      resolve();
    });
  }

  // HTTPS ONLY SERVER
  httpsRegister(plugin: FastifyPluginCallback<FastifyPluginOptions> | FastifyPluginAsync<FastifyPluginOptions> | Promise<{ default: FastifyPluginCallback<FastifyPluginOptions>; }> | Promise<{ default: FastifyPluginAsync<FastifyPluginOptions>; }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions>): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [USE]`);
      self.HTTPSFastify.register(plugin, opts);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [USE] OKAY`);
      resolve();
    });
  }
  httpsHead(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [HEAD]${ path }`);
      self.HTTPSFastify.head(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [HEAD] OKAY`);
      resolve();
    });
  }
  httpsGet(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [GET]${ path }`);
      self.HTTPSFastify.get(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [GET] OKAY`);
      resolve();
    });
  }
  httpsPost(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [POST]${ path }`);
      self.HTTPSFastify.post(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [POST] OKAY`);
      resolve();
    });
  }
  httpsPut(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PUT]${ path }`);
      self.HTTPSFastify.put(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PUT] OKAY`);
      resolve();
    });
  }
  httpsDelete(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [DELETE]${ path }`);
      self.HTTPSFastify.delete(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [DELETE] OKAY`);
      resolve();
    });
  }
  httpsPatch(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PATCH]${ path }`);
      self.HTTPSFastify.patch(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PATCH] OKAY`);
      resolve();
    });
  }
  httpsOptions(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [OPTIONS]${ path }`);
      self.HTTPSFastify.options(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [OPTIONS] OKAY`);
      resolve();
    });
  }
  httpsAll(path: string, handler: RouteHandlerMethod): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [ALL]${ path }`);
      self.HTTPSFastify.all(path, handler);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [ALL] OKAY`);
      resolve();
    });
  }
}
