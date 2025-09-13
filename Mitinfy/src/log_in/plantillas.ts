interface SpotifyTokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

interface SpotifyErrorResponse {
    error: string;
    error_description?: string;
}

class SpotifyAuthError extends Error {
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

export { SpotifyAuthError, SpotifyErrorResponse, SpotifyTokenResponse };