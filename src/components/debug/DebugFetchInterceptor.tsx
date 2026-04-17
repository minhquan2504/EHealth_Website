'use client';

import { useEffect } from 'react';

/**
 * TEMPORARY DEBUG COMPONENT — Remove after fixing [object Object] bug
 * Intercepts fetch/XHR requests to catch which code is creating [object Object] URLs
 */
export default function DebugFetchInterceptor() {
    useEffect(() => {
        // Intercept fetch
        const originalFetch = window.fetch;
        window.fetch = function (...args: any[]) {
            const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || String(args[0]);
            if (url.includes('[object') || url.includes('object%20Object')) {
                console.error('🔴 [DEBUG] fetch() called with [object Object] URL:', url);
                console.trace('Stack trace for bad fetch:');
            }
            return originalFetch.apply(this, args as any);
        };

        // Intercept XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (...args: any[]) {
            const url = args[1];
            if (typeof url === 'string' && (url.includes('[object') || url.includes('object%20Object'))) {
                console.error('🔴 [DEBUG] XHR.open() called with [object Object] URL:', url);
                console.trace('Stack trace for bad XHR:');
            }
            return originalOpen.apply(this, args as any);
        };

        // Intercept createElement to catch <link>, <script>, <img> with bad URLs
        const origCreateElement = document.createElement.bind(document);
        document.createElement = function (tagName: string, options?: ElementCreationOptions) {
            const el = origCreateElement(tagName, options);
            if (['link', 'script', 'img'].includes(tagName.toLowerCase())) {
                const origSetAttribute = el.setAttribute.bind(el);
                el.setAttribute = function (name: string, value: string) {
                    if ((name === 'href' || name === 'src') && typeof value === 'string' &&
                        (value.includes('[object') || value.includes('object%20Object'))) {
                        console.error(`🔴 [DEBUG] ${tagName}.${name} set to [object Object]:`, value);
                        console.trace('Stack trace for bad element attribute:');
                    }
                    return origSetAttribute(name, value);
                };
            }
            return el;
        };

        return () => {
            window.fetch = originalFetch;
            XMLHttpRequest.prototype.open = originalOpen;
            document.createElement = origCreateElement;
        };
    }, []);

    return null;
}
