document.addEventListener('DOMContentLoaded', () => {
    const aiInput = document.getElementById('ai-input');
    const sendAiBtn = document.getElementById('send-ai-btn');
    const chatContainer = document.getElementById('chat-container');


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

        // Clear the box and stop people from clicking twice while we wait
        aiInput.value = '';
        sendAiBtn.disabled = true;

        // Put the user's message on the screen
        appendMessage('user', text);

        // Show those three little dots to show we're thinking
        const loadingId = showTypingIndicator();

        try {
            // Check if we even have a key to talk to the AI
            if (!apiKey || apiKey.length < 10) {
                throw new Error("KEY_NOT_CONFIGURED");
            }

            const response = await callGeminiAPI(text);
            removeMessage(loadingId);
            appendMessage('ai', response);
        } catch (error) {
            removeMessage(loadingId);
            let errorMsg = 'عذراً، حدث خطأ تقني.';

            if (error.message === 'KEY_NOT_CONFIGURED') {
                errorMsg = 'لم يتم إعداد مفتاح API في الكود. يرجى من المطور وضع المفتاح الجديد.';
            } else if (error.message.includes('leaked') || error.message.includes('API key')) {
                errorMsg = 'مفتاح API غير صالح. (ربما تم حظره أو نسخه بشكل خاطئ).';
            } else if (error.message.includes('400')) {
                errorMsg = 'حدث خطأ في الطلب. (400 Bad Request).';
            } else if (error.message.includes('Failed to fetch')) {
                errorMsg = 'تأكد من اتصالك بالإنترنت.';
            }

            appendMessage('ai', `${errorMsg}\n<span style="font-size:0.7em; opacity:0.7">(${error.message})</span>`);
        }
    }

    async function callGeminiAPI(prompt) {
        // This is the direct line to Google's AI server
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
                            text: `أنت مساعد ذكي إسلامي في تطبيق للقرآن الكريم.
                            تعليماتك الصارمة هي:
                            1. أجب عن الأسئلة الدينية والإسلامية والقرآنية فقط. ارفض الإجابة بلطف على أي موضوع آخر (مثل الرياضة، التكنولوجيا، السياسة، الخ) وقل أنك متخصص في الدين فقط.
                            2. تحر الدقة المعلوماتية الكاملة. لا تذكر أي معلومة غير صحيحة أو غير مؤكدة.
                            3. أجب باللغة العربية فقط.
                            4. اجعل الرد نصياً بسيطاً وواضحاً (Text Only) دون تنسيقات معقدة.
                            
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
        avatar.innerHTML = role === 'ai' ? '<i class="fas fa-wand-magic-sparkles"></i>' : '<i class="fas fa-user"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = formatText(text);

        div.appendChild(avatar);
        div.appendChild(content);

        chatContainer.appendChild(div);
        scrollToBottom();
        return div.id = 'msg-' + Date.now();
    }

    function showTypingIndicator() {
        const div = document.createElement('div');
        div.className = 'message ai-message';
        div.id = 'typing-' + Date.now();

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i>';

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
        chatContainer.appendChild(div);
        scrollToBottom();
        return div.id;
    }

    function removeMessage(id) {
        const msg = document.getElementById(id);
        if (msg) msg.remove();
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
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