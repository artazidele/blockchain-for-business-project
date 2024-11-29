import React from 'react';
import { useEffect, useState } from 'react';

import * as flatted from 'flatted';

import CharityPlatformContract from '../contracts/CharityPlatform.json';
import DonationTokenContract from '../contracts/DonationToken.json';

const { ethers } = require("ethers");

export function CallFunction2() {
    const [account, setAccount] = useState('');

    // const [charity, setCharity] = useState(null);
    // const [charityPlatform, setCharityPlatform] = useState(null);


    const [contractAddress, setContractAddress] = useState(null);
    const [signerAddress, setSignerAddress] = useState(null);

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
        if (!localStorage.getItem('contractAddress')) {
            localStorage.removeItem('contractAddress');
            localStorage.removeItem('signerAddress');
            createContract();
        } else {
            setContractAddress(localStorage.getItem('contractAddress'));
            setSignerAddress(localStorage.getItem('signerAddress'));
        }
    }, [account]);

    async function createContract() {
        console.log('createContract');
        try {
            const newProvider = new ethers.providers.Web3Provider(window.ethereum);
            const providerSigner = await newProvider.getSigner();
    
            const abi = DonationTokenContract.abi;
            const bytecode = DonationTokenContract.bytecode;
            const factory = new ethers.ContractFactory(abi, bytecode, providerSigner)
            const contract = await factory.deploy();
            
            const platformAbi = CharityPlatformContract.abi;
            const platformBytecode = CharityPlatformContract.bytecode;
            const platformFactory = new ethers.ContractFactory(platformAbi, platformBytecode, providerSigner)
            const platformContract = await platformFactory.deploy(contract.address);
            
            const address = await providerSigner.getAddress();

            localStorage.setItem('contractAddress', platformContract.address);
            localStorage.setItem('signerAddress', address);
            setContractAddress(platformContract.address);
            setSignerAddress(address);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function createCharity() {
        console.log(signerAddress);
        console.log(contractAddress);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(localStorage.getItem('signerAddress'));

            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);
            const charity = await thisContract.addCharity(account);
            await charity.wait();
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function createProject() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);

            const project = await thisContract.createProject(
                "First Project", 
                100, 
                ['First milestone', 'Second Milestone'], 
                [10, 100]
            );
            await project.wait();

            thisContract.on('ProjectCreated', () => {
                console.log("New project");
            })
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function getProjects() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);

            const allProjects = await thisContract.getProjects();
            console.log(allProjects);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function getProject() {
        // try {
        //     const allProjects = await charityPlatform.getProject(1);
        //     console.log(allProjects);
        // } catch (error) {
        //     console.error("Error:", error);
        // }
    }

    const donate = async (id) => {
        // try {
        //     const donateTo = await charityPlatform.donate(id);
        //     const newDonateTo = await donateTo.wait();
        // } catch (error) {
        //     console.error("Error:", error);
        // }
    };

    return (
        <div className="">
            {account && <div>
                <p>Account: {account}</p>
                <button onClick={createContract}>Create contract</button>
            </div>}
            {contractAddress && <div>
                <button onClick={createCharity}>Create charity</button>
                <button onClick={createProject}>Create project</button>
                <button onClick={getProject}>Get project</button>
                <button onClick={getProjects}>Get projects</button>
            </div>}
            {/* {projects.length > 0 && <div>
                <p>{ projects.length }</p>
                {projects.map((project, index) => (
                    <button key={index} onClick={donate}>Donate {project.data} {index + 1}</button>
                ))}
            </div>} */}
        </div>
    );
};