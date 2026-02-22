document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const surahListEl = document.getElementById('surah-list');
    const recitersGridEl = document.getElementById('reciters-grid');
    const searchInput = document.getElementById('surah-search');
    const themeSwitch = document.getElementById('theme-switch');
    const playerAudio = document.getElementById('main-audio');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressFilled = document.getElementById('progress-filled');
    const progressBar = document.querySelector('.progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const playerSurah = document.getElementById('player-surah');
    const playerReciter = document.getElementById('player-reciter');
    const playerImg = document.getElementById('player-img');
    const favBtn = document.getElementById('fav-btn');
    const downloadBtn = document.getElementById('download-btn');
    const showTextBtn = document.getElementById('show-text-btn');
    const ayahViewer = document.getElementById('ayah-viewer');
    const closeViewer = document.getElementById('close-viewer');
    const ayahContent = document.getElementById('ayah-content');
    const viewerTitle = document.getElementById('viewer-title');
    const sleepTimerBtn = document.getElementById('sleep-timer-btn');
    const timerModal = document.getElementById('timer-modal');
    const closeTimer = document.getElementById('close-timer');
    const duaView = document.getElementById('dua-view');
    const duaTextEl = document.getElementById('dua-text-el');
    const tafsirModal = document.getElementById('tafsir-modal');
    const closeTafsir = document.getElementById('close-tafsir');
    const tafsirBody = document.getElementById('tafsir-body');
    const tafsirTitle = document.getElementById('tafsir-title');
    const tafsirEngineSelect = document.getElementById('tafsir-engine-select');

    const navItems = document.querySelectorAll('.nav-item');
    const searchTypeToggle = document.getElementById('search-type-toggle');
    const searchTypeLabel = document.getElementById('search-type-label');
    const salawatModal = document.getElementById('salawat-modal');
    const closeSalawat = document.getElementById('close-salawat');
    const othersSection = document.getElementById('others-section');
    const athkarView = document.getElementById('athkar-view');
    const aboutView = document.getElementById('about-view');
    const playerBar = document.querySelector('.player-bar');
    const rosaryBtn = document.getElementById('rosary-btn');
    const rosaryView = document.getElementById('rosary-view');
    const rosaryBack = document.getElementById('rosary-back');
    const rosaryCountEl = document.getElementById('rosary-count');
    const rosaryIncrementBtn = document.getElementById('rosary-increment-btn');
    const rosaryResetBtn = document.getElementById('rosary-reset-btn');
    const prayerTimesBtn = document.getElementById('prayer-times-btn');
    const prayerView = document.getElementById('prayer-view');
    const prayerBack = document.getElementById('prayer-back');
    const prayerTimesList = document.getElementById('prayer-times-list');
    const prayerGregorianDate = document.getElementById('prayer-gregorian-date');
    const prayerHijriDate = document.getElementById('prayer-hijri-date');
    const prayerLocation = document.getElementById('prayer-location');
    const offlineBanner = document.getElementById('offline-banner');


    // App State
    let surahs = [];
    let reciter = recitersData[0];
    let curIdx = -1;
    let favorites = JSON.parse(localStorage.getItem('quran_favorites')) || [];
    let isPlaying = false;
    let sleepTimer = null;
    let searchType = 'surah'; // Can be 'surah' to find chapters or 'ayah' to find specific verses
    let searchDebounceTimer = null;
    let currentTafsirEdition = localStorage.getItem('quran_tafsir_edition') || 'ar.muyassar';
    let activeTafsirAyah = null;
    let activeTafsirSurah = null;
    let prayersTimings = null;
    let notificationPreferences = { prayer: false };
    let readingObserver = null;

    // Init app logic
    init();

    async function init() {
        // console.log('Starting app...');
        renderReciters();
        await fetchSurahs();
        // console.log('Surahs ready:', surahs.length);
        loadLastPlayback(); // Resume last session
        setupEventListeners();
        applyTheme();
        updateFavoritesUI();
        if (tafsirEngineSelect) tafsirEngineSelect.value = currentTafsirEdition;

        // Set default reciter if nothing is playing
        if (reciter && playerSurah.textContent === 'اختر سورة') {
            playerReciter.textContent = reciter.name;
            playerImg.src = reciter.img;
        }

        // Status monitoring
        updateOnlineStatus();
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    }

    function updateOnlineStatus() {
        if (!navigator.onLine) {
            offlineBanner.style.display = 'flex';
        } else {
            offlineBanner.style.display = 'none';
        }
    }

    // Data fitching from API
    async function fetchSurahs() {
        try {
            const response = await fetch('https://api.alquran.cloud/v1/surah');
            const data = await response.json();
            surahs = data.data;
            renderSurahs(surahs);
        } catch (error) {
            console.error('Error fetching surahs:', error);
            surahListEl.innerHTML = '<p class="error">حدث خطأ في تحميل السور. يرجى المحاولة لاحقاً.</p>';
        }
    }

    async function fetchSurahText(number) {
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/surah/${number}`);
            const data = await response.json();
            return data.data.ayahs;
        } catch (error) {
            console.error('Error fetching surah text:', error);
            return null;
        }
    }

    // UI Rendering
    function renderReciters() {
        recitersGridEl.innerHTML = recitersData.map(r => `
            <div class="reciter-card ${r.id === reciter.id ? 'active' : ''}" data-id="${r.id}">
                <img src="${r.img}" alt="${r.name}">
                <p>${r.name}</p>
            </div>
        `).join('');

        document.querySelectorAll('.reciter-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                reciter = recitersData.find(r => r.id === id);
                document.querySelectorAll('.reciter-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                if (curIdx !== -1) {
                    playSurah(surahs[curIdx]);
                }
            });
        });
    }

    function renderSurahs(surahList) {
        if (surahList.length === 0) {
            surahListEl.innerHTML = '<p class="no-results">لا توجد نتائج مطابقة</p>';
            return;
        }

        surahListEl.innerHTML = '';
        surahList.forEach((surah, index) => {
            const card = document.createElement('div');
            card.className = 'surah-card';
            card.dataset.index = surahs.indexOf(surah);
            card.style.animationDelay = `${index * 0.05}s`;

            const isPlayingThis = surahs.indexOf(surah) === curIdx;

            card.innerHTML = `
                <div class="number">${surah.number}</div>
                <div class="surah-info">
                    <h3>${surah.name}</h3>
                    <p>${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - ${surah.numberOfAyahs} آية</p>
                </div>
                <i class="fas ${isPlayingThis && isPlaying ? 'fa-pause-circle' : 'fa-play-circle'} play-icon-pulse"></i>
            `;

            card.addEventListener('click', () => {
                const idx = parseInt(card.dataset.index);
                playSurah(surahs[idx], idx);
            });

            surahListEl.appendChild(card);
        });
    }

    // Audio Logic & controls
    function playSurah(surah, index = -1) {
        if (index !== -1) curIdx = index;
        // console.log('Playing:', surah.name, 'with', reciter.name);

        // Format number to 00X for audio availability
        const formattedNumber = String(surah.number).padStart(3, '0');
        const audioUrl = `${reciter.server}${formattedNumber}.mp3`;

        playerAudio.src = audioUrl;
        playerSurah.textContent = surah.name;
        playerReciter.textContent = reciter.name;
        playerImg.src = reciter.img;

        // Check if favorite
        const isFav = favorites.includes(surah.number);
        favBtn.classList.toggle('active', isFav);
        favBtn.querySelector('i').className = isFav ? 'fas fa-heart' : 'far fa-heart';

        playerAudio.play();
        // The player bar handles its own updates when the audio starts/stops
        // setupMediaSession(surah); // We still need this to set metadata
        setupMediaSession(surah);

        checkDownloadStatus(audioUrl);
        savePlaybackState();
    }

    async function setupMediaSession(surah) {
        // Update Media Session for OS controls
        try {
            // Branded artwork for lock screen
            const brandedArtworkUrl = await generateBrandedArtwork(reciter.img, reciter.name);
            const appIconUrl = new URL('images/icon-512x512.jpg', window.location.href).href;

            navigator.mediaSession.metadata = new MediaMetadata({
                title: surah.name,
                artist: reciter.name,
                album: 'تطبيق قرآني',
                artwork: [
                    { src: brandedArtworkUrl, sizes: '512x512', type: 'image/png' },
                    { src: appIconUrl, sizes: '512x512', type: 'image/png' }
                ]
            });

            // Action Handlers
            navigator.mediaSession.setActionHandler('play', () => { playerAudio.play(); });
            navigator.mediaSession.setActionHandler('pause', () => { playerAudio.pause(); });
            navigator.mediaSession.setActionHandler('previoustrack', () => { playPrev(); });
            navigator.mediaSession.setActionHandler('nexttrack', () => { playNext(); });
        } catch (error) {
            console.error('Media Session update failed:', error);
        }
    }

    function generateBrandedArtwork(imgSrc, reciterName) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            // Background gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, 512);
            gradient.addColorStop(0, '#1abc9c');
            gradient.addColorStop(1, '#16a085');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 512, 512);

            // Glow effect
            ctx.globalAlpha = 0.1;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(256, 256, 350, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // Reciter photo
            const img = new Image();
            // Use absolute URL for canvas compatibility
            img.src = new URL(imgSrc, window.location.href).href;
            img.crossOrigin = "anonymous";

            img.onload = () => {
                // Draw white circle border for photo
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 10;
                ctx.beginPath();
                ctx.arc(256, 180, 110, 0, Math.PI * 2);
                ctx.stroke();

                // Clip and Draw Photo
                ctx.save();
                ctx.beginPath();
                ctx.arc(256, 180, 105, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, 256 - 105, 180 - 105, 210, 210);
                ctx.restore();

                // App Name
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.font = '900 60px Tajawal, sans-serif';
                ctx.shadowColor = 'rgba(0,0,0,0.2)';
                ctx.shadowBlur = 15;
                ctx.fillText('قرآني', 256, 380);

                // Reciter Name
                ctx.font = '500 35px Tajawal, sans-serif';
                ctx.shadowBlur = 0;
                ctx.fillText(reciterName, 256, 440);

                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => {
                // Fallback to original image
                resolve(new URL(imgSrc, window.location.href).href);
            };
        });
    }

    function updateMediaPlaybackState(state) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = state;
        }
    }

    function togglePlay() {
        if (curIdx === -1) {
            // Default to Al-Fatihah if none selected
            playSurah(surahs[0], 0);
            return;
        }
        if (isPlaying) {
            playerAudio.pause();
        } else {
            playerAudio.play();
        }
    }

    function updatePlayBtn() {
        playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }

    function playNext() {
        if (curIdx < surahs.length - 1) {
            playSurah(surahs[curIdx + 1], curIdx + 1);
        }
    }

    function playPrev() {
        if (curIdx > 0) {
            playSurah(surahs[curIdx - 1], curIdx - 1);
        }
    }

    // Serach Logic stuff
    function normalizeArabic(text) {
        if (!text) return "";
        return text
            .replace(/[\u064B-\u0652]/g, "") // Remove diacritics
            .replace(/[أإآ]/g, "ا")         // Normalize Alef
            .replace(/ة/g, "ه")             // Normalize Teh Marbuta
            .replace(/ى/g, "ي");            // Normalize Alef Maksura
    }

    function handleSearch(query) {
        if (!query.trim()) {
            renderSurahs(surahs);
            return;
        }

        if (searchType === 'surah') {
            const normalizedQuery = normalizeArabic(query.trim().toLowerCase());
            const filtered = surahs.filter(s =>
                normalizeArabic(s.name).includes(normalizedQuery) ||
                s.englishName.toLowerCase().includes(normalizedQuery)
            );
            renderSurahs(filtered);
        } else {
            // Search debounce
            searchDebounceTimer = setTimeout(() => {
                handleAyahSearch(query);
            }, 600);
        }
    }

    async function handleAyahSearch(query) {
        if (query.length < 3) return;
        surahListEl.innerHTML = '<div class="loader">جاري البحث في الآيات...</div>';
        try {
            // Search simple text (no diacritics)
            const response = await fetch(`https://api.alquran.cloud/v1/search/${query}/all/quran-simple`);
            const data = await response.json();

            if (data.status === 'OK' && data.data.count > 0) {
                renderAyahSearchResults(data.data.matches);
            } else {
                surahListEl.innerHTML = '<p class="no-results">لم يتم العثور على نتائج في الآيات</p>';
            }
        } catch (error) {
            console.error('Error searching ayahs:', error);
            surahListEl.innerHTML = '<p class="error">حدث خطأ أثناء البحث.</p>';
        }
    }

    async function renderAyahSearchResults(matches) {
        surahListEl.innerHTML = '';
        matches.forEach((match, index) => {
            const card = document.createElement('div');
            card.className = 'surah-card ayah-result';
            card.dataset.surahNum = match.surah.number;
            card.dataset.ayahNum = match.numberInSurah;
            card.style.animationDelay = `${index * 0.05}s`;

            card.innerHTML = `
                <div class="number">${match.surah.number}</div>
                <div class="surah-info">
                    <h3>${match.surah.name} (آية ${match.numberInSurah})</h3>
                    <p class="ayah-snippet">${match.text}</p>
                </div>
                <i class="fas fa-play-circle play-icon-pulse"></i>
            `;

            card.addEventListener('click', async () => {
                const surahNum = parseInt(card.dataset.surahNum);
                const ayahNum = parseInt(card.dataset.ayahNum);
                const surah = surahs.find(s => s.number === surahNum);

                if (surah) {
                    playSurah(surah, surahs.indexOf(surah));

                    // Open viewer and scroll to ayah
                    viewerTitle.textContent = surah.name;
                    ayahContent.innerHTML = '<div class="loader">جاري تحميل الآيات...</div>';
                    ayahViewer.classList.add('active');

                    const ayahs = await fetchSurahText(surah.number);
                    if (ayahs) {
                        ayahContent.innerHTML = ayahs.map(a => `
                            <span class="ayah-txt" id="ayah-${a.numberInSurah}" data-surah="${surah.number}" data-ayah="${a.numberInSurah}">${a.text} <span class="ayah-num">(${a.numberInSurah})</span></span>
                        `).join(' ');

                        // Scroll to the specific ayah
                        const targetAyah = document.getElementById(`ayah-${ayahNum}`);
                        if (targetAyah) {
                            targetAyah.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetAyah.style.background = 'rgba(26, 188, 156, 0.2)';
                            setTimeout(() => targetAyah.style.background = 'transparent', 3000);
                        }

                        setTimeout(() => setupReadingObserver(surah.number), 500);
                    }
                }
            });

            surahListEl.appendChild(card);
        });
    }

    // scroll tracking setup
    function setupReadingObserver(surahNumber) {
        if (readingObserver) {
            readingObserver.disconnect();
        }

        readingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const ayahNum = entry.target.dataset.ayah;
                    localStorage.setItem(`quran_read_pos_${surahNumber}`, ayahNum);
                }
            });
        }, {
            root: ayahViewer, // Tracks within viewer context
            rootMargin: '-20% 0px -20% 0px', // Focus middle of viewport
            threshold: 0
        });

        // Delay observation for layout stability
        setTimeout(() => {
            document.querySelectorAll('.ayah-txt').forEach(el => {
                readingObserver.observe(el);
            });
        }, 100);
    }

    // Utils & Prefs
    function applyTheme() {
        const isDark = localStorage.getItem('theme') === 'dark';
        themeSwitch.checked = isDark;
        document.body.className = isDark ? 'dark-mode' : 'light-mode';
        updateMetaThemeColor(isDark);
    }

    function updateMetaThemeColor(isDark) {
        // Update status bar for mobile browsers
        const themeColor = isDark ? '#0f172a' : '#ffffff';
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', themeColor);
        }
    }

    function updateFavoritesUI() {
        // Refresh Favorites tab if active
        const activeTab = document.querySelector('.nav-item.active').dataset.target;
        if (activeTab === 'favorites') {
            const favSurahs = surahs.filter(s => favorites.includes(s.number));
            renderSurahs(favSurahs);
        }
    }

    function updateSalawatContent() {
        const icon = document.getElementById('salawat-icon');
        const iconContainer = document.getElementById('salawat-icon-container');
        const title = document.getElementById('salawat-title');
        const text = document.getElementById('salawat-text');
        const btn = document.getElementById('close-salawat');

        // Default Salawat reminder
        icon.className = 'fas fa-heart';
        if (iconContainer) iconContainer.style.color = ''; // Reset heart color
        title.style.color = 'var(--primary-color)';
        title.textContent = '🤍صلى على اشرف الخلق🤍';
        text.textContent = 'صلى عليه وخد حسنات وادعيلي';
        btn.textContent = 'عليه الصلاة والسلام';
    }

    function showSalawatModal() {
        updateSalawatContent();

        // Show immediately
        salawatModal.style.display = 'flex';
        setTimeout(() => {
            salawatModal.classList.add('show');
        }, 10);
    }

    function renderAthkar(category) {
        const container = document.getElementById('athkar-container');
        const data = athkarData[category];
        if (!data) return;

        container.innerHTML = data.items.map((item, index) => `
                <div class="thikr-card" style="animation-delay: ${index * 0.1}s">
                    <p class="thikr-text">${item.text}</p>
                    <div class="thikr-footer">
                        <span class="thikr-ref">${item.ref}</span>
                        <span class="thikr-counter">${item.count}</span>
                    </div>
                </div>
            `).join('');
    }

    // Salawat interval (5 min)
    setInterval(() => {
        if (salawatModal.style.display !== 'flex') {
            showSalawatModal();
        }
    }, 5 * 60 * 1000);

    // UI Events
    function setupEventListeners() {
        playBtn.addEventListener('click', togglePlay);
        nextBtn.addEventListener('click', playNext);
        prevBtn.addEventListener('click', playPrev);

        // Audio progress update
        playerAudio.addEventListener('timeupdate', (e) => {
            const { currentTime, duration } = e.target;
            const progressPercent = (currentTime / duration) * 100;
            progressFilled.style.width = `${progressPercent}%`;

            currentTimeEl.textContent = formatTime(currentTime);
            if (duration) durationEl.textContent = formatTime(duration);

            // Save state every 5s plugin
            if (Math.floor(currentTime) % 5 === 0) {
                savePlaybackState();
            }
        });

        // Sync UI with audio stat
        playerAudio.addEventListener('play', () => {
            isPlaying = true;
            updatePlayBtn();
            playerImg.classList.add('playing');
            updateMediaPlaybackState('playing');
            renderSurahs(surahs);
        });

        playerAudio.addEventListener('pause', () => {
            isPlaying = false;
            updatePlayBtn();
            playerImg.classList.remove('playing');
            updateMediaPlaybackState('paused');
            renderSurahs(surahs);
        });

        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const width = rect.width;
            const duration = playerAudio.duration;
            if (duration) {
                const direction = window.getComputedStyle(progressBar).direction;
                let clickX;
                if (direction === 'rtl') {
                    clickX = rect.right - e.clientX;
                } else {
                    clickX = e.clientX - rect.left;
                }
                clickX = Math.max(0, Math.min(clickX, width));
                playerAudio.currentTime = (clickX / width) * duration;
            }
        });

        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });

        searchTypeToggle.addEventListener('click', () => {
            searchType = searchType === 'surah' ? 'ayah' : 'surah';
            searchTypeLabel.textContent = searchType === 'surah' ? 'سورة' : 'آية';
            searchTypeToggle.classList.toggle('ayah', searchType === 'ayah');
            searchInput.placeholder = searchType === 'surah' ? 'ابحث عن سورة...' : 'ابحث عن كلمة في القرآن...';
            if (searchInput.value) handleSearch(searchInput.value);
            else if (searchType === 'surah') renderSurahs(surahs);
        });

        themeSwitch.addEventListener('change', () => {
            const isDark = themeSwitch.checked;
            document.body.className = isDark ? 'dark-mode' : 'light-mode';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateMetaThemeColor(isDark);
        });

        // Tab navigation logic
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                const target = item.dataset.target;

                const contentArea = document.getElementById('content-area');
                const aiSection = document.getElementById('ai-section');

                contentArea.style.display = 'none';
                aiSection.style.display = 'none';
                if (othersSection) othersSection.style.display = 'none';
                if (athkarView) athkarView.style.display = 'none';
                if (aboutView) aboutView.style.display = 'none';
                if (duaView) duaView.style.display = 'none';
                if (rosaryView) rosaryView.style.display = 'none';
                if (prayerView) prayerView.style.display = 'none';

                if (target === 'home' || target === 'favorites') {
                    playerBar.style.display = 'flex';
                } else {
                    playerBar.style.display = 'none';
                }

                if (target === 'ai') {
                    aiSection.style.display = 'flex';
                } else if (target === 'others') {
                    if (othersSection) othersSection.style.display = 'block';
                } else {
                    contentArea.style.display = 'block';
                    if (target === 'home') {
                        renderSurahs(surahs);
                        document.getElementById('current-category').textContent = 'السور';
                    } else if (target === 'favorites') {
                        const favSurahs = surahs.filter(s => favorites.includes(s.number));
                        renderSurahs(favSurahs);
                        document.getElementById('current-category').textContent = 'المفضلة';
                    }
                }
            });
        });

        // Sections Navigation
        document.getElementById('athkar-btn')?.addEventListener('click', () => {
            othersSection.style.display = 'none';
            athkarView.style.display = 'block';
            renderAthkar('morning');
        });

        document.getElementById('about-dev-btn')?.addEventListener('click', () => {
            othersSection.style.display = 'none';
            aboutView.style.display = 'block';
        });

        document.getElementById('dua-day-btn')?.addEventListener('click', () => {
            othersSection.style.display = 'none';
            duaView.style.display = 'block';
            duaTextEl.textContent = getDuaOfTheDay();
        });

        // Back buttons functionality
        document.getElementById('athkar-back')?.addEventListener('click', () => {
            athkarView.style.display = 'none';
            othersSection.style.display = 'block';
        });

        document.getElementById('about-back')?.addEventListener('click', () => {
            aboutView.style.display = 'none';
            othersSection.style.display = 'block';
        });

        document.getElementById('dua-back')?.addEventListener('click', () => {
            duaView.style.display = 'none';
            othersSection.style.display = 'block';
        });

        if (prayerBack) {
            prayerBack.addEventListener('click', () => {
                if (prayerView) prayerView.style.display = 'none';
                if (othersSection) othersSection.style.display = 'block';
            });
        }

        if (rosaryBack) {
            rosaryBack.addEventListener('click', () => {
                if (rosaryView) rosaryView.style.display = 'none';
                if (othersSection) othersSection.style.display = 'block';
            });
        }

        // Rosary Logic
        if (rosaryBtn) {
            rosaryBtn.addEventListener('click', () => {
                if (othersSection) othersSection.style.display = 'none';
                if (rosaryView) rosaryView.style.display = 'block';
            });
        }

        // Counters Persistence
        const rosaryCountKey = 'quran_rosary_count';
        let rosaryCount = parseInt(localStorage.getItem(rosaryCountKey)) || 0;
        if (rosaryCountEl) rosaryCountEl.textContent = rosaryCount;

        if (rosaryIncrementBtn) {
            rosaryIncrementBtn.addEventListener('click', () => {
                rosaryCount++;
                rosaryCountEl.textContent = rosaryCount;
                localStorage.setItem(rosaryCountKey, rosaryCount);
                rosaryIncrementBtn.classList.add('clicked');
                setTimeout(() => rosaryIncrementBtn.classList.remove('clicked'), 100);
                if (navigator.vibrate) navigator.vibrate(10);
            });
        }

        if (rosaryResetBtn) {
            rosaryResetBtn.addEventListener('click', () => {
                if (confirm('هل تريد تصفير العداد؟')) {
                    rosaryCount = 0;
                    rosaryCountEl.textContent = rosaryCount;
                    localStorage.setItem(rosaryCountKey, rosaryCount);
                }
            });
        }

        // Button to open the prayer timings screen
        if (prayerTimesBtn) {
            prayerTimesBtn.addEventListener('click', () => {
                if (othersSection) othersSection.style.display = 'none';
                if (prayerView) {
                    prayerView.style.display = 'block';
                    fetchPrayerTimes();
                }
            });
        }

        // Athkar category switching
        document.querySelectorAll('.athkar-categories button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.athkar-categories button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderAthkar(btn.dataset.cat);
            });
        });

        // Favorites toggle
        favBtn.addEventListener('click', () => {
            if (curIdx === -1) return;
            const surahNumber = surahs[curIdx].number;
            if (favorites.includes(surahNumber)) {
                favorites = favorites.filter(id => id !== surahNumber);
            } else {
                favorites.push(surahNumber);
            }
            localStorage.setItem('quran_favorites', JSON.stringify(favorites));
            const isFav = favorites.includes(surahNumber);
            favBtn.classList.toggle('active', isFav);
            favBtn.querySelector('i').className = isFav ? 'fas fa-heart' : 'far fa-heart';
            updateFavoritesUI();
        });

        // Ayah text viewer entry point
        showTextBtn.addEventListener('click', async () => {
            if (curIdx === -1) return;
            const surah = surahs[curIdx];
            viewerTitle.textContent = surah.name;
            ayahContent.innerHTML = '<div class="loader">جاري تحميل الآيات...</div>';
            ayahViewer.classList.add('active');
            const ayahs = await fetchSurahText(surah.number);
            if (ayahs) {
                ayahContent.innerHTML = ayahs.map(a => `<span class="ayah-txt" id="ayah-${a.numberInSurah}" data-surah="${surah.number}" data-ayah="${a.numberInSurah}">${a.text} <span class="ayah-num">(${a.numberInSurah})</span></span>`).join(' ');

                const savedPos = localStorage.getItem(`quran_read_pos_${surah.number}`);
                if (savedPos) {
                    setTimeout(() => {
                        const targetAyah = document.getElementById(`ayah-${savedPos}`);
                        if (targetAyah) {
                            targetAyah.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            targetAyah.style.background = 'rgba(26, 188, 156, 0.2)';
                            setTimeout(() => targetAyah.style.background = 'transparent', 3000);
                        }
                        setupReadingObserver(surah.number);
                    }, 50);
                } else {
                    setupReadingObserver(surah.number);
                }
            }
        });

        closeViewer.addEventListener('click', () => {
            ayahViewer.classList.remove('active');
        });

        ayahContent.addEventListener('click', (e) => {
            const ayahTxt = e.target.closest('.ayah-txt');
            if (ayahTxt) showTafsir(ayahTxt.dataset.surah, ayahTxt.dataset.ayah);
        });

        closeTafsir.addEventListener('click', () => {
            tafsirModal.style.display = 'none';
            activeTafsirSurah = null;
            activeTafsirAyah = null;
        });

        window.addEventListener('click', (e) => {
            if (e.target === tafsirModal) {
                tafsirModal.style.display = 'none';
                activeTafsirSurah = null;
                activeTafsirAyah = null;
            }
        });

        // Setting up the sleep timer so the audio stops by itself while you sleep
        sleepTimerBtn.addEventListener('click', () => {
            timerModal.style.display = 'flex';
        });

        closeTimer.addEventListener('click', () => {
            timerModal.style.display = 'none';
        });

        document.querySelectorAll('.timer-options button').forEach(btn => {
            btn.addEventListener('click', () => {
                const minutes = parseInt(btn.dataset.time);
                if (sleepTimer) clearTimeout(sleepTimer);
                if (minutes > 0) {
                    sleepTimer = setTimeout(() => {
                        playerAudio.pause();
                        isPlaying = false;
                        updatePlayBtn();
                        alert('انتهى مؤقت النوم، تم إيقاف المذياع.');
                    }, minutes * 60 * 1000);
                    sleepTimerBtn.classList.add('active');
                    sleepTimerBtn.style.color = 'var(--primary-color)';
                } else {
                    sleepTimerBtn.classList.remove('active');
                    sleepTimerBtn.style.color = 'inherit';
                }
                timerModal.style.display = 'none';
            });
        });


        // Handling the popup reminder for blessings
        closeSalawat.addEventListener('click', () => {
            salawatModal.classList.remove('show');
            setTimeout(() => { salawatModal.style.display = 'none'; }, 400);
        });

        if (tafsirEngineSelect) {
            tafsirEngineSelect.addEventListener('change', (e) => {
                currentTafsirEdition = e.target.value;
                localStorage.setItem('quran_tafsir_edition', currentTafsirEdition);
                if (activeTafsirSurah && activeTafsirAyah) {
                    showTafsir(activeTafsirSurah, activeTafsirAyah);
                }
            });
        }

        playerAudio.addEventListener('ended', playNext);
    }

    async function fetchPrayerTimes(silent = false) {
        if (!navigator.geolocation) {
            if (!silent) renderPrayerError('عذراً، المتصفح لا يدعم تحديد الموقع.');
            return;
        }

        if (!silent) {
            prayerTimesList.innerHTML = '<div class="loader">جاري تحديد الموقع وجلب المواقيت...</div>';
            prayerLocation.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحديد...';
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const date = new Date();
                const day = date.getDate();
                const month = date.getMonth() + 1;
                const year = date.getFullYear();

                const response = await fetch(`https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=5`);
                const data = await response.json();

                if (data.code === 200) {
                    displayPrayerTimes(data.data);
                } else if (!silent) {
                    renderPrayerError('حدث خطأ في جلب البيانات.');
                }
            } catch (error) {
                console.error('Error fetching prayer times:', error);
                if (!silent) renderPrayerError('تعذر الاتصال بالخادم.');
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            if (!silent) {
                let msg = 'تعذر تحديد الموقع.';
                if (error.code === 1) msg = 'يرجى السماح بتحديد الموقع لعرض المواقيت.';
                renderPrayerError(msg);
            }
        });
    }

    function displayPrayerTimes(data) {
        prayersTimings = data.timings; // Saving these so we know when to send notifications if needed
        const timings = data.timings;
        const date = data.date;

        // Refreshing the date and location info on the screen
        prayerGregorianDate.textContent = date.gregorian.date;
        prayerHijriDate.textContent = `${date.hijri.day} ${date.hijri.month.ar} ${date.hijri.year}`;
        prayerLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.meta.timezone}`;

        // We only show the main 5 prayers plus Sunrise, with clear Arabic names and icons
        const prayers = [
            { key: 'Fajr', name: 'الفجر', icon: 'fa-cloud-sun' },
            { key: 'Sunrise', name: 'الشروق', icon: 'fa-sun' },
            { key: 'Dhuhr', name: 'الظهر', icon: 'fa-sun' },
            { key: 'Asr', name: 'العصر', icon: 'fa-cloud-sun' },
            { key: 'Maghrib', name: 'المغرب', icon: 'fa-moon' },
            { key: 'Isha', name: 'العشاء', icon: 'fa-moon' }
        ];

        // Building the list of prayer times to display
        prayerTimesList.innerHTML = prayers.map(p => {
            return `
                <div class="prayer-item" id="prayer-${p.key}">
                    <div class="prayer-name"><i class="fas ${p.icon} fa-fw" style="margin-left:8px; color:var(--primary-color);"></i>${p.name}</div>
                    <div class="prayer-time">${formatTime12(timings[p.key])}</div>
                </div>
                `;
        }).join('');

        highlightNextPrayer(timings);
    }

    function formatTime12(time24) {
        const [hours, minutes] = time24.split(':');
        let h = parseInt(hours);
        const m = minutes;
        const ampm = h >= 12 ? 'م' : 'ص';
        h = h % 12;
        h = h ? h : 12; // the hour '0' should be '12'
        return `${h}:${m} ${ampm}`;
    }

    function renderPrayerError(msg) {
        prayerTimesList.innerHTML = `
                <div style="text-align:center; padding: 2rem; color: var(--text-muted);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px; color: #e74c3c;"></i>
                    <p>${msg}</p>
                    <button onclick="window.location.reload()" style="margin-top:10px; padding:5px 15px; border:none; background:var(--primary-color); color:white; border-radius:5px;">إعادة المحاولة</button>
                </div>
            `;
        prayerLocation.textContent = 'غير معروف';
    }

    function highlightNextPrayer(timings) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        let nextPrayer = null;

        for (const p of prayers) {
            const [h, m] = timings[p].split(':').map(Number);
            const prayerTime = h * 60 + m;

            if (prayerTime > currentTime) {
                nextPrayer = p;
                break;
            }
        }

        // If no next prayer found today, it means next is Fajr tomorrow
        if (!nextPrayer) nextPrayer = 'Fajr';

        const el = document.getElementById(`prayer-${nextPrayer}`);
        if (el) el.classList.add('next-prayer');
    }


    function getDuaOfTheDay() {
        if (typeof duasData === 'undefined' || duasData.length === 0) return "اللهم بارك لنا في يومنا هذا";
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const index = seed % duasData.length;
        return duasData[index];
    }

    // --- Getting detailed explanations and meanings of the verses ---
    async function showTafsir(surahNum, ayahNum) {
        activeTafsirSurah = surahNum;
        activeTafsirAyah = ayahNum;

        const surah = surahs.find(s => s.number == surahNum);
        tafsirTitle.textContent = `تفسير الآية ${ayahNum} - ${surah ? surah.name : ''}`;
        tafsirBody.innerHTML = '<div class="loader">جاري تحميل التفسير...</div>';
        tafsirModal.style.display = 'flex';

        const tafsirText = await fetchTafsir(surahNum, ayahNum);
        if (tafsirText) {
            tafsirBody.innerHTML = `<div>${tafsirText}</div>`;
        } else {
            tafsirBody.innerHTML = '<p class="error">عذراً، تعذر تحميل التفسير حالياً.</p>';
        }
    }

    async function fetchTafsir(surah, ayah) {
        try {
            const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${currentTafsirEdition}`);
            const data = await response.json();
            return data.data.text;
        } catch (error) {
            console.error('Error fetching tafsir:', error);
            return null;
        }
    }

    // --- Handy little helper functions used throughout the code ---
    function formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }

    // --- Saving and loading data locally so you don't lose progress ---
    function savePlaybackState() {
        if (curIdx === -1) return;
        const state = {
            reciterId: reciter.id,
            surahIndex: curIdx,
            currentTime: playerAudio.currentTime
        };
        localStorage.setItem('quran_last_play', JSON.stringify(state));
    }

    // --- Letting you download audio files so you can listen without internet ---
    async function checkDownloadStatus(url) {
        if (!downloadBtn) return;

        // Put the button back to its starting look before checking the status
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '<i class="fas fa-cloud-download-alt"></i>';
        downloadBtn.title = 'تحميل السورة';
        downloadBtn.onclick = null; // Remove any old click actions to avoid confusion

        try {
            const cache = await caches.open('quran-audio-v1');
            const match = await cache.match(url);

            if (match) {
                downloadBtn.classList.add('downloaded');
                downloadBtn.innerHTML = '<i class="fas fa-check"></i>';
                downloadBtn.title = 'تم التحميل (متاح بدون انترنت)';
                // If it's already on the device, clicking the button lets you delete it instead
                downloadBtn.onclick = async () => {
                    if (confirm('هل تريد حذف السورة من التحميلات؟')) {
                        await cache.delete(url);
                        checkDownloadStatus(url);
                    }
                };
            } else {
                downloadBtn.onclick = () => downloadSurah(url);
            }
        } catch (e) {
            console.error('Cache check failed:', e);
        }
    }

    async function downloadSurah(url) {
        if (!downloadBtn) return;

        // Show a spinning icon while the download is in progress
        downloadBtn.className = 'download-btn downloading';
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
            const cache = await caches.open('quran-audio-v1');

            // We'll just download the whole file and stick it in the browser's permanent stash

            await cache.add(url);

            // Refresh the button icon once everything is finished successfully
            checkDownloadStatus(url);

        } catch (error) {
            console.error('Download failed:', error);
            downloadBtn.className = 'download-btn';
            downloadBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
            downloadBtn.title = 'فشل التحميل';
            setTimeout(() => checkDownloadStatus(url), 3000);
        }
    }

    function loadLastPlayback() {
        const lastPlay = JSON.parse(localStorage.getItem('quran_last_play'));
        if (lastPlay && surahs.length > 0) {
            const r = recitersData.find(res => res.id === lastPlay.reciterId);
            if (r) {
                reciter = r;
                curIdx = lastPlay.surahIndex;
                const surah = surahs[curIdx];
                if (surah) {
                    playerSurah.textContent = surah.name;
                    playerReciter.textContent = reciter.name;
                    playerImg.src = reciter.img;

                    const formattedNumber = String(surah.number).padStart(3, '0');
                    playerAudio.src = `${reciter.server}${formattedNumber}.mp3`;

                    // Start exactly from the minute and second where you last stopped
                    playerAudio.addEventListener('loadedmetadata', () => {
                        playerAudio.currentTime = lastPlay.currentTime || 0;
                    }, { once: true });

                    // Make sure the download button and everything else matches the current track
                    checkDownloadStatus(playerAudio.src);
                    renderReciters();
                    renderSurahs(surahs);
                }
            }
        }
    }

});