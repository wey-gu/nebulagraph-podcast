import { createClient } from 'next-sanity'
import { cache } from 'react'

import { apiVersion, dataset, projectId, useCdn } from './api'

export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn,
  perspective: 'published',
})

// Wrap the cache function in a way that reuses the TypeScript definitions
export const serverFetch = cache(client.fetch.bind(client))