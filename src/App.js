import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import MemoryGame from "./abi/MemoryGameFHE.json";
import { CONTRACT_ADDRESS } from "./config.js";
import logo from "./assets/logo.png";
import "./App.css";
import { createEncryptedScore, decryptEncryptedEuint, initRelayer } from "./zamaClient.js";

//npm run start:prod

const cardsArray = [
  { id: 1, name: "🍎" },
  { id: 2, name: "🍌" },
  { id: 3, name: "🍒" },
  { id: 4, name: "🍇" },
  { id: 5, name: "🍉" },
  { id: 6, name: "🍍" },
];


function App() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [bestScore, setBestScore] = useState(null);

  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [contract, setContract] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const initializeDeck = useCallback(() => {
    return [...cardsArray, ...cardsArray]
      .map((card) => ({ ...card, uuid: Math.random() }))
      .sort(() => Math.random() - 0.5);
  }, []);

  const formatTime = (ms) => {
    if (ms === null || ms === undefined) return "--";
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Metamask gerekli!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const selectedAccount = accounts?.[0];
      if (!selectedAccount) throw new Error("Hesap seçilmedi.");

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();

      // Sepolia control
      if (network.chainId !== 11155111) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xaa36a7" }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xaa36a7",
                  chainName: "Sepolia Test Network",
                  nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
                  rpcUrls: ["https://rpc.sepolia.org"],
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } else throw switchError;
        }
      }

      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(CONTRACT_ADDRESS, MemoryGame.abi, signer);

      setContract(gameContract);


      try {
        await initRelayer();
        console.log("✅ Relayer initialized");
      } catch (err) {
        console.error("Relayer init error:", err);
      }

      setWalletConnected(true);
      setWalletAddress(selectedAccount);

      try {
        const best = await gameContract.getBestScore(selectedAccount);
        const bestNum = best?.toNumber?.() ?? 0;
        setBestScore(bestNum > 0 ? bestNum : null);
      } catch {
        setBestScore(null);
      }
    } catch (err) {
      console.error("connectWallet error:", err);
      alert(err?.message || "Couldn't connect.");
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    setContract(null);
    setIsPlaying(false);
    setBestScore(null);
    setTime(0);
  };

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => setTime((t) => t + 100), 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleFlip = (uuid) => {
    if (!isPlaying) return;
    if (flipped.length === 2 || flipped.includes(uuid)) return;
    setFlipped([...flipped, uuid]);
  };



  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped.map((id) => cards.find((c) => c.uuid === id));
      if (first && second && first.name === second.name) {
        setMatched((prev) => [...prev, first.name]);
      }
      setTimeout(() => setFlipped([]), 800);
    }
  }, [flipped, cards]);



  useEffect(() => {
    const finishGame = async () => {
      setIsPlaying(false);
      const finalTime = time;

      if (!contract) return;

     
      try {
        setIsSubmitting(true);

        const { handle, proof } = await createEncryptedScore(
          finalTime,
          CONTRACT_ADDRESS,
          await contract.signer.getAddress()
        );

        const tx = await contract.submitScore(handle, proof);
        await tx.wait();

        const addr = await contract.signer.getAddress();
        const encryptedBest = await contract.getEncryptedBest(addr);
        const bestNum = await decryptEncryptedEuint(encryptedBest, CONTRACT_ADDRESS, addr);

        setBestScore(bestNum > 0 ? bestNum : null);

        alert(
          `🎉 Game Over!\nTime: ${formatTime(finalTime)}\n` +
          (bestNum === finalTime ? "🔥 New Record!" : `Record: ${bestNum > 0 ? formatTime(bestNum) : "--"}`)
        );
      } catch (err) {
        console.error("Score sending error:", err);
        alert("Score sending error.");
      } finally {
        setIsSubmitting(false);
      }
        
    };

    if (isPlaying && matched.length === cardsArray.length) {
      finishGame();
    }
  }, [matched, isPlaying, time, contract]);

  const startGame = () => {
    if (!walletConnected || isSubmitting) return;
    setCards(initializeDeck());
    setFlipped([]);
    setMatched([]);
    setTime(0);
    setIsPlaying(true);
  };

  return (
    <div className="game">
      <header>
        <img
          src={logo}
          width={80}
          height={80}
          alt="logo"
        />
        <main>
          <h1 className="site-title">Memory Card Game</h1><br /><br />
          <div>
            <button
              onClick={startGame}
              disabled={!walletConnected || isSubmitting}
              className="start-button"
            >
              {isSubmitting ? (
                <span className="spinner"></span>
              ) : (
                "▶️ Start Game"
              )}
            </button>
          </div>

          <div className="score-panel">
            <p className="time">Time: {formatTime(time)}</p>
            <p className="best">Record: {bestScore ? formatTime(bestScore) : "--"}</p>
          </div>

          <div className="grid">
            {cards.map((card) => {
              const isFlipped = flipped.includes(card.uuid) || matched.includes(card.name);
              return (
                <div
                  key={card.uuid}
                  className={`card ${isFlipped ? "flipped" : ""}`}
                  onClick={() => handleFlip(card.uuid)}
                  style={{ display: "inline-block", margin: 8 }}
                >
                  <div className="front">{card.name}</div>
                  <div className="back">?</div>
                </div>
              );
            })}
          </div>
        </main>
        <button
          onClick={walletConnected ? disconnectWallet : connectWallet}
          className="wallet-button"
        >
          {walletConnected && walletAddress
            ? `🔌 ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : "💳 Connect Wallet"}
        </button>
      </header>
    </div>
  );
}

export default App;
