import React, { useState, useMemo, useEffect, useCallback } from 'react';
import CharityPlatformContract from '../../contracts/CharityPlatform.json';
const { ethers } = require("ethers");

export function NewProject() {
    const [account, setAccount] = useState("");
    const [milestones, setMilestones] = useState([]);

    // The user will now type the goal and milestone amounts in **ETH**.
    // We'll track them as strings for exact input, then parse when needed.
    const [goalAmountEth, setGoalAmountEth] = useState("");
    const [goalAmountError, setGoalAmountError] = useState(false);

    const [title, setTitle] = useState("");
    const [amountEth, setAmountEth] = useState("");
    const [amountError, setAmountError] = useState(false);

    const [description, setDescription] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // We'll fetch the current ETH → EUR rate from an external API
    const [ethToEurRate, setEthToEurRate] = useState(null);

    // Prompt MetaMask and fetch exchange rate on mount
    useEffect(() => {
        requestAccount();
        fetchExchangeRate();
    }, []);

    // 1) Prompt user to connect MetaMask
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

    // 2) Fetch live ETH→EUR rate from Coinbase’s public API
    const fetchExchangeRate = useCallback(async () => {
        try {
            // e.g., 1 ETH = X EUR
            const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=ETH');
            const data = await response.json();
            const rate = parseFloat(data?.data?.rates?.EUR); // how many EUR = 1 ETH

            if (rate > 0) {
                setEthToEurRate(rate);
            }
        } catch (error) {
            console.error("Failed to fetch exchange rate:", error);
        }
    }, []);

    // Sum of milestone amounts in ETH (use parseFloat because ETH can have decimals)
    const totalMilestoneSumEth = useMemo(() => {
        return milestones.reduce((sum, milestone) => {
            const val = parseFloat(milestone.amountEth || "0");
            return sum + (isNaN(val) ? 0 : val);
        }, 0);
    }, [milestones]);

    // Convert total milestone sum to string with 4 decimals (or your preference)
    const totalMilestoneSumDisplay = totalMilestoneSumEth.toFixed(4);

    // Check if adding a milestone is disabled
    const isAddDisabled = useMemo(() => {
        const goal = parseFloat(goalAmountEth) || 0;
        const newMilestone = parseFloat(amountEth) || 0;
        return (
            totalMilestoneSumEth >= goal ||
            !amountEth ||
            isNaN(newMilestone) ||
            newMilestone <= 0 ||
            !description.trim()
        );
    }, [goalAmountEth, totalMilestoneSumEth, amountEth, description]);

    // Check if creating a project is disabled
    const isCreateDisabled = useMemo(() => {
        const g = parseFloat(goalAmountEth);
        return (
            !title.trim() ||
            isNaN(g) ||
            g <= 0 ||
            milestones.length === 0
        );
    }, [title, goalAmountEth, milestones]);

    // Save a new milestone
    const saveMilestone = (e) => {
        e.preventDefault();
        setAmountError(false);

        const newMilestoneEth = parseFloat(amountEth);
        if (isNaN(newMilestoneEth) || newMilestoneEth <= 0) {
            setAmountError(true);
        } else if (!description.trim()) {
            alert("Milestone description cannot be empty.");
        } else {
            const goal = parseFloat(goalAmountEth);
            const sumWithNew = totalMilestoneSumEth + newMilestoneEth;
            if (sumWithNew > goal) {
                alert("The sum of milestone amounts cannot exceed the total goal amount in ETH.");
            } else {
                const newMilestone = {
                    index: milestones.length
                        ? milestones[milestones.length - 1].index + 1
                        : 0,
                    amountEth: amountEth, // store exactly what user typed
                    description,
                };

                setMilestones([...milestones, newMilestone]);
                setAmountEth("");
                setDescription("");
            }
        }
    };

    // Remove a milestone by index
    const removeMilestone = (e) => {
        e.preventDefault();
        const updatedMilestones = milestones.filter(
            item => item.index !== parseInt(e.target.value)
        );
        setMilestones(updatedMilestones);
    };

    // Create project on the smart contract
    async function createProject(e) {
        e.preventDefault();
        setGoalAmountError(false);

        const parsedGoal = parseFloat(goalAmountEth);
        if (isNaN(parsedGoal) || parsedGoal <= 0) {
            setGoalAmountError(true);
        } else if (!title.trim()) {
            alert("Project title cannot be empty.");
        } else if (totalMilestoneSumEth > parsedGoal) {
            alert("The sum of milestone amounts cannot exceed the total goal amount in ETH.");
        } else if (!ethToEurRate) {
            alert("Cannot fetch ETH → EUR rate right now. Please try again later.");
        } else {
            try {
                const contractAddress = localStorage.getItem('contract');
                const signerAddress = localStorage.getItem('signer');
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner(signerAddress);
                const thisContract = new ethers.Contract(
                    contractAddress,
                    CharityPlatformContract.abi,
                    signer
                );

                // Convert the typed ETH goal to wei
                const goalAmountWei = ethers.utils.parseUnits(parsedGoal.toString(), 18);

                // Convert each milestone’s typed ETH to wei
                const milestoneAmountsWei = milestones.map(milestone => 
                    ethers.utils.parseUnits(parseFloat(milestone.amountEth).toString(), 18)
                );
                const milestoneDescriptions = milestones.map(m => m.description);

                // Call createProject on the contract
                const projectTx = await thisContract.createProject(
                    account,
                    title,
                    goalAmountWei,
                    milestoneDescriptions,
                    milestoneAmountsWei
                );

                await projectTx.wait();

                thisContract.on('ProjectCreated', () => {
                    setSuccessMessage(`Your new project "${title}" has been created successfully!`);
                    setAmountEth("");
                    setDescription("");
                    setTitle("");
                    setGoalAmountEth("");
                    setMilestones([]);
                });
            } catch (error) {
                console.error("Error:", error);
            }
        }
    }

    // Convert a given ETH value to EUR (for display), or empty if rate not loaded
    const ethToEurDisplay = useCallback((ethStr) => {
        if (!ethToEurRate || !ethStr) return "";
        const val = parseFloat(ethStr);
        if (isNaN(val)) return "";
        return (val * ethToEurRate).toFixed(2); // 2 decimals in EUR
    }, [ethToEurRate]);

    // Remaining amount in ETH
    const goalEthNum = parseFloat(goalAmountEth) || 0;
    const remainingEth = goalEthNum - totalMilestoneSumEth;

    return (
        <div className="container mx-auto px-4">
            <h3 className="my-8 text-4xl italic text-coffee_5 font-semibold">
                New Project
            </h3>
            {successMessage && (
                <p className="text-green-700 font-semibold text-lg mb-4">
                    {successMessage}
                </p>
            )}
            <form>
                <div className="bg-white p-6 rounded-lg shadow-lg border-solid border-2 border-coffee_2">
                    {/* Title */}
                    <div className="mt-6 flex items-center justify-between gap-2">
                        <label className="font-semibold">Title:</label>
                        <input
                            onChange={e => setTitle(e.target.value)}
                            value={title}
                            aria-label="Project Title"
                            className="p-2 bg-transparent border-b-solid border-b border-b-coffee_5 grow"
                        />
                    </div>

                    {/* Goal in ETH */}
                    <div className="mt-6 flex items-center justify-between gap-2">
                        <label className="font-semibold">
                            Goal amount (ETH):
                        </label>
                        <input
                            onChange={(e) => {
                                const val = e.target.value;
                                setGoalAmountEth(val);
                                // If parse fails or <= 0, setGoalAmountError true
                                setGoalAmountError(isNaN(+val) || +val <= 0);
                            }}
                            value={goalAmountEth}
                            aria-label="Goal amount in ETH"
                            className={`p-2 bg-transparent border-b-solid border-b grow ${
                                goalAmountError
                                    ? "border-red-500"
                                    : "border-coffee_5"
                            }`}
                        />
                    </div>
                    {/* Show approximate EUR if available */}
                    {ethToEurRate && goalAmountEth && !goalAmountError && (
                        <p className="text-sm text-gray-700 mt-1">
                            Approx: {ethToEurDisplay(goalAmountEth)} EUR
                        </p>
                    )}
                    {goalAmountError && (
                        <p className="w-full text-red-900 italic text-sm my-4">
                            Goal amount must be a valid positive number.
                        </p>
                    )}

                    {/* Milestone Section */}
                    <div className="mt-6">
                        <h6 className="font-semibold border-t-solid border-t-2 pt-6 border-t-coffee_2">
                            New Milestone:
                        </h6>
                        {/* Milestone Amount in ETH */}
                        <div className="mt-6 flex items-center justify-between gap-2">
                            <label className="font-semibold">Amount (ETH):</label>
                            <input
                                onChange={e => setAmountEth(e.target.value)}
                                value={amountEth}
                                aria-label="Milestone Amount in ETH"
                                className="p-2 bg-transparent border-b-solid border-b border-b-coffee_5 grow"
                            />
                        </div>
                        {ethToEurRate && amountEth && !amountError && (
                            <p className="text-sm text-gray-700 mt-1">
                                Approx: {ethToEurDisplay(amountEth)} EUR
                            </p>
                        )}
                        {amountError && (
                            <p className="w-full text-red-900 italic text-sm my-4">
                                Amount must be a valid positive number.
                            </p>
                        )}
                        {/* Milestone Description */}
                        <div className="mt-6 flex-row items-center justify-between">
                            <label className="font-semibold">Description:</label>
                            <textarea
                                onChange={e => setDescription(e.target.value)}
                                value={description}
                                aria-label="Milestone Description"
                                className="p-2 bg-transparent mt-4 rounded-md min-h-32 border-solid border-2 border-coffee_2 w-full"
                            />
                        </div>
                        {/* Add Milestone Button */}
                        <button
                            onClick={saveMilestone}
                            disabled={isAddDisabled}
                            aria-label="Add Milestone Button"
                            className={`mt-4 font-semibold py-2 px-4 border-2 rounded-lg ${
                                isAddDisabled
                                    ? "text-gray-400 border-gray-400"
                                    : "text-lime-900 border-lime-900 hover:text-white hover:bg-lime-900 hover:border-lime-900"
                            }`}
                        >
                            Add Milestone
                        </button>
                    </div>

                    {/* Milestone List */}
                    {milestones.length > 0 && (
                        <div className="mt-8">
                            <h6 className="font-semibold border-t-solid border-t-2 pt-6 border-t-coffee_2">
                                Milestones:
                            </h6>
                            <table className="w-full mt-6 border-collapse border border-coffee_2">
                                <thead>
                                    <tr>
                                        <th className="border border-coffee_2 p-2">#</th>
                                        <th className="border border-coffee_2 p-2">Amount (ETH)</th>
                                        <th className="border border-coffee_2 p-2">Description</th>
                                        <th className="border border-coffee_2 p-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {milestones.map((milestone, index) => (
                                        <tr key={index}>
                                            <td className="border border-coffee_2 p-2 text-center">
                                                {index + 1}
                                            </td>
                                            <td className="border border-coffee_2 p-2 text-center">
                                                {parseFloat(milestone.amountEth).toFixed(4)} ETH
                                                {ethToEurRate && (
                                                    <div className="text-xs text-gray-700">
                                                        (~{ethToEurDisplay(milestone.amountEth)} EUR)
                                                    </div>
                                                )}
                                            </td>
                                            <td className="border border-coffee_2 p-2">
                                                {milestone.description}
                                            </td>
                                            <td className="border border-coffee_2 p-2 text-center">
                                                <button
                                                    value={milestone.index}
                                                    onClick={removeMilestone}
                                                    className="text-red-900 italic text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* If we've hit or exceeded the goal with milestones, note it */}
                    {goalAmountEth &&
                        totalMilestoneSumEth >= parseFloat(goalAmountEth || "0") && (
                            <p className="mt-2 font-semibold text-gray-500">
                                Milestone limit reached.
                            </p>
                        )}

                    {/* Show remaining in ETH (and EUR) */}
                    <p
                        className={`mt-4 font-semibold ${
                            remainingEth < 0 ? "text-red-500" : "text-green-700"
                        }`}
                    >
                        Remaining Amount: {remainingEth.toFixed(4)} ETH
                        {ethToEurRate && (
                            <span className="italic text-sm text-gray-700">
                                {" "}
                                (~{(remainingEth * ethToEurRate).toFixed(2)} EUR)
                            </span>
                        )}
                    </p>
                </div>

                {/* Create Project Button */}
                <button
                    onClick={createProject}
                    disabled={isCreateDisabled}
                    aria-label="Create Project Button"
                    className={`float-right mt-12 font-semibold py-2 px-4 border-2 rounded-lg ${
                        isCreateDisabled
                            ? "text-gray-400 border-gray-400"
                            : "text-lime-900 border-lime-900 hover:text-white hover:bg-lime-900 hover:border-lime-900"
                    }`}
                >
                    Create Project
                </button>
            </form>
        </div>
    );
}