import { VerifyOptions } from 'jsonwebtoken';

import { Request, Response } from 'express';
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
  keyUrl?: string;
  bearerStr: string;
  authKey: string;
  secretKey?: string;
  authType: IEJWTPluginAuthType;
  queryKey: string;
  options: VerifyOptions;
}

export default (pluginName: string, existingPluginConfig: any): IEJWTPluginConfig => {
  return {
    "keyUrl": "/auth/realms/RealmName/protocol/openid-connect/certs",
    "clientCanResolveLocally": false,
    "bearerStr": "Bearer",
    "authKey": "notset",
    "secretKey": "notset",
    "queryKey": "passtk",
    "authType": IEJWTPluginAuthType.JWTCERTS,
    "options": {
      "algorithms": ["RS256"],
      "issuer": "/auth/realms/RealmName",
      "audience": "account"
    }
  };
};