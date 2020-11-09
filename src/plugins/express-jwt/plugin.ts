import { IPlugin, PluginFeature } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { Request, Response } from 'express';
export interface IExpressJWTInit {
  req: Request,
  res: Response,
  next: Function;
}
import * as jsonwebtoken from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

export class Plugin implements IPlugin {
  private JWTClient!: jwksClient.JwksClient;
  private FEATURES!: PluginFeature;
  getJWTKey (header: any, callback: Function) {
    this.JWTClient.getSigningKey(header.kid, function (err: any, key: any) {
      try {
        var signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      } catch (exc) {
        callback(exc);
      }
    });
  }

  initIndex: number = -999998;
  init (features: PluginFeature): Promise<void> {
    const self = this;
    self.FEATURES = features;
    return new Promise((resolve) => {
      self.JWTClient = jwksClient({
        jwksUri: features.getPluginConfig().keyUrl
      });
      features.log.info(`JWT Ready with pub keys: ${features.getPluginConfig().keyUrl}`);
      resolve();
    });
  }
  initForPlugins<T1 = IExpressJWTInit, T2 = boolean | any> (initType: string, args: T1): Promise<T2> {
    const self = this;
    return new Promise((resolve, reject) => {
      if (initType == 'REQ') {
        const argsForExpressReq = args as unknown as IExpressJWTInit;
        if (`${argsForExpressReq.req.headers.authorization}`.indexOf('Bearer ') !== 0) {
          self.FEATURES.log.warn('*authorization: failed no header');
          return resolve(false as any);
        }

        const bearerToken = `${argsForExpressReq.req.headers.authorization}`.split(' ')[1];
        jsonwebtoken.verify(bearerToken, self.getJWTKey as any, self.FEATURES.getPluginConfig().config, (err: any, decoded: any) => {
          if (err) {
            self.FEATURES.log.warn('*authorization: failed error');
            self.FEATURES.log.error(err);
            return resolve(false as any);
          }
          resolve(decoded);
        });
        return;
      }
      if (initType == 'QUERY') {
        const argsForExpressReq = args as unknown as IExpressJWTInit;
        if (Tools.isNullOrUndefined(argsForExpressReq.req.query))
          return resolve(false as any);
        if (Tools.isNullOrUndefined(argsForExpressReq.req.query.passtk))
          return resolve(false as any);

        const bearerToken = decodeURIComponent(`${argsForExpressReq.req.query.passtk}`);
        jsonwebtoken.verify(bearerToken, self.getJWTKey as any, self.FEATURES.getPluginConfig().config, (err: any, decoded: any) => {
          if (err) {
            self.FEATURES.log.error(err);
            resolve(false as any);
            return;
          }
          resolve(decoded);
        });
        return;
      }
      return reject(`Unknown Init (${initType})`);
    });
  }
}

