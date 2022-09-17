import { VerifyOptions } from "jsonwebtoken";
import { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import { SecConfig } from "@bettercorp/service-base";
import { EJWTTokenType } from "./plugin";

export interface IExpressJWTInit {
  req: Request;
  res: Response;
  next: Function;
}
export enum IEJWTPluginAuthType {
  JWTCERTS = "JWTCERTS",
  JWTSECRET = "JWTSECRET",
}
export interface IEJWTPluginConfig {
  keyUrl: string; // Key URL: JWT Signing key url
  bearerStr: string; // Bearer String: Changes auth header 'Bearer (token)' value
  authKey: string; // Auth Key: For using secret key signing
  secretKey: string; // Secret Key: Signing key
  authType: IEJWTPluginAuthType; // Auth Type: Type of signing to do
  queryKey: string; // Query Key: For WebServers to use query string auth instead of header auth
  options: VerifyOptions; // Options: Signing options
  tokenLifespanMinutes: number; // Token Lifespan: Token lifespan in minutes
  defaultTokenType: EJWTTokenType; // Default Token Type: The default web server token validation type
  allowedTokenTypes: Array<EJWTTokenType>; // Allowed Token Types: If clients should only use certain types of tokens (header/query etc...)
}

export class Config extends SecConfig<IEJWTPluginConfig> {
  migrate(
    mappedPluginName: string,
    existingConfig: IEJWTPluginConfig
  ): IEJWTPluginConfig {
    return {
      keyUrl:
        existingConfig.keyUrl !== undefined
          ? existingConfig.keyUrl
          : "/auth/realms/RealmName/protocol/openid-connect/certs",
      bearerStr:
        existingConfig.bearerStr !== undefined
          ? existingConfig.bearerStr
          : "Bearer",
      authKey:
        existingConfig.authKey !== undefined
          ? existingConfig.authKey
          : bcrypt.genSaltSync(8),
      secretKey:
        existingConfig.secretKey !== undefined
          ? existingConfig.secretKey
          : bcrypt.genSaltSync(8),
      queryKey:
        existingConfig.queryKey !== undefined
          ? existingConfig.queryKey
          : "passtk",
      authType:
        existingConfig.authType !== undefined
          ? existingConfig.authType
          : IEJWTPluginAuthType.JWTCERTS,
      options: {
        algorithms:
          (existingConfig.options || {}).algorithms !== undefined
            ? (existingConfig.options || {}).algorithms
            : ["RS256"],
        issuer:
          (existingConfig.options || {}).issuer !== undefined
            ? (existingConfig.options || {}).issuer
            : "/auth/realms/RealmName",
        audience:
          (existingConfig.options || {}).audience !== undefined
            ? (existingConfig.options || {}).audience
            : "account",
      },
      tokenLifespanMinutes:
        existingConfig.tokenLifespanMinutes !== undefined
          ? existingConfig.tokenLifespanMinutes
          : 60,
      defaultTokenType:
        existingConfig.defaultTokenType !== undefined
          ? existingConfig.defaultTokenType
          : EJWTTokenType.reqOrQuery,
      allowedTokenTypes:
        existingConfig.allowedTokenTypes !== undefined
          ? existingConfig.allowedTokenTypes
          : [EJWTTokenType.reqOrQuery, EJWTTokenType.req, EJWTTokenType.query],
    };
  }
}
