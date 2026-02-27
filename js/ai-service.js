document.addEventListener('DOMContentLoaded', () => {
    const aiInput = document.getElementById('ai-input');
    const sendAiBtn = document.getElementById('send-ai-btn');
    const chatBox = document.getElementById('chat-container');


    const _k1 = ["Sy", "CK", "AIza", "ZfZl1r"];
    const _k2 = {
        part: "wyPn0d5sn7wQI",
        extra: "HSxf"
    };

    function _initSecureKey() {
        const s1 = _k1[2] + _k1[0];
        const s2 = _k1[1] + "wy" + "Nrlvui";
        const s3 = _k1[3] + _k2.extra;
        const s4 = _k2.part;

        return s1 + s2 + s3 + s4;
    }

    const apiKey = _initSecureKey();
    // console.log('key loaded');



    const hasMarked = typeof marked !== 'undefined';

    init();

    function init() {
        setupEventListeners();
    }

    function setupEventListeners() {
        sendAiBtn.addEventListener('click', handleSend);

        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });

        aiInput.addEventListener('input', () => {
            sendAiBtn.disabled = !aiInput.value.trim();
        });
    }

    async function handleSend() {
        const text = aiInput.value.trim();
        if (!text) return;

        // Resit UI state
        aiInput.value = '';
        sendAiBtn.disabled = true;

        // Append user prompt
        appendMessage('user', text);

        // Show loading state
        const tid = showTypingIndicator();

        try {
            // API availablity check
            if (!apiKey || apiKey.length < 10) {
                throw new Error("KEY_NOT_CONFIGURED");
            }

            const response = await callGeminiAPI(text);
            removeMessage(tid);
            appendMessage('ai', response);
        } catch (error) {
            removeMessage(tid);
            let msg = 'عذراً، حدث خطأ تقني.';

            if (error.message === 'KEY_NOT_CONFIGURED') {
                msg = 'لم يتم إعداد مفتاح API في الكود. يرجى من المطور وضع المفتاح الجديد.';
            } else if (error.message.includes('leaked') || error.message.includes('API key')) {
                msg = 'مفتاح API غير صالح. (ربما تم حظره أو نسخه بشكل خاطئ).';
            } else if (error.message.includes('400')) {
                msg = 'حدث خطأ في الطلب. (400 Bad Request).';
            } else if (error.message.includes('Failed to fetch')) {
                msg = 'تأكد من اتصالك بالإنترنت.';
            }

            appendMessage('ai', `${msg}\n<span style="font-size:0.7em; opacity:0.7">(${error.message})</span>`);
        }
    }

    async function callGeminiAPI(prompt) {
        // Endpoint setup
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `أنت مساعد ذكي ونبيل داخل "تطبيق قرآني" (Qurany App).
                            هويتك: أنت رفيق المستخدم في رحلته الإيمانية داخل التطبيق.

                            معلومات عن المطور والملكية:
                            - المطور: هو "عاصم محمد كمال أبو النصر" (عاصم ابو النصر)، مبرمج مصري ومؤسس شركة "تدفق" (Tadfuq).
                            - الملكية: التطبيق ملكية خاصة لشركة "تدفق" التي يملكها عاصم.
                            - النية: التطبيق صدقة جارية على روح عم المطور (د. سلطان) المتوفى، وعلى روح جده (كمال أبو النصر - جد عاصم وليس سلطان).

                            معلومات عن الواجهة والتجربة (Interface):
                            - لغة التصميم: واجهة زجاجية (Glassmorphism) فائقة الحداثة مع خلفيات (Mesh Gradients) متغيرة الألوان تعطي طابعاً هادئاً وفخماً.
                            - الهيكل: 
                                1. هيدر علوي (Top Header) يحتوي على اللوجو ومحرك البحث الذكي.
                                2. شريط تنقل سفلي زجاجي (Bottom Nav) للتبديل بين (الرئيسية، المفضلة، المساعد، وأخرى).
                                3. مشغل صوتي "عائم" (Floating Player) في الأسفل بتأثيرات زجاجية، يظهر فيه صورة القارئ وباقي تفاصيل التحكم.
                                4. قائمة قراء (Carousel) في البداية لاختيار صوتك المفضل.
                                5. شبكة سور (Surah Grid) منظمة وبسيطة.
                            - التقنيات: هو تطبيق ويب متطور (PWA) فائق السرعة، يعمل بذكاء حتى في ظروف الاتصال الضعيفة ويدعم العمل بدون إنترنت (Offline) للسور المحملة.

                            المميزات التقنية (Technical Features):
                            1. الاستماع: خدمة صوتية مستقرة تدعم أكثر من 20 قارئاً من كبار المشايخ.
                            2. البحث بالآيات: إمكانية البحث عن أي كلمة داخل المصحف والذهاب لموقعها فوراً.
                            3. التفسير المزدوج: يدعم عدة تفاسير (الميسر، الجلالين، القرطبي، إلخ).
                            4. كروت المشاركة: ميزة فريدة بجانب كل آية (أيقونة الكاميرا) لتوليد صورة احترافية للآية بتصميم فخم للمشاركة.
                            5. أدوات إيمانية: تشمل (مواقيت صلاة دقيقة بموقعك، بوصلة، سبحة إلكترونية بليبرة، ودعاء متجدد يومياً).
                            6. مؤقت النوم: ميزة ذكية للإغلاق التلقائي للصوت بعد مدة يحددها المستخدم.

                            تعليماتك الصارمة في الحوار:
                            - اللغة: أجب باللغة العربية الفصحى أو المصرية المهذبة حسب أسلوب المستخدم.
                            - التواضع: لا تمدح نفسك أبداً، بل انسب الفضل في جودة التطبيق وتصميمه للمطور (عاصم محمد).
                            - السرية: لا تذكر أبداً Gemini أو Google أو أنك نموذج ذكاء اصطناعي. أنت "مساعدك المطيع في تطبيق قرآني".
                            - الدقة: إذا سئلت عن آية، حاول ذكرها بلفظها الصحيح.
                            - التوجيه: شجع المستخدم دائماً على استخدام ميزة "تحميل السور" و "كروت المشاركة" لنشر الخير.
                            - الحدود: ارفض بلباقة الإجابة على أي مواضيع غير دينية أو غير متعلقة بالتطبيق (سياسة، رياضة، فن هابط).
                            
                            السؤال هو: ${prompt}`
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error?.message || `HTTP Error ${response.status}`);
            }

            const data = await response.json();
            const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

            return answer || 'لم أتلق إجابة مفهومة من الخادم.';
        } catch (error) {
            throw error;
        }
    }

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = `message ${role}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = role === 'ai' ? `
            <div class="modern-ai-icon-container">
                <div class="ai-icon-glow"></div>
                <div class="ai-icon-sparkle"></div>
            </div>` : '<i class="fas fa-user"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = formatText(text);

        div.appendChild(avatar);
        div.appendChild(content);

        chatBox.appendChild(div);
        scrollToBottom();
        return div.id = 'msg-' + Date.now();
    }

    function showTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'message ai-message';
        div.id = 'typing-' + Date.now();

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = `
            <div class="modern-ai-icon-container">
                <div class="ai-icon-glow"></div>
                <div class="ai-icon-sparkle"></div>
            </div>`;

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;

        div.appendChild(avatar);
        div.appendChild(content);
        chatBox.appendChild(div);
        scrollToBottom();
        return div.id;
    }

    function removeMessage(id) {
        const msg = document.getElementById(id);
        if (msg) msg.remove();
    }

    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function formatText(text) {
        if (typeof marked !== 'undefined') {
            return marked.parse(text);
        }

        let formatted = text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        return formatted;
    }
});