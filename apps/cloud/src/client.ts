// Browser side of Trajan Cloud sign-in: a passkey IS a Tempo account.
// Tempo Accounts' WebAuthn adapter runs the ceremony against our /auth handler;
// the resulting P256 key is the seller's address on Tempo. No seed phrase, no extension.

import { Provider, webAuthn } from 'accounts'
import { tempo, tempoModerato } from 'viem/tempo/chains'

const provider = Provider.create({
  adapter: webAuthn({ auth: { url: '/auth' }, name: 'Trajan' }),
  chains: [tempoModerato, tempo],
})

async function connect(opts: { create?: boolean } = {}): Promise<string> {
  // wallet_connect runs the passkey ceremony plus the /auth round-trip (which sets our session cookie).
  // `method: 'register'` creates a new passkey (Touch ID / Face ID right here); without it, it signs in with an existing one.
  const params = opts.create ? [{ capabilities: { method: 'register', name: 'Trajan' } }] : undefined
  const res = (await provider.request({ method: 'wallet_connect' as any, ...(params ? { params: params as any } : {}) })) as any
  const accounts: string[] = res?.accounts?.map((a: any) => (typeof a === 'string' ? a : a.address)) ?? res ?? []
  const address = accounts[0]
  if (!address) throw new Error('No account returned')
  return address
}

async function disconnect() {
  try { await provider.request({ method: 'wallet_disconnect' as any }) } catch {}
  await fetch('/auth/logout', { method: 'POST' }).catch(() => {})
}

async function me() {
  return (await fetch('/api/me')).json() as Promise<{ signedIn: boolean; seller: null | { name: string; slug: string; address: string; price: string; network: string } }>
}

/** Cash out from the hosted console. The transfer is built and signed by the passkey right here in the
 *  browser (Touch ID / Face ID); no key ever touches Trajan Cloud. Returns the mined receipt. */
async function withdraw(opts: { to: `0x${string}`; amount: string; memo?: string; token: `0x${string}`; chainId: number }) {
  // After a reload the provider may know the account without being "connected"; re-attach (prompts the passkey if needed).
  let accounts = (await provider.request({ method: 'eth_accounts' as any })) as string[]
  if (!accounts?.length) accounts = (await provider.request({ method: 'eth_requestAccounts' as any })) as string[]
  if (!accounts?.length) throw new Error('Sign in with your passkey first')
  const res = (await provider.request({
    method: 'wallet_transfer' as any,
    params: [{ amount: opts.amount, to: opts.to, token: opts.token, chainId: `0x${opts.chainId.toString(16)}`, ...(opts.memo ? { memo: opts.memo } : {}) }] as any,
  })) as any
  const receipt = res?.receipt ?? res
  return { txHash: receipt?.transactionHash as string, blockNumber: receipt?.blockNumber != null ? Number(receipt.blockNumber) : null, status: receipt?.status }
}

declare global { interface Window { trajan: { connect: typeof connect; disconnect: typeof disconnect; me: typeof me; withdraw: typeof withdraw; provider: typeof provider } } }
window.trajan = { connect, disconnect, me, withdraw, provider }
