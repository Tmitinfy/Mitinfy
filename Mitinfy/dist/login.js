"use strict";
/*import vscode from 'vscode';
import { app, CLIENT_ID, REDIRECT_URL, CLIENT_SECRET } from './extension';

let server: any = null;
export async function login() {
    // Iniciar el servidor si no está corriendo
    if (!server) {
        server = app.listen(8080, () => {
            console.log('Servidor corriendo en puerto 8080');
        });
    }

    const auth_url = 'https://accounts.spotify.com/authorize?'
        + `client_id=${CLIENT_ID}`
        + '&response_type=code'
        + `&redirect_uri=${encodeURIComponent(REDIRECT_URL)}`
        + '&scope=user-read-playback-state user-modify-playback-state streaming';


    await vscode.env.openExternal(vscode.Uri.parse(auth_url));

    const getUsrToken = () => {
        return app.get('/callback', async (req, res) => {
            if(!req.query.code){res.status(400).send('No hay ningún código de autorización'); return;}
            const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: req.query.code as string,
                    redirect_uri: REDIRECT_URL
                }).toString()
            });

            if(tokenRes.ok){
                res.status(200).send('Autenticacion exitosa');
                const tokenData = await tokenRes.json() as { access_token: string, refresh_token: string };

                vscode.workspace.getConfiguration().update(
                    'mitinfy.accesstoken',
                    tokenData.access_token,
                    vscode.ConfigurationTarget.Global
                );

                vscode.workspace.getConfiguration().update(
                    'mitinfy.refreshtoken',
                    tokenData.refresh_token,
                    vscode.ConfigurationTarget.Global
                );



                
            }
            res.status(400).send('token nulo'); return;
        });

    };
    
   
    const usrToken = getUsrToken();

}
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const vscode_1 = __importDefault(require("vscode"));
const extension_1 = require("./extension");
let server = null;
// Custom error class para errores específicos de Spotify
class SpotifyAuthError extends Error {
    statusCode;
    spotifyError;
    description;
    constructor(message, statusCode, spotifyError, description) {
        super(message);
        this.statusCode = statusCode;
        this.spotifyError = spotifyError;
        this.description = description;
        this.name = 'SpotifyAuthError';
        this.statusCode = statusCode;
    }
}
async function login() {
    if (!server) {
        server = extension_1.app.listen(8080, () => {
            console.log('🚀 Servidor corriendo en puerto 8080');
        });
    }
    /**
     * https://accounts.spotify.com/authorize?client_id=6ed056117cfb4d9bb9a93ec4bcb7d5b9&response_type=code&redirect_uri=http://127.0.0.1:8080/callback&scope=user-read-playback-state user-modify-playback-state streaming
     */
    const auth_url = 'https://accounts.spotify.com/authorize?'
        + `client_id=${extension_1.CLIENT_ID}`
        + '&response_type=code'
        + `&redirect_uri=${encodeURIComponent(extension_1.REDIRECT_URL)}`
        + '&scope=user-read-playback-state user-modify-playback-state streaming';
    await vscode_1.default.env.openExternal(vscode_1.default.Uri.parse(auth_url));
    extension_1.app.get('/callback', async (req, res) => {
        try {
            if (!req.query.code) {
                throw new SpotifyAuthError('No se recibió código de autorización', 400);
            }
            console.log('📝 Código recibido:', req.query.code);
            const credentials = Buffer.from(`${extension_1.CLIENT_ID}:${extension_1.CLIENT_SECRET}`).toString('base64');
            const requestBody = new URLSearchParams({
                grant_type: 'authorization_code',
                code: req.query.code,
                redirect_uri: extension_1.REDIRECT_URL
            }).toString();
            console.log('📤 Enviando petición a Spotify...');
            // Hacer petición a Spotify
            const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`
                },
                body: requestBody
            });
            console.log('📥 Respuesta recibida - Status:', tokenRes.status);
            // Si la respuesta no es exitosa, lanzar error
            if (!tokenRes.ok) {
                throw new SpotifyAuthError(`Error HTTP ${tokenRes.status}: ${tokenRes.statusText}`, tokenRes.status);
            }
            // Leer y validar respuesta JSON
            const tokenData = await tokenRes.json();
            console.log('🔍 DEBUGGING - tokenData recibida:');
            console.log('Keys:', Object.keys(tokenData || {}));
            console.log('Full object:', JSON.stringify(tokenData, null, 2));
            // Validar que tenemos los tokens necesarios
            const tokenResponse = tokenData;
            if (!tokenResponse.access_token || !tokenResponse.refresh_token) {
                throw new SpotifyAuthError('Tokens faltantes en respuesta de Spotify', 400);
            }
            console.log('✅ Tokens válidos recibidos, guardando...');
            // Guardar tokens
            await saveTokensToVSCode(tokenResponse.access_token, tokenResponse.refresh_token);
            // Verificar que se guardaron correctamente
            await verifyTokensSaved();
            // Respuesta exitosa
            res.status(200).send(generateSuccessPage(tokenResponse));
            vscode_1.default.window.showInformationMessage('¡Login exitoso con Spotify! 🎵');
            console.log('🎉 Login completado exitosamente');
        }
        catch (error) {
            // MANEJO CENTRALIZADO DE ERRORES
            console.error('💥 Error en login:', error);
            let statusCode = 500;
            let errorMessage = 'Error interno del servidor';
            // Manejo específico para nuestros errores personalizados
            if (error instanceof SpotifyAuthError) {
                statusCode = error.statusCode;
                errorMessage = error.message;
            }
            // Respuesta de error unificada
            res.status(statusCode).send(generateErrorPage(statusCode, errorMessage));
            // Notificación al usuario en VS Code
            vscode_1.default.window.showErrorMessage(`Error de autenticación: ${errorMessage}`);
        }
    });
}
// Funciones auxiliares para mejor organización
async function saveTokensToVSCode(accessToken, refreshToken) {
    const config = vscode_1.default.workspace.getConfiguration();
    await Promise.all([
        config.update('mitinfy.accessToken', accessToken, vscode_1.default.ConfigurationTarget.Global),
        config.update('mitinfy.refreshToken', refreshToken, vscode_1.default.ConfigurationTarget.Global),
    ]);
    console.log('✅ Tokens guardados en VS Code settings');
}
async function verifyTokensSaved() {
    const config = vscode_1.default.workspace.getConfiguration();
    const savedAccessToken = config.get('mitinfy.accessToken');
    const savedRefreshToken = config.get('mitinfy.refreshToken');
    if (!savedAccessToken || !savedRefreshToken) {
        throw new SpotifyAuthError('Error guardando tokens en VS Code', 500);
    }
    console.log('🔍 Tokens verificados - Access:', !!savedAccessToken, 'Refresh:', !!savedRefreshToken);
}
function generateSuccessPage(tokenData) {
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
function generateErrorPage(statusCode, errorMessage, details) {
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
//# sourceMappingURL=login.js.map