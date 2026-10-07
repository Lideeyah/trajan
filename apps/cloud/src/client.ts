// Browser side of Trajan Cloud sign-in: a passkey IS a Tempo account.
// Tempo Accounts' WebAuthn adapter runs the ceremony against our /auth handler;
// the resulting P256 key is the seller's address on Tempo. No seed phrase, no extension.

import { Provider, webAuthn } from 'accounts'
import { tempo, tempoModerato } from 'viem/tempo/chains'

const provider = Provider.create({
  adapter: webAuthn({ auth: { url: '/auth' }, name: 'Trajan' }),
  chains: [tempoModerato, tempo],
})

async function connect(): Promise<string> {
  // wallet_connect runs register-or-login with the passkey and the /auth round-trip,
  // which also sets our session cookie.
  const res = (await provider.request({ method: 'wallet_connect' as any, params: [] as any })) as any
  const accounts: string[] = res?.accounts?.map((a: any) => (typeof a === 'string' ? a : a.address)) ?? res ?? []
  const address = accounts[0]
  if (!address) throw new Error('No account returned')
  return address
}

async function disconnect() {
  try { await provider.request({ method: 'wallet_disconnect' as any, params: [] as any }) } catch {}
  await fetch('/auth/logout', { method: 'POST' }).catch(() => {})
}

async function me() {
  return (await fetch('/api/me')).json() as Promise<{ signedIn: boolean; seller: null | { name: string; slug: string; address: string; price: string; network: string } }>
}

declare global { interface Window { trajan: { connect: typeof connect; disconnect: typeof disconnect; me: typeof me; provider: typeof provider } } }
window.trajan = { connect, disconnect, me, provider }
