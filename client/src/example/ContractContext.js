import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
// import MyContract from "../contracts/CharityPlatform.json";

import CharityPlatformContract from '../contracts/CharityPlatform.json';
import DonationTokenContract from '../contracts/DonationToken.json';

const ContractContext = createContext();

export const useContract = () => {
  return useContext(ContractContext);
};

export const ContractProvider = ({ children }) => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      window.ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
        setAccount(accounts[0]);
      });
    }
  }, []);

  async function setContractFunction() {
    const providerSigner = await provider.getSigner();
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
            setContract(platformContract);
  }
  useEffect(() => {
    if (provider && account) {
      if (contract == null) {
        setContractFunction();
      }
      
      // const contractAddress = "0xD4Ebd13a602D2B034cbaC292a5A3b4d2ABbF21e7"; // Your deployed contract address
      // const contract = new ethers.Contract(contractAddress, MyContract.abi, provider.getSigner());
      // setContract(contract);

      // const provider = new ethers.providers.Web3Provider(window.ethereum);
            
    }
  }, [provider, account]);

  return (
    <ContractContext.Provider value={{ contract, account }}>
      {children}
    </ContractContext.Provider>
  );
};
