<div class="typing-indicator">
  <div class="typing-content">
    <span class="sender">Support Agent</span>
    <div class="dots">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</div>

<style>
  .typing-indicator {
    display: flex;
    margin-bottom: 20px;
    justify-content: flex-start;
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .typing-content {
    max-width: 70%;
    padding: 14px 18px;
    border-radius: 14px;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
  }

  .sender {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .dots {
    display: flex;
    gap: 6px;
    margin-top: 10px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #FDB813 0%, #F5C519 100%);
    animation: pulse 1.4s infinite;
    box-shadow: 0 0 8px rgba(253, 184, 19, 0.4);
  }

  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes pulse {
    0%, 60%, 100% {
      opacity: 0.3;
      transform: scale(0.8);
    }
    30% {
      opacity: 1;
      transform: scale(1.1);
    }
  }
</style>
