<script lang="ts">
  import type { Message } from '../types';

  export let message: Message;

  $: isUser = message.sender === 'user';
  $: timestamp = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
</script>

<div class="message {isUser ? 'user' : 'ai'}">
  <div class="message-content">
    <div class="message-header">
      <span class="sender">{isUser ? 'You' : 'Support Agent'}</span>
      <span class="timestamp">{timestamp}</span>
    </div>
    <div class="text">{message.text}</div>
  </div>
</div>

<style>
  .message {
    display: flex;
    margin-bottom: 20px;
    animation: slideIn 0.4s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message.user {
    justify-content: flex-end;
  }

  .message.ai {
    justify-content: flex-start;
  }

  .message-content {
    max-width: 70%;
    padding: 14px 18px;
    border-radius: 14px;
    backdrop-filter: blur(10px);
  }

  .message.user .message-content {
    background: linear-gradient(135deg, rgba(253, 184, 19, 0.2) 0%, rgba(245, 197, 25, 0.25) 100%);
    border: 1px solid rgba(253, 184, 19, 0.3);
    color: white;
    border-bottom-right-radius: 4px;
    box-shadow: 0 4px 12px rgba(253, 184, 19, 0.15);
  }

  .message.ai .message-content {
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 12px;
    opacity: 0.7;
  }

  .message.user .message-header {
    color: rgba(253, 184, 19, 1);
  }

  .message.ai .message-header {
    color: rgba(255, 255, 255, 0.6);
  }

  .sender {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 11px;
  }

  .timestamp {
    font-size: 10px;
    opacity: 0.8;
  }

  .text {
    line-height: 1.6;
    word-wrap: break-word;
    white-space: pre-wrap;
  }

  @media (max-width: 640px) {
    .message-content {
      max-width: 85%;
    }
  }
</style>
