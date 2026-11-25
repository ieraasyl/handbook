declare module "virtual:starlight/user-config" {
  const config: import("@astrojs/starlight/types").StarlightConfig;
  export default config;
}

declare module "virtual:starlight/pagefind-config" {
  type StarlightConfig = import("@astrojs/starlight/types").StarlightConfig;
  export const pagefindUserConfig: Omit<Exclude<StarlightConfig["pagefind"], false>, "index">;
}
