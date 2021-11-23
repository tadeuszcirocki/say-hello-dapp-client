import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/SayHello.json';
import { SocialIcon } from 'react-social-icons';

const App = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("Type your message here");

  
  const contractAddress = "0xfC17925A2744B48240348da71C1Ec67dae334D14";
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const sayHelloContract = new ethers.Contract(contractAddress, contractABI, signer);
        //fix for out of gas error, remaining will be refunded anyway
        sayHelloContract.wave(message, {gasLimit: 300000});
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}

const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const sayHelloContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await sayHelloContract.getAllWaves();
        
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const onChangeMessage = event => {
        setMessage(event.target.value);
      };

  //update waves state
  const onNewWave = (from, timestamp, message) => {
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };
  

  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      let sayHelloContract;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      sayHelloContract = new ethers.Contract(contractAddress, contractABI, signer);

      //listen to event NewWave and update our waves array
      sayHelloContract.on('NewWave', onNewWave);
    }

    //cleaning
    return () => {
        sayHelloContract.off('NewWave', onNewWave);
    };
    
  }, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="links">
          <SocialIcon url="https://github.com/tadeuszcirocki/say-hello-dapp" />
          <SocialIcon url="https://www.linkedin.com/in/tadeusz-cirocki-128514178/" />
          <SocialIcon url="https://rinkeby.etherscan.io/address/0xfc17925a2744b48240348da71c1ec67dae334d14" />
        </div>

        <div className="header">
        👋 Hey there :)<br/>
        I am Tadeusz and I'm excited about dapps. Wave at me!
        </div>

        
        <div className="bio">
          You have a 50% chance to win 0.01 ether and can do so every 10 mins. Use Rinkeby Testnet.
        </div>

        <input
        type="text"
        name="name"
        onChange={onChangeMessage}
        value={message}
      />

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString().substring(0,34)}</div>
              <div>Message: {wave.message} 👋</div>
            </div>)
        })}
      </div>
    </div>
  );
  }
export default App