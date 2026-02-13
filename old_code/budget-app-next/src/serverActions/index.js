'use server';
import { adminAuth } from '../../firebaseAdmin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const FAKE_PASS = 'test';
const MAX_ATTEMPTS = 5;
// TODO: reset attempts after 10seconds
let attempts = 0;

export const authenticPageAccess = async (password) => {
  attempts++;
  if (attempts === MAX_ATTEMPTS || password !== FAKE_PASS) {
    console.log(password, attempts);
    return false;
  }
  console.log('SUCCESS');

  attempts = 0;
  return true;
};

export const setCookie = async (cookie) => {
  const cookieStore = await cookies();
  cookieStore.set(cookie);
};

export const deleteCookie = async (cookie) => {
  const cookieStore = await cookies();
  cookieStore.delete(cookie);
};

export const redirectToPage = (page) => {
  redirect(page);
};
