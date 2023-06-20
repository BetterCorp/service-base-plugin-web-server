import { IDictionary } from "@bettercorp/tools/lib/Interfaces";
import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { BlockList } from "net";
import * as fp from "fastify-plugin";
import { IPReWrite } from "./sec.config";
import { Tools } from "@bettercorp/tools";
import { IPluginLogger } from "@bettercorp/service-base";

export interface thisPluginOptions extends IPReWrite, FastifyPluginOptions {
  log: IPluginLogger;
}
const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
function fastifyIPPlugin(
  instance: FastifyInstance,
  opts: FastifyPluginOptions,
  nextPlugin: { (): void }
) {
  const options = opts as thisPluginOptions;
  const ipList = new BlockList();
  for (let ip of options.trustedIPs) {
    const ipSplit = ip.split("/");
    ipList.addSubnet(
      ipSplit[0],
      ipSplit.length === 1 ? 32 : Number.parseInt(ipSplit[1])
    );
  }
  instance.addHook(
    "onRequest",
    (req: FastifyRequest, res: FastifyReply, next: { (): void }) => {
      const clientsIP =
        req.connection.remoteAddress ?? req.socket.remoteAddress ?? req.ip;
      if (!ipList.check(clientsIP)) {
        req.headers["ip"] = clientsIP;
        return next();
      }

      let headerKeys: IDictionary<string> = {};
      for (let hKey of Object.keys(req.headers))
        headerKeys[hKey.toLowerCase()] = hKey;

      if (options.usingCloudflareWarpTraefikPlugin === true) {
        req.headers["ip"] = (
          req.headers["x-is-trusted"] == "yes"
            ? req.headers[headerKeys["x-real-ip"]] ?? clientsIP
            : clientsIP
        ).toString();
        return next();
      }
      for (let ipHeader of options.acceptedHeaders) {
        if (Tools.isString(headerKeys[ipHeader]) && ipRegex.test(headerKeys[ipHeader])) {
          req.headers["ip"] = headerKeys[ipHeader];
          return next();
        }
      }
      req.headers["ip"] = clientsIP;
      next();
    }
  );
  nextPlugin();
}

export default fp.default(fastifyIPPlugin, {
  fastify: "^4.0.0",
  name: "fastify-ip",
});
