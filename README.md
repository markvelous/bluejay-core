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

>You may encounter errors on roject dependency. Go to [@bluejayfinance/app-vault](packages/app-vault), and copy the .env.example into a new .env file. This will enable you to skip the preflight check. Do not attempt to individually fix the dependency in the monorepo as it will lead to other errors.

Now that you've setup the dependencies for the project, you can add start developing in the different packages. 

## Establish a local blockchain using Hardhat

To speed up development feedback loop, you should use a local blockchain during development. To setup the local blockchain environment:

Go to the `contracts` directory by running `cd packages/contracts`.

Run the a local node using hardhat `hh node`. This assumes you have hardhat installed. Alternatively you can change `hh` to `npx hardhat`. 

Leave the terminal running and take note of the first private key printed on the console, you can use that on your browser's metamask account with the following settings:

- URL: http://localhost:8545
- Chain ID: 31337

### Deploy the local stack

Go to the `app-vault` directory by running `cd packages/app-vault`.

Run the deployment script by running `npm run deploy:local:fresh`. This will deploy all the necessary contracts for the web app. You may find the deployed contract addresses in the file `packages/app-vault/src/fixtures/deployment/contracts.json`.

### Update the oracle price

Follow the instructions in the [@bluejayfinance/contracts README](packages/contracts/README.md) to update the oracle price for the assets.

## All set to go!

That's it! You are now ready to develop in the different projects.

Check out the project's readme files to get started:

- [@bluejayfinance/contracts](packages/contracts/README.md)
- [@bluejayfinance/app-vault](packages/app-vault/README.md)
- [@bluejayfinance/functions](packages/functions/README.md)

### Recommended VS Code plugins

Install some useful plugins for a better coding experience in VS Code.

- Prettier
- Tailwind CSS IntelliSense
- ESLint
- Solidity
- Gitlens
- Remote-WSL (for developers using Windows env)
