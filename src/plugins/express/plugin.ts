import { IPlugin, PluginFeature } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { IWebServerConfig, IWebServerInitPlugin } from './config';
import * as EXPRESS from 'express';
import { Express } from 'express';

export class Plugin implements IPlugin {
  private Express!: Express;
  private Features!: PluginFeature;
  initIndex: number = -999999;
  init (features: PluginFeature): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      self.Features = features;
      self.Express = EXPRESS();
      features.log.info(`Server ready to listen port ${features.getPluginConfig<IWebServerConfig>().port || 80}`);
      resolve();
    });
  }
  loadedIndex: number = 999999;
  loaded (features: PluginFeature): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      self.Features.log.debug(`loaded`);
      self.Express.listen(features.getPluginConfig<IWebServerConfig>().port || 80, '0.0.0.0', () => console.log(`Listening on port ${features.getPluginConfig<IWebServerConfig>().port || 80} for WW!`));
      features.log.info(`Server listening on port ${features.getPluginConfig<IWebServerConfig>().port || 80}`);
      resolve();
    });
  }
  initForPlugins<T1 = IWebServerInitPlugin, T2 = void> (initType: string, args: T1): Promise<T2> {
    const self = this;
    return new Promise((resolve) => {
      let argsAs = args as unknown as IWebServerInitPlugin;
      self.Features.log.debug(`initForPlugins [${initType}] ${argsAs.arg1}`);
      if (Tools.isNullOrUndefined(argsAs.arg2))
        (this.Express as any)[initType](argsAs.arg1);
      else
        (this.Express as any)[initType](argsAs.arg1, argsAs.arg2);
      self.Features.log.debug(`initForPlugins [${initType}] - OKAY`);
      (resolve as any)();
    });
  }
}

