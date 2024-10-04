 import { createTRPCClient, httpLink } from "@trpc/client"
 import type { AppRouter } from "./root"

 const client = createTRPCClient<AppRouter>({
   links: [
     httpLink({
       url: "http://localhost:3000/trpc",
     }),
  ],
 })
