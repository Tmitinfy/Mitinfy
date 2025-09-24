import * as vscode from 'vscode';
import * as path from 'path';
import { getSavedAccessToken } from '../extension';
import { SpotifyAuthError } from '../log_in/auxiliar_elems';

export interface Track {
    uri: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
        name: string;
        images: Array<{ url: string }>;
    };
}

export class SpotifySearchService {
    private static instance: SpotifySearchService;
    private searchPanel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public static getInstance(context: vscode.ExtensionContext): SpotifySearchService {
        if (!SpotifySearchService.instance) {
            SpotifySearchService.instance = new SpotifySearchService(context);
        }
        return SpotifySearchService.instance;
    }

    public async showSearchPanel() {
        if (this.searchPanel) {
            this.searchPanel.reveal();
            return;
        }

        // Create WebView panel
        this.searchPanel = vscode.window.createWebviewPanel(
            'mitinfySearch',
            'Search Songs',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: false,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'playback', 'webview'))
                ]
            }
        );

        // Load search interface
        const htmlPath = path.join(this.context.extensionPath, 'src', 'playback', 'webview', 'search.html');
        const htmlContent = await vscode.workspace.fs.readFile(vscode.Uri.file(htmlPath));
        this.searchPanel.webview.html = htmlContent.toString();

        // Handle messages from WebView
        this.searchPanel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.type) {
                    case 'search':
                        try {
                            const tracks = await this.searchTracks(message.query);
                            this.searchPanel?.webview.postMessage({ 
                                type: 'searchResults', 
                                tracks 
                            });
                        } catch (error) {
                            console.error('Search error:', error);
                        }
                        break;
                    case 'play':
                        // Aquí es donde recibimos el URI de la canción clickeada
                        console.log('Track selected:', message.uri); // Para debugging
                        this.handleTrackPlay(message.uri);
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );

        // Clean up on dispose
        this.searchPanel.onDidDispose(() => {
            this.searchPanel = undefined;
        });
    }

    private async searchTracks(query: string): Promise<Track[]> {
        const { original_token, refresh_token } = getSavedAccessToken();
        if (!original_token || !refresh_token ) {
            vscode.window.showErrorMessage('Please log in to Spotify first');
            throw new SpotifyAuthError('No access token found', 401);
        }

        try {
            const response = await fetch(
                `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
                {
                    headers: {
                        'Authorization': `Bearer ${original_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 401) {
                vscode.window.showErrorMessage('Session expired. Please log in again.');
                throw new SpotifyAuthError('Token expired or invalid', 401);
            }

            if (!response.ok) {
                const errorData = await response.json() as { error?: { message: string } };
                console.error('Search error:', errorData);
                throw new Error(`Search failed: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json() as { tracks: { items: Track[] } };
            
            if (!data.tracks || !data.tracks.items) {
                throw new Error('Invalid response format from Spotify API');
            }

            return data.tracks.items;
        } catch (error) {
            if (error instanceof SpotifyAuthError) {
                throw error;
            }
            console.error('Search error:', error);
            vscode.window.showErrorMessage('Failed to search tracks. Please try again.');
            throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
        }
    }

    /**
     * Callback que se ejecuta cuando el usuario selecciona una canción para reproducir
     * Este callback será configurado por el PlayerService para manejar la reproducción
     * @private
     */
    private playTrackCallback: (uri: string) => void = () => {
        // Valor por defecto: no hacer nada
        console.warn('No play handler configured');
    };

    /**
     * Configura el manejador de reproducción de canciones
     * @param handler - Función que recibirá el URI de Spotify y se encargará de reproducirlo
     */
    public setPlayTrackHandler(handler: (uri: string) => void) {
        console.log('Setting play track handler');
        this.playTrackCallback = handler;
    }

    /**
     * Ejecuta el manejador de reproducción configurado
     * @param uri - URI de Spotify de la canción a reproducir
     */
    private handleTrackPlay(uri: string) {
        console.log('SearchService handling track play:', uri);
        if (this.playTrackCallback === undefined) {
            console.error('No play handler configured!');
            vscode.window.showErrorMessage('Player not properly initialized');
            return;
        }
        this.playTrackCallback(uri);
    }

}