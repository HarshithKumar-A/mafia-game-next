"use client";
import React, { useEffect, useState } from 'react';
import { BackButton } from '@/components/buttons/BackButton';
import Button from '@/components/buttons/button';
import { database } from '@/intercepter/firebaseApp';
import { ref, set, onValue, onDisconnect } from 'firebase/database';
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
        const unsubscribe = onValue(cartRef, (snapshot) => {
            const data = snapshot.val();
            if (!!data) {
                setRoomId(roomId);
                setRoomData(data);
                const playerData = data?.players?.find((player: any) => player.email === JSON.parse(localStorage.getItem('v1:userInfo')!).email);
                onDisconnect(ref(database, 'room-id/' + roomId + '/players/' + playerData.index + '/isActive/')).set(false);
                setPlayerData(playerData);
                console.log('dying');
                if (!playerData.isActive) { set(ref(database, 'room-id/' + roomId + '/players/' + playerData.index + '/isActive/'), true) };
                if (data.gameStatus?.status !== 'waiting') {
                    router.push(`/game/${params['game-id']}`);
                }
            } else {
                console.log('Data not found');
            }
        });
        return () => {
            unsubscribe();
        };
    }, []);

    function onActionButtonClick() {
        console.log('here');
        if (playerData.host) {
            // this end point starts gmae as per current implementation
            fetch('/api/game-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(roomData),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(errorText => {
                            throw new Error(errorText);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    router.push(`/game/${params['game-id']}`);
                })
                .catch(error => {
                    console.log(error.message);
                    alert(JSON.parse(error.message)?.error || 'something went wrong');
                });
        } else {
            // Logic for non-host players
            const userIndex = roomData.players.findIndex((player) => player.email === playerData.email);
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

    function deleteUser() {
        set(ref(database, 'room-id/' + roomId + '/players/' + playerData.index + '/isActive/'), false).then(() => {
            console.log('compleated');
        }).catch((error) => {
            console.log(error);
        });
    }

    return (
        <>
            <BackButton url={'/'} action={() => { deleteUser() }} />
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
                    {roomData.players?.map((player, index) => (
                        <span key={index} className={`py-1 px-3 bg-white card border-0 d-flex flex-row justify-content-between ${!player.isActive && 'disabled'}`}>
                            <span className='text-uppercase'>{player?.name || 'disconnected'}</span>
                            <span className='action-btn'>
                                {player?.isReady ? (
                                    <span className='text-success cursor-pointer'>READY</span>
                                ) : (
                                    <span className='cross-icon cursor-pointer'></span>
                                )}
                            </span>
                        </span>
                    ))}
                </div>
                <div className='tooltip-custom'>
                    {playerData?.host && <div className="tooltiptext"> minimum 4 players needed</div>}
                    <Button
                        action={() => onActionButtonClick()}
                        disabled={!!playerData?.host && (roomData.players.filter((player) => player.isActive).length < 4 || roomData.players.filter((player) => player.isActive).some((player) => !player.isReady))}
                        text={playerData?.host ? 'START' : playerData?.isReady ? 'NOT READY' : 'READY'}
                    />
                </div>
            </div>
        </>
    );
}

export default Waiting;
