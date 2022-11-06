import { IDictionary } from "@bettercorp/tools/lib/Interfaces";
import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from "fastify";
import * as fp from "fastify-plugin";

function fastifyIPPlugin(
  instance: FastifyInstance,
  options: FastifyPluginOptions,
  nextPlugin: { (): void }
) {
  instance.addHook(
    "onRequest",
    (req: FastifyRequest, res: any, next: { (): void }) => {
      let headerKeys: IDictionary<string> = {};
      for (let hKey of Object.keys(req.headers))
        headerKeys[hKey.toLowerCase()] = hKey;

      if (options.cloudflareWarpTraefikPlugin === true) {
        if (
          req.headers["x-is-trusted"] == "yes" ||
          req.headers["x-is-trusted"] == "no"
        ) {
          req.headers["ip"] = (
            req.headers[headerKeys["x-real-ip"]] ||
            req.socket.remoteAddress ||
            req.ip ||
            "private"
          ).toString();
          return next();
        }
        req.headers["ip"] = (
          req.socket.remoteAddress ||
          req.ip ||
          "private"
        ).toString();
        return next();
      }
      req.headers["ip"] = (
        req.headers[headerKeys["true-client-ip"]] ||
        req.headers[headerKeys["cf-connecting-ip"]] ||
        req.headers[headerKeys["x-client-ip"]] ||
        req.headers[headerKeys["x-forwarded-for"]] ||
        req.socket.remoteAddress ||
        req.ip ||
        "private"
      ).toString();
      next();
    }
  );
  nextPlugin();
}

export default fp.default(fastifyIPPlugin, {
  fastify: "^4.0.0",
  name: "fastify-ip",
});
