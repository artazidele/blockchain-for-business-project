import React from 'react';
import CharityPlatformContract from '../../contracts/CharityPlatform.json';
const { ethers } = require("ethers");

export function Project() {
    const account7 = "0x15fAA99E68F256CFc6A61703C1b209AAc059254b";
    const account10 = "0x46956ae2A728B38E168cd786A1077966427967AB";
    const [account, setAccount] = useState('');
    const [accountAmount, setAccountAmount] = useState(0);
    const [amount, setAmount] = useState();
    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [amountError, setAmountError] = useState(false);

    const id = window.location.href.split('/')[3];

    useEffect(() => {
        getProject();
    }, [account]);

    useEffect(() => {
        requestAccount();
    }, []);

    async function requestAccount() {
        if (window.ethereum == null) {
            console.log("MetaMask not installed; using read-only defaults");
        } else {
            const account = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const uppercaseAddress = ethers.utils.getAddress(account[0]);
            setAccount(uppercaseAddress);
        }
    }

    async function getProject() {
        const contractAddress = localStorage.getItem('contract');
        const signerAddress = localStorage.getItem('contract');

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);

            const projectWithId = await thisContract.getProject(id);
            setProject(projectWithId);

            const milestoneCount = projectWithId.milestoneCount.toString();
            const milestoneArray = [];
            for (let i=0; i<milestoneCount; i++) {
                const milestoneWithId = await thisContract.getMilestone(id, i);
                milestoneArray.push(milestoneWithId);
            }
            setMilestones(milestoneArray);
            getProjectDonations();
        } catch (error) {
            console.error("Error:", error);
        }
    }

    async function deactivateProject() {
        const contractAddress = localStorage.getItem('contract');
        const signerAddress = localStorage.getItem('signer');
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

    async function getProjectDonations() {
        const contractAddress = localStorage.getItem('contract');
        const signerAddress = localStorage.getItem('signer');

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner(signerAddress);
            const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);
            const donations = await thisContract.getProjectDonations(id, account);
            console.log(donations);
            setAccountAmount(ethers.utils.formatEther(donations)*3.50248);
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
            const contractAddress = localStorage.getItem('contract');
            const signerAddress = localStorage.getItem('signer');
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner(signerAddress);
                const thisContract = new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);                
                const eth = 0.28551198;
                const tokenAmount = ethers.utils.parseUnits((amount*eth).toString(), 18);
                console.log(tokenAmount);
                const projectWithId = await thisContract.donate(id, account, project.charityAddress, { value: tokenAmount });
                // const projectWithId = await thisContract.donate(id, account7, account10, { value: tokenAmount });
                await projectWithId.wait();
                console.log(projectWithId);
                thisContract.on('DonationReceived', () => {
                    setAmount("");
                    getProject();
                });
                const newBalance = await provider.getBalance(account.toString());
                console.log(ethers.utils.formatEther(newBalance));
            } catch (error) {
                console.error("Error:", error);
            }
        }
    }

    return (
        <div>
        {project && <div>
        <h3 className='ml-6 my-8 text-4xl italic text-coffee_5 font-semibold'>{ project.name }</h3>
        <div className='bg-white p-6 rounded-lg border-solid border-2 border-coffee_2'>
            {project.isActive && <div className='w-full text-lime-900 italic text-xl text-right px-12 my-4'><p>Active</p></div>}
            {!project.isActive && <div className='w-full text-red-900 italic text-xl text-right px-12 my-4'><p>Not active</p></div>}
            <h2 className='font-semibold text-xl my-6'>Goal amount: { project.goalAmount.toString() } EUR</h2>
            <h2 className='font-semibold text-xl my-6'>Raised amount: { (ethers.utils.formatEther(project.raisedAmount)*3.50248).toFixed(2) } EUR</h2>
            <h2 className='font-semibold text-xl my-6 pt-6 border-t-2 border-t-coffee_2'>Milestones: </h2>            
            {milestones && milestones.map((milestone, index) => <div className='my-8 pb-6 border-b border-b-coffee_2' key={index++}>
                <h2 className='font-medium text-lg my-4'>Target amount: { milestone.targetAmount.toString() } EUR</h2>
                <h2 className='font-medium text-lg my-4'>Description:</h2>
                <p>{ milestone.description }</p>
            </div>)}
            {(account && project) && <div>
                {(account === project.charityAddress && project.isActive) && <div className=''>
                    <button onClick={deactivateProject} className="bg-white text-center mt-12 hover:text-white hover:bg-red-900 hover:border-red-900 font-semibold text-red-900 py-2 px-4 border-2 border-red-900 rounded-lg">Deactivate project</button>
                </div>}
                {(account !== project.charityAddress && project.isActive) && <div>
                    <p>Currently, you have donated { accountAmount.toFixed(2) } EUR.</p>
                    <form>
                        <div className="mt-6 flex items-center justify-between gap-2">
                            <label className='font-semibold'>Amount (EUR): </label>
                            <input value={amount} onChange={e => setAmount(e.target.value)} className="p-2 bg-transparent border-b-solid border-b border-b-coffee_5 grow"/>                    
                        </div>  
                        {amountError && <p className='w-full text-red-900 italic text-sm my-4'>Amount must be number.</p>}                  
                        <button onClick={donate} className="bg-white text-center mt-12 hover:text-white hover:bg-lime-900 hover:border-lime-900 font-semibold text-lime-900 py-2 px-4 border-2 border-lime-900 rounded-lg">Donate</button>

                    </form>
                    {/* <button onClick={getProjectDonations} className="bg-white text-center mt-12 hover:text-white hover:bg-lime-900 hover:border-lime-900 font-semibold text-lime-900 py-2 px-4 border-2 border-lime-900 rounded-lg">Project donations</button> */}

                </div>}
                {/* <button onClick={donate} className="bg-white text-center mt-12 hover:text-white hover:bg-lime-900 hover:border-lime-900 font-semibold text-lime-900 py-2 px-4 border-2 border-lime-900 rounded-lg">Donate</button> */}

            </div>}
            </div>
        </div>}
        </div>
    );
};