import { ServiceCallable, ServicesClient } from "@bettercorp/service-base";
import {
  FastifyPluginAsync,
  FastifyPluginCallback,
  FastifyPluginOptions,
  FastifyRegisterOptions,
  FastifyTypeProviderDefault,
  RawServerDefault,
} from "fastify";
import {
  FastifyNoBodyRequestHandler,
  FastifyRequestHandler,
} from "../../plugins/service-fastify/lib";
import { FastifyWebServerConfig } from "../../plugins/service-fastify/sec.config";
import { fastifyCallableMethods } from "../../plugins/service-fastify/plugin";

export class fastify extends ServicesClient<
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  fastifyCallableMethods,
  FastifyWebServerConfig
> {
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
