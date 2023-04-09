import { Tools } from "@bettercorp/tools/lib/Tools";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { FastifyReply, FastifyRequest } from "fastify";
import type { ServiceCallable, ServicesBase } from "@bettercorp/service-base";
import { ServicesClient } from "@bettercorp/service-base";
import { EmitAndReturnableEvents } from "../../plugins/service-webjwt/plugin";
import {
  EJWTTokenType,
  VerifyOptions,
} from "../../plugins/service-webjwt/sec.config";
import type {
  JwtHeader,
  JwtPayload,
  SigningKeyCallback,
  SignOptions,
} from "jsonwebtoken";
import { verify } from "jsonwebtoken";
import { JwksClient, Options } from "jwks-rsa";

export class webJwtExpress extends ServicesClient<
  ServiceCallable,
  ServiceCallable,
  EmitAndReturnableEvents,
  ServiceCallable,
  ServiceCallable
> {
  constructor(self: ServicesBase) {
    super(self);
  }
  public override readonly _pluginName: string = "service-webjwt";
  public override readonly initAfterPlugins: string[] = [
    "service-express",
    "service-webjwt",
  ];
  public override readonly runBeforePlugins: string[] = ["service-express"];

  private config!: {
    bearerStr: string;
    queryKey: string;
    defaultTokenType: EJWTTokenType;
    allowedTokenTypes: Array<EJWTTokenType>;
  };

  public async init() {
    this.config = await this._plugin.emitEventAndReturn("getConfig");
  }

  async verify(
    req: ExpressRequest,
    res: ExpressResponse,
    tokenType: EJWTTokenType = EJWTTokenType.req
  ): Promise<any> {
    if (this.config === undefined) throw "INIT FIRST!";
    const self = this;
    return new Promise((resolve, reject) => {
      self.verifyQuiet(req, tokenType).then((x) => {
        if (x === false) {
          res.status(403).send("Forbidden");
          return reject();
        }
        resolve(x);
      });
    });
  }

  async verifyQuiet(
    req: ExpressRequest,
    tokenType?: EJWTTokenType
  ): Promise<any> {
    if (this.config === undefined) throw "INIT FIRST!";
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (tokenType !== undefined) {
        if (self.config.allowedTokenTypes.indexOf(tokenType) < 0)
          return reject("NOT ALLOWED TOKEN TYPE!" + tokenType);
      } else tokenType = self.config.defaultTokenType;

      let foundToken: string | null = null;
      if (
        tokenType === EJWTTokenType.req ||
        tokenType === EJWTTokenType.reqOrQuery
      ) {
        if (
          `${req.headers.authorization}`.indexOf(
            `${self.config.bearerStr} `
          ) === 0
        ) {
          foundToken = `${req.headers.authorization}`.split(" ")[1];
        } else {
          await self._plugin.log.warn("*authorization: no header {bearerStr}", {
            bearerStr: self.config.bearerStr,
          });
          await self._plugin.log.debug(
            "Headers: {headers}",
            {
              headers: Object.keys(req.headers).map(
                (x) => `(${x}=${req.headers[x]})`
              ),
            },
            true
          );
        }
      }
      if (
        foundToken === null &&
        (tokenType === EJWTTokenType.query ||
          tokenType === EJWTTokenType.reqOrQuery)
      ) {
        if (
          Tools.isNullOrUndefined(req.query) ||
          Tools.isNullOrUndefined(req.query[self.config.queryKey])
        ) {
          await self._plugin.log.warn(
            "*authorization: failed no query {queryKey}",
            {
              queryKey: self.config.queryKey,
            }
          );
          await self._plugin.log.debug(
            "Query: {query}",
            {
              query: Object.keys(req.query).map(
                (x) => `(${x}=${req.query[x]})`
              ),
            },
            true
          );
        } else {
          foundToken = decodeURIComponent(`${req.query[self.config.queryKey]}`);
        }
      }

      if (Tools.isNullOrUndefined(foundToken) || foundToken == "") {
        await self._plugin.log.warn("*authorization: failed no token");
        return resolve(false);
      }

      self._plugin
        .emitEventAndReturnTimed("validateToken", 1000, foundToken!)
        .then(resolve)
        .catch(() => resolve(false));
    });
  }
}

export class webJwtFastify extends ServicesClient<
  ServiceCallable,
  ServiceCallable,
  EmitAndReturnableEvents,
  ServiceCallable,
  ServiceCallable
