import { CPluginClient } from '@bettercorp/service-base/lib/ILib';
import { IWebServerConfig } from './lib';
import * as EXPRESS from 'express';

export class express extends CPluginClient<IWebServerConfig> {
  public readonly _pluginName: string = "express";

  async all(path: EXPRESS.IRoute | string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this.initForPlugins<any>('all', path, ...handlers);
  };
  async get(path: EXPRESS.IRoute | string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this.initForPlugins<any>('get', path, ...handlers);
  };
  async post(path: EXPRESS.IRoute | string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this.initForPlugins<any>('post', path, ...handlers);
  };
  async put(path: EXPRESS.IRoute | string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this.initForPlugins<any>('put', path, ...handlers);
  };
  async delete(path: EXPRESS.IRoute | string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this.initForPlugins<any>('delete', path, ...handlers);
  };
  async patch(path: EXPRESS.IRoute | string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this.initForPlugins<any>('patch', path, ...handlers);
  };
  async options(path: EXPRESS.IRoute | string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this.initForPlugins<any>('options', path, ...handlers);
  };
  async head(path: EXPRESS.IRoute | string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this.initForPlugins<any>('head', path, ...handlers);
  };
  async use(...handlers: Array<any>) {
    await this.initForPlugins<any>('use', ...handlers);
  };
}