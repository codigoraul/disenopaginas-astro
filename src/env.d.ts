/// <reference path="../.astro/types.d.ts" />
/// <reference types="vite/client" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
    readonly RESEND_API_KEY: string;
    // Añade aquí otras variables de entorno que uses
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare global {
    interface Window {
        grecaptcha: {
            render: (container: string | HTMLElement, parameters: {
                sitekey: string;
                theme?: 'light' | 'dark';
                size?: 'normal' | 'compact' | 'invisible';
                tabindex?: number;
                callback?: (token: string) => void;
                'expired-callback'?: () => void;
                'error-callback'?: () => void;
            }) => string | number;
            reset: (widgetId?: string | number) => void;
            getResponse: (widgetId?: string | number) => string;
            execute: (siteKey: string, options: { action: string }) => Promise<string>;
            ready: (callback: () => void) => void;
        };
    }
}

export {};