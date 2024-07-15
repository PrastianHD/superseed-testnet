const { ethers } = require('ethers');
const { bytecodeERC20 } = require('../config/bytecodeERC20');
const promptSync = require('prompt-sync');
const fs = require('fs');
const chalk = require('chalk');
const { log } = require('../utils/logger');

const prompt = promptSync();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function deploySC(RPC_URL) {

    const tokenName = prompt("Enter the token name: ");
    const tokenSymbol = prompt("Enter the token symbol: ");
    const mintAmount = prompt("Enter the token supply: ");

    let privateKeys = process.env.PRIVATE_KEY;
    if (!privateKeys) {
        throw new Error('PRIVATE_KEY not set in .env file');
    }

    privateKeys = JSON.parse(privateKeys);

    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

    for (const privateKey of privateKeys) {
        const wallet = new ethers.Wallet(privateKey, provider);
        try {
            const balance = await provider.getBalance(wallet.address);
            log('DEBUG', `Current ETH balance of ${wallet.address}: ${ethers.utils.formatEther(balance)} ETH`);
            log('INFO', `Starting deploy contract from wallet ${wallet.address}`);
            await delay(1000);

            const amountToMint = ethers.BigNumber.from(mintAmount).mul(ethers.BigNumber.from(10).pow(18));

            const abiERC20 = [
                "constructor(string memory name_, string memory symbol_)",
                "function name() view returns (string)",
                "function symbol() view returns (string)",
                "function totalSupply() view returns (uint256)",
                "function balanceOf(address) view returns (uint)",
                "function transfer(address to, uint256 amount) external returns (bool)",
                "function mint(uint amount) external",
            ];

            const factoryERC20 = new ethers.ContractFactory(abiERC20, bytecodeERC20, wallet);

            async function deployContract() {
                try {
                    log('INFO', 'Processing Deploy the ERC20 token contract');
                    const contractERC20 = await factoryERC20.deploy(tokenName, tokenSymbol);
                    await contractERC20.deployed();
                    log('SUCCESS', `Contract Address: ${contractERC20.address}`);
                    log('INFO', 'Wait for contract deployment on the blockchain');
                    let tx = await contractERC20.mint(amountToMint);
                    await tx.wait();
                    log('INFO', 'Contract deployed on the blockchain');
                    log('SUCCESS', `Contract Name: ${await contractERC20.name()}`);
                    log('SUCCESS', `Contract Symbol: ${await contractERC20.symbol()}`);
                    log('SUCCESS', `Total token supply: ${await contractERC20.totalSupply()}`);
                    log('DEBUG', `Completed`);
                } catch (error) {
                    log('ERROR', `Deployment failed: ${error.message}`);
                }
            }

            await deployContract();
        } catch (error) {
            log('ERROR', `Error with wallet ${wallet.address}: ${error.message}`);
        }
    }
}

module.exports = deploySC;
