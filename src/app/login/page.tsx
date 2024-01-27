"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/buttons/button';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { auth } from '@/intercepter/firebaseApp';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const Login = () => {
    const router = useRouter();
    const [name, setName] = useState('');

    const handleNextClick = async () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential?.accessToken;
                const user = result.user;
                console.log(credential, token, user);
                localStorage.setItem('v1:userInfo', JSON.stringify(user));
                router.push('/');
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.customData?.email;
                // The AuthCredential type that was used
                const credential = GoogleAuthProvider.credentialFromError(error);
                // ...
                console.log(errorCode);
            });

        // Your existing logic after Google sign-in can be added here.
        // For example, you might want to save the user's information in Firestore.
        // Below is a commented-out example using Firestore.

        // const userInfo = { name };
        // try {
        //   const docRef = await addDoc(collection(firestore, 'users'), {
        //     name: userInfo.name,
        //     // Add other user data as needed
        //   });
        //   console.log('Document written with ID: ', docRef.id);
        // } catch (error) {
        //   console.error('Error adding document: ', error);
        // }

        // Navigate to the desired route after completing the necessary operations.

    };

    return (
        <div className='d-flex flex-column gap-4 w-100 h-100  align-items-center justify-content-center fs-1'>
            {/* <div className='text-white'>YOUR NAME</div>
            <input
                type='text'
                className='card h-10 input-code-login'
                value={name}
                onChange={(e) => setName(e.target.value)}
            /> */}
            <Button text={'LOGIN'} action={handleNextClick} />
        </div>
    );
};

export default Login;
