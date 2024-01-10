import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./App.css";
import Dashboard from "./components/dashboard";
import * as firebaseui from "firebaseui";
import firebase from "firebase/compat/app";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "./firebase";
import "firebaseui/dist/firebaseui.css";
import { user } from "budget-app-store/src/budget/budgetSlice";

function App() {
  const dispatch = useDispatch();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const ui =
      firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

    const uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: function (authResult, redirectUrl) {
          // User successfully signed in.
          // Return type determines whether we continue the redirect automatically
          // or whether we leave that to developer to handle.
          auth.currentUser.getIdToken().then((idToken) => {
            dispatch(
              user({
                ...auth.currentUser.toJSON(),
                idToken,
              })
            );
            setLoggedIn(true);
          });
          // auth.sendEmailVerification(auth.currentUser);
          // return true;
        },
        uiShown: function () {
          // The widget is rendered.
          // Hide the loader.
          // document.getElementById("loader").style.display = "none";
        },
      },
      // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
      signInFlow: "popup",
      signInSuccessUrl: "login",
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false,
        },
      ],
      tosUrl: "",
      privacyPolicyUrl: "",
    };

    !loggedIn && ui.start("#firebaseui-auth-container", uiConfig);
  });

  return (
    <>{loggedIn ? <Dashboard /> : <div id="firebaseui-auth-container"></div>}</>
  );
}

export default App;
