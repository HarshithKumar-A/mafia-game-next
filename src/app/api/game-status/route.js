import { NextResponse } from "next/server";
import { database } from "@/intercepter/firebaseApp";
import { set, ref } from "firebase/database";

export async function POST(req) {
    try {
        const data = await req.json();
        if (data.players.length < 4 || data.players.length > 16) {
            throw new Error(`Unsupported number of players. minimum 4 players needed`);
        }
        const response = await setGameStatus(data);
        // console.log(data, response);

        return NextResponse.json({
            message: 'status updated',
            headers: {
                'Content-Type': 'application/json',
            },
            status: 200
        });
    } catch (error) {
        return NextResponse.json({
            error: error.message,
        }, {
            status: 400
        });
    }
}

async function setGameStatus(roomData) {
    try {
        await set(
            ref(database, 'room-id/' + roomData.gameStatus.code),
            {
                gameStatus:
                {
                    ...roomData.gameStatus,
                    round_no: 1,
                    status: 'morning',
                    isDayTime: true,
                    dayChat: [
                        { sender: 'sample', message: 'message sample' }
                    ],
                    mafiaChat: [],
                },
                players: assignRandomRoles(roomData.players)
            }
        );
        // console.log();
        return '';
    } catch (error) {
        console.log(error);
        throw error; // Rethrow the error so it can be caught by the caller
    }
}

function assignRandomRoles(players) {
    const numPlayers = players.length;
    const rolesTable = {
        4: { mafia: 1, townspeople: 2, doctor: 1, detective: 0 },
        5: { mafia: 1, townspeople: 3, doctor: 1, detective: 0 },
        6: { mafia: 2, townspeople: 3, doctor: 1, detective: 1 },
        7: { mafia: 2, townspeople: 4, doctor: 1, detective: 0 },
        8: { mafia: 2, townspeople: 4, doctor: 1, detective: 1 },
        9: { mafia: 3, townspeople: 4, doctor: 1, detective: 1 },
        10: { mafia: 3, townspeople: 5, doctor: 1, detective: 1 },
        11: { mafia: 3, townspeople: 5, doctor: 1, detective: 2 },
        12: { mafia: 3, townspeople: 6, doctor: 1, detective: 2 },
        13: { mafia: 4, townspeople: 6, doctor: 1, detective: 2 },
        14: { mafia: 4, townspeople: 7, doctor: 1, detective: 2 },
        15: { mafia: 4, townspeople: 7, doctor: 1, detective: 3 },
        16: { mafia: 4, townspeople: 8, doctor: 1, detective: 3 }
    };

    const roles = rolesTable[numPlayers];

    // Create an array with role names based on the table
    const roleNames = Array(roles.mafia).fill("Mafia")
        .concat(Array(roles.townspeople).fill("Townspeople"))
        .concat(Array(roles.doctor).fill("Doctor"))
        .concat(Array(roles.detective).fill("Detective"));

    roleNames.sort(() => Math.random() - 0.5);

    // Assign roles to players
    players.forEach((player, index) => {
        const subrole = roleNames[index];
        const role = subrole === "Mafia" ? "mafia" : "villegers";
        player.role = role.toLowerCase();
        player.subrole = subrole.toLowerCase();
        player.isVoted = false;
        player.score = 0;
    });
    return players;
}
