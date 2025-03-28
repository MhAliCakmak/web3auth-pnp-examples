import { useEffect, useState } from "react";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { WALLET_ADAPTERS, IProvider, WEB3AUTH_NETWORK, UX_MODE, getEvmChainConfig } from "@web3auth/base";
import { AuthAdapter } from "@web3auth/auth-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { initializeApp } from "firebase/app";
import { GithubAuthProvider, getAuth, signInWithPopup, UserCredential } from "firebase/auth";
import "./App.css";
// import RPC from "./evm.ethers";
// import RPC from "./evm.web3";
import RPC from "./evm.viem";

const clientId = "BHr_dKcxC0ecKn_2dZQmQeNdjPgWykMkcodEHkVvPMo71qzOV6SgtoN8KCvFdLN7bf34JOm89vWQMLFmSfIo84A"; // get from https://dashboard.web3auth.io

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyAAAF-xdPur0wJpgwXLGdLZWDwRCTRLdX8",
  authDomain: "web3auth-firebase-github.firebaseapp.com",
  projectId: "web3auth-firebase-github",
  storageBucket: "web3auth-firebase-github.appspot.com",
  messagingSenderId: "384159528034",
  appId: "1:384159528034:web:9a9121481ea2948237cd3b",
};

function App() {
  const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Get custom chain configs for your chain from https://web3auth.io/docs/connect-blockchain
        const chainConfig = getEvmChainConfig(0x13882, clientId)!;

        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3auth = new Web3AuthNoModal({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.TESTNET,
          privateKeyProvider,
        });

        const authAdapter = new AuthAdapter({
          adapterSettings: {
            uxMode: UX_MODE.REDIRECT,
            loginConfig: {
              google: {
                verifier: "aggregate-verifier-google-firebase",
                verifierSubIdentifier: "w3a-google",
                typeOfLogin: "google",
                clientId: "774338308167-q463s7kpvja16l4l0kko3nb925ikds2p.apps.googleusercontent.com",
              },
              firebaseGithub: {
                verifier: "aggregate-verifier-google-firebase",
                verifierSubIdentifier: "w3a-firebase",
                typeOfLogin: "jwt",
              },
            },
          },
        });
        web3auth.configureAdapter(authAdapter);
        setWeb3auth(web3auth);

        await web3auth.init();
        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const loginGoogle = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
      loginProvider: "google",
    });
    console.log("web3authProvider", web3authProvider);
    setProvider(web3authProvider);
  };

  const signInWithGithub = async (): Promise<UserCredential> => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const githubProvider = new GithubAuthProvider();

    const result = await signInWithPopup(auth, githubProvider);
    return result;
  };

  const loginGitHub = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const loginRes = await signInWithGithub();
    console.log("login details", loginRes);
    const idToken = await loginRes.user.getIdToken(true);
    console.log("idToken", idToken);

    const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
      loginProvider: "firebaseGithub",
      extraLoginOptions: {
        id_token: idToken,
        verifierIdField: "email",
        domain: "http://localhost:3000",
      },
    });
    setProvider(web3authProvider);
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setLoggedIn(false);
    setProvider(null);
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const userAccount = await rpc.getAccounts();
    uiConsole(userAccount);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signMessage();
    uiConsole(result);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const result = await rpc.signAndSendTransaction();
    uiConsole(result);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loginView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="card">
            Get ID Token
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
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>

      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
      </div>
    </>
  );

  const logoutView = (
    <>
      <button onClick={loginGoogle} className="card">
        Login using <b>Google</b>
      </button>
      <button onClick={loginGitHub} className="card">
        Login using <b>GitHub</b> [ via Firebase ]
      </button>
    </>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/no-modal" rel="noreferrer">
          Web3Auth
        </a>{" "}
        & Firebase React Example for Google Login
      </h1>

      <div className="grid">{loggedIn ? loginView : logoutView}</div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-pnp-examples/tree/main/web-no-modal-sdk/custom-authentication/aggregate-verifier-examples/firebase-google-aggregate-no-modal-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
        <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FWeb3Auth%2Fweb3auth-pnp-examples%2Ftree%2Fmain%2Fweb-no-modal-sdk%2Fcustom-authentication%2Faggregate-verifier-examples%2Ffirebase-google-aggregate-no-modal-example&project-name=w3a-firebase-aggregate-no-modal&repository-name=w3a-firebase-aggregate-no-modal">
          <img src="https://vercel.com/button" alt="Deploy with Vercel" />
        </a>
      </footer>
    </div>
  );
}

export default App;
