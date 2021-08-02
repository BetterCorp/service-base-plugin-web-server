import { CPlugin, CPluginClient } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { Request, Response } from 'express';
export interface IExpressJWTInit {
  req: Request,
  res: Response,
  next: Function;
}
import * as jsonwebtoken from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { ExpressJWTEvents } from '../../lib';
import { IEJWTPluginConfig } from './sec.config';

export enum EJWTTokenType {
  req = "req",
  reqOrQuery = "reqOrQuery",
  query = "query"
}
export class expressJwt extends CPluginClient<IEJWTPluginConfig> {
  public readonly _pluginName: string = "expressJwt";

  async expressVerify(req: Request, res: Response, tokenType: EJWTTokenType = EJWTTokenType.req): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.expressVerifyQuiet(req, res, tokenType).then(x => {
        if (x === false) {
          res.status(403).send('Forbidden');
          return reject();
        }
        resolve(x);
      });
    });
  }

  async expressVerifyQuiet(req: Request, res: Response, tokenType: EJWTTokenType = EJWTTokenType.req): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      let foundToken: string | null = null;
      if (tokenType === EJWTTokenType.req || tokenType === EJWTTokenType.reqOrQuery) {
        if (`${ req.headers.authorization }`.indexOf('Bearer ') === 0) {
          self.refPlugin.log.warn('*authorization: no header');
        } else {
          foundToken = `${ req.headers.authorization }`.split(' ')[1];
        }
      }
      if (foundToken === null && (tokenType === EJWTTokenType.query || tokenType === EJWTTokenType.reqOrQuery)) {
        if (Tools.isNullOrUndefined(req.query) || Tools.isNullOrUndefined(req.query[self.getPluginConfig().queryKey])) {
          self.refPlugin.log.warn('*authorization: failed no query passtk');
        } else {
          foundToken = decodeURIComponent(`${ req.query[self.getPluginConfig().queryKey] }`);
        }
      }

      if (Tools.isNullOrUndefined(foundToken) || foundToken == "") {
        self.refPlugin.log.warn('*authorization: failed no token');
        return resolve(false);
      }

      self.emitEventAndReturn(`${ ExpressJWTEvents.validateToken }-${ self.getPluginConfig().authKey }`, foundToken).then(resolve).catch(() => {
        self.refPlugin.log.warn('*authorization: failed');
        return resolve(false);
      });
    });
  }
}

export class Plugin extends CPlugin<IEJWTPluginConfig>{
  private JWTClient!: jwksClient.JwksClient;
  getJWTKey(header: any, callback: Function) {
    this.JWTClient.getSigningKey(header.kid, function (err: any, key: any) {
      try {
        var signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      } catch (exc) {
        callback(exc);
      }
    });
  }

  public readonly initIndex: number = -999997;
  init(): Promise<void> {
    const self = this;
    return new Promise((resolve) => {
      self.JWTClient = jwksClient({
        jwksUri: self.getPluginConfig().keyUrl
      });
      self.onReturnableEvent(null, `${ ExpressJWTEvents.validateToken }-${ self.getPluginConfig().authKey }`, self.validateToken);
      self.log.info(`JWT Ready with pub keys: ${ self.getPluginConfig().keyUrl } and related auth: ${ self.getPluginConfig().authKey }`);
      resolve();
    });
  }

  validateToken(resolve: any, reject: any, data: string) {
    const self = this;
    jsonwebtoken.verify(data, (a, b) => { self.getJWTKey(a, b); }, self.getPluginConfig().options, (err: any, decoded: any) => {
      if (err) {
        self.log.warn('*authorization: failed error');
        self.log.error(err);
        return reject();
      }
      resolve({
        ...decoded,
        _from: 'token'
      });
    });
  }
}

