import { VerifyOptions } from 'jsonwebtoken';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';

export interface IExpressJWTInit {
  req: Request,
  res: Response,
  next: Function;
}
export enum IEJWTPluginAuthType {
  JWTCERTS = "JWTCERTS",
  JWTSECRET = "JWTSECRET",
}
export interface IEJWTPluginConfig {
  clientCanResolveLocally: boolean;
  keyUrl: string;
  bearerStr: string;
  authKey: string;
  secretKey: string;
  authType: IEJWTPluginAuthType;
  queryKey: string;
  options: VerifyOptions;
  tokenLifespanMinutes: number;
  issuer: string | null;
}

export default (pluginName: string, existingPluginConfig: any): IEJWTPluginConfig => {
  return {
    keyUrl: "/auth/realms/RealmName/protocol/openid-connect/certs",
    clientCanResolveLocally: false,
    bearerStr: "Bearer",
    authKey: bcrypt.genSaltSync(8),
    secretKey: bcrypt.genSaltSync(8),
    queryKey: "passtk",
    authType: IEJWTPluginAuthType.JWTCERTS,
    options: {
      algorithms: ["RS256"],
      issuer: "/auth/realms/RealmName",
      audience: "account"
    },
    issuer: null,
    tokenLifespanMinutes: 60
  };
};