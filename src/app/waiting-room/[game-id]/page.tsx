"use client";
import React, { useEffect, useState } from 'react';
import { BackButton } from '@/components/buttons/BackButton';
import Button from '@/components/buttons/button';
import { database } from '@/intercepter/firebaseApp';
import { ref, set, onValue } from 'firebase/database';
import { useRouter } from 'next/navigation';

const Waiting = ({ params }: { params: { 'game-id': string } }) => {
    const [roomId, setRoomId] = useState<string>('xxxx');
    const [roomData, setRoomData] = useState<{ gameStatus: any; players: any[] }>({ gameStatus: {}, players: [] });
    const [playerData, setPlayerData] = useState<any>();
    const router = useRouter();

    useEffect(() => {
        const roomId = params['game-id'];
        if (!roomId) {
            router.push('/');
        }
        const cartRef = ref(database, 'room-id/' + roomId);
        console.log(database + 'room-id/' + roomId);
        onValue(cartRef, (snapshot) => {
            const data = snapshot.val();
            if (!!data) {
                setRoomId(roomId);
                setRoomData(data);
                const playerData = data?.players.find((player) => player.name === JSON.parse(localStorage.getItem('v1:userInfo')!).displayName);
                setPlayerData(playerData);
                console.log(data, roomData, playerData);
                console.log(data.gameStatus.status);
                if (data.gameStatus?.status !== 'waiting') {
                    router.push(`/game/${params['game-id']}`);
                }
            } else {
                console.log('Data not found');
            }
        });
    }, []);

    function onActionButtonClick() {
        console.log('here');
        if (playerData.host) {
            fetch('/api/game-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roomData),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    router.push(`/game/${params['game-id']}`);
                })
                .catch(error => {
                    console.error('Error:', error);
                });

        } else {
            // Logic for non-host players
            const userIndex = roomData.players.findIndex((player) => player.name === playerData.name);
            if (userIndex !== -1) {
                roomData.players[userIndex].isReady = !roomData.players[userIndex].isReady;
            }
            console.log('here', userIndex, roomData);
            set(
                ref(database, 'room-id/' + roomId),
                roomData
            )
                .then(() => {
                    console.log('success');
                })
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    return (
        <>
            <BackButton url={'/'} />
            <div className='d-flex flex-column gap-4 w-100 h-100 align-items-center justify-content-center'>
                <span className='text-white fs-1'>ROOM</span>
                <div className='d-flex gap-2 opacity-50'>
                    {roomId.split('').map((char, index) => (
                        <span key={index} className='code-element bg-white'>
                            {char}
                        </span>
                    ))}
                </div>
                <div className='canvas bg-white card card-bg height-card-button p-4 gap-1 overflow-auto'>
                    {roomData.players.map((player, index) => (
                        <span key={index} className='py-1 px-3 bg-white card border-0 d-flex flex-row justify-content-between'>
                            <span className='text-uppercase'>{player.name}</span>
                            <span className='action-btn'>
                                {player.isReady ? (
                                    <span className='text-success cursor-pointer'>READY</span>
                                ) : (
                                    <span className='cross-icon cursor-pointer'></span>
                                )}
                            </span>
                        </span>
                    ))}
                </div>
                <Button
                    action={() => onActionButtonClick()}
                    disabled={!!playerData?.host && roomData.players.some((player) => !player.isReady)}
                    text={playerData?.host ? 'START' : playerData?.isReady ? 'NOT READY' : 'READY'}
                />
            </div>
        </>
    );
}

export default Waiting;
