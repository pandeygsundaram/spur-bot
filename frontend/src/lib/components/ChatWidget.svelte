<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { sendMessage, getConversationHistory, APIError } from '../api';
  import type { Message } from '../types';
  import ChatMessage from './ChatMessage.svelte';
  import TypingIndicator from './TypingIndicator.svelte';

  let messages: Message[] = [];
  let inputMessage = '';
  let sessionId: string | undefined;
  let isLoading = false;
  let error: string | null = null;
  let isRateLimited = false;
  let rateLimitRetryAfter: number | null = null;
  let messagesContainer: HTMLDivElement;

  const SESSION_KEY = 'spur_chat_session';

  onMount(async () => {
    const savedSessionId = localStorage.getItem(SESSION_KEY);
    if (savedSessionId) {
      try {
        const history = await getConversationHistory(savedSessionId);
        sessionId = savedSessionId;
        messages = history.messages;
        await scrollToBottom();
      } catch (err) {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  });

  async function scrollToBottom() {
    await tick();
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  async function handleSend() {
    const trimmedMessage = inputMessage.trim();

    if (!trimmedMessage) {
      return;
    }

    if (trimmedMessage.length > 2000) {
      error = 'Message is too long. Please keep it under 2000 characters.';
      return;
    }

    error = null;
    isLoading = true;

    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: sessionId || '',
      sender: 'user',
      text: trimmedMessage,
      created_at: new Date().toISOString(),
    };

    messages = [...messages, tempUserMessage];
    inputMessage = '';
    await scrollToBottom();

    try {
      const response = await sendMessage({
        message: trimmedMessage,
        sessionId,
      });

      if (!sessionId) {
        sessionId = response.sessionId;
        localStorage.setItem(SESSION_KEY, response.sessionId);
      }

      const history = await getConversationHistory(response.sessionId);
      messages = history.messages;

      await scrollToBottom();
    } catch (err) {
      messages = messages.filter((m) => m.id !== tempUserMessage.id);

      if (err instanceof APIError) {
        // Check if it's a rate limit error (429)
        if (err.status === 429) {
          isRateLimited = true;
          error = err.message;

          // Disable sending for 60 seconds (1 minute)
          rateLimitRetryAfter = 60;
          const interval = setInterval(() => {
            if (rateLimitRetryAfter && rateLimitRetryAfter > 0) {
              rateLimitRetryAfter--;
            } else {
              isRateLimited = false;
              rateLimitRetryAfter = null;
              clearInterval(interval);
            }
          }, 1000);
        } else {
          error = err.message;
        }
      } else {
        error = 'An unexpected error occurred. Please try again.';
      }
    } finally {
      isLoading = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function clearError() {
    error = null;
    // Don't clear rate limit status, it needs to countdown
  }

  function startNewConversation() {
    messages = [];
    sessionId = undefined;
    localStorage.removeItem(SESSION_KEY);
    error = null;
  }

  async function handleQuickQuestion(question: string) {
    inputMessage = question;
    await handleSend();
  }
</script>

<div class="chat-widget">
  <div class="chat-header">
    <div class="header-content">
      <h2>Customer Support</h2>
      <p class="header-subtitle">We're here to help!</p>
    </div>
    {#if messages.length > 0}
      <button class="new-chat-btn" on:click={startNewConversation} title="Start new conversation">
        New Chat
      </button>
    {/if}
  </div>

  <div class="messages-container" bind:this={messagesContainer}>
    {#if messages.length === 0 && !isLoading}
      <div class="welcome-message">
        <h3>Welcome to Spur Store Support!</h3>
        <p>Ask me anything about:</p>
        <div class="quick-questions">
          <button
            class="quick-question-btn"
            on:click={() => handleQuickQuestion('What are your shipping options and delivery times?')}
          >
            <span class="icon">📦</span>
            <div class="question-content">
              <span class="title">Shipping & Delivery</span>
              <span class="subtitle">Free shipping, delivery times, tracking</span>
            </div>
          </button>

          <button
            class="quick-question-btn"
            on:click={() => handleQuickQuestion('What is your return and refund policy?')}
          >
            <span class="icon">↩️</span>
            <div class="question-content">
              <span class="title">Returns & Refunds</span>
              <span class="subtitle">30-day returns, refund process</span>
            </div>
          </button>

          <button
            class="quick-question-btn"
            on:click={() => handleQuickQuestion('What payment methods do you accept?')}
          >
            <span class="icon">💳</span>
            <div class="question-content">
              <span class="title">Payment Methods</span>
              <span class="subtitle">Cards, PayPal, Apple Pay</span>
            </div>
          </button>

          <button
            class="quick-question-btn"
            on:click={() => handleQuickQuestion('What are your customer support hours?')}
          >
            <span class="icon">🕐</span>
            <div class="question-content">
              <span class="title">Support Hours</span>
              <span class="subtitle">When we're available to help</span>
            </div>
          </button>
        </div>
        <p class="welcome-subtitle">Or type your own question below</p>
      </div>
    {/if}

    {#each messages as message (message.id)}
      <ChatMessage {message} />
    {/each}

    {#if isLoading}
      <TypingIndicator />
    {/if}
  </div>

  {#if error}
    <div class="error-banner" class:rate-limit={isRateLimited}>
      <div class="error-content">
        <span>{error}</span>
        {#if isRateLimited && rateLimitRetryAfter}
          <div class="rate-limit-countdown">
            Please wait {rateLimitRetryAfter} seconds before sending another message.
          </div>
        {/if}
      </div>
      {#if !isRateLimited}
        <button class="error-close" on:click={clearError}>×</button>
      {/if}
    </div>
  {/if}

  <div class="input-container">
    <textarea
      bind:value={inputMessage}
      on:keypress={handleKeyPress}
      placeholder="Type your message..."
      disabled={isLoading}
      rows="1"
      maxlength="2000"
    ></textarea>
    <button on:click={handleSend} disabled={isLoading || !inputMessage.trim() || isRateLimited} class="send-btn">
      {#if isLoading}
        <span class="loader"></span>
      {:else if isRateLimited && rateLimitRetryAfter}
        Wait {rateLimitRetryAfter}s
      {:else}
        Send
      {/if}
    </button>
  </div>
</div>

<style>
  .chat-widget {
    display: flex;
    flex-direction: column;
    height: 600px;
    max-width: 800px;
    margin: 0 auto;
    background: rgba(20, 20, 20, 0.95);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  .chat-header {
    background: linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(20, 20, 20, 0.95) 100%);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    color: white;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .header-content h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
    background: linear-gradient(135deg, #FDB813 0%, #F5C519 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header-subtitle {
    margin: 6px 0 0 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  .new-chat-btn {
    background: rgba(253, 184, 19, 0.1);
    color: #FDB813;
    border: 1px solid rgba(253, 184, 19, 0.3);
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .new-chat-btn:hover {
    background: rgba(253, 184, 19, 0.2);
    border-color: #FDB813;
    box-shadow: 0 0 16px rgba(253, 184, 19, 0.3);
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    background: rgba(15, 15, 15, 0.8);
  }

  .messages-container::-webkit-scrollbar {
    width: 8px;
  }

  .messages-container::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .messages-container::-webkit-scrollbar-thumb {
    background: rgba(253, 184, 19, 0.3);
    border-radius: 4px;
  }

  .messages-container::-webkit-scrollbar-thumb:hover {
    background: rgba(253, 184, 19, 0.5);
  }

  .welcome-message {
    text-align: center;
    padding: 60px 24px;
    color: rgba(255, 255, 255, 0.6);
  }

  .welcome-message h3 {
    color: white;
    margin-bottom: 24px;
    font-size: 24px;
    font-weight: 600;
  }

  .quick-questions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin: 24px 0;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
  }

  .quick-question-btn {
    background: rgba(253, 184, 19, 0.1);
    border: 1px solid rgba(253, 184, 19, 0.2);
    border-radius: 12px;
    padding: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;
  }

  .quick-question-btn:hover {
    background: rgba(253, 184, 19, 0.2);
    border-color: rgba(253, 184, 19, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(253, 184, 19, 0.2);
  }

  .quick-question-btn:active {
    transform: translateY(0);
  }

  .quick-question-btn .icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .question-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .question-content .title {
    font-weight: 600;
    color: #FDB813;
    font-size: 14px;
  }

  .question-content .subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.4;
  }

  @media (max-width: 640px) {
    .quick-questions {
      grid-template-columns: 1fr;
    }
  }

  .welcome-subtitle {
    margin-top: 32px;
    font-size: 14px;
    font-style: italic;
    color: rgba(255, 255, 255, 0.5);
  }

  .error-banner {
    background: rgba(220, 38, 38, 0.15);
    color: #fca5a5;
    padding: 14px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(220, 38, 38, 0.3);
    animation: slideDown 0.3s ease-out;
  }

  .error-banner.rate-limit {
    background: rgba(253, 184, 19, 0.15);
    color: #FDB813;
    border-top: 1px solid rgba(253, 184, 19, 0.3);
  }

  .error-content {
    flex: 1;
  }

  .rate-limit-countdown {
    margin-top: 6px;
    font-size: 13px;
    font-weight: 600;
    opacity: 0.9;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .error-close {
    background: none;
    border: none;
    color: #fca5a5;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    line-height: 1;
    transition: color 0.2s;
  }

  .error-close:hover {
    color: #ef4444;
  }

  .input-container {
    display: flex;
    gap: 12px;
    padding: 20px;
    background: rgba(20, 20, 20, 0.95);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  textarea {
    flex: 1;
    padding: 14px 16px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: white;
    font-family: inherit;
    font-size: 14px;
    resize: none;
    min-height: 48px;
    max-height: 120px;
    transition: all 0.3s ease;
  }

  textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  textarea:focus {
    outline: none;
    border-color: rgba(253, 184, 19, 0.5);
    background: rgba(30, 30, 30, 0.9);
    box-shadow: 0 0 0 3px rgba(253, 184, 19, 0.1);
  }

  textarea:disabled {
    background: rgba(20, 20, 20, 0.6);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .send-btn {
    background: linear-gradient(135deg, #FDB813 0%, #F5C519 100%);
    color: #0a0a0a;
    border: none;
    padding: 14px 28px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 600;
    transition: all 0.3s ease;
    min-width: 90px;
    box-shadow: 0 4px 12px rgba(253, 184, 19, 0.3);
  }

  .send-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(253, 184, 19, 0.4);
  }

  .send-btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .send-btn:disabled {
    background: rgba(60, 60, 60, 0.5);
    color: rgba(255, 255, 255, 0.3);
    cursor: not-allowed;
    box-shadow: none;
  }

  .loader {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(10, 10, 10, 0.3);
    border-top-color: #0a0a0a;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 768px) {
    .chat-widget {
      height: 100vh;
      max-width: 100%;
      border-radius: 0;
      border: none;
    }
  }
</style>
