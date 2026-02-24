/**
 * Initialization and External Services Setup
 */

// 1. Google Analytics
(function () {
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=G-E6FX97WVER";
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-E6FX97WVER');
})();

// 2. Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(reg => {
            reg.update();
        });
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            window.location.reload();
            refreshing = true;
        }
    });
}

// 3. PWA Install Logic
let deferredPrompt;
const pwaInstallBanner = document.getElementById('pwa-install-banner');
const pwaInstallBtn = document.getElementById('pwa-install-btn');
const pwaDismissBtn = document.getElementById('pwa-dismiss-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) {
        setTimeout(() => {
            if (pwaInstallBanner) {
                pwaInstallBanner.style.display = 'flex';
                requestAnimationFrame(() => {
                    pwaInstallBanner.classList.add('visible');
                });
            }
        }, 2000);
    }
});

if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        pwaInstallBanner.classList.remove('visible');
        setTimeout(() => { pwaInstallBanner.style.display = 'none'; }, 400);
    });
}

if (pwaDismissBtn) {
    pwaDismissBtn.addEventListener('click', () => {
        localStorage.setItem('pwa-install-dismissed', '1');
        pwaInstallBanner.classList.remove('visible');
        setTimeout(() => { pwaInstallBanner.style.display = 'none'; }, 400);
    });
}

window.addEventListener('appinstalled', () => {
    if (pwaInstallBanner) {
        pwaInstallBanner.classList.remove('visible');
        setTimeout(() => { pwaInstallBanner.style.display = 'none'; }, 400);
    }
    deferredPrompt = null;
});
