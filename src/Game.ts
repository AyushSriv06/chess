import { Chess, Move } from "chess.js";
import { WebSocket } from "ws";
import { GAME_OVER, MOVE } from "./messages";

export class Game {
    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    public moves: string[];
    public startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = [];
        this.startTime = new Date();
    }

    makeMove(socket: WebSocket, move: {
        from: string,
        to: string
    }) {
        // validation using zod

        if(this.board.moves.length % 2 === 0 && socket !== this.player1) {
            return;
        }

        if(this.board.moves.length % 2 === 0 && socket !== this.player2) {
            return;
        }

        try{
            this.board.move(move);
        } catch(e) {
            return;
        }

        //check if the game is over

        if(this.board.isGameOver()) {
            this.player1.emit(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }))
            this.player2.emit(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }))
            return;
        }

        if(this.board.moves.length % 2 === 0) {
            this.player2.emit(JSON.stringify({
                type: MOVE,
                payload: move
            }))
        } else {
            this.player1.emit(JSON.stringify({
                type: MOVE,
                payload: move
            }))
        }

        //send updated board to both players
        
    }
}