// AppearDesk AI Chatbot - Added by Person 4
(function () {
  const SYSTEM_PROMPT = `You are a friendly and helpful fashion assistant for AppearDesk, a clothing website. 
You help customers with:
- Finding the right clothes, sizes, and styles
- Questions about products, fabric, and care instructions
- Order tracking, returns, and exchange policies
- Outfit suggestions and styling tips
- Any general shopping queries

Always respond in a warm, friendly, and helpful tone. Keep answers concise and practical. 
If you don't know something specific about the store's inventory, suggest the customer contact support.`;

  // Inject chatbot CSS
  const style = document.createElement("style");
  style.textContent = `
    #appeardesk-chat-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: #222;
      color: #fff;
      font-size: 26px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    #appeardesk-chat-btn:hover { background: #444; }

    #appeardesk-chat-box {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: 340px;
      max-height: 480px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      z-index: 9999;
      overflow: hidden;
      font-family: inherit;
    }
    #appeardesk-chat-header {
      background: #222;
      color: #fff;
      padding: 14px 18px;
      font-weight: 600;
      font-size: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #appeardesk-chat-header span { font-size: 12px; color: #aaa; }
    #appeardesk-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f9f9f9;
    }
    .ad-msg {
      max-width: 82%;
      padding: 9px 13px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.5;
      word-break: break-word;
    }
    .ad-msg.bot {
      background: #222;
      color: #fff;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .ad-msg.user {
      background: #e8e8e8;
      color: #222;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .ad-msg.typing { opacity: 0.6; font-style: italic; }
    #appeardesk-chat-input-row {
      display: flex;
      border-top: 1px solid #eee;
      padding: 10px;
      gap: 8px;
      background: #fff;
    }
    #appeardesk-chat-input {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 13.5px;
      outline: none;
      resize: none;
    }
    #appeardesk-chat-input:focus { border-color: #222; }
    #appeardesk-chat-send {
      background: #222;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: background 0.2s;
    }
    #appeardesk-chat-send:hover { background: #444; }
    #appeardesk-chat-send:disabled { background: #aaa; cursor: not-allowed; }
  `;
  document.head.appendChild(style);

  // Create chat button
  const btn = document.createElement("button");
  btn.id = "appeardesk-chat-btn";
  btn.innerHTML = "💬";
  btn.title = "Chat with us!";
  document.body.appendChild(btn);

  // Create chat box (hidden initially)
  const box = document.createElement("div");
  box.id = "appeardesk-chat-box";
  box.style.display = "none";
  box.innerHTML = `
    <div id="appeardesk-chat-header">
      👗 AppearDesk Assistant
      <span>Online</span>
    </div>
    <div id="appeardesk-chat-messages"></div>
    <div id="appeardesk-chat-input-row">
      <textarea id="appeardesk-chat-input" rows="1" placeholder="Ask me anything about fashion..."></textarea>
      <button id="appeardesk-chat-send">Send</button>
    </div>
  `;
  document.body.appendChild(box);

  // State
  let isOpen = false;
  let conversationHistory = [];
  const messagesDiv = document.getElementById("appeardesk-chat-messages");
  const input = document.getElementById("appeardesk-chat-input");
  const sendBtn = document.getElementById("appeardesk-chat-send");

  // Toggle chat
  btn.addEventListener("click", () => {
    isOpen = !isOpen;
    box.style.display = isOpen ? "flex" : "none";
    btn.innerHTML = isOpen ? "✕" : "💬";
    if (isOpen && messagesDiv.children.length === 0) {
      addMessage("bot", "👋 Hi! I'm your AppearDesk fashion assistant. How can I help you today?");
    }
  });

  // Add message to UI
  function addMessage(role, text) {
    const msg = document.createElement("div");
    msg.className = `ad-msg ${role}`;
    msg.textContent = text;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return msg;
  }

  // Send message to Groq API
  async function sendMessage() {
    const userText = input.value.trim();
    if (!userText) return;

    addMessage("user", userText);
    conversationHistory.push({ role: "user", content: userText });
    input.value = "";
    sendBtn.disabled = true;

    const typingMsg = addMessage("bot", "Typing...");
    typingMsg.classList.add("typing");

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (window.GROQ_API_KEY || "")
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 400,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversationHistory
          ]
        })
      });

      const data = await response.json();
      typingMsg.remove();

      if (data.choices && data.choices[0]) {
        const reply = data.choices[0].message.content;
        addMessage("bot", reply);
        conversationHistory.push({ role: "assistant", content: reply });
      } else {
        addMessage("bot", "Sorry, I could not get a response. Please try again!");
      }
    } catch (err) {
      typingMsg.remove();
      addMessage("bot", "Oops! Something went wrong. Please check your connection.");
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  // Send on button click
  sendBtn.addEventListener("click", sendMessage);

  // Send on Enter key (Shift+Enter for new line)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
