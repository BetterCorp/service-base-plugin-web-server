import { CPlugin, CPluginClient } from '@bettercorp/service-base/lib/interfaces/plugins';
import { Tools } from '@bettercorp/tools/lib/Tools';
import * as jsonwebtoken from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import { WebJWTEvents } from '../../lib';
import { IEJWTPluginAuthType, IEJWTPluginConfig } from './sec.config';
import * as bcrypt from 'bcrypt';

export class JWTLib {
  private JWTClient!: jwksClient.JwksClient;
  private uSelf!: CPlugin<IEJWTPluginConfig> | CPluginClient<IEJWTPluginConfig>;
  async init(uSelf: CPlugin<IEJWTPluginConfig> | CPluginClient<IEJWTPluginConfig>): Promise<JWTLib> {
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

  async validateToken(data: string, local: boolean) {
    const self = this.uSelf;
    const aSelf = this;
    return new Promise(async (resolve: any, reject: any) => {
      if (!local) {
        return self.emitEventAndReturn(`${ WebJWTEvents.validateToken }-${ (await self.getPluginConfig()).authKey }`, data).then(resolve).catch(() => {
          return resolve(false);
        });
      }
      if ((await self.getPluginConfig()).authType === IEJWTPluginAuthType.JWTCERTS) {
        return jsonwebtoken.verify(data, (a, b) => { aSelf.getJWTKey(a, b); }, (await self.getPluginConfig()).options, async (err: any, decoded: any) => {
          if (err) {
            return reject();
          }
          if (!Tools.isNullOrUndefined((await self.getPluginConfig()).options.issuer)) {
            if (Tools.isArray((await this.uSelf.getPluginConfig()).options.issuer)) {
              if (((await this.uSelf.getPluginConfig()).options.issuer as Array<string>).indexOf((decoded as jsonwebtoken.JwtPayload).iss || bcrypt.genSaltSync(8)) < 0)
                return reject();
            } else {
              if ((decoded as jsonwebtoken.JwtPayload).iss !== (await self.getPluginConfig()).options.issuer)
                return reject();
            }
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
        if (!Tools.isNullOrUndefined((await this.uSelf.getPluginConfig()).options.issuer)) {
          if (Tools.isArray((await this.uSelf.getPluginConfig()).options.issuer)) {
            if (((await this.uSelf.getPluginConfig()).options.issuer as Array<string>).indexOf((decoded as jsonwebtoken.JwtPayload).iss || bcrypt.genSaltSync(8)) < 0)
              throw 'Invalid token';
          } else {
            if ((decoded as jsonwebtoken.JwtPayload).iss !== (await self.getPluginConfig()).options.issuer)
              throw 'Invalid token';
          }
        }
        resolve({
          ...(decoded as jsonwebtoken.JwtPayload),
          _from: 'token'
        });
      } catch (xcc) {
        return reject();
      }
    });
  }

  async signTokenSecretKey(tokenData: any, userId: string) {
    return jsonwebtoken.sign(tokenData, (await this.uSelf.getPluginConfig()).secretKey, {
      expiresIn: (60 * (await this.uSelf.getPluginConfig()).tokenLifespanMinutes),
      issuer: ((await this.uSelf.getPluginConfig()).options.issuer || ((this.uSelf as CPluginClient<any>).refPlugin || this.uSelf || {}).pluginName || 'bsb-jwt').toString(),
      subject: userId
    });
  }
}