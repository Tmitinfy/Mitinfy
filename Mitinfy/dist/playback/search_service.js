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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifySearchService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const extension_1 = require("../extension");
const auxiliar_elems_1 = require("../log_in/auxiliar_elems");
class SpotifySearchService {
    static instance;
    searchPanel;
    context;
    constructor(context) {
        this.context = context;
    }
    static getInstance(context) {
        if (!SpotifySearchService.instance) {
            SpotifySearchService.instance = new SpotifySearchService(context);
        }
        return SpotifySearchService.instance;
    }
    async showSearchPanel() {
        if (this.searchPanel) {
            this.searchPanel.reveal();
            return;
        }
        // Create WebView panel
        this.searchPanel = vscode.window.createWebviewPanel('mitinfySearch', 'Search Songs', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: false,
            localResourceRoots: [
                vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'playback', 'webview'))
            ]
        });
        // Load search interface
        const htmlPath = path.join(this.context.extensionPath, 'src', 'playback', 'webview', 'search.html');
        const htmlContent = await vscode.workspace.fs.readFile(vscode.Uri.file(htmlPath));
        this.searchPanel.webview.html = htmlContent.toString();
        // Handle messages from WebView
        this.searchPanel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'search':
                    try {
                        const tracks = await this.searchTracks(message.query);
                        this.searchPanel?.webview.postMessage({
                            type: 'searchResults',
                            tracks
                        });
                    }
                    catch (error) {
                        console.error('Search error:', error);
                    }
                    break;
                case 'play':
                    // Aquí es donde recibimos el URI de la canción clickeada
                    console.log('Track selected:', message.uri); // Para debugging
                    this.handleTrackPlay(message.uri);
                    break;
            }
        }, undefined, this.context.subscriptions);
        // Clean up on dispose
        this.searchPanel.onDidDispose(() => {
            this.searchPanel = undefined;
        });
    }
    async searchTracks(query) {
        const { original_token, refresh_token } = (0, extension_1.getSavedAccessToken)();
        if (!original_token || !refresh_token) {
            vscode.window.showErrorMessage('Please log in to Spotify first');
            throw new auxiliar_elems_1.SpotifyAuthError('No access token found', 401);
        }
        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${original_token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 401) {
                vscode.window.showErrorMessage('Session expired. Please log in again.');
                throw new auxiliar_elems_1.SpotifyAuthError('Token expired or invalid', 401);
            }
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Search error:', errorData);
                throw new Error(`Search failed: ${errorData.error?.message || response.statusText}`);
            }
            const data = await response.json();
            if (!data.tracks || !data.tracks.items) {
                throw new Error('Invalid response format from Spotify API');
            }
            return data.tracks.items;
        }
        catch (error) {
            if (error instanceof auxiliar_elems_1.SpotifyAuthError) {
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
    playTrackCallback = () => {
        // Valor por defecto: no hacer nada
        console.warn('No play handler configured');
    };
    /**
     * Configura el manejador de reproducción de canciones
     * @param handler - Función que recibirá el URI de Spotify y se encargará de reproducirlo
     */
    setPlayTrackHandler(handler) {
        console.log('Setting play track handler');
        this.playTrackCallback = handler;
    }
    /**
     * Ejecuta el manejador de reproducción configurado
     * @param uri - URI de Spotify de la canción a reproducir
     */
    handleTrackPlay(uri) {
        console.log('SearchService handling track play:', uri);
        if (this.playTrackCallback === undefined) {
            console.error('No play handler configured!');
            vscode.window.showErrorMessage('Player not properly initialized');
            return;
        }
        this.playTrackCallback(uri);
    }
}
exports.SpotifySearchService = SpotifySearchService;
//# sourceMappingURL=search_service.js.map