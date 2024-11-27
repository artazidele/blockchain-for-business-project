import React from 'react';
import { useEffect, useState } from 'react';

import CharityPlatformContract from '../contracts/CharityPlatform.json';
import DonationTokenContract from '../contracts/DonationToken.json';

const { ethers } = require("ethers");

export function Test() {
    const [account, setAccount] = useState('');
    const [result, setResult] = useState(null);
    const [balance, setBalance] = useState('');

    async function requestAccount() {
        if (window.ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults");
        } else {
            const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(account[0]);
        }
    }

    useEffect(() => {
        requestAccount();
    }, []);

    useEffect(() => {
        requestBalance();
    }, [account]);

    async function requestBalance() {
        if (account) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const newBalance = await provider.getBalance(account.toString());
            setBalance(ethers.formatEther(newBalance));
        }
    }

    async function testDonation() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const abi = DonationTokenContract.abi;
        const bytecode = DonationTokenContract.bytecode;
        const factory = new ethers.ContractFactory(abi, bytecode, signer)
        const contract = await factory.deploy();

        const platformAbi = CharityPlatformContract.abi;
        const platformBytecode = CharityPlatformContract.bytecode;
        const platformFactory = new ethers.ContractFactory(platformAbi, platformBytecode, signer)
        const platformContract = await platformFactory.deploy(contract.getAddress());

        const charity = await platformContract.addCharity(account);
        await charity.wait();
        
        try {
            const project = await platformContract.createProject("First Project", 100, ['First milestone', 'Second Milestone'], [10, 100]);
            await project.wait();
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div className="">
            {account && <p>Account: {account}</p>}
            {balance && <p>Balance: {balance}</p>}
            <button onClick={testDonation}>TEST DONATION</button>
            {result && <p>{result}</p>}
        </div>
    );
};