> {
  constructor(self: ServicesBase) {
    super(self);
  }
  public override readonly _pluginName: string = "service-webjwt";
  public override readonly initAfterPlugins: string[] = [
    "service-fastify",
    "service-webjwt",
  ];
  public override readonly runBeforePlugins: string[] = ["service-fastify"];

  private config!: {
    bearerStr: string;
    queryKey: string;
    defaultTokenType: EJWTTokenType;
    allowedTokenTypes: Array<EJWTTokenType>;
  };

  public async init() {
    this.config = await this._plugin.emitEventAndReturn("getConfig");
  }

  async verify(
    req: FastifyRequest<any>,
    reply: FastifyReply,
    tokenType: EJWTTokenType = EJWTTokenType.req
  ): Promise<any> {
    if (this.config === undefined) throw "INIT FIRST!";
    const self = this;
    return new Promise((resolve, reject) => {
      self.verifyQuiet(req, tokenType).then((x) => {
        if (x === false) {
          reply.code(403).send("Forbidden");
          return reject();
        }
        resolve(x);
      });
    });
  }

  async verifyQuiet(
    req: FastifyRequest<any, any, any, any, any, any, any, any>,
    tokenType?: EJWTTokenType
  ): Promise<any> {
    if (this.config === undefined) throw "INIT FIRST!";
    const self = this;
    return new Promise(async (resolve, reject) => {
      if (tokenType !== undefined) {
        if (self.config.allowedTokenTypes.indexOf(tokenType) < 0)
          return reject("NOT ALLOWED TOKEN TYPE!" + tokenType);
      } else tokenType = self.config.defaultTokenType;

      let foundToken: string | null = null;
      if (
        tokenType === EJWTTokenType.req ||
        tokenType === EJWTTokenType.reqOrQuery
      ) {
        if (
          `${req.headers.authorization}`.indexOf(
            `${self.config.bearerStr} `
          ) === 0
        ) {
          foundToken = `${req.headers.authorization}`.split(" ")[1];
        } else {
          await self._plugin.log.warn("*authorization: no header {bearerStr}", {
            bearerStr: self.config.bearerStr,
          });
          await self._plugin.log.debug(
            "Headers: {headers}",
            {
              headers: Object.keys(req.headers).map(
                (x) => `(${x}=${req.headers[x]})`
              ),
            },
            true
          );
        }
      }
      if (
        foundToken === null &&
        (tokenType === EJWTTokenType.query ||
          tokenType === EJWTTokenType.reqOrQuery)
      ) {
        if (
          Tools.isNullOrUndefined(req.query) ||
          Tools.isNullOrUndefined(req.query[self.config.queryKey])
        ) {
          await self._plugin.log.warn(
            "*authorization: failed no query {queryKey}",
            {
              queryKey: self.config.queryKey,
            }
          );
          await self._plugin.log.debug(
            "Query: {query}",
            {
              query: Object.keys(req.query).map(
                (x) => `(${x}=${req.query[x]})`
              ),
            },
            true
          );
        } else {
          foundToken = decodeURIComponent(`${req.query[self.config.queryKey]}`);
        }
      }

      if (Tools.isNullOrUndefined(foundToken) || foundToken == "") {
        await self._plugin.log.warn("*authorization: failed no token");
        return resolve(false);
      }

      self._plugin
        .emitEventAndReturnTimed("validateToken", 1000, foundToken!)
        .then(resolve)
        .catch(() => resolve(false));
    });
  }
}

export class webJwt extends ServicesClient<
  ServiceCallable,
  ServiceCallable,
  EmitAndReturnableEvents,
  ServiceCallable,
  ServiceCallable
> {
  constructor(self: ServicesBase) {
    super(self);
  }
  public override readonly _pluginName: string = "service-webjwt";
  public override readonly initAfterPlugins: string[] = ["service-webjwt"];

  async validateToken(token: string): Promise<any>;
  async validateToken(
    token: string,
    overrideOptions: VerifyOptions
  ): Promise<any>;
  async validateToken(
    token: string,
    overrideOptions?: VerifyOptions
  ): Promise<any> {
    return await this._plugin.emitEventAndReturn(
      "validateToken",
      token,
      overrideOptions
    );
  }

  async validateTokenQuiet(token: string): Promise<any>;
  async validateTokenQuiet(
    token: string,
    overrideOptions: VerifyOptions
  ): Promise<any>;
  async validateTokenQuiet(
    token: string,
    overrideOptions?: VerifyOptions
  ): Promise<any> {
    const self = this;
    return new Promise(async (resolve) =>
      self._plugin
        .emitEventAndReturn("validateToken", token, overrideOptions)
        .then(resolve)
        .catch(() => resolve(false))
    );
  }

  async signToken(tokenData: any, userId: string): Promise<string>;
  async signToken(
    tokenData: any,
    userId: string,
    overrideOptions: SignOptions
  ): Promise<string>;
  async signToken(
    tokenData: any,
    userId: string,
    overrideOptions?: SignOptions
  ): Promise<string> {
    return await this._plugin.emitEventAndReturn(
      "signToken",
      tokenData,
      userId,
      overrideOptions
    );
  }
}

