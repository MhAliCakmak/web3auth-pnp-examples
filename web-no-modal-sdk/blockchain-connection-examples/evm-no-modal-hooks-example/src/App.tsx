import { useEffect, useState } from "react";
import { useWeb3Auth } from "@web3auth/no-modal-react-hooks";
import { useWalletServicesPlugin } from "@web3auth/wallet-services-plugin-react-hooks";
import { IProvider, WALLET_ADAPTERS, IAdapter, getEvmChainConfig } from "@web3auth/base";
import { adapters } from "./Web3AuthProvider";
import "./App.css";
import RPC from "./web3RPC"; // for using web3.js

const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ";
// Get custom chain configs for your chain from https://web3auth.io/docs/connect-blockchain
const newChain = getEvmChainConfig(0x89, clientId)!;

function App() {
  const { connectTo, authenticateUser, enableMFA, logout, userInfo, provider, isMFAEnabled, web3Auth, status, addAndSwitchChain } = useWeb3Auth();

  const { showCheckout, showWalletConnectScanner, showWalletUI, isPluginConnected } = useWalletServicesPlugin();

  const [MFAHeader, setMFAHeader] = useState<JSX.Element | null>(null);
  const [pluginStatus, setPluginStatus] = useState<string>("disconnected");

  // Update MFA status header
  useEffect(() => {
    if (isMFAEnabled) {
      setMFAHeader(<h2 style={{ color: "green" }}>MFA is enabled</h2>);
    } else {
      setMFAHeader(<h2 style={{ color: "red" }}>MFA is disabled</h2>);
    }
  }, [isMFAEnabled]);

  // Update Plugin Status
  useEffect(() => {
    if (isPluginConnected) {
      setPluginStatus("connected");
    } else {
      setPluginStatus("disconnected");
    }
  }, [isPluginConnected]);

  const getChainId = async () => {
    if (!provider) {
      uiConsole("Provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider as IProvider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("Provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider as IProvider);
    const accounts = await rpc.getAccounts();
    uiConsole(accounts);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("Provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider as IProvider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("Provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider as IProvider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("Provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider as IProvider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  const uiConsole = (...args: any[]): void => {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  };

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={() => uiConsole(userInfo)} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button
            onClick={async () => {
              const { idToken } = await authenticateUser();
              uiConsole(idToken);
            }}
            className="card"
          >
            Get ID Token
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              enableMFA();
            }}
            className="card"
          >
            Enable MFA
          </button>
        </div>
        <div>
          <button onClick={getChainId} className="card">
            Get Chain ID
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              addAndSwitchChain(newChain);
            }}
            className="card"
          >
            Add & Switch Chain
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              showWalletUI();
            }}
            className="card"
          >
            Show Wallet UI
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              showWalletConnectScanner();
            }}
            className="card"
          >
            Show Wallet Connect
          </button>
        </div>
        <div>
          <button
            onClick={() => {
              showCheckout();
            }}
            className="card"
          >
            Show Checkout
          </button>
        </div>
        <div>
          <button onClick={() => logout()} className="card">
            Log Out
          </button>
        </div>
      </div>
      <div id="console">
        <p></p>
      </div>
    </>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/no-modal" rel="noreferrer">
          Web3Auth & React No-Modal Hooks Example
        </a>
      </h1>

      <div className="container" style={{ textAlign: "center" }}>
        {MFAHeader}
        <h2>Web3Auth Status: {status}</h2>
        <h2>Wallet Services Plugin Status: {pluginStatus}</h2> {/* Plugin status added here */}
      </div>

      <div className="grid">
        {status === "connected" ? (
          loggedInView
        ) : (
          <>
          <button
            className="card"
            onClick={() => {
              connectTo(WALLET_ADAPTERS.AUTH, {
                loginProvider: "google",
              });
            }}
          >
            Login With Google
          </button>
          {adapters?.map((adapter: IAdapter<unknown>) => (
            <button key={adapter.name.toUpperCase()} onClick={() => connectTo(adapter.name)} className="card">
              `Login with {adapter.name.charAt(0).toUpperCase() + adapter.name.slice(1)} Wallet`
            </button>
          ))}
          </>
        )}
      </div>

      <footer className="footer">
        <a href="https://github.com/Web3Auth" target="_blank" rel="noopener noreferrer">
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
