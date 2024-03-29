import React, { useState } from 'react';
import { database } from '@/intercepter/firebaseApp';
import { ref, set } from 'firebase/database';

export default function Chat({ chatHistory, userName, roomId, chatType }) {
    const [message, setMessage] = useState('');

    function chat() {
        if (message.trim() !== '') {
            console.log(database, 'room-id/' + roomId + '/gameStatus/' + chatType);
            set(ref(database, 'room-id/' + roomId + '/gameStatus/' + chatType), [
                ...chatHistory,
                {
                    message: message,
                    sender: JSON.parse(localStorage.getItem('v1:userInfo')).displayName,
                },
            ]).then(() => {
                console.log('compleated');
            }).catch((error) => {
                console.log(error);
            });;
            // Clear the input field after sending the message
            setMessage('');
        }
    }

    return (
        <>
            <div className='overflow-auto custom-scrollbar h-100 w-100 p-2 pe-0'>
                {chatHistory.map((chat, id) => (
                    <div
                        key={id}
                        className={`font-12 p-1 fw-bold card bg-off-white text-black ${JSON.parse(localStorage.getItem('v1:userInfo')).displayName === chat.sender &&
                            'text-end pe-2'
                            }`}
                    >
                        {JSON.parse(localStorage.getItem('v1:userInfo')).displayName === chat.sender ? 'YOU' : chat.sender}
                        <span className='fw-normal p-1'>{chat.message}</span>
                    </div>
                ))}
            </div>
            <div className='card d-flex flex-row justify-content-between p-2 m-2 bg-off-white align-items-center'>
                <input
                    type='text'
                    className='border-0 border-radius-15 p-1'
                    style={{ width: 'calc(100% - 40px)' }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <svg
                    className='cursor-pointer'
                    onClick={chat}
                    width='28'
                    height='25'
                    viewBox='0 0 28 25'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                >
                    <path d='M1.5 1.5C19.9 13.5 9.16667 21.5 1.5 24' stroke='black' />
                    <path d='M2.5 1L26.5 13.5L2.5 24.5H0' stroke='black' />
                </svg>
            </div>
        </>
    );
}
