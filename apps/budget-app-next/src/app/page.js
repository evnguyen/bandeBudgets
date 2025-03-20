'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import db from '../utils/firestore';
import { collection, setDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { auth } from '../../firebaseConfig';
import { authenticPageAccess } from '@/serverActions';
import { Input, Button, Theme } from 'tamagui';
import { useRouter } from 'next/navigation';
import 'firebaseui/dist/firebaseui.css';
import './globals.css';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState();
  const router = useRouter();

  // useEffect(() => {
  //   onAuthStateChanged(auth, (user) => {
  //     console.log(user);
  //     if (!user) {
  //       console.log('11111111111111111');
  //       router.push('/login');
  //     } else {
  //       console.log('22222222222');
  //       router.push('/home');
  //     }
  //   });
  // }, []);

  // This observer gets called whenever the sign-in state changes
  // onAuthStateChanged(auth, (user) => {
  //   if (user) {
  //     // Signed in
  //     user
  //       .getIdToken()
  //       .then((idToken) => {
  //         setUser(userData);
  //         setLoggedIn(true);
  //         router.push('/home');
  //       })
  //       .catch((e) => 'Error getting user id token');
  //   } else {
  //     // Signed out
  //     setLoggedIn(false);
  //     router.push('/login');
  //   }
  // });

  // useEffect(() => {
  //   router.push('/home');
  // }, []);

  // return (
  // <Theme name={'light_green'}>
  //   {children}
  // </Theme>
  // );
}
