import { CPlugin } from '@bettercorp/service-base/lib/interfaces/plugins';
import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

interface bsbOpts {
  uSelf: CPlugin;
}

function plugin(fastify: FastifyInstance, opts: bsbOpts, next: Function) {
  function info() {
    opts.uSelf.log.info(arguments);
  }

  function warn() {
    opts.uSelf.log.warn(arguments);
  }

  function error() {
    opts.uSelf.log.error(arguments);
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
