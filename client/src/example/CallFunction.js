import React from 'react';
import { useEffect, useState } from 'react';

import * as flatted from 'flatted';

import CharityPlatformContract from '../contracts/CharityPlatform.json';
import DonationTokenContract from '../contracts/DonationToken.json';

const { ethers } = require("ethers");

export function CallFunction() {
    const [account, setAccount] = useState('');
    const [signer, setSigner] = useState(null);
    const [charity, setCharity] = useState(null);
    // const [donationToken, setDonationToken] = useState(null);
    const [charityPlatform, setCharityPlatform] = useState(null);
    const [projects, setProjects] = useState([]);

    const [contractAddress, setContractAddress] = useState(null);
    const [provider, setProvider] = useState(null);

    const [contract, setContract] = useState(null);


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
        //     // localStorage.removeItem('contractAddress');
        //     // localStorage.removeItem('signer');
        //     // localStorage.removeItem('provider');
        //     // localStorage.removeItem('contract');
        //     createContract();
        } else {
            setContractAddress(localStorage.getItem('contractAddress'));
            // setProvider(localStorage.getItem('provider'));
            // setContract(JSON.parse(localStorage.getItem('contract')));
        }

    }, [account]);

    // useEffect(() => {
    //     charityPlatform.getProjects();
    // }, [charityPlatform]);

    async function createContract() {
        console.log('createContract');
        try {
            const cProvider = new ethers.providers.Web3Provider(window.ethereum);
            const providerSigner = await cProvider.getSigner();
            // setSigner(providerSigner);
    
            const abi = DonationTokenContract.abi;
            const bytecode = DonationTokenContract.bytecode;
            const factory = new ethers.ContractFactory(abi, bytecode, providerSigner)
            const contract = await factory.deploy();
            // setDonationToken(contract);
    
            const platformAbi = CharityPlatformContract.abi;
            const platformBytecode = CharityPlatformContract.bytecode;
            const platformFactory = new ethers.ContractFactory(platformAbi, platformBytecode, providerSigner)
            const platformContract = await platformFactory.deploy(contract.address);
            // setCharityPlatform(platformContract);

            // console.log(platformContract.address);
            // setContractAddress(platformContract.address);
            // setProvider(cProvider);
            // setSigner(providerSigner);
            const address = await signer.getAddress();

            localStorage.setItem('contractAddress', platformContract.address);
            localStorage.setItem('signer', address);
            localStorage.setItem('provider', flatted.stringify(cProvider));
            // localStorage.setItem('contract', flatted.stringify(platformContract));
            // const jsonString = flatted.stringify(obj); 
// console.log(jsonString);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function createCharity() {
        try {
            // console.log(localStorage.getItem('contractAddress'));

            // console.log(localStorage.getItem('contractAddress'));
            // console.log(JSON.parse(localStorage.getItem('provider')));
            // console.log(JSON.parse(localStorage.getItem('signer')));
            const signer = await flatted.parse(localStorage.getItem('provider')).getSigner();
            // const providerSigner = await provider.getSigner();
            const thisContract = new ethers.Contract(localStorage.getItem('contractAddress'), CharityPlatformContract.abi, signer);
            const charity = await thisContract.addCharity(account);
            const newCharity = await charity.wait();
            // setCharity(newCharity);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function createProject() {
        try {
            const project = await charityPlatform.createProject(
                "First Project", 
                100, 
                ['First milestone', 'Second Milestone'], 
                [10, 100]
            );
            await project.wait();
            // const newProject = await project.wait();
            // setProjects([...projects, newProject]);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function getProjects() {
        try {
            const allProjects = await charityPlatform.getProjects();
            console.log(allProjects);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function getProject() {
        try {
            const allProjects = await charityPlatform.getProject(1);
            console.log(allProjects);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    const donate = async (id) => {
        try {
            const donateTo = await charityPlatform.donate(id);
            const newDonateTo = await donateTo.wait();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div className="">
            {account && <div>
                <p>Account: {account}</p>
                <button onClick={createContract}>Create contract</button>
            </div>}
            {contractAddress && <div>
                <button onClick={createCharity}>Create charity</button>
            </div>}
            {charity && <div>
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