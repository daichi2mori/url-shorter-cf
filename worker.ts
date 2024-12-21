import handle from "hono-remix-adapter/cloudflare-workers";
import * as build from "./build/server";
import { getLoadContext } from "./load-context";
import server from "./server/index";

export default handle(build, server, { getLoadContext });
