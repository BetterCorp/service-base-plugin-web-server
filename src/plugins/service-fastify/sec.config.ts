import { SecConfig } from "@bettercorp/service-base";

export interface FastifyCorsOptions {
  origin?: boolean | string | Array<string>; // Origin: Configures the Access-Control-Allow-Origin CORS header.
  credentials?: boolean; // Allow credentials header: Configures the Access-Control-Allow-Credentials CORS header.
  exposedHeaders?: string | string[]; // Expose Headers: Configures the Access-Control-Expose-Headers CORS header.
  allowedHeaders?: string | string[]; // Allow Headers: Configures the Access-Control-Allow-Headers CORS header.
  methods?: string | string[]; // Allow Methods: Configures the Access-Control-Allow-Methods CORS header.
  maxAge?: number; // Max Age: Configures the Access-Control-Max-Age CORS header.
  preflightContinue?: boolean; // Preflight continue response: Pass the CORS preflight response to the route handler (default: false).
  optionsSuccessStatus?: number; // Options Successs Status: Provides a status code to use for successful OPTIONS requests, since some legacy browsers (IE11, various SmartTVs) choke on 204.
  preflight?: boolean; // Preflight: Pass the CORS preflight response to the route handler (default: false).
  strictPreflight?: boolean; // Strict: Enforces strict requirement of the CORS preflight request headers (Access-Control-Request-Method and Origin).
  /**
   * Hide options route from the documentation built using fastify-swagger (default: true).
   */
  //hideOptionsRoute?: boolean;
}
export interface RateLimitOptions {
  max?: number; // Max Requests: The maximum number of requests a single client can perform inside a timeWindow
  timeWindow?: number | string; // Time Window: Time window around the max requests limit
  //cache?: number;
  //allowList?: string[];
  //continueExceeding?: boolean;
  //skipOnError?: boolean;
  //ban?: number;
}

export enum IWebServerConfigServer {
  http = "http",
  https = "https",
  httpAndHttps = "dual",
}
export interface FastifyCors {
  enabled: boolean; // Enabled: If CORS is enabled
  options: FastifyCorsOptions;
}
export interface FastifyRateLimit {
  enabled: boolean; // Enabled: If rate limiting is enabled
  options: RateLimitOptions;
}
export interface IPReWrite {
  enabled: boolean; // Enabled: If IP rewriting is enabled
  usingCloudflareWarpTraefikPlugin: boolean; // CloudflareWARP Traefik plugin: github.com/BetterCorp/cloudflarewarp is in front of this service
  trustedIPs: Array<string>; // Trusted Proxies: List of trusted proxy ips (x.x.x.x/x or x.x.x.x) (IPv4/IPv6)
  acceptedHeaders: Array<string>; // Accepted Headers: List of accepted headers to check for the IP
}
export interface FastifyWebServerConfig {
  health: boolean; // Enable /health endpoint: Used to monitoring
  cors: FastifyCors;
  rateLimit: FastifyRateLimit;
  ipRewrite: IPReWrite; // Rewrite the IP: For proxies
  host: string; // Host: 127.0.0.1/0.0.0 type host definition
  server: IWebServerConfigServer; // Server Type: HTTP/HTTPS or both
  httpPort: number; // HTTP Server Port: If using the HTTP server, the port to bind to
  httpToHttpsRedirect: boolean; // HTTP to HTTPS redirect: If you are using both HTTP and HTTPS, then we can automatically redirect HTTP to HTTPS
  httpsPort: number; // HTTPS Server Port: If using the HTTPS server, the port to bind to
  httpsCert: string | null; // HTTPS Cert File: The full path for the HTTP certificate file
  httpsKey: string | null; // HTTPS Cert Key File: The full path for the HTTP certificate key file
}

