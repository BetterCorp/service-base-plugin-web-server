import { VerifyOptions } from 'jsonwebtoken';

export interface IEJWTPluginConfig {
  keyUrl: string;
  authKey: string;
  queryKey: string;
  options: VerifyOptions
}

export default (pluginName: string, existingPluginConfig: any): IEJWTPluginConfig => {
  return {
    "keyUrl": "/auth/realms/RealmName/protocol/openid-connect/certs",
    "authKey": "notset",
    "queryKey": "passtk",
    "options": {
      "algorithms": ["RS256"],
      "issuer": "/auth/realms/RealmName",
      "audience": "account"
    }
  };
};