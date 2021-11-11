import { CPlugin, CPluginClient } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import * as jsonwebtoken from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { WebJWTEvents } from '../../lib';
import { IEJWTPluginAuthType } from './sec.config';

export class JWTLib {
  private JWTClient!: jwksClient.JwksClient;
  private uSelf!: CPlugin | CPluginClient<any>;
  async init(uSelf: CPlugin | CPluginClient<any>): Promise<JWTLib> {
    this.uSelf = uSelf;
    if ((await uSelf.getPluginConfig()).authType === IEJWTPluginAuthType.JWTCERTS)
      this.JWTClient = jwksClient({
        jwksUri: (await uSelf.getPluginConfig()).keyUrl!
      });
    return this;
  }
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

  async validateToken(resolve: any, reject: any, data: string, local: boolean) {
    const self = this.uSelf;
    const aSelf = this;
    if (!local) {
      return self.emitEventAndReturn(`${ WebJWTEvents.validateToken }-${ (await self.getPluginConfig()).authKey }`, data).then(resolve).catch(() => {
        return resolve(false);
      });
    }
    if ((await self.getPluginConfig()).authType === IEJWTPluginAuthType.JWTCERTS) {
      return jsonwebtoken.verify(data, (a, b) => { aSelf.getJWTKey(a, b); }, (await self.getPluginConfig()).options, (err: any, decoded: any) => {
        if (err) {
          return reject();
        }
        resolve({
          ...decoded,
          _from: 'token'
        });
      });
    }
    try {
      let decoded = jsonwebtoken.verify(data, (await self.getPluginConfig()).secretKey!, (await self.getPluginConfig()).options);
      if (Tools.isString(decoded)) throw 'Invalid token';
      resolve({
        ...(decoded as jsonwebtoken.JwtPayload),
        _from: 'token'
      });
    } catch (xcc) {
      return reject();
    }
  }
}