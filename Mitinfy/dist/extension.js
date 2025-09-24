"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playMusic = exports.deactivate = exports.getSavedAccessToken = exports.activate = exports.REDIRECT_URL = exports.CLIENT_SECRET = exports.CLIENT_ID = exports.app = void 0;
const vscode = __importStar(require("vscode"));
const express_1 = __importDefault(require("express"));
const playback_service_1 = require("./playback/playback_service");
const login_1 = require("./log_in/login");
exports.app = (0, express_1.default)();
// Your existing constants
exports.CLIENT_ID = "6ed056117cfb4d9bb9a93ec4bcb7d5b9";
exports.CLIENT_SECRET = "bcf93dd96259479dbe7f2e8a0097ae2b";
exports.REDIRECT_URL = "http://127.0.0.1:8080/callback";
let playerService;
function activate(context) {
    console.log('Congratulations, your extension "Mitinfy" is now active!');
    // Initialize the player service
    playerService = playback_service_1.SpotifyPlayerService.getInstance(context);
    // Register all commands
    const disposables = [
        vscode.commands.registerCommand('Mitinfy.helloWorld', () => {
            vscode.window.showInformationMessage('Hello World from mitinfy!');
        }),
        vscode.commands.registerCommand('Mitinfy.login', () => { (0, login_1.login)(); }),
        vscode.commands.registerCommand('Mitinfy.showPlayer', async () => {
            try {
                await playerService.initializePlayer();
            }
            catch (error) {
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
exports.activate = activate;
function getSavedAccessToken() {
    const config = vscode.workspace.getConfiguration('mitinfy');
    return {
        original_token: config.get('accessToken'),
        refresh_token: config.get('refreshToken')
    };
}
exports.getSavedAccessToken = getSavedAccessToken;
function deactivate() {
    // Cleanup if needed
}
exports.deactivate = deactivate;
function playMusic() {
    // Legacy function - now handled by PlayerService
}
exports.playMusic = playMusic;
//# sourceMappingURL=extension.js.map