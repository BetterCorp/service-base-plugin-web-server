
import { IPluginLogger } from '@bettercorp/service-base';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

function plugin(fastify: FastifyInstance, opts: IPluginLogger, next: Function) {
  function info() {
    opts.info(arguments.toString(), {}, true);
  }

  function warn() {
    opts.warn(arguments.toString(), {}, true);
  }

  function error() {
    opts.error(arguments.toString(), {}, true);
  }

  const logger = {
    info,
    warn,
    error
  };

  fastify.decorate('logger', logger);
  Object.keys(logger).forEach(k => {
    fastify.decorate(k, (logger as any)[k]);
  });

  next();
}

export default fp(plugin, {
  name: 'fastify-bsb-logger'
});
