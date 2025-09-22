import fetch from "node-fetch";
import { searchTrack } from "./spotifyPlayer"; // usa tu función de búsqueda

/**
 * Agrega una canción a favoritos en Spotify
 * @param token Token de autenticación de Spotify
 * @param trackId ID de la canción
 */
export async function agregarAFavoritos(token: string, trackId: string) {
  try {
    const res = await fetch("https://api.spotify.com/v1/me/tracks", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: [trackId] }),
    });

    if (res.status === 200) {
      console.log(`✅ Canción agregada a favoritos correctamente`);
    } else {
      console.error(`❌ Error al agregar a favoritos: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("❌ Error en la petición:", err);
  }
}

/**
 * Busca una canción por nombre y la agrega a favoritos.
 * Si hay varias coincidencias, elige la primera.
 */
export async function buscarYAgregarAFavoritos(token: string, query: string) {
  const track = await searchTrack(token, query);
  if (!track) {
    console.error("⚠️ No se encontró ninguna canción con ese nombre.");
    return;
  }

  await agregarAFavoritos(token, track.id);
}
