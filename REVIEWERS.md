# Reviewer guide and on-chain evidence

Everything Trajan claims is checkable on Tempo's public testnet (Moderato, chain id 42431). This file lists the addresses and transactions behind the demo, and the fastest way to verify the product yourself. Generated from the demo sellers' call logs and Trajan Cloud's database on 2026-10-08.

## Verify in five minutes (no account needed)

1. **The hosted product is live:** https://trajan-five.vercel.app — sign up with a passkey; the address shown is a real Tempo account (check it on the explorer link below).
2. **The CLI is on npm:** `npx trajan-cli --help` (package: https://www.npmjs.com/package/trajan-cli). The library: https://www.npmjs.com/package/trajan-server.
3. **Run the self-hosted loop:** README → "60-second quickstart". Unpaid request returns 402 with an MPP challenge; a paid request returns 200 and a `Payment-Receipt` header carrying the tx hash; the console at `/trajan` shows the row.
4. **Pick any hash below and open it on the explorer.** Each is a TIP-20 transfer (Tempo transaction type 0x76) from a buyer wallet to a seller address, with `feePayer` set when sponsorship was on.

## Addresses

| Role | Address | Explorer |
|---|---|---|
| Demo seller (recipient for all example servers; also the fee sponsor) | `0xdC0c0024CE466b0FA4A6974534265D3B7eD23aeC` | https://explore.testnet.tempo.xyz/address/0xdC0c0024CE466b0FA4A6974534265D3B7eD23aeC |
| Demo buyer (the agent's wallet) | `0x5A784c18a498f5AA03faC3a1dD05DDE545b69d62` | https://explore.testnet.tempo.xyz/address/0x5A784c18a498f5AA03faC3a1dD05DDE545b69d62 |
| Founder's hosted account — a passkey created on 8 Oct 2026; the address is derived from the passkey's P256 key | `0xDC2AAE7352E56B332C0E2210Ee16aa5D812D2e5e` | https://explore.testnet.tempo.xyz/address/0xDC2AAE7352E56B332C0E2210Ee16aa5D812D2e5e |
| pathUSD (Moderato test stablecoin, 6 decimals) | `0x20c0000000000000000000000000000000000000` | https://explore.testnet.tempo.xyz/address/0x20c0000000000000000000000000000000000000 |

## Payments to a hosted account (Trajan Cloud)

Seller "Pust", created through the live sign-up with a passkey. Reported to Trajan Cloud by `trajan-cli init --cloud` from a plain Hono app.

| Time (UTC) | Route | Paid | Payer | Fee payer | Block | Tx |
|---|---|---|---|---|---|---|
| 2026-10-07T23:39:02 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38630795 | [0xf9ea6c4fe3…](https://explore.testnet.tempo.xyz/tx/0xf9ea6c4fe3f6449bc1e64378404a782a27168da6dedc12356facd7c5942fe243) |

## Withdraw from the self-hosted console

A 0.5 pathUSD transfer with the on-chain memo "trajan test withdraw", sent from the demo seller's address via the console's Cash out form: [0x7dddefbb…](https://explore.testnet.tempo.xyz/tx/0x7dddefbb241ae95c1f0f702bc084f1873608a5000f586b89a38257589eff0b6f) (block 38551487).

## Every paid call logged by the example servers

### HTTP demo seller (examples/mcp-server) — 7 paid calls

| Time (UTC) | Route / tool | Paid | Fee payer | Block | Tx |
|---|---|---|---|---|---|
| 2026-10-07T10:01:20 | `/tools/echo?q=call1` | 0.01 | agent | 38549019 | [0xb60dfef384…](https://explore.testnet.tempo.xyz/tx/0xb60dfef3844c3644454ee6485a8374b11612157556e6e8e59da56415c5be905c) |
| 2026-10-07T10:01:24 | `/tools/echo?q=call2` | 0.01 | agent | 38549025 | [0xaa441976c2…](https://explore.testnet.tempo.xyz/tx/0xaa441976c225676aca3f194454a9b4255176e95ce82a2137ab8d406258ee0c37) |
| 2026-10-07T10:25:13 | `/tools/echo?q=trajan` | 0.01 | agent | 38551377 | [0x60fa6ef95a…](https://explore.testnet.tempo.xyz/tx/0x60fa6ef95a444a069561b868a26c5f1ba692d5e5eebc9b8aa3184b7ac04d5bd4) |
| 2026-10-07T10:41:44 | `/tools/echo?q=trajan` | 0.01 | agent | 38553006 | [0x57e2fd82ff…](https://explore.testnet.tempo.xyz/tx/0x57e2fd82ff7ca0928faf6538bc358a41589a8f03c9607ca63c09ead17d0588a5) |
| 2026-10-07T10:41:50 | `/tools/echo?q=trajan` | 0.01 | agent | 38553015 | [0x1b5e8c0008…](https://explore.testnet.tempo.xyz/tx/0x1b5e8c00083dd74ddfa0782b2b36ef4406edc12ed487c7f01d9fcfa6d7a9500c) |
| 2026-10-07T10:43:41 | `/tools/echo?q=trajan` | 0.01 | 0xdc0c0024… | 38553198 | [0x6575175c14…](https://explore.testnet.tempo.xyz/tx/0x6575175c14e9f01382c217a6b8d06f2a06d3df2f29f962be2aaed9f9d13a6f64) |
| 2026-10-07T10:46:03 | `/tools/echo?q=trajan` | 0.01 | 0xdc0c0024… | 38553432 | [0x8dc8edac0e…](https://explore.testnet.tempo.xyz/tx/0x8dc8edac0e50a0bd2c4aa869993e9fbd013448ff296959186b990d2c2744c4ec) |

### MCP demo seller (examples/mcp-tools) — 24 paid calls

| Time (UTC) | Route / tool | Paid | Fee payer | Block | Tx |
|---|---|---|---|---|---|
| 2026-10-07T10:37:38 | `` | 0.01 | agent | 38552599 | [0xd08e732697…](https://explore.testnet.tempo.xyz/tx/0xd08e7326978565ef5bd50766784e6308fe1146061075fc74e7ab74c5635bda31) |
| 2026-10-07T10:37:40 | `` | 0.005 | agent | 38552603 | [0x48b838c2b4…](https://explore.testnet.tempo.xyz/tx/0x48b838c2b4f6771bfe83d29734b0916862e731b8c58083e60dbf9462bedefcf9) |
| 2026-10-07T10:38:30 | `` | 0.01 | agent | 38552685 | [0x8d617ca29e…](https://explore.testnet.tempo.xyz/tx/0x8d617ca29e1aec5c1315702186a92b20b1e0fa7c20edb169af9ef4f3826a128f) |
| 2026-10-07T10:38:32 | `` | 0.005 | agent | 38552689 | [0x752f8071d2…](https://explore.testnet.tempo.xyz/tx/0x752f8071d26c62ed41bbe9c81cf3eb38ad4eb32d9d2ab7630e145d8227f5e4d3) |
| 2026-10-07T10:39:03 | `` | 0.01 | agent | 38552739 | [0xb9077572fe…](https://explore.testnet.tempo.xyz/tx/0xb9077572fea84141c4a66462956c25650a2e5e529772298ce14437c0d7d2b4f4) |
| 2026-10-07T10:39:07 | `` | 0.005 | agent | 38552747 | [0x38fdd651e7…](https://explore.testnet.tempo.xyz/tx/0x38fdd651e7a76a713a769fdb9b515c960b268ab2d755b1c038366ffd94336bb4) |
| 2026-10-07T10:39:44 | `quote_of_the_day` | 0.01 | agent | 38552803 | [0x6b9c4df789…](https://explore.testnet.tempo.xyz/tx/0x6b9c4df7890e1e9792ae5076aa2c02110af457c5ec27839034943cf46f36ac08) |
| 2026-10-07T10:39:47 | `word_count` | 0.005 | agent | 38552813 | [0x2526d8fc83…](https://explore.testnet.tempo.xyz/tx/0x2526d8fc830312878c1800ab7949af13666da39e9c4224bb78b20c43c7e89526) |
| 2026-10-07T10:43:55 | `quote_of_the_day` | 0.01 | 0x5a784c18… | 38553221 | [0x9603fd2f25…](https://explore.testnet.tempo.xyz/tx/0x9603fd2f25f90afafcf96298ed731bb602fbeebcab522ba5b0ceb4adcd8d36c7) |
| 2026-10-07T10:43:58 | `word_count` | 0.005 | 0x5a784c18… | 38553226 | [0x654861dc00…](https://explore.testnet.tempo.xyz/tx/0x654861dc00cccc431a1324144d4d67b105e673dcaeb52a6f8dd763220053ccde) |
| 2026-10-07T10:44:26 | `quote_of_the_day` | 0.01 | 0xdc0c0024… | 38553271 | [0xde6f533806…](https://explore.testnet.tempo.xyz/tx/0xde6f533806d665e785129a0b093a6ba38f23ba0374d7b44dcb8847932ede7e77) |
| 2026-10-07T10:44:29 | `word_count` | 0.005 | 0xdc0c0024… | 38553278 | [0xfda82cf139…](https://explore.testnet.tempo.xyz/tx/0xfda82cf139917d35a3f86a5063ee738f00b7c6b8dc57e1c125f44e9b5c2495bd) |
| 2026-10-07T10:45:19 | `quote_of_the_day` | 0.01 | 0xdc0c0024… | 38553360 | [0x46be0630ba…](https://explore.testnet.tempo.xyz/tx/0x46be0630ba00f21157b9112d3cf2f11668637287b38e973bf67cd33de463a113) |
| 2026-10-07T10:45:23 | `word_count` | 0.005 | 0xdc0c0024… | 38553366 | [0xd779121752…](https://explore.testnet.tempo.xyz/tx/0xd7791217524c2eab119be6376150545dc848f97793c7aa5622e536d1ea3df93f) |
| 2026-10-07T11:32:29 | `quote_of_the_day` | 0.01 | 0xdc0c0024… | 38558035 | [0xa45759792d…](https://explore.testnet.tempo.xyz/tx/0xa45759792d00c3e4d4a9619181960789469b0dbe03a299f866494a71adb12988) |
| 2026-10-07T11:32:34 | `word_count` | 0.005 | 0xdc0c0024… | 38558044 | [0xe9515ac4d3…](https://explore.testnet.tempo.xyz/tx/0xe9515ac4d39ad9ce4c6e823efce70e6a30d114cce36e3f6941f2d1fd98c6a6da) |
| 2026-10-07T11:34:31 | `quote_of_the_day` | 0.01 | 0xdc0c0024… | 38558238 | [0x9073332ac1…](https://explore.testnet.tempo.xyz/tx/0x9073332ac1994578223d284fb0cf4e0d0eb5597022eb9789b8e462fa65a04752) |
| 2026-10-07T11:34:39 | `word_count` | 0.005 | 0xdc0c0024… | 38558252 | [0xabab0148e2…](https://explore.testnet.tempo.xyz/tx/0xabab0148e2fe128f1a0703a520073f2049194a301ff912e9ab0b5cc09ed1ea86) |
| 2026-10-07T11:54:26 | `quote_of_the_day` | 0.01 | 0xdc0c0024… | 38560216 | [0xa708fa7caa…](https://explore.testnet.tempo.xyz/tx/0xa708fa7caab6cc4eb81677bf4d5505e18e214c1ba4c72cfd8c9cdfcc55b75305) |
| 2026-10-07T11:54:29 | `word_count` | 0.005 | 0xdc0c0024… | 38560221 | [0x0a01a4d916…](https://explore.testnet.tempo.xyz/tx/0x0a01a4d9168e6946b4ad33413ce0e47c753f2e1088e24ca63c9ef61800501144) |
| 2026-10-07T11:54:40 | `word_count` | 0.005 | 0xdc0c0024… | 38560239 | [0x23c912f177…](https://explore.testnet.tempo.xyz/tx/0x23c912f177d36fb0c9dc1ccda3915fa5294ec8dfdbe6c2fad537a74dedc722b8) |
| 2026-10-07T11:56:07 | `quote_of_the_day` | 0.01 | 0xdc0c0024… | 38560383 | [0x7325396bc6…](https://explore.testnet.tempo.xyz/tx/0x7325396bc6950fe1317b232d9bdee0e12b323c849cf0c1f2da0e121783100017) |
| 2026-10-07T11:56:10 | `word_count` | 0.005 | 0xdc0c0024… | 38560388 | [0x472e865648…](https://explore.testnet.tempo.xyz/tx/0x472e865648cb06e03ad243d71801833b688f866c50ac2ca1d0e7e4ef0d041fae) |
| 2026-10-07T11:56:15 | `word_count` | 0.005 | 0xdc0c0024… | 38560395 | [0xd491c059ca…](https://explore.testnet.tempo.xyz/tx/0xd491c059ca6537ead2c2c365ab6fa81c6c2f6c47779517ee4ee934bbadff8ac2) |

### Fresh Hono app set up with init (examples/fresh-hono) — 3 paid calls

| Time (UTC) | Route / tool | Paid | Fee payer | Block | Tx |
|---|---|---|---|---|---|
| 2026-10-07T10:04:19 | `/joke` | 0.02 | agent | 38549316 | [0xa5d5c96a5e…](https://explore.testnet.tempo.xyz/tx/0xa5d5c96a5e10cee372e544ddae5c8fc6d3e8e0a20d461a10aa0adde638d1e4aa) |
| 2026-10-07T14:26:01 | `/joke` | 0.02 | 0xdc0c0024… | 38575355 | [0x15c0c84d95…](https://explore.testnet.tempo.xyz/tx/0x15c0c84d953e4a1a4778455316671473a76a1f1c0be23ab0d5e7022b76c2743d) |
| 2026-10-07T23:39:02 | `/joke` | 0.01 | 0xdc0c0024… | 38630795 | [0xf9ea6c4fe3…](https://explore.testnet.tempo.xyz/tx/0xf9ea6c4fe3f6449bc1e64378404a782a27168da6dedc12356facd7c5942fe243) |

### Fresh Express app set up with init (examples/fresh-express) — 1 paid calls

| Time (UTC) | Route / tool | Paid | Fee payer | Block | Tx |
|---|---|---|---|---|---|
| 2026-10-07T11:34:13 | `/fact` | 0.03 | 0xdc0c0024… | 38558208 | [0x41da89921b…](https://explore.testnet.tempo.xyz/tx/0x41da89921bff40de47a226381ff38c9c6521f4433ff8af6951d0c19835adb516) |

## How to read a transaction on the explorer

- **From** is the buyer's wallet; **To** is the pathUSD contract (a TIP-20 transfer), with the seller address inside the transfer event.
- **feePayer** (in the receipt) is the account that paid the gas-in-stablecoin fee. When it differs from *From*, the seller sponsored the call; the demo seller does this via `TRAJAN_FEE_PAYER_KEY`.
- Fees on Moderato are below one base unit of a 6-decimal token, so a buyer's balance moves by exactly the price.

## What is not claimed

Testnet only; no mainnet transactions exist. No audit. Hosted cash-out does not yet send (Trajan Cloud never holds a seller's key). See [SECURITY.md](SECURITY.md) and the README's Limits.
