/**
 * Security Layer for Quran App
 * Developed by Antigravity AI
 * This script provides several layers of protection against basic inspection and unauthorized use.
 */

(function () {
    'use strict';

    const SecurityConfig = {
        disableRightClick: true,
        disableDevToolsShortcuts: true,
        antiDebugging: true,
        consoleWarning: true,
        integrityCheck: true
    };

    // 1. Disable Right Click
    if (SecurityConfig.disableRightClick) {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            // console.warn('الحماية مفعّلة: غير مسموح بفتح القائمة المنبثقة.');
        });
    }

    // 2. Disable DevTools Keyboard Shortcuts
    if (SecurityConfig.disableDevToolsShortcuts) {
        document.addEventListener('keydown', (e) => {
            // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'u') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C')
            ) {
                e.preventDefault();
                // console.warn('الحماية مفعّلة: اختصارات المطورين معطلة.');
                return false;
            }
        });
    }

    // 3. Anti-Debugging (Debugger Trap)
    // This makes the browser pause whenever DevTools is opened
    if (SecurityConfig.antiDebugging) {
        setInterval(() => {
            (function () {
                return false;
            }
            ['constructor']('debugger')
            ['call']());
        }, 3000);
    }

    // 4. Console Warning (Prevents Self-XSS)
    if (SecurityConfig.consoleWarning) {
        const warningStyles = [
            'color: #e74c3c; font-size: 30px; font-weight: bold; text-shadow: 2px 2px 0px black;',
            'color: #2c3e50; font-size: 18px;',
        ];

        setTimeout(() => {
            console.log('%cتوقف!', warningStyles[0]);
            console.log('%cهذه الخاصية مخصصة للمطورين فقط. إذا طلب منك أحد نسخ كود ولصقه هنا، فهذا يعني أنه يحاول اختراق بياناتك أو سرقة مفاتيح التطبيق.', warningStyles[1]);
        }, 1000);
    }

    // 5. Detection of DevTools opening
    let devtoolsOpen = false;
    const threshold = 160;

    // Check window size changes which usually happen when DevTools opens
    function checkDevTools() {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if (widthThreshold || heightThreshold) {
            if (!devtoolsOpen) {
                // devtools opened
                devtoolsOpen = true;
                // You could trigger a logout or clear sensitive data here if needed
            }
        } else {
            devtoolsOpen = false;
        }
    }

    window.addEventListener('resize', checkDevTools);
    checkDevTools();

    // 6. Protection against variable mutation (Freeze key objects)
    if (typeof window.localStorage !== 'undefined') {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function (key, value) {
            // Logic to prevent sensitive keys from being overwritten by external scripts
            if (key.includes('secure_') || key.includes('api_')) {
                // console.error('محاولة تعديل بيانات حساسة تم منعها.');
                return;
            }
            originalSetItem.apply(this, arguments);
        };
    }

})();
