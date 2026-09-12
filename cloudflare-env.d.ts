declare module "cloudflare:workers" {
  export interface CloudflareEnv {
    ENVIRONMENT?: string;
    REVALIDATE_SECRET?: string;
    DSE_DATA?: {
      get(key: string, type?: "text"): Promise<string | null>;
      get<T = unknown>(key: string, type: "json"): Promise<T | null>;
      get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
      get(key: string, type: "stream"): Promise<ReadableStream | null>;
      put(key: string, value: string | ArrayBuffer | ReadableStream, options?: any): Promise<void>;
      delete(key: string): Promise<void>;
      list(options?: any): Promise<any>;
    };
    VINEXT_KV_CACHE?: any;
    ASSETS?: any;
    IMAGES?: any;
    [key: string]: any;
  }

  export const env: CloudflareEnv;
}
