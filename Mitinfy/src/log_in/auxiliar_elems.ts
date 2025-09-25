/**
 * En este archivo no hay logica alguna, son solamente plantillas/funciones auxiliares que se usan para el inicio de sesión.
 * Igualmente son escensiales para el correcto funcionamiento de el servicio.
 * 
 */
import * as vscode from 'vscode';

export interface SpotifyTokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

export interface SpotifyErrorResponse {
    error: string;
    error_description?: string;
}

export class SpotifyAuthError extends Error {
    constructor(
        message: string,
        public statusCode: number,
        public spotifyError?: string,
        public description?: string
    ) {
        super(message);
        this.name = 'SpotifyAuthError';
        this.statusCode = statusCode;
    }
}

export async function verifyTokensSaved(): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const savedAccessToken = config.get('mitinfy.accessToken');
    const savedRefreshToken = config.get('mitinfy.refreshToken');
    
    if (!savedAccessToken || !savedRefreshToken) {
        throw new SpotifyAuthError('Error guardando tokens en VS Code', 500);
    }
}

export function generateSuccessPage(tokenData: SpotifyTokenResponse): string {
    return `
        <html>
            <head>
                <title>Mitinfy - Autenticación Exitosa</title>
            </head>
            <body>
                <div class="success">✅ ¡Autenticación exitosa!</div>
                <div class="info">Tu extensión Mitinfy está lista para usar Spotify.</div>
                <div class="info">Ya puedes cerrar esta ventana y volver a VS Code.</div>
                <div class="debug">
                    <strong>Información de debug:</strong><br>
                    • Access token: ${tokenData.access_token.substring(0, 20)}...<br>
                    • Refresh token: ${tokenData.refresh_token.substring(0, 20)}...<br>
                    • Expira en: ${tokenData.expires_in} segundos<br>
                    • Scopes: ${tokenData.scope}
                </div>
                <button class="close-btn" onclick="window.close()">Cerrar ventana</button>
            </body>
        </html>
    `;
}

export function generateErrorPage(statusCode: number, errorMessage: string, details?: string): string {
    return `
        <html>
            <head>
                <title>Mitinfy - Error de Autenticación</title>
            </head>
            <body>
                <div class="error">❌ Error de autenticación</div>
                <div class="details">
                    <strong>Error ${statusCode}:</strong> ${errorMessage}<br><br>
                    <strong>Detalles:</strong> ${details}
                </div>
                <a href="javascript:history.back()" class="retry-btn">Reintentar</a>
            </body>
        </html>
    `;
}