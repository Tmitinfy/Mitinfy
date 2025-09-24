import vscode from 'vscode';
import { app, CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } from '../extension';
import { SpotifyAuthError, SpotifyTokenResponse, verifyTokensSaved, generateErrorPage, generateSuccessPage } from './auxiliar_elems';
let server: any = null;


async function saveTokensToVSCode(accessToken: string, refreshToken: string): Promise<void> {
    const config = vscode.workspace.getConfiguration();    
    await Promise.all([
        config.update('mitinfy.accessToken', accessToken, true),
        config.update('mitinfy.refreshToken', refreshToken, true),
    ]);
};

export async function login() {
    if (!server) {
        server = app.listen(8080, () => {
            console.log('🚀 Servidor corriendo en puerto 8080');
        });
    }
    const scopes = [
        'streaming',                    // CRÍTICO - Web Playback SDK
        'user-read-email',             // CRÍTICO - Web Playback SDK  
        'user-read-private',           // CRÍTICO - Web Playback SDK
        'user-read-playback-state',    // Para leer estado actual
        'user-modify-playback-state'   // Para controlar reproducción
    ].join('%20');
    
    const auth_url = 'https://accounts.spotify.com/authorize?'
        + `client_id=${CLIENT_ID}`
        + '&response_type=code'
        + `&redirect_uri=${encodeURIComponent(REDIRECT_URL)}`
        + `&scope=${scopes}`;

    await vscode.env.openExternal(vscode.Uri.parse(auth_url));

    app.get('/callback', async (req, res) => {
        try {
            if (!req.query.code) {
                throw new SpotifyAuthError('No se recibió código de autorización', 400);
            }
            const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
            const requestBody = new URLSearchParams({
                grant_type: 'authorization_code',
                code: req.query.code as string,
                redirect_uri: REDIRECT_URL
            }).toString();

            vscode.window.showInformationMessage('📤 Enviando petición a Spotify...');

            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`
                },
                body: requestBody
            });
            if (!tokenRes.ok) {
                throw new SpotifyAuthError(
                    `Error HTTP ${tokenRes.status}: ${tokenRes.statusText}`,
                    tokenRes.status
                );
            }
            const tokenData = await tokenRes.json();
            // Validar que tenemos los tokens necesarios
            const tokenResponse = tokenData as SpotifyTokenResponse;
            if (!tokenResponse.access_token || !tokenResponse.refresh_token) {
                throw new SpotifyAuthError(
                    'Tokens faltantes en respuesta de Spotify',
                    400
                );
            }
            await saveTokensToVSCode(tokenResponse.access_token, tokenResponse.refresh_token);

            await verifyTokensSaved();

            res.status(200).send(generateSuccessPage(tokenResponse));
            vscode.window.showInformationMessage('¡Login exitoso con Spotify! 🎵');
        } catch (error) {
            let statusCode = 500;
            let errorMessage = 'Error interno del servidor';

            if (error instanceof SpotifyAuthError) {
                statusCode = error.statusCode;
                errorMessage = error.message;
            }

            res.status(statusCode).send(generateErrorPage(statusCode, errorMessage));
            
            vscode.window.showErrorMessage(`Error de autenticación: ${errorMessage}`);
        }
    });
};