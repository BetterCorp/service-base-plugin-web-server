import { CPlugin } from '@bettercorp/service-base/lib/ILib';
import { IWebServerConfig, IWebServerConfigServer, IWebServerListenerHelper } from './lib';
import * as EXPRESS from 'express';
import { Express } from 'express';
import * as http from 'http';
import * as https from 'https';
import { readFileSync } from 'fs';
import { hostname } from 'os';

export class Plugin extends CPlugin<IWebServerConfig> {
  private HTTPExpress!: Express;
  private HTTPSExpress!: Express;
  public readonly initIndex: number = Number.MIN_SAFE_INTEGER;
  init(): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) {
        self.HTTPExpress = EXPRESS();
        self.log.info(`[HTTP] Server ready: ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpPort }`);
      }
      if (self.getPluginConfig().server === IWebServerConfigServer.https) {
        self.HTTPSExpress = EXPRESS();
        self.log.info(`[HTTPS] Server ready: ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpsPort }`);
      }
      self.options('/BSB/Ping', (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.send({
          time: new Date().getTime(),
          alive: true,
          clusterId: hostname()
        });
      });
      resolve();
    });
  }
  public readonly loadedIndex: number = Number.MAX_SAFE_INTEGER;
  loaded(): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      self.log.debug(`loaded`);
      if (self.getPluginConfig().server === IWebServerConfigServer.http || self.getPluginConfig().server === IWebServerConfigServer.httpAndHttps) {
        http.createServer(self.HTTPExpress).listen(self.getPluginConfig().httpPort, self.getPluginConfig().host, () =>
          console.log(`[HTTP] Listening ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpPort } for WW!`));
        self.log.info(`[HTTP] Server started ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpPort }`);
      }
      if (self.getPluginConfig().server === IWebServerConfigServer.https || self.getPluginConfig().server === IWebServerConfigServer.httpAndHttps) {
        let opts: https.ServerOptions = {
          cert: readFileSync(self.getPluginConfig().httpsCert!),
          key: readFileSync(self.getPluginConfig().httpsKey!)
        };
        https.createServer(opts, self.HTTPSExpress).listen(
          (self.getPluginConfig().httpsPort, self.getPluginConfig().host, () =>
            console.log(`[HTTPS] Listening ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpsPort }!`)));
        self.log.info(`[HTTPS] Server started ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpsPort }`);
      }
      if (self.getPluginConfig().server === IWebServerConfigServer.httpAndHttps && self.getPluginConfig().httpToHttpsRedirect) {
        self.HTTPExpress.use((req: any, res: any) => {
          res.redirect(301, `https://${ req.hostname }:${ self.getPluginConfig().httpsPort }${ req.originalUrl }`);
        });
        self.log.info(`[HTTP] Server redirect: ${ self.getPluginConfig().host }:${ self.getPluginConfig().httpPort }`);
      }
      resolve();
    });
  }

  // DYNAMIC HANDLING
  private getServerToListenTo(): IWebServerListenerHelper {
    let serverToListenOn = {
      server: this.HTTPSExpress,
      type: "HTTPS"
    };
    if (this.getPluginConfig().server === IWebServerConfigServer.http) {
      serverToListenOn = {
        server: this.HTTPExpress,
        type: "HTTP"
      };
    }
    return serverToListenOn;
  }
  use(...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [USE]`);
      server.server.use(handlers);
      self.log.debug(`[${ server.type }] initForPlugins [USE] OKAY`);
      resolve();
    });
  }
  head(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [HEAD]${ path }`);
      server.server.head(path, handlers);
      self.log.debug(`[${ server.type }] initForPlugins [HEAD] OKAY`);
      resolve();
    });
  }
  get(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [GET]${ path }`);
      server.server.get(path, handlers);
      self.log.debug(`[${ server.type }] initForPlugins [GET] OKAY`);
      resolve();
    });
  }
  post(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [POST]${ path }`);
      server.server.post(path, handlers);
      self.log.debug(`[${ server.type }] initForPlugins [POST] OKAY`);
      resolve();
    });
  }
  put(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [PUT]${ path }`);
      server.server.put(path, handlers);
      self.log.debug(`[${ server.type }] initForPlugins [PUT] OKAY`);
      resolve();
    });
  }
  delete(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [DELETE]${ path }`);
      server.server.delete(path, handlers);
      self.log.debug(`[${ server.type }] initForPlugins [DELETE] OKAY`);
      resolve();
    });
  }
  patch(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [PATCH]${ path }`);
      server.server.patch(path, handlers);
      self.log.debug(`[${ server.type }] initForPlugins [PATCH] OKAY`);
      resolve();
    });
  }
  options(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [OPTIONS]${ path }`);
      server.server.options(path, handlers);
      self.log.debug(`[${ server.type }] initForPlugins [OPTIONS] OKAY`);
      resolve();
    });
  }
  all(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [ALL]${ path }`);
      server.server.all(path, handlers);
      self.log.debug(`[${ server.type }] initForPlugins [ALL] OKAY`);
      resolve();
    });
  }

  // HTTP ONLY SERVER
  httpUse(...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [USE]`);
      self.HTTPExpress.use(handlers);
      self.log.debug(`[HTTP_ONLY] initForPlugins [USE] OKAY`);
      resolve();
    });
  }
  httpHead(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      let server = self.getServerToListenTo();
      self.log.debug(`[${ server.type }] initForPlugins [HEAD]${ path }`);
      server.server.head(path, handlers);
      self.log.debug(`[${ server.type }] initForPlugins [HEAD] OKAY`);
      resolve();
    });
  }
  httpGet(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [GET]${ path }`);
      self.HTTPExpress.get(path, handlers);
      self.log.debug(`[HTTP_ONLY] initForPlugins [GET] OKAY`);
      resolve();
    });
  }
  httpPost(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [POST]${ path }`);
      self.HTTPExpress.post(path, handlers);
      self.log.debug(`[HTTP_ONLY] initForPlugins [POST] OKAY`);
      resolve();
    });
  }
  httpPut(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [PUT]${ path }`);
      self.HTTPExpress.put(path, handlers);
      self.log.debug(`[HTTP_ONLY] initForPlugins [PUT] OKAY`);
      resolve();
    });
  }
  httpDelete(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [DELETE]${ path }`);
      self.HTTPExpress.delete(path, handlers);
      self.log.debug(`[HTTP_ONLY] initForPlugins [DELETE] OKAY`);
      resolve();
    });
  }
  httpPatch(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [PATCH]${ path }`);
      self.HTTPExpress.patch(path, handlers);
      self.log.debug(`[HTTP_ONLY] initForPlugins [PATCH] OKAY`);
      resolve();
    });
  }
  httpOptions(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [OPTIONS]${ path }`);
      self.HTTPExpress.options(path, handlers);
      self.log.debug(`[HTTP_ONLY] initForPlugins [OPTIONS] OKAY`);
      resolve();
    });
  }
  httpAll(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.https) return reject('HTTP NOT ENABLED');
      self.log.debug(`[HTTP_ONLY] initForPlugins [ALL]${ path }`);
      self.HTTPExpress.all(path, handlers);
      self.log.debug(`[HTTP_ONLY] initForPlugins [ALL] OKAY`);
      resolve();
    });
  }

  // HTTPS ONLY SERVER
  httpsUse(...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [USE]`);
      self.HTTPSExpress.use(handlers);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [USE] OKAY`);
      resolve();
    });
  }
  httpsHead(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [HEAD]${ path }`);
      self.HTTPSExpress.head(path, handlers);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [HEAD] OKAY`);
      resolve();
    });
  }
  httpsGet(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [GET]${ path }`);
      self.HTTPSExpress.get(path, handlers);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [GET] OKAY`);
      resolve();
    });
  }
  httpsPost(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [POST]${ path }`);
      self.HTTPSExpress.post(path, handlers);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [POST] OKAY`);
      resolve();
    });
  }
  httpsPut(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PUT]${ path }`);
      self.HTTPSExpress.put(path, handlers);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PUT] OKAY`);
      resolve();
    });
  }
  httpsDelete(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [DELETE]${ path }`);
      self.HTTPSExpress.delete(path, handlers);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [DELETE] OKAY`);
      resolve();
    });
  }
  httpsPatch(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PATCH]${ path }`);
      self.HTTPSExpress.patch(path, handlers);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [PATCH] OKAY`);
      resolve();
    });
  }
  httpsOptions(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [OPTIONS]${ path }`);
      self.HTTPSExpress.options(path, handlers);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [OPTIONS] OKAY`);
      resolve();
    });
  }
  httpsAll(path: string, ...handlers: any): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (self.getPluginConfig().server === IWebServerConfigServer.http) return reject('HTTPS NOT ENABLED');
      self.log.debug(`[HTTPS_ONLY] initForPlugins [ALL]${ path }`);
      self.HTTPSExpress.all(path, handlers);
      self.log.debug(`[HTTPS_ONLY] initForPlugins [ALL] OKAY`);
      resolve();
    });
  }
}

