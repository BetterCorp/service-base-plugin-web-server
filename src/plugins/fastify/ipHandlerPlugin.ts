import { IDictionary } from '@bettercorp/tools/lib/Interfaces';
import { FastifyInstance } from 'fastify';
import * as fp from 'fastify-plugin';

function fastifyIPPlugin(instance: FastifyInstance, options: any, nextPlugin: { (): void; }) {
  instance.addHook('onRequest', (req: any, res: any, next: { (): void; }) => {
    let headerKeys: IDictionary<string> = {};
    for (let hKey of Object.keys(req.headers))
      headerKeys[hKey.toLowerCase()] = hKey;

    req.ip = (req.headers[headerKeys['true-client-ip']] ||
      req.headers[headerKeys['cf-connecting-ip']] ||
      req.headers[headerKeys['x-client-ip']] ||
      req.headers[headerKeys['x-forwarded-for']] ||
      req.socket.remoteAddress || req.ip || 'private').toString();
    next();
  });
  nextPlugin();
}

export default fp.default(fastifyIPPlugin, {
  fastify: '^3.0.0',
  name: 'fastify-ip'
});

