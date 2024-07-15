const optimism = require("@eth-optimism/sdk");
const ethers = require("ethers");
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');
const figlet = require('figlet');
require('dotenv').config();
const { log } = require('../utils/logger');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function loadConfig(configFile) {
  const configPath = `config/${configFile}`;
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file ${configPath} does not exist`);
  }
  return JSON.parse(fs.readFileSync(configPath));
}

function initializeMessenger(config, privateKey) {
  const l1Settings = config.L1;
  const l2Settings = config.L2;
  const addresses = config.addresses;

  const l1Provider = new ethers.providers.StaticJsonRpcProvider(l1Settings.rpc);
  const l2Provider = new ethers.providers.StaticJsonRpcProvider(l2Settings.rpc);

  if (!privateKey || !ethers.utils.isHexString(privateKey)) {
    throw new Error("Invalid private key");
  }
  const l1Wallet = new ethers.Wallet(privateKey, l1Provider);
  const l2Wallet = new ethers.Wallet(privateKey, l2Provider);

  return new optimism.CrossChainMessenger({
    l1ChainId: l1Settings.chainId,
    l2ChainId: l2Settings.chainId,
    l1SignerOrProvider: l1Wallet,
    l2SignerOrProvider: l2Wallet,
    contracts: {
      l1: {
        AddressManager: addresses.AddressManager,
        L1CrossDomainMessenger: addresses.L1CrossDomainMessenger,
        L1StandardBridge: addresses.L1StandardBridge,
        OptimismPortal: addresses.OptimismPortal,
        L2OutputOracle: addresses.L2OutputOracle,
        StateCommitmentChain: ethers.constants.AddressZero,
        CanonicalTransactionChain: ethers.constants.AddressZero,
        BondManager: ethers.constants.AddressZero,
      },
      l2: optimism.DEFAULT_L2_CONTRACT_ADDRESSES,
    }
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkGasPrice(provider, gasPriceThresholdGwei) {
  const gasData = await provider.getFeeData();
  const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasData.gasPrice, 'gwei'));
  log('DEBUG', `Current gas price: ${gasPriceGwei} Gwei`);

  if (gasPriceGwei > gasPriceThresholdGwei) {
    log('ERROR', `Gas price too high (${gasPriceGwei} Gwei). Operation canceled.`);
    return false;
  }
  return true;
}

async function bridgeETH(config, amount, gasPriceThresholdGwei, privateKey, times) {
  const messenger = initializeMessenger(config, privateKey);
  const l1NetworkName = config.L1.name;
  const l2NetworkName = config.L2.name;

  if (!(await checkGasPrice(messenger.l1SignerOrProvider, gasPriceThresholdGwei))) {
    return;
  }

  const balance = await messenger.l1SignerOrProvider.getBalance();
  log('INFO', `Current ETH balance of ${l1NetworkName}: ${ethers.utils.formatEther(balance)} ETH`);

  const amountInWei = ethers.utils.parseEther(amount);

  if (balance.lt(amountInWei.mul(times))) {
    log('ERROR', "Insufficient funds.");
    return;
  }

  try {
    for (let i = 0; i < times; i++) {
      const gasLimit = 2000000;
      let tx = await messenger.depositETH(amountInWei, gasLimit);
      log('SUCCESS', `Bridge ${amount} ETH successfully. Hash : ${tx.hash}`);

      if ((i + 1) % times === 0 || i === times - 1) {
        log('INFO', `Waiting for the deposit to be relayed to ${l2NetworkName}`);
        await delay(5000);
        const l2Balance = await messenger.l2SignerOrProvider.getBalance();
        console.log(chalk.yellowBright(`${l2NetworkName} Balance : `), ethers.utils.formatEther(l2Balance), 'ETH');
      }
    }
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      log('ERROR', `Insufficient funds for gas * price + value. ${error.message}`);
    } else {
      log('ERROR', `${error.message}`);
    }
  }
}

async function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(chalk.blueBright(question), (answer) => {
      resolve(answer);
    });
  });
}

async function bridge() {
  const configFile = 'superseed-testnet.json';
  const config = loadConfig(configFile);

  const gasPriceThresholdGwei = await promptUser("Enter Max gas Gwei, ex 3 : ");
  const amount = await promptUser("Enter the amount of ETH, ex 0.001 : ");
  const times = await promptUser("Enter the number of times to bridge: ");

  const privateKeys = JSON.parse(process.env.PRIVATE_KEY);
  for (const privateKey of privateKeys) {
    await bridgeETH(config, amount.trim(), parseFloat(gasPriceThresholdGwei.trim()), privateKey, parseInt(times, 10));
  }
  console.log(chalk.greenBright("Bridge Completed."));
  rl.close();
}

module.exports = bridge;
