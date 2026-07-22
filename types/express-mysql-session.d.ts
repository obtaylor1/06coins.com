declare module "express-mysql-session" {
  import type session from "express-session";
  const factory: (sessionModule: typeof session) => new (options: Record<string, unknown>) => session.Store;
  export default factory;
}
