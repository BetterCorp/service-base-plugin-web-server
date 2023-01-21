import { EJWTTokenType, IEJWTPluginAuthType, IEJWTPluginConfig } from "./sec.config";
import * as jsonwebtoken from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import * as bcrypt from "bcrypt";
import { ServiceCallable, ServicesBase } from "@bettercorp/service-base";
import { Tools } from "@bettercorp/tools/lib/Tools";

export interface EmitAndReturnableEvents {
  validateToken(token: string): Promise<any>;
  signToken(tokenData: any, userId: string): Promise<string>;
  getConfig():Promise<{
    bearerStr: string,
    queryKey: string,
    defaultTokenType: EJWTTokenType,
    allowedTokenTypes: Array<EJWTTokenType>,
  }>
}

export class Service extends ServicesBase<
  ServiceCallable,
  ServiceCallable,
  EmitAndReturnableEvents,
  ServiceCallable,
  ServiceCallable,
  IEJWTPluginConfig
> {
  private JWTClient!: jwksClient.JwksClient;
  public override async init() {
    if (
      (await this.getPluginConfig()).authType === IEJWTPluginAuthType.JWTCERTS
    )
      this.JWTClient = jwksClient({
        jwksUri: (await this.getPluginConfig()).keyUrl!,
      });

    const self = this;
    await this.onReturnableEvent("validateToken", async (token: string) => {
      return await self.validateToken(token);
    });
    await this.onReturnableEvent(
      "signToken",
      async (tokenData: any, userId: string) => {
        return await self.signTokenSecretKey(tokenData, userId);
      }
    );
    await this.onReturnableEvent("getConfig", async () => {
      return {
        bearerStr: (await self.getPluginConfig()).bearerStr,
        queryKey: (await self.getPluginConfig()).queryKey,
        defaultTokenType: (await self.getPluginConfig()).defaultTokenType,
        allowedTokenTypes: (await self.getPluginConfig()).allowedTokenTypes
      }
    });
  }
  private getJWTKey(header: any, callback: Function) {
    this.JWTClient.getSigningKey(header.kid, function (err: any, key: any) {
      try {
        var signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      } catch (exc) {
        callback(exc);
      }
    });
  }
  private async validateToken(data: string) {
    const self = this;
    return new Promise(async (resolve: any, reject: any) => {
      if (
        (await self.getPluginConfig()).authType === IEJWTPluginAuthType.JWTCERTS
      ) {
        return jsonwebtoken.verify(
          data,
          (a, b) => {
            self.getJWTKey(a, b);
          },
          (await self.getPluginConfig()).options,
          async (err: any, decoded: any) => {
            if (err) {
              return reject(err);
            }
            if (
              !Tools.isNullOrUndefined(
                (await self.getPluginConfig()).options.issuer
              )
            ) {
              if (
                Tools.isArray((await self.getPluginConfig()).options.issuer)
              ) {
                if (
                  (
                    (await self.getPluginConfig()).options
                      .issuer as Array<string>
                  ).indexOf(
                    (decoded as jsonwebtoken.JwtPayload).iss ||
                      bcrypt.genSaltSync(8)
                  ) < 0
                )
                  return reject();
              } else {
                if (
                  (decoded as jsonwebtoken.JwtPayload).iss !==
                  (await self.getPluginConfig()).options.issuer
                )
                  return reject();
              }
            }
            resolve({
              ...decoded,
              _from: "token",
            });
          }
        );
      }
      try {
        let decoded = jsonwebtoken.verify(
          data,
          (await self.getPluginConfig()).secretKey!,
          (await self.getPluginConfig()).options
        );
        if (Tools.isString(decoded)) throw "Invalid token";
        if (
          !Tools.isNullOrUndefined(
            (await self.getPluginConfig()).options.issuer
          )
        ) {
          if (Tools.isArray((await self.getPluginConfig()).options.issuer)) {
            if (
              (
                (await self.getPluginConfig()).options.issuer as Array<string>
              ).indexOf(
                (decoded as jsonwebtoken.JwtPayload).iss ||
                  bcrypt.genSaltSync(8)
              ) < 0
            )
              throw "Invalid token";
          } else {
            if (
              (decoded as jsonwebtoken.JwtPayload).iss !==
              (await self.getPluginConfig()).options.issuer
            )
              throw "Invalid token";
          }
        }
        resolve({
          ...(decoded as jsonwebtoken.JwtPayload),
          _from: "token",
        });
      } catch (xcc) {
        return reject(xcc);
      }
    });
  }

  private async signTokenSecretKey(tokenData: any, userId: string) {
    const tokenLifespanMinutes = (await this.getPluginConfig()).tokenLifespanMinutes;
    return jsonwebtoken.sign(
      tokenData,
      (await this.getPluginConfig()).secretKey,
      {
        expiresIn: tokenLifespanMinutes === null ? undefined : 60 * tokenLifespanMinutes,
        issuer: (
          (await this.getPluginConfig()).options.issuer || this.pluginName
        ).toString(),
        subject: userId,
      }
    );
  }
}
