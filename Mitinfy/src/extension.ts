// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import express from 'express';
//import spotify from 'spotify-web-api-node';
import { login } from './log_in/login';
import { nextTrack, previousTrack, play, pause } from './Controles/controles';
import { searchAndPlayTrack } from "./reproducir"; // <-- IMPORTA tu archivo reproducir.ts

export const app = express();

export const CLIENT_ID = "6ed056117cfb4d9bb9a93ec4bcb7d5b9";
export const CLIENT_SECRET = "bcf93dd96259479dbe7f2e8a0097ae2b";
export const REDIRECT_URL ='http://127.0.0.1:8080/callback';

export function activate(context: vscode.ExtensionContext) {

    console.log('Congratulations, your extension "Mitinfy" is now active!');

    // Comando hello world
    const disposable = vscode.commands.registerCommand('Mitinfy.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from mitinfy!');
        vscode.window.showInformationMessage('Please init session with spotify for play your music');
    });

    // Comando login
    const loginDisposable = vscode.commands.registerCommand('Mitinfy.login', () => {
        vscode.window.showInformationMessage('Connecting with spotify...');
        login();
    });

    // Comandos de control de reproducción
    const playDisposable = vscode.commands.registerCommand('Mitinfy.play', () => {
        vscode.window.showInformationMessage('inicia a escuchar musica');
        play();
    });

    const pauseDisposable = vscode.commands.registerCommand('Mitinfy.pausa', () => {
        vscode.window.showInformationMessage('se pauso la reproduccion');
        pause();
    });

    const skipDisposable = vscode.commands.registerCommand('Mitinfy.siguienteCancion', () => {
        vscode.window.showInformationMessage('se paso a la siguente cancion');
        nextTrack();
    });

    const pepitoDisposable = vscode.commands.registerCommand('Mitinfy.cancionAnterior', () => {
        vscode.window.showInformationMessage('cancion anterior');
        previousTrack();
    });

    // Comando para buscar y reproducir canción
    const playTrackCommand = vscode.commands.registerCommand("Mitinfy.playTrack", async () => {
        const query = await vscode.window.showInputBox({
            prompt: "Escribí el nombre de la canción que querés reproducir (podés agregar artista)",
        });

        if (query) await searchAndPlayTrack(query);
    });

    // Registramos todos los comandos
    context.subscriptions.push(
        disposable,
        loginDisposable,
        playDisposable,
        pauseDisposable,
        skipDisposable,
        pepitoDisposable,
        playTrackCommand // <-- agregado tu comando
    );
}

// Comando extra de login (parece duplicado)
export function Login(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('mitinfy.login', () => {
        vscode.window.showInformationMessage('Please make the login with Spotify first');
        login();
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {}

export function playMusic() {}
