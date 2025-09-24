import * as vscode from 'vscode';
import express from 'express';
import { SpotifyPlayerService } from './playback/playback_service';
import { login } from './log_in/login';
export const app = express();

// Your existing constants
export const CLIENT_ID = "6ed056117cfb4d9bb9a93ec4bcb7d5b9";
export const CLIENT_SECRET = "bcf93dd96259479dbe7f2e8a0097ae2b";
export const REDIRECT_URL = "http://127.0.0.1:8080/callback";

let playerService: SpotifyPlayerService;

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "Mitinfy" is now active!');
    
    // Initialize the player service
    playerService = SpotifyPlayerService.getInstance(context);
    
    // Register all commands
    const disposables = [
        vscode.commands.registerCommand('Mitinfy.helloWorld', () => {
            vscode.window.showInformationMessage('Hello World from mitinfy!');
        }),
        
        vscode.commands.registerCommand('Mitinfy.login', () => {login();}),
        
        vscode.commands.registerCommand('Mitinfy.showPlayer', async () => {
            try {
                await playerService.initializePlayer();
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to show player: ${error}`);
            }
        }),
        
        vscode.commands.registerCommand('Mitinfy.search', () => {
            playerService.showSearch();
        }),
        
        vscode.commands.registerCommand('Mitinfy.play', () => {
            playerService.play();
        }),
        
        vscode.commands.registerCommand('Mitinfy.pause', () => {
            playerService.pause();
        }),
        
        vscode.commands.registerCommand('Mitinfy.next', () => {
            playerService.next();
        }),
        
        vscode.commands.registerCommand('Mitinfy.previous', () => {
            playerService.previous();
        })
    ];
    
    context.subscriptions.push(...disposables);
}


export function getSavedAccessToken() {
    const config = vscode.workspace.getConfiguration('mitinfy');
    return {
        original_token: config.get<string>('accessToken'),
        refresh_token: config.get<string>('refreshToken')
    };
}

export function deactivate() {
    // Cleanup if needed
}

export function playMusic() {
    // Legacy function - now handled by PlayerService
}
