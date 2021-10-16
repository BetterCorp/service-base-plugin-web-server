import { CPlugin } from '@bettercorp/service-base/lib/ILib';
import { Request, Response } from 'express';
export interface IExpressJWTInit {
  req: Request,
  res: Response,
  next: Function;
}
import * as jsonwebtoken from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { WebJWTEvents } from '../../lib';
import { IEJWTPluginConfig } from './sec.config';

export enum EJWTTokenType {
  req = "req",
  reqOrQuery = "reqOrQuery",
  query = "query"
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
    return new Promise(async (resolve) => {
      self.JWTClient = jwksClient({
        jwksUri: (await self.getPluginConfig()).keyUrl
      });
      self.onReturnableEvent(null, `${ WebJWTEvents.validateToken }-${ (await self.getPluginConfig()).authKey }`, (a, b, c) => self.validateToken(a, b, c));
      self.log.info(`JWT Ready with pub keys: ${ (await self.getPluginConfig()).keyUrl } and related auth: ${ (await self.getPluginConfig()).authKey }`);
      resolve();
    });
  }

  async validateToken(resolve: any, reject: any, data: string) {
    const self = this;
    jsonwebtoken.verify(data, (a, b) => { self.getJWTKey(a, b); }, (await self.getPluginConfig()).options, (err: any, decoded: any) => {
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

