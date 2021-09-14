import { CPluginClient } from '@bettercorp/service-base/lib/ILib';
import { FastifyInstance, FastifyPluginAsync, FastifyPluginCallback, FastifyPluginOptions, FastifyRegisterOptions, RouteHandlerMethod } from 'fastify';
import { IWebServerConfig } from './lib';

export class fastify extends CPluginClient<IWebServerConfig> {
  public readonly _pluginName: string = "fastify";

  async getServerInstance(): Promise<FastifyInstance> {
    return await this.initForPlugins<any, FastifyInstance>('getServerInstance');
  }
  async all(path: string, handler: RouteHandlerMethod) {
    await this.initForPlugins<any>('all', path, handler);
  };
  async get(path: string, handler: RouteHandlerMethod) {
    await this.initForPlugins<any>('get', path, handler);
  };
  async post(path: string, handler: RouteHandlerMethod) {
    await this.initForPlugins<any>('post', path, handler);
  };
  async put(path: string, handler: RouteHandlerMethod) {
    await this.initForPlugins<any>('put', path, handler);
  };
  async delete(path: string, handler: RouteHandlerMethod) {
    await this.initForPlugins<any>('delete', path, handler);
  };
  async patch(path: string, handler: RouteHandlerMethod) {
    await this.initForPlugins<any>('patch', path, handler);
  };
  async options(path: string, handler: RouteHandlerMethod) {
    await this.initForPlugins<any>('options', path, handler);
  };
  async head(path: string, handler: RouteHandlerMethod) {
    await this.initForPlugins<any>('head', path, handler);
  };
  async register(plugin: FastifyPluginCallback<FastifyPluginOptions> | FastifyPluginAsync<FastifyPluginOptions> | Promise<{ default: FastifyPluginCallback<FastifyPluginOptions>; }> | Promise<{ default: FastifyPluginAsync<FastifyPluginOptions>; }>,
    opts?: FastifyRegisterOptions<FastifyPluginOptions>) {
    await this.initForPlugins<any>('use', plugin, opts);
  };
}