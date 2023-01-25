// Feeling aren't real Feeling are a reaction to a prceived wound that's never been healed.
import { ethers } from "./ethers-5.2.esm.min.js";
import { contractAddress, abi } from "./constants.js";
const UICtrl = (() => {
  const UISelectors = {
    connectButton: "#connectButton",
    fundButton: "#fund",
    ethAmount: "#ethAmount",
    balanceButton: "#balanceButton",
    withdrawButton: "#withdrawButton",
  };
  return {
    getSelectors: () => {
      return UISelectors;
    },
  };
})();
const Web3Ctrl = (() => {
  return {
    connect: async function () {
      if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log(window.ethereum);
        document.getElementById("connectButton").innerText = "Connected";
        console.log("Connected!");
      } else {
        document.getElementById("connectButton").innerText =
          "Please Install Metamask First!";
      }
    },
    listenForTransactionMine: function (transactionResponse, provider) {
      console.log(`Mining ${transactionResponse.hash}`);
      return new Promise((resolve, reject) => {
        try {
          provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
              `Completed with ${transactionReceipt.confirmations} confirmations.`
            );
            resolve();
          });
        } catch (error) {
          reject(error);
        }
      });
    },
    withdraw: async function () {
      if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing....");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
          const transactionResponse = await contract.withdraw();
          await this.listenForTransactionMine(transactionResponse, provider);
          // the error "this.listenForTransactionMine" is because i am not calling withdraw function on click but i am mentioning that on click you have to call withdraw function
        } catch (error) {
          console.log(error);
        }
      }
    },
    fund: async function (ethAmount) {
      console.log(`Funding with amount ${ethAmount}`);
      if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        // signer / wallet / someone with some gas
        // contract that we are interacting with
        // ^ ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
          const transactionResponse = await contract.fund({
            value: ethers.utils.parseEther(ethAmount),
          });
          await this.listenForTransactionMine(transactionResponse, provider);
          console.log("Done!");
        } catch (error) {
          console.log(error);
        }
      }
    },

    getBalance: async function () {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
      }
    },
  };
})();

const App = ((UICtrl, Web3Ctrl) => {
  const loadEventListeners = () => {
    const UISelectors = UICtrl.getSelectors();
    document
      .querySelector(UISelectors.connectButton)
      .addEventListener("click", Web3Ctrl.connect);
    document
      .querySelector(UISelectors.fundButton)
      .addEventListener("click", () => {
        const ethAmount = document.querySelector(UISelectors.ethAmount).value;
        Web3Ctrl.fund(ethAmount);
      });
    document
      .querySelector(UISelectors.balanceButton)
      .addEventListener("click", Web3Ctrl.getBalance);
    document
      .querySelector(UISelectors.withdrawButton)
      .addEventListener("click", () => {
        Web3Ctrl.withdraw();
      });
  };
  return {
    init: function () {
      loadEventListeners();
    },
  };
})(UICtrl, Web3Ctrl);

App.init();
