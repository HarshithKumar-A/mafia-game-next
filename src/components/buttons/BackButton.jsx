import React from 'react';
import { useRouter } from 'next/navigation';

export const BackButton = ({ url, action }) => {
    const router = useRouter();

    const goBack = () => {
        action();
        router.push(url);
    };

    return (
        <div className='position-absolute top-0 start-0 m-4 cursor-pointer' onClick={goBack}>
            <svg width="28" height="32" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="27.8848" height="31.7781" rx="13.9424" fill="black" />
                <path d="M6.39026 15.2129L17.2827 5.55141V24.8744L6.39026 15.2129Z" fill="#D9D9D9" />
            </svg>
        </div>
    );
};