export class webJwtLocal extends ServicesClient<
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  ServiceCallable
> {
  public override readonly _pluginName: string = "service-webjwt";
  private RequestConfig!: {
    bearerStr: string;
    queryKey: string;
    defaultTokenType: EJWTTokenType;
    allowedTokenTypes: Array<EJWTTokenType>;
  };
  private JWTClient!: JwksClient;
  private TokenConfig!: VerifyOptions;
  constructor(self: ServicesBase) {
    super(self);
  }
  public async init(
    config: {
      bearerStr: string;
      queryKey: string;
      defaultTokenType: EJWTTokenType;
      allowedTokenTypes: Array<EJWTTokenType>;
    },
    jwtConfig: Options,
    tokenConfig: VerifyOptions
  ) {
    this.RequestConfig = config;
    this.TokenConfig = tokenConfig;
    this.JWTClient = new JwksClient(jwtConfig);
  }

  private getJWTKey(header: JwtHeader, callback: SigningKeyCallback): void {
    this.JWTClient.getSigningKey(header.kid, (err: any, key: any) => {
      try {
        var signingKey = key.publicKey || key.rsaPublicKey;
        callback(null, signingKey);
      } catch (exc: any) {
        callback(exc);
      }
    });
  }

  public async verifyWebRequest<Token extends JwtPayload = any>(
    req:
      | FastifyRequest<any, any, any, any, any, any, any, any>
      | ExpressRequest,
    tokenType?: EJWTTokenType
  ): Promise<Token | boolean | null> {
    const self = this;
    return new Promise(async (resolve) => {
      if (tokenType !== undefined) {
        if (self.RequestConfig.allowedTokenTypes.indexOf(tokenType) < 0)
          return resolve(null);
      } else tokenType = self.RequestConfig.defaultTokenType;

      let foundToken: string | null = null;
      if (
        tokenType === EJWTTokenType.req ||
        tokenType === EJWTTokenType.reqOrQuery
      ) {
        if (
          `${req.headers.authorization}`.indexOf(
            `${self.RequestConfig.bearerStr} `
          ) === 0
        ) {
          foundToken = `${req.headers.authorization}`.split(" ")[1];
        } else {
          await self._plugin.log.warn("*authorization: no header {bearerStr}", {
            bearerStr: self.RequestConfig.bearerStr,
          });
          await self._plugin.log.debug(
            "Headers: {headers}",
            {
              headers: Object.keys(req.headers).map(
                (x) => `(${x}=${req.headers[x]})`
              ),
            },
            true
          );
        }
      }
      if (
        foundToken === null &&
        (tokenType === EJWTTokenType.query ||
          tokenType === EJWTTokenType.reqOrQuery)
      ) {
        if (
          Tools.isNullOrUndefined(req.query) ||
          Tools.isNullOrUndefined(req.query[self.RequestConfig.queryKey])
        ) {
          await self._plugin.log.warn(
            "*authorization: failed no query {queryKey}",
            {
              queryKey: self.RequestConfig.queryKey,
            }
          );
          await self._plugin.log.debug(
            "Query: {query}",
            {
              query: Object.keys(req.query).map(
                (x) => `(${x}=${req.query[x]})`
              ),
            },
            true
          );
        } else {
          foundToken = decodeURIComponent(
            `${req.query[self.RequestConfig.queryKey]}`
          );
        }
      }

      if (Tools.isNullOrUndefined(foundToken) || foundToken == "") {
        await self._plugin.log.warn("*authorization: failed no token");
        return resolve(null);
      }

      self.verifyToken<Token>(foundToken).then((x) => resolve(x));
    });
  }

  public async verifyToken<Token extends JwtPayload = any>(
    token?: string | null
  ): Promise<boolean | Token> {
    const self = this;
    return new Promise(async (resolve) => {
      if (token === undefined) return resolve(false);
      if (token === null) return resolve(false);
      verify(token, (header: JwtHeader, callback: SigningKeyCallback)=>self.getJWTKey(header, callback), self.TokenConfig, (error, decoded) => {
        if (error !== null) return resolve(false);
        if (typeof decoded === "string") return resolve(false);
        if (decoded === undefined) return resolve(false);
        if (decoded.header !== undefined) return resolve(false);
        if ((decoded as Token).iss === undefined) return resolve(false);
        resolve(decoded as Token);
      });
    });
  }
}
