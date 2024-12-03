import React from 'react';
import { useEffect, useState } from 'react';
import CharityPlatformContract from '../../contracts/CharityPlatform.json';
import ProjectsItem from './ProjectsItem';

const { ethers } = require("ethers");

export function AllProjects() {

    const [projects, setProjects] = useState([]);
    const [projects1, setProjects1] = useState([]);
    const [count, setCount] = useState([]);

    useEffect(() => {
        getProjects();
    }, []);

    useEffect(() => {
        getLastProject();
    }, [count]);

    async function getLastProject() {
        const contractAddress = localStorage.getItem('contractAddress');
        const signerAddress = localStorage.getItem('signerAddress');
        const id = projects.length;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);

            const projectWithId = await thisContract.getProject(id);
            // console.log(projectWithId);
            const mc = projectWithId.milestoneCount.toString()
            const project = {
                id: id,
                name: projectWithId.name,
                charityAddress: projectWithId.charityAddress,
                goalAmount: projectWithId.goalAmount,
                raisedAmount: projectWithId.raisedAmount,
                isActive: projectWithId.isActive,
                milestoneCount: mc,
            };
            const allProjectsArray = projects;
            allProjectsArray.push(project);
            setProjects1(allProjectsArray);
        } catch (error) {
            console.error("Error:", error);
        }
    }

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
            setCount(names.length);

        } catch (error) {
            console.error("Error:", error);
        }
    }

    return (
        <div>
            <h1 className='ml-6 my-8 text-4xl italic text-coffee_5 font-semibold'>All projects</h1>
            <div className='grid grid-cols-3 gap-4 w-full'>
                {projects1 && projects1.map((project) => <div key={project.id}>
                    {/* <p>{project.id}</p> */}
                    <ProjectsItem project={ project }/>
                </div>)}
            </div>
        </div>
    );
};