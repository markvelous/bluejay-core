# Bluejay Monorepo

This repository is a monorepo for Bleujay Finance. It's organized using [Lerna](https://github.com/lerna/lerna). Different projects can be found under the `/packages/` folder. 

>Below are packages available in this repository:

- [@bluejayfinance/contracts](packages/contracts/README.md)
- [@bluejayfinance/app-vault](packages/app-vault/README.md)
- [@bluejayfinance/functions](packages/functions/README.md)

# Install the Monorepo

To get started, you will need to install lerna by running `npm i -g lerna` or `yarn add lerna`.

>For Windows environment, install WSL(Ubintu) extension in VS Code to run Linux commands. 

Once lerna is installed, install project dependencies by running `lerna bootstrap`.

Finally, since most project depends on the `contract` dependency, build the projects by running `lerna run build`.

>You may encounter errors on project dependency that prompt you to resolve the issues individually. Do not attempt to fix errors independently in the monorepo as it may lead to other errors. Instead, go to [@bluejayfinance/app-vault](packages/app-vault), and copy the .env.example into a new .env file in app-vault. This will enable you to skip the preflight check. 

>You should see the following message for a successful build:
```
lerna success run Ran npm script 'build' in 2 packages in 51.6s:
lerna success - @bluejayfinance/app-vault
lerna success - @bluejayfinance/contracts
```

Now that you've setup the dependencies for the project, you can add start developing in the different packages. 

## Establish a local blockchain using Hardhat

To speed up development feedback loop, you should use a local blockchain during development. To setup the local blockchain environment:

Run `cd packages/contracts` to go into the contract directory.

Start a local node using `hh node` or `npx hardhat node`. 

Leave the terminal with the local node running. 

Pick one of the private keys from the list and use it to create an account in Metamask. 

Next, create a custom RPC using the following network setting:

- URL: http://localhost:8545
- Chain ID: 31337

In Metamask, go to `Settings > Advanced > Reset Account`, this will clear all previous transactions and reset the nonce to zero. 
### Deploy the local stack

Open a new terminal. Go to the `app-vault` directory by running `cd packages/app-vault`.

Run the deployment script by running `npm run deploy:local:fresh`. This will deploy all the contracts for the app. You can find the list of these contract addresses in the file `packages/app-vault/src/fixtures/deployment/contracts.json`.

Congratulations! You've just deployed all the smart contracts for Bluejay.Finance.

### Update the oracle price

Follow the instructions in the [@bluejayfinance/contracts README](packages/contracts/README.md) to update the oracle price for the assets.

## All set to go!

That's it! You are now ready to develop in the different projects.

Check out the project's readme files to get started:

- [@bluejayfinance/contracts](packages/contracts/README.md)
- [@bluejayfinance/app-vault](packages/app-vault/README.md)
- [@bluejayfinance/functions](packages/functions/README.md)

Start by copying the `.env example` files under these folders into `.env`, respectively.

### Recommended plugins

Install some useful plugins for a better coding experience in VSCode.

- Prettier
- Tailwind CSS IntelliSense
- ESLint
- Solidity
- Gitlens
- Remote-WSL (for developers using Windows env)
