// The module 'vscode' contains the VS Code extensibility API Rama controlesReproduccion
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import express from 'express';
import spotify from 'spotify-web-api-node';
import { login } from './log_in/login';
export const app = express();

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export const CLIENT_ID = "6ed056117cfb4d9bb9a93ec4bcb7d5b9";
export const CLIENT_SECRET = "bcf93dd96259479dbe7f2e8a0097ae2b";
export const REDIRECT_URL ='http://127.0.0.1:8080/callback';
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "Mitinfy" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('Mitinfy.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from mitinfy!');
		vscode.window.showInformationMessage('Please init session with spotify for play your music');
	});
	const loginDisposable = vscode.commands.registerCommand('Mitinfy.login', () => {
		vscode.window.showInformationMessage('Connecting with spotify...');
		login();
	});

	context.subscriptions.push(disposable, loginDisposable);
}
export function Login(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('mitinfy.login', () => {
		vscode.window.showInformationMessage('Please make the login with Spotify first');
		login();
	
	} );
	context.subscriptions.push(disposable);

}

// This method is called when your extension is deactivated
export function deactivate() {}

export function playMusic() {}