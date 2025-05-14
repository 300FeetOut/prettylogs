import { Auth0Client } from "@auth0/nextjs-auth0/server"

export const auth0 = new Auth0Client({
    domain: 'https://prettylogs.us.auth0.com',
    clientId: 'Uuarl6XViiFkvcEK4QVpquU2avFzqJwk',
    clientSecret: '8JHls_fZtMM7bJIzsfQTmp5BexDWdiqW3qQ5g6m7z1FGiaNMisdcO5RSyhlSw9I1',
    appBaseUrl: 'http://localhost:3000',
    secret: 'OMoafenfN37Tw5PDZw4IzEFWEkCzQgOevKSzNxQJn-l36ppee0d6XImHv5_k0HuJ',
    
})