import { Express } from 'express';

export interface IWebServerInitPlugin {
  arg1: any;
  arg2?: any;
}
export interface IWebServerListenerHelper {
  server: Express;
  type: string;
}