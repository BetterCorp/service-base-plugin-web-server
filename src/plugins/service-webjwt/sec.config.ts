import * as bcrypt from "bcrypt";
import { SecConfig } from "@bettercorp/service-base";
import { EJWTTokenType } from "./plugin";

export enum IEJWTPluginAuthType {
  JWTCERTS = "JWTCERTS",
  JWTSECRET = "JWTSECRET",
}
// https://github.com/auth0/node-jsonwebtoken#algorithms-supported
export type Algorithm =
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"
  | "ES256"
  | "ES384"
  | "ES512"
  | "PS256"
  | "PS384"
  | "PS512"
  | "none";

export interface VerifyOptions {
  algorithms?: Algorithm[] | undefined;
  audience?: string | RegExp | Array<string | RegExp> | undefined;
  clockTimestamp?: number | undefined;
  clockTolerance?: number | undefined;
  /** return an object with the decoded `{ payload, header, signature }` instead of only the usual content of the payload. */
  complete?: boolean | undefined;
  issuer?: string | string[] | undefined;
  ignoreExpiration?: boolean | undefined;
  ignoreNotBefore?: boolean | undefined;
  jwtid?: string | undefined;
  /**
   * If you want to check `nonce` claim, provide a string value here.
   * It is used on Open ID for the ID Tokens. ([Open ID implementation notes](https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes))
   */
  nonce?: string | undefined;
  subject?: string | undefined;
  maxAge?: string | number | undefined;
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
