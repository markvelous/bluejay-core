# Bluejay Monorepo

This repository is a monorepo for Bleujay Finance. It's organized using [Lerna](https://github.com/lerna/lerna). Different projects can be found in the `/packages/` folder. 

Below are packages available in this repository:

- [@bluejayfinance/contracts](packages/contracts/README.md)
- [@bluejayfinance/app-vault](packages/app-vault/README.md)
- [@bluejayfinance/functions](packages/functions/README.md)

# Developer

To get started, you will need to install lerna by running `npm i -g lerna`.

Once lerna is installed, install project dependencies by running `lerna bootstrap`.

Finally, since most project depends on the `contract` dependency, build the projects by running `lerna run build`.

Now that you've setup the dependencies for the project, you can add start developing in the different packages. 

## Developing with local blockchain

To speed up development feedback loop, you should use a local blockchain during development. To setup the local blockchain environment:

### Running the local blockchain using Hardhat

Go to the `contracts` directory by running `cd packages/contracts`.

Run the a local node using hardhat `hh node`. This assumes you have hardhat installed. Alternatively you can change `hh` to `npx hardhat`. 

Leave the terminal running and take note of the first private key printed on the console, you can use that on your browser's metamask account with the following settings:

- URL: http://localhost:8545
- Chain ID: 31337

### Deploying the local stack

Go to the `app-vault` directory by running `cd packages/app-vault`.

Run the deployment script by running `npm deploy:local:fresh`. This will deploy all the necessary contracts for the web app. You may find the deployed contract addresses in the file `src/fixtures/deployment/contracts.json`.

### Get started

You are now ready to develop in the different projects!

Check out the project's readme to get started:

- [@bluejayfinance/contracts](packages/contracts/README.md)
- [@bluejayfinance/app-vault](packages/app-vault/README.md)
- [@bluejayfinance/functions](packages/functions/README.md)

## Recommended VS Code Plugins

You may wish to install the following plugins if you are using VS Code to have a more plesant developer experience.

- Prettier
- Tailwind CSS IntelliSense
- ESLint
- Solidity
- Gitlens