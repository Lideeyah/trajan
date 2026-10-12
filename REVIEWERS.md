# Reviewer guide and on-chain evidence

Everything Trajan claims is checkable on Tempo's public testnet (Moderato, chain id 42431). This file lists the addresses and transactions behind the demo, and the fastest way to verify the product yourself. Generated from the demo sellers' call logs and Trajan Cloud's database on 2026-10-12.

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
| 2026-10-08T10:27:15 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38695733 | [0x1d2baf5cb7…](https://explore.testnet.tempo.xyz/tx/0x1d2baf5cb75f1ab2e325952918676830b218dac42c53c8008d5e57f9c1a36c1b) |
| 2026-10-08T10:29:16 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38695932 | [0xb936562ce5…](https://explore.testnet.tempo.xyz/tx/0xb936562ce5f517f51ef80a398b4f17570799b290378a43ee711df8e0e0c74626) |
| 2026-10-08T10:32:49 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38696284 | [0x505f22b123…](https://explore.testnet.tempo.xyz/tx/0x505f22b123a741e55b0de6364b76bf005e4c000ac48a291ccb13b0ef5f5e825b) |
| 2026-10-08T10:34:52 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38696487 | [0x30ca16da1b…](https://explore.testnet.tempo.xyz/tx/0x30ca16da1b4822a92faf1114e45e7f98fe593854e2516d34ad70d6d964585963) |
| 2026-10-08T10:36:20 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38696631 | [0x98561c44d7…](https://explore.testnet.tempo.xyz/tx/0x98561c44d7e2196d9dec8b0805b9072f00cef8d7a0355dd6d2620751013e0703) |
| 2026-10-08T10:37:15 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38696720 | [0x1ec800be78…](https://explore.testnet.tempo.xyz/tx/0x1ec800be7806442a564a476c0ec2553f8ab496b53453db8905cadaa00cf4c3be) |
| 2026-10-08T10:42:04 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38697191 | [0x63ee20f7c5…](https://explore.testnet.tempo.xyz/tx/0x63ee20f7c5efd50dd8de36559e3be16e74e3e0a49b8989e9c906f3d114a85c37) |
| 2026-10-08T10:43:27 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38697326 | [0xb9ccb82556…](https://explore.testnet.tempo.xyz/tx/0xb9ccb8255650e3ffe537b16573412aaa59e211675fbddef3aaf321f0431b4a4f) |
| 2026-10-08T10:46:53 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38697660 | [0x2247f1de83…](https://explore.testnet.tempo.xyz/tx/0x2247f1de83cee28e027aef69443962f75b132b518f2bca76a65c761cb905f8e8) |
| 2026-10-08T10:47:28 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38697718 | [0x508550a102…](https://explore.testnet.tempo.xyz/tx/0x508550a1025e0cf575073338a492a13ec9a6e3188c5f2a690f55c44f92cf5d72) |
| 2026-10-08T10:50:35 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38698023 | [0x7a1e727e4b…](https://explore.testnet.tempo.xyz/tx/0x7a1e727e4b991bf919e68c8fe95e49403f766cdc199835440b68e13291f7bd4d) |
| 2026-10-08T10:51:09 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38698078 | [0xbd42a99a8c…](https://explore.testnet.tempo.xyz/tx/0xbd42a99a8c09e923f0469ffd4e2127a06ad4be6df9cfc053709aed1619e0ba83) |
| 2026-10-08T10:51:28 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38698108 | [0xb54cdfc8f0…](https://explore.testnet.tempo.xyz/tx/0xb54cdfc8f067b9c46338447950bd95cc7e08ccf786171cf6452e58786e3e0dc1) |
| 2026-10-08T11:01:52 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38699122 | [0xd5d2998525…](https://explore.testnet.tempo.xyz/tx/0xd5d299852540e9fe9ae4a3c175dd1151f96ae8f1c455bf18221ff19b12ad101f) |
| 2026-10-08T11:10:45 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38699988 | [0xfd3c94bce0…](https://explore.testnet.tempo.xyz/tx/0xfd3c94bce0be3c0b6d8ea898ef8b95c56ceef67529039d49776cda82c6edc5c8) |
| 2026-10-08T11:15:09 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38700416 | [0xf7a44ae001…](https://explore.testnet.tempo.xyz/tx/0xf7a44ae00122456487b7b8af8b0c6b800f93f5e84f57e3e313545dd1934e6d60) |
| 2026-10-08T11:15:26 | `/price/air-max-90` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38700445 | [0x3450dc78e6…](https://explore.testnet.tempo.xyz/tx/0x3450dc78e69ce0d9439513f6db3aecb7910c49306e52f026908db341b25e268d) |
| 2026-10-08T11:16:06 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38700509 | [0xa04d118793…](https://explore.testnet.tempo.xyz/tx/0xa04d1187939a6add1f0e777ea9c1be408c9b4ea034058d4f97a0da5174bdc832) |
| 2026-10-08T11:16:24 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38700538 | [0x10086fa837…](https://explore.testnet.tempo.xyz/tx/0x10086fa8379b9319138dd9a14e1c81dc70b410cc4d7d44380472a369cf289cd2) |
| 2026-10-08T11:19:37 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38700855 | [0xb039603b69…](https://explore.testnet.tempo.xyz/tx/0xb039603b6993b8e8fb73943a9855d5d14140c1cb061b605bedc5a348c2fffa10) |
| 2026-10-08T11:21:51 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38701076 | [0x85f4aabf01…](https://explore.testnet.tempo.xyz/tx/0x85f4aabf011f49dc2c0ddda119bd279bb1d51ec5319544c8de2e2a9aae15e28e) |
| 2026-10-08T11:31:46 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38702049 | [0xd4cc13c57c…](https://explore.testnet.tempo.xyz/tx/0xd4cc13c57cb3feefa4f97ae299e09378744bd7e1e86fbdb29f579992338a0c6a) |
| 2026-10-08T11:32:03 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38702077 | [0xd24d18a59e…](https://explore.testnet.tempo.xyz/tx/0xd24d18a59e65f1526b0c36d9861f480d00f53c37bd8d9d7a178bf39ded4d5803) |
| 2026-10-08T11:33:47 | `/joke` | 0.01 | 0x5a784c18… | 0xdc0c0024… | 38702248 | [0x146256474a…](https://explore.testnet.tempo.xyz/tx/0x146256474ae381a9c0d7fac0c0e92480ac5d6d7050af370cdd50e4c9950a7be2) |
| 2026-10-08T11:36:40 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38702533 | [0x774225c9cd…](https://explore.testnet.tempo.xyz/tx/0x774225c9cd2793763f152824c6c884d1badde78565e64abc2f8a3d94f7338656) |
| 2026-10-08T11:39:33 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38702817 | [0x5dcd153a83…](https://explore.testnet.tempo.xyz/tx/0x5dcd153a83de2963dba9d73816567f43af632803f225bbaef4e8e95da12cb3dc) |
| 2026-10-08T11:43:03 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38703158 | [0x2ddf98e613…](https://explore.testnet.tempo.xyz/tx/0x2ddf98e61388711fc5457c6fbbb1e60674449125919ba5fd9b52ccb7bec5fd3d) |
| 2026-10-08T11:47:44 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38703619 | [0x85ea0ced79…](https://explore.testnet.tempo.xyz/tx/0x85ea0ced79bbd68562ad0d03ad554fbe22967ce20781b43639cae95c1ea378b8) |
| 2026-10-08T11:50:15 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38703868 | [0xb9a8617aca…](https://explore.testnet.tempo.xyz/tx/0xb9a8617aca7016669b86cbe93cf3ae80ad31a76dca62c8087e9ac0018faf5942) |
| 2026-10-08T11:51:38 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38704006 | [0x89169b9907…](https://explore.testnet.tempo.xyz/tx/0x89169b9907dd2f80d1bb55ddc7902921258579e67fcfcb225c7400d2a4426624) |
| 2026-10-08T11:52:17 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38704069 | [0x575fb3e123…](https://explore.testnet.tempo.xyz/tx/0x575fb3e12396a0730108acd7835ffa0f6c323ade0a05655090905f30cfbbb737) |
| 2026-10-08T12:02:29 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38705076 | [0xdec373ef3b…](https://explore.testnet.tempo.xyz/tx/0xdec373ef3b927746e82600fa60447f0cdf1b17980c371cf08239643b147a2865) |
| 2026-10-08T12:04:11 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38705244 | [0x1995c3eb0f…](https://explore.testnet.tempo.xyz/tx/0x1995c3eb0f3a166136cbb697afea72cae22f19bba00b30a7171a2e5b9030911a) |
| 2026-10-08T12:10:57 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38705912 | [0xc4dac558b0…](https://explore.testnet.tempo.xyz/tx/0xc4dac558b05ff321ebf1f33bd00d5b0216fda3662277a0db897dad11681b1d14) |
| 2026-10-08T12:18:58 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38706701 | [0xbdf459bb9e…](https://explore.testnet.tempo.xyz/tx/0xbdf459bb9e57b3c0ad3110c0e16a1d7bff9da7b897c2ba0f498721fa21295631) |
| 2026-10-08T12:23:50 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38707184 | [0x8ce6f1afc7…](https://explore.testnet.tempo.xyz/tx/0x8ce6f1afc7f7c51e6e5526d694feebb965bdbae85a791f96d4b3a005f4a45891) |
| 2026-10-08T12:26:21 | `/price/jordan-1-chicago` | 0.02 | 0x5a784c18… | 0xdc0c0024… | 38707433 | [0xabc7c368e4…](https://explore.testnet.tempo.xyz/tx/0xabc7c368e4db1c4af758afce5d93c913a8df04106a32bd8ea7153098a2b5a3ea) |

## Withdraw from the self-hosted console

A 0.5 pathUSD transfer with the on-chain memo "trajan test withdraw", sent from the demo seller's address via the console's Cash out form: [0x7dddefbb…](https://explore.testnet.tempo.xyz/tx/0x7dddefbb241ae95c1f0f702bc084f1873608a5000f586b89a38257589eff0b6f) (block 38551487).

## Every paid call logged by the example servers

### HTTP demo seller (examples/mcp-server) — 24 paid calls

| Time (UTC) | Route / tool | Paid | Fee payer | Block | Tx |
|---|---|---|---|---|---|
| 2026-10-07T10:01:20 | `/tools/echo?q=call1` | 0.01 | agent | 38549019 | [0xb60dfef384…](https://explore.testnet.tempo.xyz/tx/0xb60dfef3844c3644454ee6485a8374b11612157556e6e8e59da56415c5be905c) |
| 2026-10-07T10:01:24 | `/tools/echo?q=call2` | 0.01 | agent | 38549025 | [0xaa441976c2…](https://explore.testnet.tempo.xyz/tx/0xaa441976c225676aca3f194454a9b4255176e95ce82a2137ab8d406258ee0c37) |
| 2026-10-07T10:25:13 | `/tools/echo?q=trajan` | 0.01 | agent | 38551377 | [0x60fa6ef95a…](https://explore.testnet.tempo.xyz/tx/0x60fa6ef95a444a069561b868a26c5f1ba692d5e5eebc9b8aa3184b7ac04d5bd4) |
| 2026-10-07T10:41:44 | `/tools/echo?q=trajan` | 0.01 | agent | 38553006 | [0x57e2fd82ff…](https://explore.testnet.tempo.xyz/tx/0x57e2fd82ff7ca0928faf6538bc358a41589a8f03c9607ca63c09ead17d0588a5) |
| 2026-10-07T10:41:50 | `/tools/echo?q=trajan` | 0.01 | agent | 38553015 | [0x1b5e8c0008…](https://explore.testnet.tempo.xyz/tx/0x1b5e8c00083dd74ddfa0782b2b36ef4406edc12ed487c7f01d9fcfa6d7a9500c) |
| 2026-10-07T10:43:41 | `/tools/echo?q=trajan` | 0.01 | 0xdc0c0024… | 38553198 | [0x6575175c14…](https://explore.testnet.tempo.xyz/tx/0x6575175c14e9f01382c217a6b8d06f2a06d3df2f29f962be2aaed9f9d13a6f64) |
| 2026-10-07T10:46:03 | `/tools/echo?q=trajan` | 0.01 | 0xdc0c0024… | 38553432 | [0x8dc8edac0e…](https://explore.testnet.tempo.xyz/tx/0x8dc8edac0e50a0bd2c4aa869993e9fbd013448ff296959186b990d2c2744c4ec) |
| 2026-10-08T11:39:15 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38702787 | [0x4c1fc152a1…](https://explore.testnet.tempo.xyz/tx/0x4c1fc152a19f2f16da543c0a2d0564d261bf580c37354cc5254587b3bd2e7cf6) |
| 2026-10-08T11:41:05 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38702966 | [0xfcea2b2c68…](https://explore.testnet.tempo.xyz/tx/0xfcea2b2c68488527691d3d4c6be29b876b5d839e10ceb235cb91fb53f4e966bf) |
| 2026-10-08T11:42:45 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38703129 | [0xb46dd4a427…](https://explore.testnet.tempo.xyz/tx/0xb46dd4a427d92800288e8322c68ac06871cc9a458e339360e3e0b94fe2a7ed2b) |
| 2026-10-08T11:45:39 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38703414 | [0x66750606a7…](https://explore.testnet.tempo.xyz/tx/0x66750606a76cdc3e26e155f373a45744cbfa772199ba2445aaa8aa81648b80c3) |
| 2026-10-08T11:47:29 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38703595 | [0xc3b4bd00a3…](https://explore.testnet.tempo.xyz/tx/0xc3b4bd00a323e51a541d088cbeb9bbc94e72165cb561a4c120f0949e8eb2300d) |
| 2026-10-08T11:48:31 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38703697 | [0x15fc928461…](https://explore.testnet.tempo.xyz/tx/0x15fc9284612caa5356eee2fc01345e15c36c4caf3d2f5708c96d84c28cb027ae) |
| 2026-10-08T11:51:19 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38703974 | [0x79651c4093…](https://explore.testnet.tempo.xyz/tx/0x79651c4093d0f4ddf9281f6c269140c95a7f9fada3f6781b21c1b78080ec1a07) |
| 2026-10-08T11:55:31 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38704387 | [0x47b4a792b6…](https://explore.testnet.tempo.xyz/tx/0x47b4a792b6f68c97892ef839ad9dc0e243b3165f5be696c733bbc199402eebe4) |
| 2026-10-08T11:59:46 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38704809 | [0xbedb0e4b9c…](https://explore.testnet.tempo.xyz/tx/0xbedb0e4b9cf95da6399cc6983ddfbe4a6d16fd735babcf0b1a1e47770f5e3b27) |
| 2026-10-08T11:59:54 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38704822 | [0xc5f7b95f70…](https://explore.testnet.tempo.xyz/tx/0xc5f7b95f70bb0737c2f04b213604e71824f28b18eb22bf7b1513b6ef7dbda14a) |
| 2026-10-08T12:01:40 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38704996 | [0x6f240c371f…](https://explore.testnet.tempo.xyz/tx/0x6f240c371f69471434a4c490fd6bf019a853de0da62d93f7329dea2d6e85424c) |
| 2026-10-08T12:03:53 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38705214 | [0xf08f1f109e…](https://explore.testnet.tempo.xyz/tx/0xf08f1f109e3a5ea540fedc1aa6f2871c490d71441f68e951d961d2c8aa0d0081) |
| 2026-10-08T12:08:42 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38705690 | [0x071ca4d648…](https://explore.testnet.tempo.xyz/tx/0x071ca4d648ca7c734579fc34f10ad62cbdf5c7d102af59215b978ab5c0900898) |
| 2026-10-08T12:10:09 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38705833 | [0xea56120a8a…](https://explore.testnet.tempo.xyz/tx/0xea56120a8aaf9bf060d519ff430112d76766b3150194bcf96abf60b24acf67f2) |
| 2026-10-08T12:13:58 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38706210 | [0xf620736f57…](https://explore.testnet.tempo.xyz/tx/0xf620736f578fe901e0f382748aa8e121247e6819cfeca3044be9b4f0e555529c) |
| 2026-10-08T12:25:57 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 38707394 | [0xfc1376fc9a…](https://explore.testnet.tempo.xyz/tx/0xfc1376fc9a43a422ea626021e016d05360f526a44168ed0e563ec9285d9c7130) |
| 2026-10-10T21:04:06 | `/tools/echo?q=hello` | 0.01 | 0xdc0c0024… | 39039411 | [0x249079989a…](https://explore.testnet.tempo.xyz/tx/0x249079989a4a824408f2b7c9529aa537531d873c578ed33ac51b827bcc29d603) |

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

### Fresh Hono app set up with init (examples/fresh-hono) — 22 paid calls

| Time (UTC) | Route / tool | Paid | Fee payer | Block | Tx |
|---|---|---|---|---|---|
| 2026-10-07T10:04:19 | `/joke` | 0.02 | agent | 38549316 | [0xa5d5c96a5e…](https://explore.testnet.tempo.xyz/tx/0xa5d5c96a5e10cee372e544ddae5c8fc6d3e8e0a20d461a10aa0adde638d1e4aa) |
| 2026-10-07T14:26:01 | `/joke` | 0.02 | 0xdc0c0024… | 38575355 | [0x15c0c84d95…](https://explore.testnet.tempo.xyz/tx/0x15c0c84d953e4a1a4778455316671473a76a1f1c0be23ab0d5e7022b76c2743d) |
| 2026-10-07T23:39:02 | `/joke` | 0.01 | 0xdc0c0024… | 38630795 | [0xf9ea6c4fe3…](https://explore.testnet.tempo.xyz/tx/0xf9ea6c4fe3f6449bc1e64378404a782a27168da6dedc12356facd7c5942fe243) |
| 2026-10-08T10:27:15 | `/joke` | 0.01 | 0xdc0c0024… | 38695733 | [0x1d2baf5cb7…](https://explore.testnet.tempo.xyz/tx/0x1d2baf5cb75f1ab2e325952918676830b218dac42c53c8008d5e57f9c1a36c1b) |
| 2026-10-08T10:29:16 | `/joke` | 0.01 | 0xdc0c0024… | 38695932 | [0xb936562ce5…](https://explore.testnet.tempo.xyz/tx/0xb936562ce5f517f51ef80a398b4f17570799b290378a43ee711df8e0e0c74626) |
| 2026-10-08T10:32:49 | `/joke` | 0.01 | 0xdc0c0024… | 38696284 | [0x505f22b123…](https://explore.testnet.tempo.xyz/tx/0x505f22b123a741e55b0de6364b76bf005e4c000ac48a291ccb13b0ef5f5e825b) |
| 2026-10-08T10:34:52 | `/joke` | 0.01 | 0xdc0c0024… | 38696487 | [0x30ca16da1b…](https://explore.testnet.tempo.xyz/tx/0x30ca16da1b4822a92faf1114e45e7f98fe593854e2516d34ad70d6d964585963) |
| 2026-10-08T10:36:20 | `/joke` | 0.01 | 0xdc0c0024… | 38696631 | [0x98561c44d7…](https://explore.testnet.tempo.xyz/tx/0x98561c44d7e2196d9dec8b0805b9072f00cef8d7a0355dd6d2620751013e0703) |
| 2026-10-08T10:42:04 | `/joke` | 0.01 | 0xdc0c0024… | 38697191 | [0x63ee20f7c5…](https://explore.testnet.tempo.xyz/tx/0x63ee20f7c5efd50dd8de36559e3be16e74e3e0a49b8989e9c906f3d114a85c37) |
| 2026-10-08T10:46:53 | `/joke` | 0.01 | 0xdc0c0024… | 38697660 | [0x2247f1de83…](https://explore.testnet.tempo.xyz/tx/0x2247f1de83cee28e027aef69443962f75b132b518f2bca76a65c761cb905f8e8) |
| 2026-10-08T10:47:28 | `/joke` | 0.01 | 0xdc0c0024… | 38697718 | [0x508550a102…](https://explore.testnet.tempo.xyz/tx/0x508550a1025e0cf575073338a492a13ec9a6e3188c5f2a690f55c44f92cf5d72) |
| 2026-10-08T10:50:35 | `/joke` | 0.01 | 0xdc0c0024… | 38698023 | [0x7a1e727e4b…](https://explore.testnet.tempo.xyz/tx/0x7a1e727e4b991bf919e68c8fe95e49403f766cdc199835440b68e13291f7bd4d) |
| 2026-10-08T10:51:09 | `/joke` | 0.01 | 0xdc0c0024… | 38698078 | [0xbd42a99a8c…](https://explore.testnet.tempo.xyz/tx/0xbd42a99a8c09e923f0469ffd4e2127a06ad4be6df9cfc053709aed1619e0ba83) |
| 2026-10-08T10:51:28 | `/joke` | 0.01 | 0xdc0c0024… | 38698108 | [0xb54cdfc8f0…](https://explore.testnet.tempo.xyz/tx/0xb54cdfc8f067b9c46338447950bd95cc7e08ccf786171cf6452e58786e3e0dc1) |
| 2026-10-08T11:01:52 | `/joke` | 0.01 | 0xdc0c0024… | 38699122 | [0xd5d2998525…](https://explore.testnet.tempo.xyz/tx/0xd5d299852540e9fe9ae4a3c175dd1151f96ae8f1c455bf18221ff19b12ad101f) |
| 2026-10-08T11:10:45 | `/joke` | 0.01 | 0xdc0c0024… | 38699988 | [0xfd3c94bce0…](https://explore.testnet.tempo.xyz/tx/0xfd3c94bce0be3c0b6d8ea898ef8b95c56ceef67529039d49776cda82c6edc5c8) |
| 2026-10-08T11:15:09 | `/joke` | 0.01 | 0xdc0c0024… | 38700416 | [0xf7a44ae001…](https://explore.testnet.tempo.xyz/tx/0xf7a44ae00122456487b7b8af8b0c6b800f93f5e84f57e3e313545dd1934e6d60) |
| 2026-10-08T11:16:06 | `/joke` | 0.01 | 0xdc0c0024… | 38700509 | [0xa04d118793…](https://explore.testnet.tempo.xyz/tx/0xa04d1187939a6add1f0e777ea9c1be408c9b4ea034058d4f97a0da5174bdc832) |
| 2026-10-08T11:19:37 | `/joke` | 0.01 | 0xdc0c0024… | 38700855 | [0xb039603b69…](https://explore.testnet.tempo.xyz/tx/0xb039603b6993b8e8fb73943a9855d5d14140c1cb061b605bedc5a348c2fffa10) |
| 2026-10-08T11:21:51 | `/joke` | 0.01 | 0xdc0c0024… | 38701076 | [0x85f4aabf01…](https://explore.testnet.tempo.xyz/tx/0x85f4aabf011f49dc2c0ddda119bd279bb1d51ec5319544c8de2e2a9aae15e28e) |
| 2026-10-08T11:31:46 | `/joke` | 0.01 | 0xdc0c0024… | 38702049 | [0xd4cc13c57c…](https://explore.testnet.tempo.xyz/tx/0xd4cc13c57cb3feefa4f97ae299e09378744bd7e1e86fbdb29f579992338a0c6a) |
| 2026-10-08T11:33:47 | `/joke` | 0.01 | 0xdc0c0024… | 38702248 | [0x146256474a…](https://explore.testnet.tempo.xyz/tx/0x146256474ae381a9c0d7fac0c0e92480ac5d6d7050af370cdd50e4c9950a7be2) |

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
