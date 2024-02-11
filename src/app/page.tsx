"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/buttons/button';
import { ref, set, onValue, onDisconnect } from 'firebase/database';
import { database } from '../intercepter/firebaseApp';

export default function Home() {
  const router = useRouter();
  const [joinRoom, setJoinRoom] = useState(false);
  const [roomCode, setRoomCode]: any = useState([0, 0, 0, 0]);
  const inputRefs = [useRef<HTMLInputElement>(), useRef<HTMLInputElement>(), useRef<HTMLInputElement>(), useRef<HTMLInputElement>()];

  const [unavailableRoomIds, setUnavailable] = useState<string[]>([]);

  useEffect(() => {
    const isUserAuthenticated = localStorage.getItem('v1:userInfo');
    if (!isUserAuthenticated) {
      router.push('/login');
    }
    onValue(ref(database, 'unavailable-rooms'), (snapshot) => {
      const data = snapshot.val();
      if (!!data) {
        setUnavailable(data.ids);
      } else {
        console.log('Data not found');
      }
    });
  }, []);

  const handleCodeEnter = (event: React.ChangeEvent<HTMLInputElement>, input: number) => {
    const value = event.target.value.slice(0, 1); // Restrict to one character
    setRoomCode((prevRoomCode: any) => {
      const newRoomCode = [...prevRoomCode];
      newRoomCode[input - 1] = value;
      return newRoomCode;
    });

    // Focus on the next input
    if (value !== '' && input < inputRefs.length) {
      inputRefs[input].current?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent) => {
    var cartId = 1;
    const data = {
      cartId: cartId,
      ids: ['0000'],
    };
    set(ref(database, 'cart/' + cartId), data)
      .then(() => {
        // Success.
        console.log('success!!');
      })
      .catch((error) => {
        console.log(error);
      });
    event.preventDefault();
  };

  const handleKeyDown = (event: React.KeyboardEvent, input: number) => {
    // Handle backspace key
    setTimeout(() => {
      if (event.key === 'Backspace' && input > 1) {
        inputRefs[input - 2].current?.focus();
      }
    });
  };

  function generateUniqueString(existingArray: string[]) {
    const generateRandomString = () => {
      const randomNumber = Math.floor(Math.random() * 10000);
      const paddedNumber = randomNumber.toString().padStart(4, '0');
      return paddedNumber;
    };
    let newString = generateRandomString();
    while (existingArray.includes(newString)) {
      newString = generateRandomString();
    }
    return newString;
  }

  const createRoom = () => {
    const newCode = generateUniqueString(unavailableRoomIds);
    set(ref(database, 'unavailable-rooms/ids'), [...unavailableRoomIds, newCode])
      .then(() => {
        console.log(newCode, unavailableRoomIds);
        set(
          ref(database, 'room-id/' + newCode),
          {
            players: [
              {
                name: JSON.parse(localStorage.getItem('v1:userInfo')!).displayName,
                score: 0,
                role: null,
                isActive: true,
                isReady: true,
                host: true,
                index: 0,
                email: JSON.parse(localStorage.getItem('v1:userInfo')!).email
              },
            ],
            gameStatus: {
              round_no: 1,
              code: newCode,
              status: 'waiting', // Morning, night, etc
            },
          }
        )
          .then(() => {
            localStorage.setItem('v1:gameInfo', JSON.stringify({ gameId: newCode }));
            router.push('/waiting-room/' + newCode);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const verifyCode = () => {
    const roomId = roomCode.join('');
    const cartRef = ref(database, 'room-id/' + roomId);
    console.log(database + 'room-id/' + roomId);
    localStorage.removeItem('v1:gameInfo');
    onValue(cartRef, (snapshot) => {
      if (localStorage.getItem('v1:gameInfo')) {
        localStorage.setItem('v1:gameInfo', JSON.stringify({ gameId: roomId }));
        router.push('/waiting-room/' + roomId);
        return;
      }
      const data = snapshot.val();
      if (!!data) {
        localStorage.setItem('v1:gameInfo', JSON.stringify({ gameId: roomId }));
        // If player alreadyexist in the grup
        const playerData = data?.players?.find((player: any) => player.email === JSON.parse(localStorage.getItem('v1:userInfo')!).email);
        if (playerData) {
          set(ref(database, 'room-id/' + roomId + '/players/' + playerData.index + '/isActive/'), true).then(() => {
            router.push('/waiting-room/' + roomId);
          })
        } else {
          set(
            ref(database, 'room-id/' + roomId + '/players/'), 
            [
                ...data.players,
                {
                  name: JSON.parse(localStorage.getItem('v1:userInfo')!).displayName,
                  score: 0,
                  role: null,
                  isActive: true,
                  isReady: false,
                  host: false,
                  index: data.players.length,
                  email: JSON.parse(localStorage.getItem('v1:userInfo')!).email
                },
              ],
          )
            .then(() => {
              router.push('/waiting-room/' + roomId);
            })
            .catch((error) => {
              console.log(error);
            });
        }

      } else {
        console.log('Data not found');
      }
    });
  };

  return (
    <div className='d-flex flex-column gap-4 w-100 h-100 align-items-center justify-content-center'>
      {joinRoom ? (
        <>
          <div
            className='position-absolute top-0 start-0 m-4 cursor-pointer'
            onClick={() => setJoinRoom(false)}
          >
            <svg width='28' height='32' viewBox='0 0 28 32' fill='none' xmlns='http://www.w3.org/2000/svg'>
              <rect width='27.8848' height='31.7781' rx='13.9424' fill='black' />
              <path d='M6.39026 15.2129L17.2827 5.55141V24.8744L6.39026 15.2129Z' fill='#D9D9D9' />
            </svg>
          </div>
          <div className='text-white'>ENTER THE ROOM CODE</div>
          <div className='d-flex gap-1'>
            {inputRefs.map((ref: any, index) => (
              <input
                key={index}
                onChange={(e) => handleCodeEnter(e, index + 1)}
                onPaste={handlePaste}
                onKeyDown={(e) => handleKeyDown(e, index + 1)}
                maxLength={1}
                className='code-element bg-white text-black'
                type='text'
                id={`input-${index + 1}`}
                ref={ref}
              />
            ))}
          </div>
          <Button text={'SUBMIT'} action={() => verifyCode()} disabled={false}/>
        </>
      ) : (
        <>
          <Button text={'CREATE ROOM'} action={() => createRoom()} disabled={false}/>
          <Button action={() => setJoinRoom(true)} text={'JOIN ROOM'} disabled={false}/>
        </>
      )}
    </div>
  );
}
