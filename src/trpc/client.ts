import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from './root'

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://127.0.0.1:3000/trpc',
    }),
  ],
})
const data = await trpc.note.byId.query({ id: 1 })
console.log(data)
