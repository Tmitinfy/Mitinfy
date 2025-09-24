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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyPlayerService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const extension_1 = require("../extension");
const search_service_1 = require("./search_service");
class SpotifyPlayerService {
    static instance;
    panel;
    deviceId;
    context;
    searchService;
    constructor(context) {
        this.context = context;
        this.searchService = search_service_1.SpotifySearchService.getInstance(context);
        // Configure the play handler
        this.searchService.setPlayTrackHandler(async (uri) => {
            console.log('PlaybackService: Playing track:', uri);
            await this.playTrack(uri);
        });
    }
    static getInstance(context) {
        if (!SpotifyPlayerService.instance) {
            SpotifyPlayerService.instance = new SpotifyPlayerService(context);
        }
        return SpotifyPlayerService.instance;
    }
    async initializePlayer() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        vscode.window.showInformationMessage('1)panel cargado');
        // Verify we have a token before proceeding
        const { original_token } = (0, extension_1.getSavedAccessToken)();
        if (!original_token) {
            vscode.window.showErrorMessage('No access token found. Please log in first using "Mitinfy: Login into Mitinfy"');
            throw new Error('No access token found. Please log in first.');
        }
        vscode.window.showInformationMessage('2)token cargado');
        // Create WebView panel with proper configuration
        this.panel = vscode.window.createWebviewPanel('spotifyPlayer', 'Mitinfy Player', vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath, 'src')),
                vscode.Uri.file(path.join(this.context.extensionPath, 'dist')),
                vscode.Uri.file(this.context.extensionPath)
            ]
        });
        vscode.window.showInformationMessage('3)panel creado');
        // Load the WebView content with better error handling
        await this.loadWebviewContent();
        vscode.window.showInformationMessage('4)WebView funcionando');
        // Handle messages from WebView
        this.panel.webview.onDidReceiveMessage(async (message) => {
            console.log('PlayerService received message:', message);
            vscode.window.showInformationMessage(`Mensaje recibido: ${JSON.stringify(message)}`);
            switch (message.type) {
                // En tu switch del onDidReceiveMessage, agrega:
                // En el switch del onDidReceiveMessage:
                case 'info':
                    console.log('Player info:', message.message);
                    vscode.window.showInformationMessage(`Player: ${message.message}`);
                    break;
                case 'test':
                    console.log('Received test message from webview:', message.message);
                    vscode.window.showInformationMessage(`Webview test: ${message.message}`);
                    break;
                case 'ready':
                    try {
                        vscode.window.showInformationMessage(`Ready message: ${JSON.stringify(message)}`);
                        console.log("Full ready message:", message);
                        this.deviceId = message.deviceId;
                        if (!this.deviceId) {
                            throw new Error('Device ID is undefined or empty');
                        }
                        console.log('Device ID set to:', this.deviceId);
                        vscode.window.showInformationMessage(`Player ready! Device: ${this.deviceId}`);
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        console.error('Ready handler error:', error);
                        vscode.window.showErrorMessage(`Ready error: ${errorMessage}`);
                    }
                    break;
                case 'error':
                    console.error('Player error:', message.message);
                    vscode.window.showErrorMessage(`Player error: ${message.message}`);
                    break;
                case 'stateChanged':
                    // Handle state changes (can update UI, status bar, etc)
                    console.log('Playback state changed:', message.state);
                    break;
            }
        }, undefined, this.context.subscriptions);
        vscode.window.showInformationMessage('5)Handlers set up');
        // Send token to WebView after a short delay to ensure it's ready
        // -----------------------------------------------------------------------
        // Desde acá al final hay algo que provoca que no termine de cargar el webview, al testeo se llega a cargar el handler.
        /*
        setTimeout(async () => {
            vscode.window.showInformationMessage('Timeout iniciado...');
            const { original_token } = getSavedAccessToken();
            vscode.window.showInformationMessage(`Token obtenido en timeout --> ${original_token}`);
            if (original_token && this.panel) {
                vscode.window.showInformationMessage('Token y panel disponibles, enviando token...');
                console.log('Sending token to WebView');
                await this.panel.webview.postMessage({
                    type: 'token',
                    token: original_token
                });
                vscode.window.showInformationMessage('Token enviado al webview');
            }else{
                vscode.window.showInformationMessage('Token o panel no disponibles, no se envía token');
            }
            vscode.window.showInformationMessage('Timeout finalizado...');
        }, 1000);
        */
        setTimeout(async () => {
            console.log('🔥 TIMEOUT: Starting token send process');
            vscode.window.showInformationMessage('Timeout iniciado...');
            const { original_token } = (0, extension_1.getSavedAccessToken)();
            console.log('🔥 TIMEOUT: Token retrieved, length:', original_token?.length);
            console.log('🔥 TIMEOUT: Token preview:', original_token?.substring(0, 30) + '...');
            if (original_token && this.panel) {
                console.log('🔥 TIMEOUT: Sending token to webview');
                vscode.window.showInformationMessage('Token y panel disponibles, enviando token...');
                const tokenMessage = {
                    type: 'token',
                    token: original_token
                };
                console.log('🔥 TIMEOUT: Token message being sent:', tokenMessage);
                await this.panel.webview.postMessage(tokenMessage);
                console.log('🔥 TIMEOUT: postMessage completed');
                vscode.window.showInformationMessage('Token enviado al webview');
            }
            else {
                console.log('🔥 TIMEOUT: Missing token or panel');
                console.log('🔥 TIMEOUT: original_token exists:', !!original_token);
                console.log('🔥 TIMEOUT: panel exists:', !!this.panel);
                vscode.window.showInformationMessage('Token o panel no disponibles');
            }
            console.log('🔥 TIMEOUT: Process finished');
            vscode.window.showInformationMessage('Timeout finalizado...');
        }, 1000);
        // Clean up on dispose
        this.panel.onDidDispose(() => {
            this.panel = undefined;
            this.deviceId = undefined;
        });
        vscode.window.showInformationMessage('6) limpieza hecha.');
    }
    async loadWebviewContent() {
        if (!this.panel) {
            return;
        }
        const possiblePaths = [
            path.join(this.context.extensionPath, 'src', 'playback', 'webview', 'player.html'),
            path.join(this.context.extensionPath, 'playerTest.html'),
            path.join(this.context.extensionPath, 'webview', 'playerTest.html')
        ];
        // Intentar todos los paths en paralelo
        const promises = possiblePaths.map(async (htmlPath) => {
            try {
                const html = await vscode.workspace.fs.readFile(vscode.Uri.file(htmlPath));
                return { content: html.toString(), path: htmlPath };
            }
            catch {
                return null;
            }
        });
        const results = await Promise.allSettled(promises);
        const successful = results.find(result => result.status === 'fulfilled' && result.value !== null);
        let htmlContent = '';
        if (successful && successful.status === 'fulfilled') {
            htmlContent = successful.value?.content || '';
            console.log('Successfully loaded HTML from:', successful.value?.path);
            console.log('HTML preview:', htmlContent.substring(0, 200));
        }
        else {
            console.log('Using fallback inline HTML');
            htmlContent = this.getFallbackHTML();
        }
        this.panel.webview.html = htmlContent;
        vscode.window.showInformationMessage(`loadWebViewContent() -->> ejecucion de la funcion terminada...`);
    }
    play() {
        if (!this.panel) {
            vscode.window.showWarningMessage('Player not initialized. Please show player first.');
            return;
        }
        console.log('Sending play command to WebView');
        this.panel.webview.postMessage({ type: 'play' });
    }
    pause() {
        if (!this.panel) {
            vscode.window.showWarningMessage('Player not initialized. Please show player first.');
            return;
        }
        console.log('Sending pause command to WebView');
        this.panel.webview.postMessage({ type: 'pause' });
    }
    next() {
        if (!this.panel) {
            vscode.window.showWarningMessage('Player not initialized. Please show player first.');
            return;
        }
        console.log('Sending next command to WebView');
        this.panel.webview.postMessage({ type: 'next' });
    }
    previous() {
        if (!this.panel) {
            vscode.window.showWarningMessage('Player not initialized. Please show player first.');
            return;
        }
        console.log('Sending previous command to WebView');
        this.panel.webview.postMessage({ type: 'previous' });
    }
    showSearch() {
        this.searchService.showSearchPanel();
    }
    async playTrack(uri) {
        console.log('PlaybackService: playTrack called with URI:', uri);
        if (!this.panel) {
            console.error('Panel not available');
            vscode.window.showErrorMessage('Player not initialized. Please show player first.');
            return;
        }
        if (!this.deviceId) {
            console.error('No device ID available');
            vscode.window.showWarningMessage('Player not ready. Please wait for initialization.');
            return;
        }
        try {
            console.log('Sending play message to WebView with URI:', uri);
            await this.panel.webview.postMessage({
                type: 'play',
                uri: uri,
                deviceId: this.deviceId
            });
        }
        catch (error) {
            console.error('Error playing track:', error);
            vscode.window.showErrorMessage('Failed to play track');
        }
    }
    /*
    private getWebviewContent(htmlContent: string): string {
        // Ensure the HTML has proper webview setup
        return htmlContent.replace(
            /<script>/g,
            `<script>
                // Verificar que acquireVsCodeApi esté disponible
                if (typeof acquireVsCodeApi === 'undefined') {
                    console.error('acquireVsCodeApi is not available - this should only run in VS Code webview');
                    window.vscode = { postMessage: () => console.log('Mock postMessage called') };
                } else {
                    window.vscode = acquireVsCodeApi();
                }
            </script>
            `
        );
    }

    */
    getFallbackHTML() {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mitinfy Player</title>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-font-family);
                }
                .error {
                    text-align: center;
                    padding: 40px;
                    color: var(--vscode-errorForeground);
                }
                .reload-btn {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="error">
                <h2>Failed to load player</h2>
                <p>Could not find player.html file</p>
                <p>Expected location: src/playback/webview/player.html</p>
                <button class="reload-btn" onclick="location.reload()">Retry</button>
            </div>
        </body>
        </html>`;
    }
}
exports.SpotifyPlayerService = SpotifyPlayerService;
//# sourceMappingURL=playback_service.js.map