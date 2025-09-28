# Zamemory 🎮🔐

Zamemory is a **Memory Game** application powered by **Zama FHE (Fully Homomorphic Encryption)** technology.  
Players’ scores are stored **encrypted on-chain**, and only the player can view their own score.  

## 🚀 Features
- 🧠 Classic **memory game** gameplay  
- 🔐 Scores encrypted and stored using **Zama FHE**  
- 🌐 Smart contract deployed on **Sepolia testnet**  
- 📊 Players can only view their **own encrypted scores**  

---

## 📦 Installation

### 1. Clone the repository

git clone https://github.com/Sedshwarz/zamemory-game.git
cd zamemory-game

2. Install dependencies
npm install
3. Set up environment variables
Create a .env file in the project root and add:

RPC_URL= # Sepolia RPC URL (Alchemy/Infura etc.)
PRIVATE_KEY= # Wallet private key for deployment

⚠️ The .env file is ignored with .gitignore. Never commit it to the repo.



📝 Deploying the Smart Contract


Compile

npx hardhat compile



Deploy

npx hardhat run scripts/deploy.js --network sepolia
Once deployed, the contract address will be printed.
Update your config.js with it:

export const CONTRACT_ADDRESS = "0x...";


🌍 Running the App

Development

npm start

By default, the app runs at http://localhost:3000.


Production

npm run build
npx http-server -p 5000 build
Then open http://localhost:5000.

⚡ Tech Stack
React

Hardhat

Ethers.js

Zama FHE SDK

📜 License
This project is licensed under the MIT License.