export class Config extends SecConfig<FastifyWebServerConfig> {
  migrate(
    mappedPluginName: string,
    existingConfig: FastifyWebServerConfig
  ): FastifyWebServerConfig {
    return {
      health:
        existingConfig.health !== undefined ? existingConfig.health : false,
      host: existingConfig.host !== undefined ? existingConfig.host : "0.0.0.0",
      httpPort:
        existingConfig.httpPort !== undefined ? existingConfig.httpPort : 80,
      ipRewrite: {
        enabled:
          existingConfig.ipRewrite === undefined
            ? false
            : existingConfig.ipRewrite.enabled ?? false,
        usingCloudflareWarpTraefikPlugin:
          existingConfig.ipRewrite === undefined
            ? false
            : existingConfig.ipRewrite.usingCloudflareWarpTraefikPlugin ??
              false,
        trustedIPs:
          existingConfig.ipRewrite === undefined
            ? []
            : existingConfig.ipRewrite.trustedIPs ?? [],
        acceptedHeaders:
          existingConfig.ipRewrite === undefined
            ? ["cf-connecting-ip", "x-forwarded-for"]
            : existingConfig.ipRewrite.acceptedHeaders.map(x=>x.toLowerCase()) ?? [
                "cf-connecting-ip",
                "x-forwarded-for",
              ],
      },
      server:
        existingConfig.server !== undefined
          ? existingConfig.server
          : IWebServerConfigServer.http,
      httpToHttpsRedirect:
        existingConfig.httpToHttpsRedirect !== undefined
          ? existingConfig.httpToHttpsRedirect
          : true,
      httpsPort:
        existingConfig.httpsPort !== undefined ? existingConfig.httpsPort : 443,
      httpsCert:
        existingConfig.httpsCert !== undefined
          ? existingConfig.httpsCert
          : null,
      httpsKey:
        existingConfig.httpsKey !== undefined ? existingConfig.httpsKey : null,
      cors: {
        enabled:
          (existingConfig.cors || {}).enabled !== undefined
            ? (existingConfig.cors || {}).enabled
            : false,
        options: {
          origin:
            ((existingConfig.cors || {}).options || {}).origin !== undefined
              ? ((existingConfig.cors || {}).options || {}).origin
              : true,
          exposedHeaders:
            ((existingConfig.cors || {}).options || {}).exposedHeaders !==
            undefined
              ? ((existingConfig.cors || {}).options || {}).exposedHeaders
              : undefined,
          allowedHeaders:
            ((existingConfig.cors || {}).options || {}).allowedHeaders !==
            undefined
              ? ((existingConfig.cors || {}).options || {}).allowedHeaders
              : "content-type",
          methods:
            ((existingConfig.cors || {}).options || {}).methods !== undefined
              ? ((existingConfig.cors || {}).options || {}).methods
              : "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          credentials:
            ((existingConfig.cors || {}).options || {}).credentials !==
            undefined
              ? ((existingConfig.cors || {}).options || {}).credentials
              : false,
          maxAge:
            ((existingConfig.cors || {}).options || {}).maxAge !== undefined
              ? ((existingConfig.cors || {}).options || {}).maxAge
              : 13000,
          preflightContinue:
            ((existingConfig.cors || {}).options || {}).preflightContinue !==
            undefined
              ? ((existingConfig.cors || {}).options || {}).preflightContinue
              : false,
          optionsSuccessStatus:
            ((existingConfig.cors || {}).options || {}).optionsSuccessStatus !==
            undefined
              ? ((existingConfig.cors || {}).options || {}).optionsSuccessStatus
              : 200,
          preflight:
            ((existingConfig.cors || {}).options || {}).preflight !== undefined
              ? ((existingConfig.cors || {}).options || {}).preflight
              : true,
          strictPreflight:
            ((existingConfig.cors || {}).options || {}).strictPreflight !==
            undefined
              ? ((existingConfig.cors || {}).options || {}).strictPreflight
              : false,
        },
      },
      rateLimit: {
        enabled:
          (existingConfig.rateLimit || {}).enabled !== undefined
            ? (existingConfig.rateLimit || {}).enabled
            : false,
        options: {
          max:
            ((existingConfig.rateLimit || {}).options || {}).max !== undefined
              ? ((existingConfig.rateLimit || {}).options || {}).max
              : 500,
          timeWindow:
            ((existingConfig.rateLimit || {}).options || {}).timeWindow !==
            undefined
              ? ((existingConfig.rateLimit || {}).options || {}).timeWindow
              : "15 minute",
        },
      },
    };
  }
}
