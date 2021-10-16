import { CPluginClient, IPlugin } from '@bettercorp/service-base/lib/ILib';
import { Tools } from '@bettercorp/tools/lib/Tools';
import { WebJWTEvents } from '../../lib';
import { EJWTTokenType } from './plugin';
import { IEJWTPluginConfig } from './sec.config';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { FastifyReply, FastifyRequest } from 'fastify';

export class webJwtExpress extends CPluginClient<IEJWTPluginConfig> {
  public readonly _pluginName: string = "webJwt";
  async verify(req: ExpressRequest, res: ExpressResponse, tokenType: EJWTTokenType = EJWTTokenType.req): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.verifyQuiet(req, res, tokenType).then(x => {
        if (x === false) {
          res.status(403).send('Forbidden');
          return reject();
        }
        resolve(x);
      });
    });
  }

  async verifyQuiet(req: ExpressRequest, res: ExpressResponse, tokenType: EJWTTokenType = EJWTTokenType.req): Promise<any> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      let foundToken: string | null = null;
      if (tokenType === EJWTTokenType.req || tokenType === EJWTTokenType.reqOrQuery) {
        if (`${ req.headers.authorization }`.indexOf('Bearer ') === 0) {
          foundToken = `${ req.headers.authorization }`.split(' ')[1];
        } else {
          self.refPlugin.log.warn('*authorization: no header');
        }
      }
      if (foundToken === null && (tokenType === EJWTTokenType.query || tokenType === EJWTTokenType.reqOrQuery)) {
        if (Tools.isNullOrUndefined(req.query) || Tools.isNullOrUndefined(req.query[(await self.getPluginConfig()).queryKey])) {
          self.refPlugin.log.warn('*authorization: failed no query passtk');
        } else {
          foundToken = decodeURIComponent(`${ req.query[(await self.getPluginConfig()).queryKey] }`);
        }
      }

      if (Tools.isNullOrUndefined(foundToken) || foundToken == "") {
        self.refPlugin.log.warn('*authorization: failed no token');
        return resolve(false);
      }

      self.emitEventAndReturn(`${ WebJWTEvents.validateToken }-${ (await self.getPluginConfig()).authKey }`, foundToken).then(resolve).catch(() => {
        self.refPlugin.log.warn('*authorization: failed');
        return resolve(false);
      });
    });
  }
}

export class webJwtFastify extends CPluginClient<IEJWTPluginConfig> {
  public readonly _pluginName: string = "webJwt";
  async verify(req: FastifyRequest<any>, reply: FastifyReply, tokenType: EJWTTokenType = EJWTTokenType.req): Promise<any> {
    const self = this;
    return new Promise((resolve, reject) => {
      self.verifyQuiet(req, reply, tokenType).then(x => {
        if (x === false) {
          reply.code(403).send('Forbidden');
          return reject();
        }
        resolve(x);
      });
    });
  }

  async verifyQuiet(req: FastifyRequest<any>, reply: FastifyReply, tokenType: EJWTTokenType = EJWTTokenType.req): Promise<any> {
    const self = this;
    return new Promise(async (resolve, reject) => {
      let foundToken: string | null = null;
      if (tokenType === EJWTTokenType.req || tokenType === EJWTTokenType.reqOrQuery) {
        if (`${ req.headers.authorization }`.indexOf('Bearer ') === 0) {
          foundToken = `${ req.headers.authorization }`.split(' ')[1];
        } else {
          self.refPlugin.log.warn('*authorization: no header');
        }
      }
      if (foundToken === null && (tokenType === EJWTTokenType.query || tokenType === EJWTTokenType.reqOrQuery)) {
        if (Tools.isNullOrUndefined(req.query) || Tools.isNullOrUndefined(req.query[(await self.getPluginConfig()).queryKey])) {
          self.refPlugin.log.warn('*authorization: failed no query passtk');
        } else {
          foundToken = decodeURIComponent(`${ req.query[(await self.getPluginConfig()).queryKey] }`);
        }
      }

      if (Tools.isNullOrUndefined(foundToken) || foundToken == "") {
        self.refPlugin.log.warn('*authorization: failed no token');
        return resolve(false);
      }

      self.emitEventAndReturn(`${ WebJWTEvents.validateToken }-${ (await self.getPluginConfig()).authKey }`, foundToken).then(resolve).catch(() => {
        self.refPlugin.log.warn('*authorization: failed');
        return resolve(false);
      });
    });
  }
}
export class webJwt extends CPluginClient<IEJWTPluginConfig> {
  public readonly _pluginName: string = "webJwt";
  public express: webJwtExpress;
  public fastify: webJwtFastify;
  constructor(self: IPlugin) {
    super(self);
    this.express = new webJwtExpress(self);
    this.fastify = new webJwtFastify(self);
  }

  async validateToken(token: string): Promise<any> {
    return this.emitEventAndReturn(`${ WebJWTEvents.validateToken }-${ (await this.getPluginConfig()).authKey }`, token);
  }
}