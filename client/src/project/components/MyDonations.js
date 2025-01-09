import React, { useEffect, useState, useCallback } from 'react';
import CharityPlatformContract from '../../contracts/CharityPlatform.json';
import DonatedProjectItem from './DonatedProjectItem';

const { ethers } = require("ethers");

export function MyDonations() {
    const [account, setAccount] = useState("");
    const [projects1, setProjects1] = useState([]);
    const [projects2, setProjects2] = useState([]);
    const [projects, setProjects] = useState([]);
    const [projectCount, setProjectCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // New: store real-time ETH→EUR exchange rate
    const [ethToEurRate, setEthToEurRate] = useState(null);

    useEffect(() => {
        requestAccount();
        fetchExchangeRate();  // First fetch the EUR rate
        getProjects();        // Then load all projects
    }, []);

    useEffect(() => {
        if (projectCount > 0) {
            getLastProject();
        }
    }, [projectCount]);

    useEffect(() => {
        if (projects1.length > 0) {
            filterProjects();
        }
    }, [projects1]);

    const requestAccount = useCallback(async () => {
        if (window.ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults");
            return;
        }
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            setAccount(ethers.utils.getAddress(accounts[0]));
        } catch (error) {
            console.error("Failed to fetch account:", error);
        }
    }, []);

    /**
     * Fetch real-time ETH→EUR rate using Coinbase API
     */
     async function fetchExchangeRate() {
        try {
            const response = await fetch("https://api.coinbase.com/v2/exchange-rates?currency=ETH");
            const data = await response.json();
            const rate = parseFloat(data?.data?.rates?.EUR);
            if (rate > 0) {
                setEthToEurRate(rate);
            } else {
                console.warn("Received invalid rate from API.");
            }
        } catch (error) {
            console.error("Error fetching ETH→EUR exchange rate:", error);
        }
    }

    async function filterProjects() {
        const contractAddress = localStorage.getItem('contract');
        const signerAddress = localStorage.getItem('signer');
        let allProjectsArray = [];
        
        for (let i = 0; i<projects1.length; i++) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner(signerAddress);
                const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);
    
                const projectAccountDonations = await thisContract.getProjectDonations(i+1, account);
                if (ethers.utils.formatEther(projectAccountDonations) != 0) {
                    const project = {
                        id: projects1[i].id,
                        name: projects1[i].name,
                        charityAddress: projects1[i].charityAddress,
                        goalAmount: projects1[i].goalAmount,
                        raisedAmount: projects1[i].raisedAmount,
                        isActive: projects1[i].isActive,
                        donatedAmount: projectAccountDonations
                    };
                    allProjectsArray.push(project);
                }
            } catch (error) {
                console.error("Error:", error);
            }
            setProjects2(allProjectsArray);
        }
        setProjects2(allProjectsArray);
    }

    /**
     * Fetch the last project (by projectCount) from the contract
     */
     async function getLastProject() {
        const contractAddress = localStorage.getItem('contract');
        const signerAddress = localStorage.getItem('signer');
        const id = projectCount; // Using the number of projects as the ID

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);

            const projectWithId = await thisContract.getProject(id);
            const mc = projectWithId.milestoneCount.toString();
            const project = {
                id: id,
                name: projectWithId.name,
                charityAddress: projectWithId.charityAddress,
                goalAmount: projectWithId.goalAmount,
                raisedAmount: projectWithId.raisedAmount,
                isActive: projectWithId.isActive,
                milestoneCount: mc,
            };
            const allProjectsArray = [...projects];
            allProjectsArray.push(project);
            setProjects1(allProjectsArray);
            setLoading(false);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    /**
     * Fetch all projects in bulk
     */
     async function getProjects() {
        setLoading(true);
        const contractAddress = localStorage.getItem('contract');
        const signerAddress = localStorage.getItem('signer');

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);

            const allProjects = await thisContract.getProjects();

            const names = allProjects.name;
            const charityAddresses = allProjects.charityAddress;
            const goalAmounts = allProjects.goalAmount;
            const raisedAmounts = allProjects.raisedAmount;
            const areActive = allProjects.isActive;
            const milestoneCounts = allProjects.milestoneCount;

            setProjectCount(names.length);

            let allProjectsArray = [];
            // Notice we’re iterating from 1 to names.length - 1
            // (Often index 0 is unused if your contract started indexing at 1)
            for (let i = 1; i < names.length; i++) {
                const project = {
                    id: i,
                    name: names[i],
                    charityAddress: charityAddresses[i],
                    goalAmount: goalAmounts[i],
                    raisedAmount: raisedAmounts[i],
                    isActive: areActive[i],
                    milestoneCount: milestoneCounts[i]
                };
                allProjectsArray.push(project);
            }

            setProjects(allProjectsArray);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div>
        <h3 className='ml-6 my-8 text-4xl italic text-coffee_5 font-semibold'>My Donations</h3>
        <div className='bg-white p-6'>
            <p className='my-4 italic'>In this page you can see projects you have donated to.</p>
        </div>
        { loading && <div className='bg-white p-6'>
            <p className='my-4 italic'>Loading...</p>
        </div> }
        <div className='grid grid-cols-3 gap-4 w-full'>
            {projects2 && projects2.map((project) => (
                <div key={project.id}>
                    {/* Pass the ethToEurRate to each ProjectsItem component */}
                    <DonatedProjectItem project={project} ethToEurRate={ethToEurRate} />
                </div>
            ))}
        </div>
    </div>
    );
};