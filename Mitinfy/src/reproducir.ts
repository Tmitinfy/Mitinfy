import * as vscode from "vscode";
import { getSavedAccessToken } from "./Controles/controles";

// Función para buscar y reproducir canción usando la API Web de Spotify
export async function searchAndPlayTrack(query: string) {
    const { original_token } = getSavedAccessToken();

    if (!original_token) {
        vscode.window.showErrorMessage("No se encontró un token de acceso de Spotify.");
        return;
    }

    try {
        // Buscar canción
        const searchResponse = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
            {
                headers: {
                    Authorization: `Bearer ${original_token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!searchResponse.ok) {
            const errorText = await searchResponse.text();
            vscode.window.showErrorMessage(`Error de Spotify: ${errorText}`);
            return;
        }

        const data = await searchResponse.json();
        const track = data.tracks.items[0];

        if (!track) {
            vscode.window.showInformationMessage("No se encontró la canción.");
            return;
        }

        // Reproducir canción
        const playResponse = await fetch(
            `https://api.spotify.com/v1/me/player/play`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${original_token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ uris: [track.uri] }),
            }
        );

        if (!playResponse.ok) {
            const errorText = await playResponse.text();
            vscode.window.showErrorMessage(`No se pudo reproducir la canción: ${errorText}`);
            return;
        }

        vscode.window.showInformationMessage(`🎵 Reproduciendo: ${track.name} - ${track.artists.map((a: any) => a.name).join(", ")}`);
    } catch (err) {
        vscode.window.showErrorMessage(`Error al reproducir la canción: ${err}`);
    }
}
