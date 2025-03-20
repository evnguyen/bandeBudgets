'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
// import { Input, Button, H1, YStack } from 'tamagui';
import { useRouter } from 'next/navigation';
import { Button, Input, Stack } from '@mui/material';
import { setCookie, redirectToPage } from '../../serverActions';
import './login.css';

export default function Login() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState();
  const [hasAccess, setHasAccess] = useState(false);
  const [value, setValue] = useState('testetetetet');
  const router = useRouter();

  const saveToken = async (userCredential) => {
    const idToken = await userCredential.getIdToken();

    await setCookie({
      name: 'firebase_token',
      value: idToken,
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'strict',
    });
  };

  const handleLoginSuccess = async (userData) => {
    console.log(userData);
    setUser(userData);
    setLoggedIn(true);
    await saveToken(userData);
    await redirectToPage('/home');
    // router.push('/home');
  };

  const renderLoginForm = () => {
    let email = '';
    let password = '';
    return (
      <div className="passwordForm">
        <Input
          placeholder={'Enter email'}
          onChange={(e) => {
            email = e.target.value;
          }}
        />
        <Input
          placeholder={'Enter password'}
          onChange={(e) => {
            password = e.target.value;
          }}
          type="password"
        />
        <Button
          variant="contained"
          onClick={() => {
            handleClick(email, password);
          }}
        >
          Log in
        </Button>
      </div>
    );
  };

  // This observer gets called whenever the sign-in state changes
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        // Signed in
        user
          .getIdToken()
          .then(async (idToken) => {
            await handleLoginSuccess(user);
            setLoggedIn(true);
          })
          .catch((e) => 'Error getting user id token');
      } else {
        // Signed out
        setLoggedIn(false);
      }
    });
  }, []);

  useEffect(() => {
    if (loggedIn || user) {
      router.push('/home');
    }
  }, [loggedIn]);

  const handleClick = async (email, password) => {
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        await handleLoginSuccess(userCredential.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  };

  return (
    <div className="login-container">
      <span className="login__header">
        <Stack>
          <h1>B & E</h1>
          <h1>Budgets</h1>
        </Stack>
      </span>
      {renderLoginForm()}
    </div>
  );
}
