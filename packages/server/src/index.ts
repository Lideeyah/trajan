export { createCallLog, type CallLog, type CallRow } from './log.js'
export { attachCallLog, MODERATO_RPC, MAINNET_RPC, type AttachOptions } from './attach.js'
export {
  trajanConsole, consoleApi,
  MODERATO_EXPLORER_TX, MODERATO_EXPLORER_ADDRESS, MAINNET_EXPLORER_TX, MAINNET_EXPLORER_ADDRESS,
  type ConsoleOptions,
} from './api.js'
export { createWallet, type Wallet, type WalletOptions } from './wallet.js'

/** Moderato testnet stablecoins (tempo.xyz faucet docs). 6 decimals. */
export const MODERATO_TOKENS = {
  pathUSD: '0x20c0000000000000000000000000000000000000',
  alphaUSD: '0x20c0000000000000000000000000000000000001',
  betaUSD: '0x20c0000000000000000000000000000000000002',
  thetaUSD: '0x20c0000000000000000000000000000000000003',
  OUSD: '0x20c0000000000000000000006a37DA5C996874BE',
} as const
