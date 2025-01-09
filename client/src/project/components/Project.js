import React, { useEffect, useState, useCallback } from "react";
import CharityPlatformContract from "../../contracts/CharityPlatform.json";
const { ethers } = require("ethers");

export function Project() {
    // User’s connected address
    const [account, setAccount] = useState("");

    // Total donation to the project (from the contract) in ETH
    const [accountAmount, setAccountAmount] = useState("0");

    // Any input validation errors (e.g. negative amounts)
    const [amountError, setAmountError] = useState(false);

    // Data about the current project and its milestones
    const [project, setProject] = useState(null);
    const [milestones, setMilestones] = useState([]);

    // Loading indicator for async calls
    const [loading, setLoading] = useState(false);

    // Fetched exchange rate: how many EUR = 1 ETH
    const [ethToEurRate, setEthToEurRate] = useState(null);

    // We'll store per-milestone donations (in ETH) in localStorage, keyed by project ID
    const [milestoneDonations, setMilestoneDonations] = useState([]);

    // The project ID from the URL
    const id = window.location.href.split("/")[3];

    // Local storage stuff
    useEffect(() => {
        requestAccount();
        fetchExchangeRate();
    }, [id]);

    // Once we have an account and a rate, fetch the project data
    useEffect(() => {
        if (account && ethToEurRate) {
            fetchProjectData();
        }
    }, [account, ethToEurRate]);

    /**
     * Prompt user to connect MetaMask (if not already connected)
     */
    const requestAccount = useCallback(async () => {
        if (!window.ethereum) {
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
     * Fetch the current exchange rate (1 ETH = X EUR) from a public API (Coinbase here)
     */
    const fetchExchangeRate = useCallback(async () => {
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
    }, []);

    /**
     * Initialize contract using the signer from MetaMask
     */
    const initializeContract = useCallback(() => {
        const contractAddress = localStorage.getItem("contract");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        return new ethers.Contract(contractAddress, CharityPlatformContract.abi, signer);
    }, []);

    /**
     * Fetch Project data (goal, raised, milestones) in ETH,
     * then store them in local state. Convert user’s total donation to a string.
     */
    const fetchProjectData = useCallback(async () => {
        if (!ethToEurRate) return; // wait until we have a valid rate

        setLoading(true);
        try {
            const thisContract = initializeContract();
            const projectData = await thisContract.getProject(id);

            const milestoneCount = projectData.milestoneCount.toNumber();
            const milestonesData = [];
            const newMilestoneDonations = [];
            for (let i = 0; i < milestoneCount; i++) {
                let milestone = await thisContract.getMilestone(id, i);
                milestonesData.push(milestone);
                const donatedAmount = await thisContract.getMilestoneAmount(account, id, i);
                newMilestoneDonations.push(donatedAmount);
            }

            setProject(projectData);
            setMilestones(milestonesData);
            setMilestoneDonations(newMilestoneDonations);

            // Fetch total donations (in wei) for the current user
            const donations = await thisContract.getProjectDonations(id, account);
            const donorEth = ethers.utils.formatEther(donations);
            // We'll store it as a string for display
            setAccountAmount(donorEth);
        } catch (error) {
            console.error("Error fetching project data:", error);
        } finally {
            setLoading(false);
        }
    }, [account, id, initializeContract, ethToEurRate]);

    /**
     * Deactivate the project (only the project’s owner/charity can do this)
     */
    const deactivateProject = useCallback(async () => {
        try {
            const thisContract = initializeContract();
            const tx = await thisContract.deactivateProject(id, account);
            await tx.wait();
            fetchProjectData();
        } catch (error) {
            console.error("Error deactivating project:", error);
        }
    }, [id, initializeContract, fetchProjectData]);

    /**
     * Donate to a specific milestone - user enters ETH in the form
     */
    const donateToMilestone = useCallback(
        async (e, milestoneIndex, ethDonation) => {
            e.preventDefault();
            setAmountError(false);

            if (!ethDonation || isNaN(+ethDonation) || +ethDonation <= 0) {
                setAmountError(true);
                return;
            }

            // Parse user’s ETH donation as a float
            const donationEth = parseFloat(ethDonation);

            // Figure out the milestone's target in ETH
            const milestone = milestones[milestoneIndex];
            const targetEth = parseFloat(ethers.utils.formatEther(milestone.targetAmount));
            const raisedEth = parseFloat(ethers.utils.formatEther(milestone.raisedAmount));
            const leftoverEth = targetEth - raisedEth;

            // Prevent going beyond the milestone target
            if (donationEth > leftoverEth) {
                alert(`You cannot donate more than ${leftoverEth.toFixed(4)} ETH for this milestone.`);
                return;
            }

            // Convert to wei
            const weiValue = ethers.utils.parseUnits(donationEth.toString(), 18);

            try {
                const thisContract = initializeContract();
                const tx = await thisContract.donate(id, milestoneIndex, account, project?.charityAddress, {
                    value: weiValue
                });
                await tx.wait();

                // Update local milestoneDonations
                thisContract.on("DonationReceived", () => {
                    console.log("DonationReceived");

                    // Clear the input field for this milestone
                    const input = document.getElementById(`milestone-input-${milestoneIndex}`);
                    if (input) input.value = "";

                    fetchProjectData();
                });
                thisContract.on("MilestoneCompleted", () => {
                    console.log("MilestoneCompleted");
                });
            } catch (error) {
                console.error("Error during donation:", error);
            }
        },
        [account, milestones, project, milestoneDonations, initializeContract, fetchProjectData, id]
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {project && (
                <div>
                    <h3 className="ml-6 my-8 text-4xl italic text-coffee_5 font-semibold">
                        {project.name || "Untitled Project"}
                    </h3>
                    <div className="bg-white p-6 rounded-lg border-solid border-2 border-coffee_2">
                        <div
                            className={`w-full italic text-xl text-right px-12 my-4 ${
                                project.isActive ? "text-lime-900" : "text-red-900"
                            }`}
                        >
                            <p>{project.isActive ? "Active" : "Not active"}</p>
                        </div>

                        {/* Goal in ETH */}
                        <h2 className="font-semibold text-xl my-6">
                            Goal amount (ETH):{" "}
                            {project.goalAmount
                                ? parseFloat(ethers.utils.formatEther(project.goalAmount)).toFixed(4)
                                : "N/A"}{" "}
                            {ethToEurRate && project.goalAmount ? (
                                <span className="italic text-sm text-gray-700">
                                    {" "}
                                    (~{" "}
                                    {(
                                        parseFloat(ethers.utils.formatEther(project.goalAmount)) *
                                        ethToEurRate
                                    ).toFixed(2)}{" "}
                                    EUR)
                                </span>
                            ) : null}
                        </h2>

                        {/* Raised in ETH */}
                        <h2 className="font-semibold text-xl my-6">
                            Raised amount (ETH):{" "}
                            {project.raisedAmount
                                ? parseFloat(ethers.utils.formatEther(project.raisedAmount)).toFixed(
                                      4
                                  )
                                : "N/A"}{" "}
                            {ethToEurRate && project.raisedAmount ? (
                                <span className="italic text-sm text-gray-700">
                                    {" "}
                                    (~{" "}
                                    {(
                                        parseFloat(
                                            ethers.utils.formatEther(project.raisedAmount)
                                        ) * ethToEurRate
                                    ).toFixed(2)}{" "}
                                    EUR)
                                </span>
                            ) : null}
                        </h2>

                        <h2 className="font-semibold text-xl my-6 pt-6 border-t-2 border-t-coffee_2">
                            Milestones:
                        </h2>
                        {milestones && milestones.length > 0 ? (
                            milestones.map((milestone, index) => {
                                const targetEth = parseFloat(
                                    ethers.utils.formatEther(milestone.targetAmount)
                                );
                                const raisedEth = parseFloat(
                                    ethers.utils.formatEther(milestone.raisedAmount)
                                );
                                const leftoverEth = targetEth - raisedEth;

                                const userDonatedEth = parseFloat(
                                    ethers.utils.formatEther(milestoneDonations[index])
                                );

                                return (
                                    <div
                                        className="my-8 pb-6 border-b border-b-coffee_2"
                                        key={index}
                                    >
                                        <h2 className="font-medium text-lg my-4">
                                            Target amount: {targetEth.toFixed(4)} ETH{" "}
                                            {ethToEurRate && (
                                                <span className="italic text-sm text-gray-700">
                                                    {" "}
                                                    (~
                                                    {(targetEth * ethToEurRate).toFixed(2)} EUR)
                                                </span>
                                            )}
                                        </h2>
                                        <h2 className="font-medium text-lg my-4">Description:</h2>
                                        <p>{milestone.description || "No description provided."}</p>
                                        <p
                                            className={`w-full italic text-sm text-right my-4 ${
                                                milestone.isCompleted
                                                    ? "text-lime-900"
                                                    : "text-red-900"
                                            }`}
                                        >
                                            {milestone.isCompleted
                                                ? "Completed"
                                                : "Not completed."}
                                        </p>

                                        {/* Show how much the user has donated to this milestone */}
                                        <p className="text-sm mb-2">
                                            You have donated so far:{" "}
                                            <span className="font-semibold">
                                                {userDonatedEth.toFixed(4)} ETH
                                            </span>{" "}
                                            {ethToEurRate && (
                                                <span className="italic text-xs text-gray-700">
                                                    {" "}
                                                    (~
                                                    {(userDonatedEth * ethToEurRate).toFixed(2)} EUR)
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm mb-4">
                                            Remaining for this milestone:{" "}
                                            <span className="font-semibold">
                                                {Math.max(leftoverEth, 0).toFixed(4)} ETH
                                            </span>{" "}
                                            {ethToEurRate && (
                                                <span className="italic text-xs text-gray-700">
                                                    {" "}
                                                    (~
                                                    {(
                                                        Math.max(leftoverEth, 0) * ethToEurRate
                                                    ).toFixed(2)}{" "}
                                                    EUR)
                                                </span>
                                            )}
                                        </p>

                                        {/* Donation form for this milestone */}
                                        {account !== project.charityAddress &&
                                            project.isActive &&
                                            leftoverEth > 0 && (
                                                <form
                                                    onSubmit={(e) =>
                                                        donateToMilestone(
                                                            e,
                                                            index,
                                                            e.target[`milestoneInput-${index}`].value
                                                        )
                                                    }
                                                >
                                                    <div className="mt-6 flex items-center justify-between gap-2">
                                                        <label className="font-semibold">
                                                            Donate (ETH):
                                                        </label>
                                                        <input
                                                            id={`milestone-input-${index}`}
                                                            name={`milestoneInput-${index}`}
                                                            className="p-2 bg-transparent border-b-solid border-b border-b-coffee_5 grow"
                                                            placeholder={`Up to ${leftoverEth.toFixed(
                                                                4
                                                            )}`}
                                                        />
                                                    </div>
                                                    {amountError && (
                                                        <p className="w-full text-red-900 italic text-sm my-4">
                                                            Amount must be a positive number.
                                                        </p>
                                                    )}
                                                    <button
                                                        type="submit"
                                                        className="bg-white text-center mt-4 hover:text-white hover:bg-lime-900 hover:border-lime-900 font-semibold text-lime-900 py-2 px-4 border-2 border-lime-900 rounded-lg"
                                                    >
                                                        Donate to this Milestone
                                                    </button>
                                                </form>
                                            )}
                                    </div>
                                );
                            })
                        ) : (
                            <p>No milestones added yet.</p>
                        )}

                        {/* Only the charity can deactivate its own project */}
                        {account === project.charityAddress && project.isActive && (
                            <button
                                onClick={deactivateProject}
                                className="bg-white text-center mt-12 hover:text-white hover:bg-red-900 hover:border-red-900 font-semibold text-red-900 py-2 px-4 border-2 border-red-900 rounded-lg"
                            >
                                Deactivate project
                            </button>
                        )}

                        {/* Show the user's total donation to this project (in ETH) */}
                        {account !== project.charityAddress && project.isActive && (
                            <div className="mt-6 text-sm text-gray-600">
                                <p>
                                    Your total donation to this project:{" "}
                                    <span className="font-semibold">
                                        {parseFloat(accountAmount).toFixed(4)} ETH
                                    </span>{" "}
                                    {ethToEurRate && (
                                        <span className="italic text-xs text-gray-700">
                                            {" "}
                                            (~
                                            {(
                                                parseFloat(accountAmount) * ethToEurRate
                                            ).toFixed(2)}{" "}
                                            EUR)
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}