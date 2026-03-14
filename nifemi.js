  const colors = ['#e8a0a0','#f5d0d0','#c9a84c','#e8cc80','#fdf6ee'];
  const container = document.getElementById('petals');
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.cssText = `
      left: ${Math.random()*100}%;
      width: ${4+Math.random()*6}px;
      height: ${7+Math.random()*9}px;
      background: ${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration: ${6+Math.random()*10}s;
      animation-delay: ${Math.random()*8}s;
      border-radius: ${Math.random()>.5 ? '50% 50% 50% 0':'50%'};
    `;
    container.appendChild(p);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const BIN_URL = 'https://api.jsonbin.io/v3/b';
  const MASTER_KEY = '$2a$10$MJO6vDCL1cgQ6w9C4/.3D.ajJlIso2BPxZ5kJg.4c862Di0ZnXee.';
  const binId = '69b06b3e1687bc351c7aa40d';

  let videos = [];

  async function loadVideos() {
    setLoading(true);
    try {
      const res = await fetch(`${BIN_URL}/${binId}/latest`, {
        headers: { 'X-Master-Key': MASTER_KEY }
      });
      const data = await res.json();
      videos = data.record.videos || [];
    } catch (e) {
      videos = [];
    }
    setLoading(false);
    render();
  }

  async function saveVideos() {
    try {
      await fetch(`${BIN_URL}/${binId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY
        },
        body: JSON.stringify({ videos })
      });
    } catch (e) {}
  }

  function setLoading(on) {
    const grid = document.getElementById('videoGrid');
    if (on) {
      grid.innerHTML = '<div class="empty-state" style="color:rgba(255,255,255,.3)">Loading messages... ✦</div>';
    }
  }

  function embedUrl(raw) {
    raw = raw.trim();
    let m = raw.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (m) return `https://www.youtube.com/embed/${m[1]}?rel=0`;
    m = raw.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    m = raw.match(/drive\.google\.com\/open\?id=([^&]+)/);
    if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
    return null;
  }

  async function addVideo() {
    const url  = document.getElementById('videoUrl').value.trim();
    const name = document.getElementById('senderName').value.trim() || 'A special friend';
    if (!url) return;
    const embed = embedUrl(url);
    if (!embed) { alert('Please paste a valid YouTube or Google Drive video link.'); return; }
    const id = Date.now();
    videos.push({ id, embed, name });
    render();
    document.getElementById('videoUrl').value   = '';
    document.getElementById('senderName').value = '';
    await saveVideos();
  }

  async function removeVideo(id) {
    videos = videos.filter(v => v.id !== id);
    render();
    await saveVideos();
  }

  function render() {
    const grid = document.getElementById('videoGrid');
    if (videos.length === 0) {
      grid.innerHTML = '<div class="empty-state" id="emptyState">No messages yet — add the first one above ✦</div>';
      return;
    }
    grid.innerHTML = videos.map(v => `
      <div class="video-card">
        <iframe src="${v.embed}" allowfullscreen allow="autoplay"></iframe>
        <div class="video-card-footer">
          <span class="heart">✦</span>
          <span>${v.name}</span>
          <button class="remove-btn" onclick="removeVideo(${v.id})" title="Remove">✕</button>
        </div>
      </div>
    `).join('');
  }

 /* ['videoUrl','senderName'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') addVideo();
    });
  });*/

  loadVideos();