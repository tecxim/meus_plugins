(function() {
    // 1. Configurações Iniciais
    const container = document.getElementById('wac-chat-container');
    if (!container) return;
    const lojaId = container.getAttribute('data-loja') || 'loja_joao';
    let chatHistory = [];

    // 2. Injetar CSS do Chat (Para não quebrar o site do cliente)
    const style = document.createElement('style');
    style.innerHTML = `
        #wac-wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 9999; font-family: sans-serif; }
        #wac-button { width: 60px; height: 60px; background: #4f46e5; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; shadow: 0 4px 12px rgba(0,0,0,0.1); }
        #wac-window { display: none; width: 350px; height: 500px; background: white; border-radius: 12px; flex-direction: column; box-shadow: 0 8px 24px rgba(0,0,0,0.2); margin-bottom: 20px; overflow: hidden; }
        #wac-header { background: #4f46e5; color: white; padding: 15px; font-weight: bold; }
        #wac-messages { flex: 1; padding: 15px; overflow-y: auto; background: #f8fafc; font-size: 14px; }
        #wac-input-area { padding: 10px; border-top: 1px solid #e2e8f0; display: flex; }
        #wac-input { flex: 1; border: 1px solid #cbd5e1; padding: 8px; border-radius: 6px; outline: none; }
        .wac-msg { margin-bottom: 10px; padding: 8px 12px; border-radius: 8px; max-width: 80%; }
        .wac-user { background: #4f46e5; color: white; align-self: flex-end; margin-left: auto; }
        .wac-bot { background: #e2e8f0; color: #1e293b; align-self: flex-start; }
    `;
    document.head.appendChild(style);

    // 3. Criar Estrutura HTML
    const wrapper = document.createElement('div');
    wrapper.id = 'wac-wrapper';
    wrapper.innerHTML = `
        <div id="wac-window">
            <div id="wac-header">Atendimento WAC Shield</div>
            <div id="wac-messages" style="display: flex; flex-direction: column;"></div>
            <div id="wac-input-area">
                <input type="text" id="wac-input" placeholder="Digite sua dúvida...">
                <button id="wac-send" style="margin-left:5px; background:#4f46e5; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;">➤</button>
            </div>
        </div>
        <div id="wac-button">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
    `;
    document.body.appendChild(wrapper);

    // 4. Lógica de Interação
    const btn = document.getElementById('wac-button');
    const win = document.getElementById('wac-window');
    const input = document.getElementById('wac-input');
    const send = document.getElementById('wac-send');
    const box = document.getElementById('wac-messages');

    btn.onclick = () => win.style.display = win.style.display === 'flex' ? 'none' : 'flex';

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMsg(text, 'user');
        input.value = '';

        try {
            const res = await fetch('https://wac-ai-backend.suportewrsystems.workers.dev/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: text, 
                    clienteId: lojaId, 
                    history: chatHistory.slice(-4) 
                })
            });
            const data = await res.json();
            if (data.history) chatHistory = data.history;
            addMsg(data.resposta, 'bot');
        } catch (e) {
            addMsg("Erro na conexão.", "bot");
        }
    }

    function addMsg(text, type) {
        const m = document.createElement('div');
        m.className = `wac-msg wac-${type}`;
        m.innerHTML = text;
        box.appendChild(m);
        box.scrollTop = box.scrollHeight;
    }

    send.onclick = sendMessage;
    input.onkeypress = (e) => e.key === 'Enter' && sendMessage();
})();
