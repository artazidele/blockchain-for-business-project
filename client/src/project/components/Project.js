import React from 'react';
import { useEffect, useState } from 'react';
import CharityPlatformContract from '../../contracts/CharityPlatform.json';
import Example from '../../contracts/Example.json';

const { ethers } = require("ethers");

export function Project() {
    const [account, setAccount] = useState('');

    const [balance, setBalance] = useState('');

    const [amount, setAmount] = useState();
    const [charityAddress, setCharityAddress] = useState();
    

    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([]);

    const [amountError, setAmountError] = useState(false);

    const id = window.location.href.split('/')[3];

    useEffect(() => {
        getProject();
        requestAccount();
    }, []);

    async function requestAccount() {
        if (window.ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults");
        } else {
            const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(account[0]);
            console.log(account[0]);
        }
    }

    async function getProject() {
        const contractAddress = localStorage.getItem('contractAddress');
        const signerAddress = localStorage.getItem('signerAddress');

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);

            const projectWithId = await thisContract.getProject(id);
            setProject(projectWithId);
            setCharityAddress(projectWithId.charityAddress);
            console.log(projectWithId);

            const milestoneCount = projectWithId.milestoneCount.toString();
            const milestoneArray = [];
            for (let i=0; i<milestoneCount; i++) {
                const milestoneWithId = await thisContract.getMilestone(id, i);
                milestoneArray.push(milestoneWithId);
            }
            setMilestones(milestoneArray);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function deactivateProject() {
        const contractAddress = localStorage.getItem('contractAddress');
        const signerAddress = localStorage.getItem('signerAddress');
        // console.log(signerAddress);
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);
            const project = await thisContract.deactivateProject(id);
            await project.wait();
            getProject();
        } catch (error) {
            console.error("Error:", error);
        }
    }

    useEffect(() => {
        requestBalance();
    }, [account]);

    async function requestBalance() {
        if (account) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const newBalance = await provider.getBalance(account.toString());
            setBalance(ethers.utils.formatEther(newBalance));
        }
    }
    // 73.336576129406074468
    // 73.335874169406074468
    // 73.335172209406074468

    async function example() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = await provider.getSigner();

        const signerAddress = await signer.getAddress();
        localStorage.setItem('signer', signerAddress);
        console.log(signerAddress);

        const abi = Example.abi;
        const bytecode = Example.bytecode;

        const factory = new ethers.ContractFactory(abi, bytecode, signer);
        const contract = await factory.deploy(1000);

        console.log(contract.address);
        localStorage.setItem('contract', contract.address);
    }

    async function transferTokens() {
        const contractAddress = localStorage.getItem('contract');
        console.log(contractAddress);
        const signerAddress = localStorage.getItem('signer');
        console.log(signerAddress);
          
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner(signerAddress);
            const contract = new ethers.Contract(contractAddress, Example.abi, signer);
            const toA = "0x9BD215d2d68Ce261E35B5A2596640aCf2f61B6D5";
            const project = await contract.transferTokens(toA, 100);
            const result = await project.wait();
            contract.on('Transfer', () => {
                console.log("Transaction complete");
            });

            const tx = await signer.sendTransaction({
                to: toA,
                value: ethers.utils.parseUnits("2", "ether")
            });
        
            console.log("Transaction hash:", tx.hash);
            await tx.wait();
            alert("Transaction successful!");

            requestBalance();
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function donate(e) {
        e.preventDefault();
        setAmountError(false);
        if(isNaN(amount)) {
            setAmountError(true);
        } else {
            //
        }
        // const contractAddress = localStorage.getItem('contractAddress');
        // const signerAddress = localStorage.getItem('signerAddress');
        // const amountInt = parseInt(amount);

        // console.log(charityAddress);

        // try {
        //     const provider = new ethers.providers.Web3Provider(window.ethereum);
        //     const signer = provider.getSigner(signerAddress);
        //     const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);
        //     const project = await thisContract.donate(charityAddress, { value: ethers.utils.parseEther("0.1") });
        //     await project.wait();
    
        //     thisContract.on('Transfer', () => {
        //         setAmount("");
        //         // getProject();
        //     })
        // } catch (error) {
        //     console.error("Error:", error);
        // }
    }

    return (
        <div>
        {project && <div>
        <h3 className='ml-6 my-8 text-4xl italic text-coffee_5 font-semibold'>{ project.name }</h3>
        <div className='bg-white p-6 rounded-lg border-solid border-2 border-coffee_5'>
            {project.isActive && <div className='w-full text-lime-900 italic text-xl text-right px-12 my-4'><p>Active</p></div>}
            {!project.isActive && <div className='w-full text-red-900 italic text-xl text-right px-12 my-4'><p>Not active</p></div>}
            <h2 className='font-semibold text-xl my-6'>Goal amount: { project.goalAmount.toString() } EUR</h2>
            <h2 className='font-semibold text-xl my-6'>Raised amount: { project.raisedAmount.toString() } EUR</h2>
            <h2 className='font-semibold text-xl my-6 pt-6 border-t-2 border-t-coffee_4'>Milestones: </h2>            
            {milestones && milestones.map((milestone, index) => <div className='my-8 pb-6 border-b border-b-coffee_4' key={index++}>
                <h2 className='font-medium text-lg my-4'>Target amount: { project.goalAmount.toString() } EUR</h2>
                <h2 className='font-medium text-lg my-4'>Description:</h2>
                <p>{ milestone.description }</p>
            </div>)}
            {(account && project) && <div>
                {(account.toLowerCase() === project.charityAddress.toLowerCase() && project.isActive) && <div>
                    <button onClick={deactivateProject} className="bg-white text-center mt-12 hover:text-white hover:bg-red-900 hover:border-red-900 font-semibold text-red-900 py-2 px-4 border-2 border-red-900 rounded-lg">Deactivate Project</button>
                </div>}
                {(account.toLowerCase() !== project.charityAddress.toLowerCase() && project.isActive) && <div>
                    <form>
                        <div className="mt-6 flex items-center justify-between gap-2">
                            <label className='font-semibold'>Amount (EUR): </label>
                            <input onChange={e => setAmount(e.target.value)} className="p-2 bg-transparent border-b-solid border-b-2 border-b-coffee_5 grow"/>                    
                        </div>  
                        {amountError && <p className='w-full text-red-900 italic text-sm my-4'>Amount must be number.</p>}                  
                        <button onClick={donate} className="bg-white text-center mt-12 hover:text-white hover:bg-lime-900 hover:border-lime-900 font-semibold text-lime-900 py-2 px-4 border-2 border-lime-900 rounded-lg">Donate</button>
                    </form>
                </div>}
            </div>}
            {balance && <p>{balance}</p>}
            <button onClick={example} className="bg-white text-center mt-12 hover:text-white hover:bg-lime-900 hover:border-lime-900 font-semibold text-lime-900 py-2 px-4 border-2 border-lime-900 rounded-lg">Example</button>
            <button onClick={transferTokens} className="bg-white text-center mt-12 hover:text-white hover:bg-lime-900 hover:border-lime-900 font-semibold text-lime-900 py-2 px-4 border-2 border-lime-900 rounded-lg">Example</button>
            </div>
        </div>}
        </div>
    );
};