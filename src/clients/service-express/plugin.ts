import { ServiceCallable, ServicesClient } from "@bettercorp/service-base";
import * as EXPRESS from "express";
import { expressCallableMethods } from "../../plugins/service-express/plugin";
import { IWebServerConfig } from "../../plugins/service-express/sec.config";

export class express extends ServicesClient<
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  ServiceCallable,
  expressCallableMethods,
  IWebServerConfig
> {
  public override readonly _pluginName: string = "service-express";
  public override readonly initAfterPlugins: string[] = ["service-express"];
  public override readonly runBeforePlugins: string[] = ["service-express"];

  async all(path: string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this._plugin.callPluginMethod("all", path, ...handlers);
  }
  async get(path: string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this._plugin.callPluginMethod("get", path, ...handlers);
  }
  async post(path: string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this._plugin.callPluginMethod("post", path, ...handlers);
  }
  async put(path: string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this._plugin.callPluginMethod("put", path, ...handlers);
  }
  async delete(path: string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this._plugin.callPluginMethod("delete", path, ...handlers);
  }
  async patch(path: string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this._plugin.callPluginMethod("patch", path, ...handlers);
  }
  async options(path: string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this._plugin.callPluginMethod("options", path, ...handlers);
  }
  async head(path: string, ...handlers: Array<EXPRESS.RequestHandler<any>>) {
    await this._plugin.callPluginMethod("head", path, ...handlers);
  }
  async use(...handlers: Array<any>) {
    await this._plugin.callPluginMethod("use", ...handlers);
  }
}
