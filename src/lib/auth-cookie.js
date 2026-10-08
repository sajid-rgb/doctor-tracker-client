'use server';

import { cookies } from 'next/headers';

export  const setTokenCookie = async (token)=>{
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, 
  });
}

export const getTokenCookie = async ()=>{
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value || null;
}

export const removeTokenCookie = async ()=>{
  const cookieStore = await cookies();
  cookieStore.delete('token');
}
