import vscode from 'vscode';
import { app, CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } from '../extension';
import { SpotifyAuthError, SpotifyErrorResponse, SpotifyTokenResponse} from './plantillas';
let server: any = null;

export async function login() {
    if (!server) {
        server = app.listen(8080, () => {
            console.log('🚀 Servidor corriendo en puerto 8080');
        });
    }
    const auth_url = 'https://accounts.spotify.com/authorize?'
        + `client_id=${CLIENT_ID}`
        + '&response_type=code'
        + `&redirect_uri=${encodeURIComponent(REDIRECT_URL)}`
        + '&scope=user-read-playback-state user-modify-playback-state streaming';

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
}

// Funciones auxiliares para mejor organización

async function saveTokensToVSCode(accessToken: string, refreshToken: string): Promise<void> {
    const config = vscode.workspace.getConfiguration();    
    await Promise.all([
        config.update('mitinfy.accessToken', accessToken, vscode.ConfigurationTarget.Global),
        config.update('mitinfy.refreshToken', refreshToken, vscode.ConfigurationTarget.Global),
    ]);
}

async function verifyTokensSaved(): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const savedAccessToken = config.get('mitinfy.accessToken');
    const savedRefreshToken = config.get('mitinfy.refreshToken');
    
    if (!savedAccessToken || !savedRefreshToken) {
        throw new SpotifyAuthError('Error guardando tokens en VS Code', 500);
    }
}

function generateSuccessPage(tokenData: SpotifyTokenResponse): string {
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

function generateErrorPage(statusCode: number, errorMessage: string, details?: string): string {
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