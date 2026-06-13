(function() {
  // 1. Locate configuration attributes from load script
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget.js"]');
  const tenant = scriptTag ? scriptTag.getAttribute('data-tenant') || 'demo' : 'demo';
  const botName = scriptTag ? scriptTag.getAttribute('data-bot-name') || 'Aether AI Assistant' : 'Aether AI Assistant';
  
  console.log(`[Aether Widget] Loading launcher for workspace: "${tenant}" (Bot: "${botName}")`);

  // 2. Inject structural styling for floating elements
  const styles = `
    .aether-widget-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .aether-launcher-bubble {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .aether-launcher-bubble:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.4);
    }
    .aether-launcher-bubble svg {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: #ffffff;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: transform 0.3s ease;
    }
    .aether-chat-frame-box {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 360px;
      height: 520px;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: #070913;
      transform: scale(0.9) translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: bottom right;
    }
    .aether-chat-frame-box.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    .aether-chat-frame-box iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
    }
  `;

  const styleTag = document.createElement('style');
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);

  // 3. Create floating structural DOM layout
  const container = document.createElement('div');
  container.className = 'aether-widget-container';

  const frameBox = document.createElement('div');
  frameBox.className = 'aether-chat-frame-box';

  // Embed standlone router page inside clean iframe
  const host = window.location.origin || 'http://localhost:3000';
  const iframe = document.createElement('iframe');
  iframe.src = `${host}/b/${tenant}`;
  iframe.title = botName;
  
  frameBox.appendChild(iframe);

  const bubble = document.createElement('div');
  bubble.className = 'aether-launcher-bubble';
  
  // Icon vector
  bubble.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  `;

  container.appendChild(frameBox);
  container.appendChild(bubble);
  document.body.appendChild(container);

  // 4. Handle bubble toggle clicks
  let isOpen = false;
  bubble.addEventListener('click', function() {
    isOpen = !isOpen;
    if (isOpen) {
      frameBox.classList.add('open');
      bubble.querySelector('svg').style.transform = 'rotate(90deg)';
    } else {
      frameBox.classList.remove('open');
      bubble.querySelector('svg').style.transform = 'rotate(0deg)';
    }
  });

})();
