document.addEventListener('DOMContentLoaded', () => {
    const messagesContainer = document.querySelector('.chat-messages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    let chatHistory = [{
        role: 'model',
        text: '一律以繁體中文回答'
    }];

    if (!messagesContainer || !userInput || !sendButton) {
        console.error('聊天介面的某些元素未找到');
        return;
    }

    // 思考中的可愛提示訊息陣列
    const thinkingMessages = [
        '(｡ŏ﹏ŏ) 思考中...',
        '(◕‿◕✿) 正在探索...',
        '(・∀・) 處理中...',
        '(｀･ω･´)ゞ 讓我想想...',
        '(◠‿◠✿) 腦袋運轉中...',
        '(＾▽＾) 靈感來了...',
        '(￣▽￣) 正在組織語言...',
        '(*´･д･)ﾉ 等我一下下...',
        '(｡♥‿♥｡) 認真思考中...',
        '(◕ᴗ◕✿) 讓我幫你找找...'
    ];

    // 顯示思考中訊息
    function showThinkingMessage() {
        const randomIndex = Math.floor(Math.random() * thinkingMessages.length);
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'message assistant thinking';
        thinkingDiv.textContent = thinkingMessages[randomIndex];
        messagesContainer.appendChild(thinkingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return thinkingDiv;
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // 添加使用者訊息到聊天界面
        appendMessage('user', text);
        userInput.value = '';

        // 添加使用者訊息到歷史記錄
        chatHistory.push({
            role: 'user',
            text: text
        });

        // 顯示思考中訊息
        const thinkingMessage = showThinkingMessage();

        try {
            // 發送請求到 Gemini API
            const response = await fetch('http://localhost:5252/api/Gemini/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: chatHistory })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            
            // 移除思考中訊息
            thinkingMessage.remove();
            
            // 將回應轉換為 Markdown 並添加到聊天界面
            appendMessage('assistant', marked.parse(data.result));

            // 添加助手回應到歷史記錄
            chatHistory.push({
                role: 'model',
                text: data.result
            });
        } catch (error) {
            thinkingMessage.remove();
            console.error('Error:', error);
            appendMessage('assistant', '抱歉，發生了一些錯誤。請稍後再試。');
        }
    }

    function appendMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.innerHTML = content;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // 發送按鈕點擊事件
    sendButton.addEventListener('click', sendMessage);

    // 按下 Enter 鍵發送訊息（Shift + Enter 換行）
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 自定義 AI 相關功能
    const customAIButton = document.getElementById('customAIButton');
    const aiSettingsModal = document.getElementById('aiSettingsModal');
    const aiSettings = document.getElementById('aiSettings');
    const saveSettings = document.getElementById('saveSettings');
    const cancelSettings = document.getElementById('cancelSettings');
    const modalCloseButtons = aiSettingsModal.querySelectorAll('.close');

    // 打開設定對話框
    customAIButton.addEventListener('click', () => {
        if (chatHistory.length > 1 && chatHistory[1].role === 'model' && 
            chatHistory[1].text.startsWith('我一定會根據你的設定回答')) {
            const currentSetting = chatHistory[1].text.replace('我一定會根據你的設定回答 ', '');
            aiSettings.value = currentSetting;
        }
        aiSettingsModal.style.display = 'block';
    });

    // 關閉設定對話框
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            aiSettingsModal.style.display = 'none';
        });
    });

    // 點擊對話框外部關閉
    aiSettingsModal.addEventListener('click', (e) => {
        if (e.target === aiSettingsModal) {
            aiSettingsModal.style.display = 'none';
        }
    });

    // 保存設定
    saveSettings.addEventListener('click', () => {
        const settingText = aiSettings.value.trim();
        
        if (chatHistory.length > 1 && chatHistory[1].role === 'model' && 
            chatHistory[1].text.startsWith('我一定會根據你的設定回答')) {
            chatHistory.splice(1, 1);
        }
        
        if (settingText) {
            chatHistory.splice(1, 0, {
                role: 'model',
                text: `我一定會根據你的設定回答 ${settingText}`
            });

            const updateNotice = document.createElement('div');
            updateNotice.className = 'message assistant update-notice';
            updateNotice.textContent = '---已更新自訂義---';
            messagesContainer.appendChild(updateNotice);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        aiSettingsModal.style.display = 'none';
    });

    // 取消設定
    cancelSettings.addEventListener('click', () => {
        aiSettingsModal.style.display = 'none';
    });
});