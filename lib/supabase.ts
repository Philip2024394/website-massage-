declare const supabase: any; // Assuming supabase is loaded from CDN

let client: any = null;

export const initSupabase = (url: string, key: string) => {
    try {
        if (typeof supabase === 'undefined' || !supabase.createClient) {
            console.error("Supabase client is not available on window. Make sure the script is loaded.");
            return null;
        }
        client = supabase.createClient(url, key);
        console.log("Supabase client initialized.");
        return client;
    } catch (error) {
        console.error("Error initializing Supabase client:", error);
        client = null;
        return null;
    }
};

export const getSupabase = () => {
    return client;
};

export const disconnectSupabase = () => {
    client = null;
    console.log("Supabase client disconnected.");
};
