import { IPlugin, PluginFeature } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { IWebServerConfig, IWebServerInitPlugin } from './config';
import * as EXPRESS from 'express';
import { Express } from 'express';

export class Plugin implements IPlugin {
  private Express!: Express;
  initIndex: number = -999999;
  init (features: PluginFeature): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      self.Express = EXPRESS();
      features.log.info(`Server ready to listen port ${features.getPluginConfig<IWebServerConfig>().port || 80}`);
      resolve();
    });
  }
  loadedIndex: number = 999999;
  loaded (features: PluginFeature): Promise<void> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.Express.listen(features.getPluginConfig<IWebServerConfig>().port || 80, '0.0.0.0', () => console.log(`Listening on port ${features.getPluginConfig<IWebServerConfig>().port || 80} for WW!`));
      features.log.info(`Server listening on port ${features.getPluginConfig<IWebServerConfig>().port || 80}`);
      resolve();
    });
  }
  initForPlugins<T1 = IWebServerInitPlugin, T2 = void> (initType: string, args: T1): Promise<T2> {
    return new Promise((resolve, reject) => {
      let argsAs = args as unknown as IWebServerInitPlugin;
      if (Tools.isNullOrUndefined(argsAs.arg2))
        (this.Express as any)[initType](argsAs.arg1);
      else
        (this.Express as any)[initType](argsAs.arg1, argsAs.arg2);
      (resolve as any)();
    });
  }
}

