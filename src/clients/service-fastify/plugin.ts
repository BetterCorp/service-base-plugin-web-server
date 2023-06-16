import {
  ServiceCallable,
  ServicesBase,
  ServicesClient,
} from "@bettercorp/service-base";
import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyPluginOptions,
  FastifyRegisterOptions,
  FastifyReply,
  FastifyRequest,
  FastifyTypeProviderDefault,
  RawServerDefault,
  RouteShorthandOptions,
} from "fastify";
import {
  FastifyNoBodyRequestHandler,
  FastifyRequestHandler,
} from "../../plugins/service-fastify/lib";
import { fastifyCallableMethods } from "../../plugins/service-fastify/plugin";
import { Server as HServer } from "http";
import { Server as HSServer } from "https";

export class fastify extends ServicesClient<
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  fastifyCallableMethods
> {
  constructor(self: ServicesBase) {
    super(self);
  }
  async addHealthCheck(
    checkName: string,
    handler: () => Promise<boolean>
  ): Promise<void> {
    await this._plugin.callPluginMethod(
      "addHealthCheck",
      this._plugin.pluginName,
      checkName,
      handler
    );
  }
  public override readonly _pluginName: string = "service-fastify";
  public override readonly initAfterPlugins: string[] = ["service-fastify"];
  public override readonly runBeforePlugins: string[] = ["service-fastify"];

  public async register(
    plugin:
      | FastifyPluginCallback<
          FastifyPluginOptions,
          RawServerDefault,
          FastifyTypeProviderDefault
        >
      | FastifyPluginAsync<
          FastifyPluginOptions,
          RawServerDefault,
          FastifyTypeProviderDefault
        >
      | Promise<{
          default: FastifyPluginCallback<
            FastifyPluginOptions,
            RawServerDefault,
            FastifyTypeProviderDefault
          >;
        }>
      | Promise<{
          default: FastifyPluginAsync<
            FastifyPluginOptions,
            RawServerDefault,
            FastifyTypeProviderDefault
          >;
        }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions> | undefined
  ): Promise<void> {
    await this._plugin.callPluginMethod("register", plugin, opts);
  }

  public async getServer(): Promise<
    FastifyInstance<HServer | HSServer>
  > {
    return await this._plugin.callPluginMethod("getServerInstance");
  }

  public async head<Path extends string>(
    path: Path,
    handler: FastifyNoBodyRequestHandler<Path>
  ): Promise<void> {
    await this._plugin.callPluginMethod("head", path, handler as any);
  }
  public async get<Path extends string>(
    path: Path,
    handler: FastifyNoBodyRequestHandler<Path>
  ): Promise<void> {
    await this._plugin.callPluginMethod("get", path, handler as any);
  }
  public async getCustom<
    Path extends string,
    Opts extends RouteShorthandOptions = any,
    Handler extends Function = {
      (request: FastifyRequest, reply: FastifyReply): Promise<void>;
    }
  >(path: Path, opts: Opts, handler: Handler): Promise<void> {
    await this._plugin.callPluginMethod(
      "getCustom",
      path,
      opts,
      handler as any
    );
  }
  public async post<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void> {
    await this._plugin.callPluginMethod("post", path, handler as any);
  }
  public async put<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void> {
    await this._plugin.callPluginMethod("put", path, handler as any);
  }
  public async delete<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void> {
    await this._plugin.callPluginMethod("delete", path, handler as any);
  }
  public async patch<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void> {
    await this._plugin.callPluginMethod("patch", path, handler as any);
  }
  public async options<Path extends string>(
    path: Path,
    handler: FastifyNoBodyRequestHandler<Path>
  ): Promise<void> {
    await this._plugin.callPluginMethod("options", path, handler as any);
  }
  public async all<Path extends string>(
    path: Path,
    handler: FastifyRequestHandler<Path>
  ): Promise<void> {
    await this._plugin.callPluginMethod("all", path, handler as any);
  }
}
