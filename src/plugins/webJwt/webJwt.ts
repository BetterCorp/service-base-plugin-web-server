import { CPluginClient, IPlugin } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { EJWTTokenType } from './plugin';
import { IEJWTPluginConfig } from './sec.config';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { FastifyReply, FastifyRequest } from 'fastify';
import { JWTLib } from './lib';

export class webJwtExpress extends CPluginClient<IEJWTPluginConfig> {
  public readonly _pluginName: string = "webJwt";
  private JWTLib!: JWTLib;
  private async getJWTLib() {
    if (Tools.isNullOrUndefined(this.JWTLib))
      this.JWTLib = await (new JWTLib()).init(this);

    return this.JWTLib;
  }

  async verify(req: ExpressRequest, res: ExpressResponse, tokenType: EJWTTokenType = EJWTTokenType.req): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.verifyQuiet(req, tokenType).then(x => {
        if (x === false) {
          res.status(403).send('Forbidden');
          return reject();
        }
        resolve(x);
      });
    });
  }

  async verifyQuiet(req: ExpressRequest, tokenType: EJWTTokenType = EJWTTokenType.req): Promise<any> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      let foundToken: string | null = null;
      if (tokenType === EJWTTokenType.req || tokenType === EJWTTokenType.reqOrQuery) {
        if (`${ req.headers.authorization }`.indexOf(`${ (await self.getPluginConfig()).bearerStr } `) === 0) {
          foundToken = `${ req.headers.authorization }`.split(' ')[1];
        } else {
          self.refPlugin.log.warn('*authorization: no header');
          self.refPlugin.log.debug(req.headers);
          self.refPlugin.log.debug(req.headers.authorization);
          self.refPlugin.log.debug((await self.getPluginConfig()).bearerStr);
        }
      }
      if (foundToken === null && (tokenType === EJWTTokenType.query || tokenType === EJWTTokenType.reqOrQuery)) {
        if (Tools.isNullOrUndefined(req.query) || Tools.isNullOrUndefined(req.query[(await self.getPluginConfig()).queryKey])) {
          self.refPlugin.log.warn('*authorization: failed no query passtk');
          self.refPlugin.log.debug(req.query);
          self.refPlugin.log.debug((await self.getPluginConfig()).queryKey);
        } else {
          foundToken = decodeURIComponent(`${ req.query[(await self.getPluginConfig()).queryKey] }`);
        }
      }

      if (Tools.isNullOrUndefined(foundToken) || foundToken == "") {
        self.refPlugin.log.warn('*authorization: failed no token');
        self.refPlugin.log.debug(foundToken);
        return resolve(false);
      }

      (await self.getJWTLib()).validateToken(resolve, () => reject(false), foundToken!, (await self.getPluginConfig()).clientCanResolveLocally);
    });
  }
}

export class webJwtFastify extends CPluginClient<IEJWTPluginConfig> {
  public readonly _pluginName: string = "webJwt";
  private JWTLib!: JWTLib;
  private async getJWTLib() {
    if (Tools.isNullOrUndefined(this.JWTLib))
      this.JWTLib = await (new JWTLib()).init(this);

    return this.JWTLib;
  }

  async verify(req: FastifyRequest<any>, reply: FastifyReply, tokenType: EJWTTokenType = EJWTTokenType.req): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.verifyQuiet(req, tokenType).then(x => {
        if (x === false) {
          reply.code(403).send('Forbidden');
          return reject();
        }
        resolve(x);
      });
    });
  }

  async verifyQuiet(req: FastifyRequest<any>, tokenType: EJWTTokenType = EJWTTokenType.req): Promise<any> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      let foundToken: string | null = null;
      if (tokenType === EJWTTokenType.req || tokenType === EJWTTokenType.reqOrQuery) {
        if (`${ req.headers.authorization }`.indexOf(`${ (await self.getPluginConfig()).bearerStr } `) === 0) {
          foundToken = `${ req.headers.authorization }`.split(' ')[1];
        } else {
          self.refPlugin.log.warn('*authorization: no header');
          self.refPlugin.log.debug(req.headers);
          self.refPlugin.log.debug(req.headers.authorization);
          self.refPlugin.log.debug((await self.getPluginConfig()).bearerStr);
        }
      }
      if (foundToken === null && (tokenType === EJWTTokenType.query || tokenType === EJWTTokenType.reqOrQuery)) {
        if (Tools.isNullOrUndefined(req.query) || Tools.isNullOrUndefined(req.query[(await self.getPluginConfig()).queryKey])) {
          self.refPlugin.log.warn('*authorization: failed no query passtk');
          self.refPlugin.log.debug(req.query);
          self.refPlugin.log.debug((await self.getPluginConfig()).queryKey);
        } else {
          foundToken = decodeURIComponent(`${ req.query[(await self.getPluginConfig()).queryKey] }`);
        }
      }

      if (Tools.isNullOrUndefined(foundToken) || foundToken == "") {
        self.refPlugin.log.warn('*authorization: failed no token');
        self.refPlugin.log.debug(foundToken);
        return resolve(false);
      }

      (await self.getJWTLib()).validateToken(resolve, () => reject(false), foundToken!, (await self.getPluginConfig()).clientCanResolveLocally);
    });
  }
}

export class webJwt extends CPluginClient<IEJWTPluginConfig> {
  public readonly _pluginName: string = "webJwt";
  public express: webJwtExpress;
  public fastify: webJwtFastify;
  private JWTLib!: JWTLib;
  private async getJWTLib() {
    if (Tools.isNullOrUndefined(this.JWTLib))
      this.JWTLib = await (new JWTLib()).init(this);

    return this.JWTLib;
  }

  constructor(self: IPlugin) {
    super(self);
    this.express = new webJwtExpress(self);
    this.fastify = new webJwtFastify(self);
    this.pluginName().then(async pluginName => {
      this.refPlugin.log.debug(`Running mapped as ${ this._pluginName }: ${ pluginName } / appConfigDirectly: ${ await this.refPlugin.appConfig.getMappedPluginName(this._pluginName) }`);
    }).catch(this.refPlugin.log.warn);
  }

  async validateToken(token: string): Promise<any> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      (await self.getJWTLib()).validateToken(resolve, () => reject(false), token, (await self.getPluginConfig()).clientCanResolveLocally);
    });
  }

  async signTokenSecretKey(tokenData: any, userId: string) {
    const self = this;
    return new Promise(async (resolve, reject) => (await self.getJWTLib()).signTokenSecretKey(tokenData, userId).then(resolve).catch(reject));
  }
}