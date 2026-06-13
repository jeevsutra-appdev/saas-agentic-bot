import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const scriptContent = `
    (function() {
      const scriptTag = document.currentScript;
      const botSlug = scriptTag ? scriptTag.getAttribute('data-bot') : null;
      
      if (!botSlug) {
        console.error("Aether AI: Missing data-bot attribute on the embed script.");
        return;
      }

      const iframeUrl = "http://localhost:4022/b/" + botSlug; // Update to app.aether.ai in prod

      // Create Launcher Button
      const btn = document.createElement('div');
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
      btn.style.position = 'fixed';
      btn.style.bottom = '24px';
      btn.style.right = '24px';
      btn.style.width = '60px';
      btn.style.height = '60px';
      btn.style.borderRadius = '30px';
      btn.style.backgroundColor = '#4F46E5';
      btn.style.color = '#FFFFFF';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
      btn.style.cursor = 'pointer';
      btn.style.zIndex = '999999';
      btn.style.transition = 'transform 0.2s';
      
      btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
      btn.onmouseout = () => btn.style.transform = 'scale(1)';

      // Create Iframe Container
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.bottom = '100px';
      container.style.right = '24px';
      container.style.width = '400px';
      container.style.height = '600px';
      container.style.maxWidth = 'calc(100vw - 48px)';
      container.style.maxHeight = 'calc(100vh - 124px)';
      container.style.backgroundColor = '#0a0d1a';
      container.style.borderRadius = '24px';
      container.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
      container.style.overflow = 'hidden';
      container.style.zIndex = '999999';
      container.style.display = 'none';
      container.style.opacity = '0';
      container.style.transition = 'opacity 0.3s, transform 0.3s';
      container.style.transform = 'translateY(20px)';

      const iframe = document.createElement('iframe');
      iframe.src = iframeUrl;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      container.appendChild(iframe);

      let isOpen = false;
      btn.onclick = () => {
        isOpen = !isOpen;
        if (isOpen) {
          container.style.display = 'block';
          setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
          }, 10);
        } else {
          container.style.opacity = '0';
          container.style.transform = 'translateY(20px)';
          setTimeout(() => {
            container.style.display = 'none';
          }, 300);
          btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>';
        }
      };

      document.body.appendChild(btn);
      document.body.appendChild(container);
    })();
  `;

  return new NextResponse(scriptContent, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
