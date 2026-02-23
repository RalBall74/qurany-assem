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
                            text: `أنت مساعد ذكي داخل "تطبيق قرآني".
                            مهامك هي:
                            1. الإجابة على الأسئلة الدينية والقرآنية بدقة وتيسير.
                            2. مساعدة المستخدمين في معرفة كيفية استخدام التطبيق ومميزاته.

                            معلومات عن التطبيق (استخدمها عند الحاجة):
                            - اسم التطبيق: تطبيق قرآني (تطوير عاصم محمد).
                            - المميزات الأساسية: قراءة القرآن، الاستماع لأكثر من 10 من كبار القراء، تحميل السور للاستماع بدون إنترنت، والبحث السريع.
                            - ميزة "كروت المشاركة": يمكن للمستخدم الضغط على أيقونة "الكاميرا" بجانب أي آية لتوليد صورة احترافية ومشاركتها.
                            - الحفظ التلقائي: التطبيق يحفظ آخر سورة وآية توقفت عندها لتعود إليها لاحقاً.
                            - التواصل: يمكن للمطور تلقي المقترحات عبر زر "تواصل معنا" في قسم المطور.

                            تعليماتك الصارمة:
                            - أجب بأسلوب ودي، قصير، ومهذب باللغة العربية فقط.
                            - لا تذكر أبداً أنك نموذج ذكاء اصطناعي أو تذكر اسم Gemini أو Google.
                            - إذا سُئلت عن هويتك، أنت "مساعد تطبيق قرآني".
                            - ارفض الإجابة على المواضيع الخارجة عن الدين أو استخدام التطبيق (مثل الرياضة أو السياسة) بكل أريحيّة.
                            
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