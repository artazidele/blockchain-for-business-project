import React from 'react';
import { useEffect, useState } from 'react';
import CharityPlatformContract from '../../contracts/CharityPlatform.json';
import ProjectsItem from './ProjectsItem';

const { ethers } = require("ethers");

export function AllProjects() {

    const [projects, setProjects] = useState([]);

    useEffect(() => {
        getProjects();
    }, []);

    async function getProjects() {
        const contractAddress = localStorage.getItem('contractAddress');
        const signerAddress = localStorage.getItem('signerAddress');

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);

            const allProjects = await thisContract.getProjects();

            const names = allProjects.name;
            const charityAddreses = allProjects.charityAddress;
            const goalAmounts = allProjects.goalAmount;
            const raisedAmounts = allProjects.raisedAmount;
            const areActive = allProjects.isActive;
            const milestoneCounts = allProjects.milestoneCount;

            let allProjectsArray = [];

            for (let i = 0; i < names.length; i++) {
                const project = {
                    id: i,
                    name: names[i],
                    charityAddress: charityAddreses[i],
                    goalAmount: goalAmounts[i],
                    raisedAmount: raisedAmounts[i],
                    isActive: areActive[i],
                    milestoneCount: milestoneCounts[i]
                };
                allProjectsArray.push(project);
            };
            setProjects(allProjectsArray);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div>
            <h1 className='ml-6 my-8 text-4xl italic text-coffee_5 font-semibold'>All projects</h1>
            <div className='grid grid-cols-3 gap-4 w-full'>
                {projects && projects.map((project) => <div key={project.id}>
                    <ProjectsItem project={ project }/>
                </div>)}
            </div>
        </div>
    );
};