#!/usr/bin/env node
// Dev shim: run the TypeScript entry through tsx. A build step replaces this before publishing.
import { register } from 'tsx/esm/api'
register()
await import('../src/index.ts')
