import { CPlugin } from '@bettercorp/service-base/lib/interfaces/plugins';
import { WebJWTEvents } from '../../lib';
import { JWTLib } from './lib';
import { IEJWTPluginAuthType, IEJWTPluginConfig } from './sec.config';

export enum EJWTTokenType {
  req = "req",
  reqOrQuery = "reqOrQuery",
  query = "query"
}

export class Plugin extends CPlugin<IEJWTPluginConfig>{
  private JWTLib!: JWTLib;

  public readonly initIndex: number = -999997;
  init(): Promise<void> {
    const self = this;
    return new Promise(async (resolve) => {
      self.JWTLib = await (new JWTLib()).init(self);

      self.onReturnableEvent(null, `${ WebJWTEvents.validateToken }-${ (await self.getPluginConfig()).authKey }`, (data) => self.JWTLib.validateToken(data, true));
      if ((await self.getPluginConfig()).authType === IEJWTPluginAuthType.JWTCERTS)
        self.log.info(`JWT Ready with pub keys: ${ (await self.getPluginConfig()).keyUrl } and related auth: ${ (await self.getPluginConfig()).authKey }`);
      else
        self.log.info(`JWT Ready with secret key and related auth: ${ (await self.getPluginConfig()).authKey }`);
      resolve();
    });
  }
}

