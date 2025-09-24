import * as vscode from 'vscode';
import * as path from 'path';
import { getSavedAccessToken } from '../extension';
import { SpotifySearchService } from './search_service';

export class SpotifyPlayerService {
    private static instance: SpotifyPlayerService;
    private panel: vscode.WebviewPanel | undefined;
    private deviceId: string | undefined;
    private context: vscode.ExtensionContext;
    private searchService: SpotifySearchService;

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.searchService = SpotifySearchService.getInstance(context);
        
        // Configure the play handler
        this.searchService.setPlayTrackHandler(async (uri: string) => {
            console.log('PlaybackService: Playing track:', uri);
            await this.playTrack(uri);
        });
    }

    public static getInstance(context: vscode.ExtensionContext): SpotifyPlayerService {
        if (!SpotifyPlayerService.instance) {
            SpotifyPlayerService.instance = new SpotifyPlayerService(context);
        }
        return SpotifyPlayerService.instance;
    }

    public async initializePlayer() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        // Verify we have a token before proceeding
        const { original_token } = getSavedAccessToken();
        if (!original_token) {
            vscode.window.showErrorMessage('No access token found. Please log in first using "Mitinfy: Login into Mitinfy"');
            throw new Error('No access token found. Please log in first.');
        }
        // Create WebView panel with proper configuration
        this.panel = vscode.window.createWebviewPanel(
            'spotifyPlayer',
            'Mitinfy Player',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.context.extensionPath, 'src')),
                    vscode.Uri.file(path.join(this.context.extensionPath, 'dist')),
                    vscode.Uri.file(this.context.extensionPath)
                ]
            }
        );
        // Load the WebView content with better error handling
        await this.loadWebviewContent();

        // Handle messages from WebView
        this.panel.webview.onDidReceiveMessage(
            async (message) => {
                console.log('PlayerService received message:', message);
                vscode.window.showInformationMessage(`Mensaje recibido: ${JSON.stringify(message)}`);
                
                switch (message.type) {
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
                        } catch (error) {
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
                    case 'SP_MESSAGE':
                        // Manejo de mensajes tipo SP_MESSAGE desde el WebView
                        if (message.topic) {
                            switch (message.topic) {
                                case 'EVENT':
                                    if (message.data && message.data.name === 'PLAYER_INIT_ERROR') {
                                        vscode.window.showErrorMessage('Init error: ' + (message.data.eventData?.message || 'Unknown'));
                                    }
                                    break;
                                case 'GET_TOKEN':
                                    // Enviar el token al WebView si es solicitado
                                    const { original_token } = getSavedAccessToken();
                                    if (original_token && this.panel) {
                                        this.panel.webview.postMessage({ type: 'token', token: original_token });
                                    } else {
                                        vscode.window.showErrorMessage('No access token available for GET_TOKEN');
                                    }
                                    break;
                                case 'CONNECTED':
                                    vscode.window.showInformationMessage('Connect result: ' + (message.data?.connected ? 'true' : 'false'));
                                    break;
                                default:
                                    vscode.window.showWarningMessage('SP_MESSAGE topic desconocido: ' + message.topic);
                                    break;
                            }
                        } else {
                            vscode.window.showWarningMessage('SP_MESSAGE recibido sin topic');
                        }
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
        vscode.window.showInformationMessage('5)Handlers set up');

        setTimeout(async () => {
            console.log('🔥 TIMEOUT: Starting token send process');
            vscode.window.showInformationMessage('Timeout iniciado...');
            
            const { original_token } = getSavedAccessToken();
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
            } else {
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

    private async loadWebviewContent() {
        if (!this.panel) { return; }
        const possiblePaths = [
            path.join(this.context.extensionPath, 'src', 'playback', 'webview', 'playerDebug2.html'),
            path.join(this.context.extensionPath, 'playerTest.html'),
            path.join(this.context.extensionPath, 'webview', 'playerTest.html')
        ];

        // Intentar todos los paths en paralelo
        const promises = possiblePaths.map(async (htmlPath) => {
            try {
                const html = await vscode.workspace.fs.readFile(vscode.Uri.file(htmlPath));
                return { content: html.toString(), path: htmlPath };
            } catch {
                return null;
            }
        });

        const results = await Promise.allSettled(promises);
        const successful = results.find(result => result.status === 'fulfilled' && result.value !== null );

        let htmlContent = '';        
        if (successful && successful.status === 'fulfilled') {
            htmlContent = successful.value?.content || '';
            console.log('Successfully loaded HTML from:', successful.value?.path);
            console.log('HTML preview:', htmlContent.substring(0, 200));
        } else {
            console.log('Using fallback inline HTML');
            htmlContent = this.getFallbackHTML();
        }

        this.panel.webview.html = htmlContent;
        vscode.window.showInformationMessage(`loadWebViewContent() -->> ejecucion de la funcion terminada...`);
    }

    public play() {
        if (!this.panel) {
            vscode.window.showWarningMessage('Player not initialized. Please show player first.');
            return;
        }
        console.log('Sending play command to WebView');
        this.panel.webview.postMessage({ type: 'play' });
    }

    public pause() {
        if (!this.panel) {
            vscode.window.showWarningMessage('Player not initialized. Please show player first.');
            return;
        }
        console.log('Sending pause command to WebView');
        this.panel.webview.postMessage({ type: 'pause' });
    }

    public next() {
        if (!this.panel) {
            vscode.window.showWarningMessage('Player not initialized. Please show player first.');
            return;
        }
        console.log('Sending next command to WebView');
        this.panel.webview.postMessage({ type: 'next' });
    }

    public previous() {
        if (!this.panel) {
            vscode.window.showWarningMessage('Player not initialized. Please show player first.');
            return;
        }
        console.log('Sending previous command to WebView');
        this.panel.webview.postMessage({ type: 'previous' });
    }

    public showSearch() {
        this.searchService.showSearchPanel();
    }

    private async playTrack(uri: string) {
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
        } catch (error) {
            console.error('Error playing track:', error);
            vscode.window.showErrorMessage('Failed to play track');
        }
    }

    private getFallbackHTML(): string {
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