// ==UserScript==
// @name         VFS Global Auto Login (Nepal → Japan)
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Fetches credentials from API, simulates real typing, and clicks Sign In on VFS Global
// @author       AutoCraft
// @match        https://visa.vfsglobal.com/npl/en/jpn/login*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      senda.fit
// @run-at       document-idle
// ==/UserScript==

(async function () {
    'use strict';

    const API_URL = 'https://senda.fit/autocraft_placeholder/api.php';
    const LOG  = (msg) => console.log(`%c[VFS AutoLogin] ${msg}`, 'color:#4CAF50;font-weight:bold');
    const WARN = (msg) => console.warn(`[VFS AutoLogin] ${msg}`);
    const ERR  = (msg) => console.error(`[VFS AutoLogin] ${msg}`);

    /* ═══════════════════════════════════════════════════════════════
       UTILITY: Wait for a DOM element via MutationObserver.
       Essential for Angular SPA where elements render async.
    ═══════════════════════════════════════════════════════════════ */
    function waitForElement(selector, timeout = 15000) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);

            const observer = new MutationObserver(() => {
                const el = document.querySelector(selector);
                if (el) {
                    observer.disconnect();
                    clearTimeout(timer);
                    resolve(el);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });

            const timer = setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout: "${selector}" not found within ${timeout}ms`));
            }, timeout);
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       UTILITY: Simple promise-based delay.
    ═══════════════════════════════════════════════════════════════ */
    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    /* ═══════════════════════════════════════════════════════════════
       UTILITY: Simulate a single real keystroke on an element.
       Fires keydown → keypress → input (with data) → keyup.
       This is what Angular's reactive form engine actually listens
       to — character by character — to mark a field as dirty/valid.
    ═══════════════════════════════════════════════════════════════ */
    function simulateKey(el, char) {
        const keyOpts = {
            key:      char,
            char:     char,
            keyCode:  char.charCodeAt(0),
            which:    char.charCodeAt(0),
            bubbles:  true,
            cancelable: true
        };

        el.dispatchEvent(new KeyboardEvent('keydown',  keyOpts));
        el.dispatchEvent(new KeyboardEvent('keypress', keyOpts));

        // Use native setter to append the character to current value
        const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeSetter.call(el, el.value + char);

        // Fire InputEvent with the typed character as data
        el.dispatchEvent(new InputEvent('input', {
            data:       char,
            inputType:  'insertText',
            bubbles:    true,
            cancelable: false
        }));

        el.dispatchEvent(new KeyboardEvent('keyup', keyOpts));
    }

    /* ═══════════════════════════════════════════════════════════════
       UTILITY: Type a full string into a field, character by
       character, with a small random delay between keystrokes
       (mimics human typing speed — avoids bot detection).
    ═══════════════════════════════════════════════════════════════ */
    async function typeIntoField(el, text, delayMs = 60) {
        // Clear the field first
        el.focus();
        el.select && el.select();

        // Clear existing value using native setter
        const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeSetter.call(el, '');
        el.dispatchEvent(new Event('input', { bubbles: true }));

        await delay(120);

        // Type each character with a slight random delay
        for (const char of text) {
            simulateKey(el, char);
            // Random delay between 40ms–90ms per keystroke (human-like)
            await delay(delayMs + Math.floor(Math.random() * 30));
        }

        // Final blur to mark field as "touched" in Angular
        el.dispatchEvent(new Event('blur', { bubbles: true }));
        await delay(150);

        LOG(`Typed ${text.length} characters into [${el.id || el.type || el.name}]`);
    }

    /* ═══════════════════════════════════════════════════════════════
       UTILITY: Try multiple selectors and return first match.
    ═══════════════════════════════════════════════════════════════ */
    async function findInputBySelectors(selectors, label) {
        for (const sel of selectors) {
            try {
                const el = await waitForElement(sel, 4000);
                if (el) {
                    LOG(`${label} field located via: "${sel}"`);
                    return el;
                }
            } catch (_) { /* try next */ }
        }
        throw new Error(`Cannot locate ${label} input with any known selector.`);
    }

    /* ═══════════════════════════════════════════════════════════════
       UTILITY: Find a button by its visible text content.
       Handles Angular Material where text is inside nested <span>.
    ═══════════════════════════════════════════════════════════════ */
    function findButtonByText(...texts) {
        const allButtons = Array.from(document.querySelectorAll('button'));
        for (const text of texts) {
            const found = allButtons.find(btn =>
                btn.textContent.trim().toLowerCase().includes(text.toLowerCase()) &&
                !btn.disabled
            );
            if (found) return found;
        }
        return null;
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 1: Fetch credentials from senda.fit API.
       Uses GM_xmlhttpRequest to bypass CORS.
       Caches result in GM_setValue for fallback use.
    ═══════════════════════════════════════════════════════════════ */
    function fetchCredentials() {
        return new Promise((resolve, reject) => {
            LOG('Fetching credentials from API...');
            GM_xmlhttpRequest({
                method:  'GET',
                url:     API_URL,
                timeout: 10000,
                headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
                onload(res) {
                    if (res.status === 200) {
                        try {
                            const data = JSON.parse(res.responseText);
                            if (!data.email || !data.password)
                                throw new Error('Missing email or password in API response.');
                            GM_setValue('vfs_email',    data.email);
                            GM_setValue('vfs_password', data.password);
                            LOG(`API credentials received → ${data.email}`);
                            resolve(data);
                        } catch (e) { reject(e); }
                    } else {
                        reject(new Error(`API HTTP ${res.status}`));
                    }
                },
                onerror:   () => reject(new Error('Network error.')),
                ontimeout: () => reject(new Error('API timed out.'))
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 2: Dismiss OneTrust cookie consent banner.
    ═══════════════════════════════════════════════════════════════ */
    async function dismissCookieBanner() {
        try {
            const btn = await waitForElement('#onetrust-accept-btn-handler', 6000);
            await delay(500);
            btn.click();
            LOG('Cookie banner dismissed.');
            await delay(800);
        } catch (_) {
            LOG('No cookie banner — skipping.');
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 3 + 4: Fill email and password using simulated typing.
       Uses confirmed VFS Global selectors (#mat-input-0, #mat-input-1)
       with multiple fallbacks for resilience.
    ═══════════════════════════════════════════════════════════════ */
    async function fillLoginForm(credentials) {
        LOG('Locating login form fields...');

        // ── Email Field ───────────────────────────────────────────
        // Primary: #mat-input-0 (confirmed from real VFS automation bots)
        const emailInput = await findInputBySelectors([
            '#mat-input-0',
            'input[type="email"]',
            'input[formcontrolname="username"]',
            'input[formcontrolname="email"]',
            'input[placeholder*="Email" i]',
            'input[name="email"]'
        ], 'Email');

        // ── Password Field ────────────────────────────────────────
        // Primary: #mat-input-1 (confirmed from real VFS automation bots)
        const passwordInput = await findInputBySelectors([
            '#mat-input-1',
            'input[type="password"]',
            'input[formcontrolname="password"]',
            'input[placeholder*="Password" i]',
            'input[name="password"]'
        ], 'Password');

        // ── Type credentials character by character ───────────────
        await typeIntoField(emailInput,    credentials.email,    65);
        await delay(300);
        await typeIntoField(passwordInput, credentials.password, 65);
        await delay(400);

        LOG('Credentials typed successfully.');
    }

    /* ═══════════════════════════════════════════════════════════════
       STEP 5: Click the Sign In / Submit button.

       Confirmed VFS Global button selectors (from real bot source):
         Primary:  "body > app-root > div > div > app-login >
                    section > div > div > mat-card > form > button"
         Fallback: button.mat-focus-indicator.btn.btn-brand-orange

       Also checks if button is disabled and waits for Angular to
       enable it after form validation settles.
    ═══════════════════════════════════════════════════════════════ */
    async function clickSignInButton() {
        LOG('Locating Sign In button...');

        // Wait for Angular's validators to process the typed input
        await delay(700);

        let btn = null;

        // ── Strategy 1: Exact full path (confirmed from VFS bot) ──
        const fullPath = 'body > app-root > div > div > app-login > section > div > div > mat-card > form > button';
        btn = document.querySelector(fullPath);
        if (btn) LOG('Button found via: full CSS path');

        // ── Strategy 2: VFS brand orange button (two class variants) ──
        if (!btn) {
            btn = document.querySelector(
                'button.mat-focus-indicator.btn.mat-btn-lg.btn-block.btn-brand-orange'
            );
            if (btn) LOG('Button found via: btn-brand-orange (mat-btn-lg)');
        }

        // ── Strategy 3: Stroked variant (used on some VFS pages) ──
        if (!btn) {
            btn = document.querySelector(
                'button.btn-brand-orange.mat-stroked-button'
            );
            if (btn) LOG('Button found via: btn-brand-orange (mat-stroked)');
        }

        // ── Strategy 4: Any brand orange button ───────────────────
        if (!btn) {
            btn = document.querySelector('button.btn-brand-orange');
            if (btn) LOG('Button found via: button.btn-brand-orange');
        }

        // ── Strategy 5: Angular MDC raised button ─────────────────
        if (!btn) {
            btn = document.querySelector('button.mat-mdc-raised-button');
            if (btn) LOG('Button found via: button.mat-mdc-raised-button');
        }

        // ── Strategy 6: Standard submit button ───────────────────
        if (!btn) {
            btn = document.querySelector('button[type="submit"]');
            if (btn) LOG('Button found via: button[type="submit"]');
        }

        // ── Strategy 7: Text content match ───────────────────────
        if (!btn) {
            btn = findButtonByText('Sign In', 'Sign in', 'Login', 'Submit');
            if (btn) LOG('Button found via: text content match');
        }

        // ── Strategy 8: Last button inside <form> ─────────────────
        if (!btn) {
            const formBtns = Array.from(document.querySelectorAll('form button'));
            if (formBtns.length) {
                btn = formBtns[formBtns.length - 1];
                LOG('Button found via: last button inside <form>');
            }
        }

        if (!btn) {
            throw new Error('Sign In button not found with any strategy.');
        }

        // ── Handle disabled state ─────────────────────────────────
        // Angular disables the button if form validation hasn't passed.
        // Wait up to 3s for it to become enabled after typing.
        let attempts = 0;
        while (btn.disabled && attempts < 6) {
            WARN(`Button is disabled — waiting for Angular validation... (${attempts + 1}/6)`);
            await delay(500);
            attempts++;
        }

        if (btn.disabled) {
            // Force-enable as last resort (removes Angular's disabled binding)
            WARN('Force-enabling button — Angular validation may not have fully passed.');
            btn.removeAttribute('disabled');
            btn.disabled = false;
        }

        // ── Final click ───────────────────────────────────────────
        await delay(200);
        btn.focus();
        await delay(100);
        btn.click();

        // Also dispatch a MouseEvent for Angular click listeners
        btn.dispatchEvent(new MouseEvent('click', {
            bubbles:    true,
            cancelable: true,
            view:       window
        }));

        LOG('✅ Sign In button clicked! Waiting for navigation...');

        // ── Post-click error check ────────────────────────────────
        // If VFS shows "Mandatory field" error, log a warning
        await delay(1500);
        const errorEl = document.querySelector(
            '.errorMessage, [class*="error"], mat-error'
        );
        if (errorEl && errorEl.textContent.trim().length > 0) {
            WARN(`Form error detected: "${errorEl.textContent.trim()}"`);
            WARN('This means Angular did not register the typed values properly.');
            WARN('Try increasing the typing delay or check if a CAPTCHA appeared.');
        }
    }

    /* ═══════════════════════════════════════════════════════════════
       MAIN — Orchestrates all steps
    ═══════════════════════════════════════════════════════════════ */
    async function main() {
        LOG(`Script v4.0 started → ${window.location.href}`);

        try {
            // Step 1: Get credentials
            let creds;
            try {
                creds = await fetchCredentials();
            } catch (apiErr) {
                WARN(`API failed: ${apiErr.message} — trying cache...`);
                const e = GM_getValue('vfs_email',    null);
                const p = GM_getValue('vfs_password', null);
                if (e && p) {
                    creds = { email: e, password: p };
                    LOG('Using cached credentials.');
                } else {
                    throw new Error('No credentials available.');
                }
            }

            // Step 2: Cookie banner
            await dismissCookieBanner();

            // Step 3 & 4: Fill form with simulated typing
            await fillLoginForm(creds);

            // Step 5: Click Sign In
            await clickSignInButton();

        } catch (err) {
            ERR(`FATAL: ${err.message}`);
        }
    }

    main();

})();
