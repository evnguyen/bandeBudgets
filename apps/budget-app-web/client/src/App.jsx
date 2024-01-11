import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Dashboard from "./components/dashboard";
import * as firebaseui from "firebaseui";
import firebase from "firebase/compat/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebase";
import "firebaseui/dist/firebaseui.css";
import { user } from "budget-app-store/src/budget/budgetSlice";

function App() {
  const dispatch = useDispatch();
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLoginSuccess = (userData, idToken) => {
    dispatch(user({ ...userData.toJSON(), idToken }));
    setLoggedIn(true);
  };

  const invokeLogin = (auth) => {
    const ui =
      firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
    const uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
          auth.currentUser.getIdToken().then((idToken) => {
            handleLoginSuccess(auth.currentUser, idToken);
          });
        },
        uiShown: function () {
          // The widget is rendered.
          // Hide the loader.
          // document.getElementById("loader").style.display = "none";
        },
      },
      signInFlow: "popup",
      signInSuccessUrl: "login",
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false,
        },
        // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      ],
      tosUrl: "",
      privacyPolicyUrl: "",
    };

    !loggedIn && ui.start("#firebaseui-auth-container", uiConfig);
  };

  onAuthStateChanged(auth, (user) => {
    if (user) {
      user
        .getIdToken()
        .then((idToken) => {
          handleLoginSuccess(user, idToken);
          setLoggedIn(true);
        })
        .catch((e) => "Error getting user id token");
    } else {
      setLoggedIn(false);
    }
  });

  useEffect(() => {
    if (!loggedIn) {
      invokeLogin(auth);
    }
  }, [loggedIn]);

  return (
    <>
      {loggedIn ? (
        <>
          <Dashboard />
          <button
            onClick={(e) => {
              auth.signOut();
            }}
          >
            Sign out
          </button>
        </>
      ) : (
        <div id="firebaseui-auth-container"></div>
      )}
    </>
  );
}

export default App;
