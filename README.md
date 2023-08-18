<img src="frontend/src/lib/assets/OpenGraph-Choodle-1200x630-2x.jpg" alt="Choodle" />

# Choodle

### Draw onchain!

[Choodle](https://choodle.xyz/) is a simple mobile-first doodling app that publishes to the blockchain. By enabling
creative expression and ownership, Choodle seeks to bring the advantages of web3 technologies to typical users without
friction.

## Table of Contents

- [Features](#features)
- [Architecture overview](#architecture-overview)
- [Developer workflow](#developer-workflow)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Links](#links)

# Features

### Interactive canvas

- Optimized for drawing on mobile touchscreens
- "Undo" functionality to remove last line stroke from canvas
- Text-based prompt for drawing, updatable via CMS ([Sanity](https://www.sanity.io/))

### Image saving

- Ability to save a black-and-white, aliased image with a 3:4 aspect ratio
- Image saved with unique browser ID

### Image sharing

- Native sharing via "share" button allows user to save image, share via messaging application of choice, etc.

# Architecture overview

Choodle consists of three main parts: the progressive web app client, a Sanity Studio instance, and the smart contract for
holding a collection of Choodles as on-chain ERC721 tokens.

- `frontend`: built with [SvelteKit](https://kit.svelte.dev/).
- `choodle-cms`: a [Sanity Studio](https://sanity.io/) application for viewing stored choodles, and static content for
  the interface.
- `contracts`: the smart contract that holds the collection of choodles.

# Developer workflow

### `frontend`

To use the web client, run `pnpm dev` in the `frontend/` directory, and connect to it
on [http://localhost:5173/]

### `choodle-cms`

To use Sanity Studio, run `pnpm dev` in the `choodle-cms/` directory, and connect to it on [http://localhost:3333/]

### `contracts`

We use [Hardhat](https://hardhat.org/) for building and testing smart contract code, and [OpenZeppelin](https://www.openzeppelin.com/contracts)

# Deployment

Use hardhat tasks to deploy smart contracts to local / testnet / mainnet as
needed. We host the PWA and sanity client on Vercel, which has an easy configuration for
automatically deploying Sveltekit based on repo updates.

# Contributing

If you'd like to contribute to this project, please follow the steps below.

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

# License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/license/mit/)

# Links

**Contact**

- Email: help@choodle.xyz
- Website: [choodle.xyz](https://choodle.xyz/)
- Twitter: [@choodlexyz](https://twitter.com/choodlexyz)
- Instagram: [@choodlexyz](https://www.instagram.com/choodlexyz/)

**Friends**

- [RMX](https://www.rmx.party/)
- [FWB FEST 2023](https://www.fwbfest.xyz/)
