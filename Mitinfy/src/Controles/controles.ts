import vscode from 'vscode';

export function getSavedAccessToken() {
    return {
        refresh_token: vscode.workspace.getConfiguration().get('mitinfy.refreshToken'),
        original_token: vscode.workspace.getConfiguration().get('mitinfy.accessToken')
    };
}

export async function spotifyRequest(endpoint: string, method: string) {
    const { original_token } = getSavedAccessToken();

    if (!original_token) {
        vscode.window.showErrorMessage("No se encontró un token de acceso de Spotify.");
        return;
    }

    const response = await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
        method,
        headers: {
            Authorization: `Bearer ${original_token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        vscode.window.showErrorMessage(`Error de Spotify: ${error}`);
    }
}

// funciones
export async function play() {
    await spotifyRequest("play", "PUT");
    vscode.window.showInformationMessage("poner play");
}


export async function pause() {
    await spotifyRequest("pause", "PUT");
    vscode.window.showInformationMessage("pausa");
}


export async function nextTrack() {
    await spotifyRequest("next", "POST");
    vscode.window.showInformationMessage("cancioncita sisguiente");
}


export async function previousTrack() {
    await spotifyRequest("previous", "POST");
    vscode.window.showInformationMessage("me quiero matar");
}




