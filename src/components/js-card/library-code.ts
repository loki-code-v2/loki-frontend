export const web3Read = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string
) => {
  return `
const Web3 = require('web3');
const web3 = new Web3('<INSERT PROVIDER>');

const contractAddress = '${contractAddress}';

const contractABI = '${contractABI}';

const myContract = new web3.eth.Contract(contractABI, contractAddress);

const result = await myContract.methods.${funcName}(${args}).call();
console.log(result);
`;
};

export const web3ReadTS = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string
): string => {
  return `
import Web3 from 'web3';
const web3: Web3 = new Web3('<INSERT PROVIDER>');

const contractAddress: string = '${contractAddress}';

const contractABI: any = ${contractABI};

const myContract: Web3.eth.Contract = new web3.eth.Contract(contractABI, contractAddress);

const result: any = await myContract.methods.${funcName}(${args}).call();
console.log(result);
  `;
};

export const web3Write = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string
) => {
  return `
const Web3 = require('web3');
const web3 = new Web3('<INSERT PROVIDER>');

const contractAddress = '${contractAddress}';

const contractABI = '${contractABI}';

const myContract = new web3.eth.Contract(contractABI, contractAddress);
const accounts = await web3.eth.getAccounts();

await myContract.methods.${funcName}(${args}).send({ from: accounts[0] });
`;
};

export const web3WriteTS = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string
): string => {
  return `
import Web3 from 'web3';
const web3: Web3 = new Web3('<INSERT PROVIDER>');

const contractAddress: string = '${contractAddress}';

const contractABI: any = ${contractABI};

const myContract: Web3.eth.Contract = new web3.eth.Contract(contractABI, contractAddress);
const accounts: string[] = await web3.eth.getAccounts();

await myContract.methods.${funcName}(${args}).send({ from: accounts[0] });
  `;
};

export const ethersRead = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string
) => {
  return `
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('<INSERT PROVIDER>');

const contractAddress = '${contractAddress}';

const contractABI = '${contractABI}';

const myContract = new ethers.Contract(contractAddress, contractABI, provider);

const result = await myContract.${funcName}(${args});
console.log(result);
`;
};

export const ethersReadTS = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string
): string => {
  return `
import { ethers } from 'ethers';
const provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider('<INSERT PROVIDER>');

const contractAddress: string = '${contractAddress}';

const contractABI: any = ${contractABI};

const myContract: ethers.Contract = new ethers.Contract(contractAddress, contractABI, provider);

const result: any = await myContract.${funcName}(${args});
console.log(result);
  `;
};

export const ethersWrite = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string
) => {
  return `
const { ethers } = require('ethers');
const provider = new ethers.providers.JsonRpcProvider('<INSERT PROVIDER>');

const contractAddress = '${contractAddress}';

const contractABI = '${contractABI}';

const myContract = new ethers.Contract(contractAddress, contractABI, provider);

const signer = provider.getSigner();
myContract = myContract.connect(signer);

const tx = await myContract.${funcName}(${args});
await tx.wait();
`;
};

export const ethersWriteTS = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string
): string => {
  return `
import { ethers } from 'ethers';
const provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider('<INSERT PROVIDER>');

const contractAddress: string = '${contractAddress}';

const contractABI: any = ${contractABI};

let myContract: ethers.Contract = new ethers.Contract(contractAddress, contractABI, provider);

const signer: ethers.Signer = provider.getSigner();
myContract = myContract.connect(signer);

const tx: ethers.providers.TransactionResponse = await myContract.${funcName}(${args});
await tx.wait();
  `;
};

export const viemRead = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string,
  network: string
) => {
  return `
const { createPublicClient, http } = require('viem');
const { ${network} } = require('viem/chains');

const client = createPublicClient({
  chain: ${network},
  transport: http(),
});

const contractAddress: string = '${contractAddress}';

const contractABI: any = ${contractABI};

const result = await client.readContract({
  address: contractAddress,
  abi: contractABI,
  functionName: '${funcName}',
  args: [${args}]
});
console.log(result);
`;
};

export const viemReadTS = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string,
  network: string
): string => {
  return `
import { createPublicClient, http } from 'viem';
import { ${network} } from 'viem/chains';

const client = createPublicClient({
  chain: ${network},
  transport: http(),
});

const contractAddress: string = '${contractAddress}';

const contractABI: any = ${contractABI};

const result: any = await client.readContract({
  address: contractAddress,
  abi: contractABI,
  functionName: '${funcName}',
  args: [${args}]
});
console.log(result);
  `;
};

export const viemWrite = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string,
  network: string
) => {
  return `
const { createWalletClient } = require('viem');
const { ${network} } = require('viem/chains');

const contractAddress: string = '${contractAddress}';

const contractABI: any = ${contractABI};

const walletClient = createWalletClient({
  chain: ${network},
  transport: http(),
  privateKey: 'YOUR_PRIVATE_KEY',
});

await walletClient.writeContract({
    address: contractAddress,
    abi: contractABI,
    functionName: '${funcName}',
    args: [${args}]
});
`;
};

export const viemWriteTS = (
  funcName: string,
  args: string,
  contractABI: string,
  contractAddress: string,
  network: string
): string => {
  return `
import { createWalletClient, http } from 'viem';
import { ${network} } from 'viem/chains';

const walletClient = createWalletClient({
  chain: ${network},
  transport: http(),
  privateKey: 'YOUR_PRIVATE_KEY',
});

const contractAddress: string = '${contractAddress}';

const contractABI: any = ${contractABI};

await walletClient.writeContract({
  address: contractAddress,
  abi: contractABI,
  functionName: '${funcName}',
  args: [${args}]
});
`;
};
