import { IPlugin, PluginFeature } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { IWebServerConfig, IWebServerInitPlugin } from './config';
import * as EXPRESS from 'express';
import { Express } from 'express';
import * as http from 'http';
import * as https from 'https';
import { readFileSync } from 'fs';

export class Plugin implements IPlugin {
  private HTTPExpress!: Express;
  private HTTPSExpress!: Express;
  private Features!: PluginFeature;
  static initIndex: number = -999999;
  init(features: PluginFeature): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      self.Features = features;
      if (features.getPluginConfig<IWebServerConfig>().http) {
        self.HTTPExpress = EXPRESS();
        if (features.getPluginConfig<IWebServerConfig>().httpAutoRedirect === true && features.getPluginConfig<IWebServerConfig>().https) {
          self.HTTPExpress.use((req: any, res: any) => {
            res.redirect(301, `https://${ req.hostname }:${ features.getPluginConfig<IWebServerConfig>().httpsPort }${ req.originalUrl }`);
          });
        }
        features.log.info(`[HTTP] Server ready: ${ features.getPluginConfig<IWebServerConfig>().host }:${ features.getPluginConfig<IWebServerConfig>().httpPort }`);
      }
      if (features.getPluginConfig<IWebServerConfig>().https) {
        if (features.getPluginConfig<IWebServerConfig>().httpAndHttps === false || features.getPluginConfig<IWebServerConfig>().http === false)
          self.HTTPSExpress = EXPRESS();
        features.log.info(`[HTTPS] Server ready: ${ features.getPluginConfig<IWebServerConfig>().host }:${ features.getPluginConfig<IWebServerConfig>().httpsPort }`);
      }
      resolve();
    });
  }
  static loadedIndex: number = 999999;
  loaded(features: PluginFeature): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      features.log.debug(`loaded`);
      if (features.getPluginConfig<IWebServerConfig>().http) {
        http.createServer(self.HTTPExpress).listen(features.getPluginConfig<IWebServerConfig>().httpPort, features.getPluginConfig<IWebServerConfig>().host, () =>
          console.log(`[HTTP] Listening ${ features.getPluginConfig<IWebServerConfig>().host }:${ features.getPluginConfig<IWebServerConfig>().httpPort } for WW!`));
        features.log.info(`[HTTP] Server started ${ features.getPluginConfig<IWebServerConfig>().host }:${ features.getPluginConfig<IWebServerConfig>().httpPort }`);
      }
      if (features.getPluginConfig<IWebServerConfig>().https) {
        let opts: https.ServerOptions = {
          cert: readFileSync(features.getPluginConfig<IWebServerConfig>().httpsCert!),
          key: readFileSync(features.getPluginConfig<IWebServerConfig>().httpsKey!)
        };
        https.createServer(opts,
          features.getPluginConfig<IWebServerConfig>().httpAndHttps === true && features.getPluginConfig<IWebServerConfig>().http !== false
            ? self.HTTPExpress
            : self.HTTPSExpress).listen(
              (features.getPluginConfig<IWebServerConfig>().httpsPort, features.getPluginConfig<IWebServerConfig>().host, () =>
                console.log(`[HTTPS] Listening ${ features.getPluginConfig<IWebServerConfig>().host }:${ features.getPluginConfig<IWebServerConfig>().httpPort } for WW[S]!`)));
        features.log.info(`[HTTPS] Server started ${ features.getPluginConfig<IWebServerConfig>().host }:${ features.getPluginConfig<IWebServerConfig>().httpsPort }`);
      }
      resolve();
    });
  }
  initForPlugins<T1 = IWebServerInitPlugin, T2 = void>(initType: string, args: T1): Promise<T2> {
    const self = this;
    return new Promise((resolve) => {
      let argsAs = args as unknown as IWebServerInitPlugin;
      let serverToListenOn = self.HTTPExpress;
      let serverToListenOnComment = 'HTTP';
      if (self.Features.getPluginConfig<IWebServerConfig>().https) {
        if (self.Features.getPluginConfig<IWebServerConfig>().httpAndHttps === true && self.Features.getPluginConfig<IWebServerConfig>().http !== false) {
          serverToListenOnComment = 'HTTP/HTTPS';
        } else {
          serverToListenOn = self.HTTPSExpress;
          serverToListenOnComment = 'HTTPS';
        }
      }

      self.Features.log.debug(`[${ serverToListenOnComment }] initForPlugins [${ initType }] ${ argsAs.arg1 } / `);
      if (Tools.isNullOrUndefined(argsAs.arg2))
        (serverToListenOn as any)[initType](argsAs.arg1);
      else
        (serverToListenOn as any)[initType](argsAs.arg1, argsAs.arg2);
      self.Features.log.debug(`[${ serverToListenOnComment }] initForPlugins [${ initType }] - OKAY`);
      (resolve as any)();
    });
  }
}

