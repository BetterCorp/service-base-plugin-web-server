import { Tools } from "@bettercorp/tools/lib/Tools";
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import { FastifyReply, FastifyRequest } from "fastify";
import { ServiceCallable, ServicesClient } from "@bettercorp/service-base";
import { EmitAndReturnableEvents } from "../../plugins/service-webjwt/plugin";
import {
  EJWTTokenType,
  IEJWTPluginConfig,
} from "../../plugins/service-webjwt/sec.config";

export class webJwtExpress extends ServicesClient<
  ServiceCallable,
  ServiceCallable,
  EmitAndReturnableEvents,
  ServiceCallable,
  ServiceCallable,
  IEJWTPluginConfig
> {
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
          self._plugin.log.warn("*authorization: no header {bearerStr}", {
            bearerStr: self.config.bearerStr,
          });
          self._plugin.log.debug(
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
          self._plugin.log.warn("*authorization: failed no query {queryKey}", {
            queryKey: self.config.queryKey,
          });
          self._plugin.log.debug(
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
        self._plugin.log.warn("*authorization: failed no token");
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
  ServiceCallable,
  IEJWTPluginConfig
> {
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
          self._plugin.log.warn("*authorization: no header {bearerStr}", {
            bearerStr: self.config.bearerStr,
          });
          self._plugin.log.debug(
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
          self._plugin.log.warn("*authorization: failed no query {queryKey}", {
            queryKey: self.config.queryKey,
          });
          self._plugin.log.debug(
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
        self._plugin.log.warn("*authorization: failed no token");
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
  ServiceCallable,
  IEJWTPluginConfig
> {
  public override readonly _pluginName: string = "service-webjwt";
  public override readonly initAfterPlugins: string[] = ["service-webjwt"];

  async validateToken(token: string): Promise<any> {
    return await this._plugin.emitEventAndReturnTimed(
      "validateToken",
      1000,
      token
    );
  }

  async validateTokenQuiet(token: string): Promise<any> {
    const self = this;
    return new Promise(async (resolve) =>
      self._plugin
        .emitEventAndReturnTimed("validateToken", 1000, token)
        .then(resolve)
        .catch(() => resolve(false))
    );
  }

  async signToken(tokenData: any, userId: string) {
    return await this._plugin.emitEventAndReturnTimed(
      "signToken",
      1000,
      tokenData,
      userId
    );
  }
}
