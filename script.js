// ============================================================
// Carnets — logique commune (feed + article)
// Source unique : chaque article vit dans articles/slug.md
// index.json ne contient que la liste des slugs.
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
  if (document.getElementById('feed')) initFeed();
});

// Convention : la valeur "category" dans le front matter doit être
// exactement contre-jour | hors-piste | contrebande.
// Ces mots sont aussi les noms des variables CSS
// --contre-jour / --hors-piste / --contrebande dans style.css.
// Ajouter une catégorie = l'ajouter aux deux endroits, avec le même mot.
const CATEGORY_LABEL = {
  'contre-jour': 'Contre-jour',
  'hors-piste': 'Hors-piste',
  'contrebande': 'Contrebande'
};

// ---- Feed (homepage) ----

async function initFeed(){
  try {
    const resp = await fetch('articles/index.json');
    const slugs = await resp.json();  // just an array of strings now
    const articles = await Promise.all(slugs.map(loadArticleMeta));
    const list = articles.filter(Boolean);
    list.sort((a,b) => new Date(b.date) - new Date(a.date));
    renderFeed(list);

    document.getElementById('filters').addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      document.querySelectorAll('#filters button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      renderFeed(f === 'all' ? list : list.filter(a => a.category === f));
    });
  } catch {
    document.getElementById('feed').innerHTML =
      '<p style="color:var(--ink-faint)">Aucun carnet pour le moment — ajoute un slug dans articles/index.json et le .md correspondant.</p>';
  }
}

async function loadArticleMeta(slug){
  try {
    const resp = await fetch(`articles/${slug}.md`);
    if (!resp.ok) return null;
    const raw = await resp.text();
    const { meta, body } = parseFrontMatter(raw);
    meta.slug = slug;
    meta.body = body;
    if (!meta.teaser){
      const first = body.split(/\n\s*\n/)[0] || '';
      meta.teaser = first.replace(/\n/g, ' ').slice(0, 200);
    }
    meta.readTime = estimateReadTime(body);
    if (meta.tags && typeof meta.tags === 'string') meta.tags = splitTags(meta.tags);
    return meta;
  } catch { return null; }
}

function estimateReadTime(text){
  // ~200 mots/min en français
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes < 1 ? "<1 min" : `${minutes} min`;
}

function renderFeed(list){
  const feed = document.getElementById('feed');
  if (!list.length){ feed.innerHTML = '<p style="color:var(--ink-faint)">Rien dans cette catégorie pour l\'instant.</p>'; return; }
  feed.innerHTML = list.map(a => `
    <a class="entry tag-${a.category}" href="article.html?slug=${encodeURIComponent(a.slug)}">
      <div class="entry-meta">${CATEGORY_LABEL[a.category] || a.category} · ${formatDate(a.date)} · ${a.readTime || '?'}</div>
      <h3 class="entry-title">${escapeHtml(a.title)}</h3>
      <p class="entry-teaser">${escapeHtml(a.teaser)}</p>
      ${renderTags(a.tags)}
    </a>`).join('');
}

// ---- Article page ----

function renderArticle(){
  const slug = new URLSearchParams(location.search).get('slug');
  if (!slug){ document.getElementById('art-title').textContent = 'Carnet introuvable.'; return; }

  // Load article + index for prev/next navigation
  Promise.all([
    fetch(`articles/${slug}.md`).then(r => { if (!r.ok) throw new Error('not found'); return r.text(); }),
    fetch('articles/index.json').then(r => r.json()).catch(() => [])
  ])
    .then(([raw, slugs]) => {
      const { meta, body } = parseFrontMatter(raw);
      document.title = `${meta.title} — Valérie`;
      setMeta('og:title', meta.title);
      setMeta('twitter:title', meta.title);
      setMeta('og:description', meta.teaser || '');
      setMeta('twitter:description', meta.teaser || '');
      const artHead = document.getElementById('art-head');
      if (artHead) artHead.style.setProperty('--c', `var(--${meta.category})`);
      document.querySelector('.article-body').style.setProperty('--c', `var(--${meta.category})`);
      document.getElementById('art-title').textContent = meta.title || slug;
      const readTime = estimateReadTime(body);
      document.getElementById('art-date').innerHTML = `${formatDate(meta.date)} · ${readTime} de lecture`;
      const tagEl = document.getElementById('art-tag');
      tagEl.textContent = CATEGORY_LABEL[meta.category] || meta.category || '';

      const html = renderMarkdown(body) + renderTags(splitTags(meta.tags)) + renderArticleNav(slug, slugs);
      document.getElementById('art-body').innerHTML = html;
    })
    .catch(() => {
      document.getElementById('art-title').textContent = 'Ce carnet est introuvable.';
      document.getElementById('art-body').innerHTML = '';
    });
}

function renderArticleNav(currentSlug, slugs){
  if (!slugs || slugs.length < 2) return '';
  const idx = slugs.indexOf(currentSlug);
  if (idx === -1) return '';
  const prev = idx > 0 ? slugs[idx - 1] : null;
  const next = idx < slugs.length - 1 ? slugs[idx + 1] : null;
  if (!prev && !next) return '';

  let html = '<nav class="article-nav">';
  if (prev){
    html += `<a class="article-nav-link prev" href="article.html?slug=${encodeURIComponent(prev)}">
      <span class="nav-dir">← Précédent</span>
      <span class="nav-slug" data-slug="${prev}">…</span>
    </a>`;
  } else {
    html += '<div></div>';
  }
  if (next){
    html += `<a class="article-nav-link next" href="article.html?slug=${encodeURIComponent(next)}">
      <span class="nav-dir">Suivant →</span>
      <span class="nav-slug" data-slug="${next}">…</span>
    </a>`;
  }
  html += '</nav>';

  // Load titles for nav links asynchronously
  setTimeout(() => {
    document.querySelectorAll('.nav-slug[data-slug]').forEach(el => {
      fetch(`articles/${el.dataset.slug}.md`).then(r => r.text()).then(raw => {
        const { meta } = parseFrontMatter(raw);
        el.textContent = meta.title || '';
      }).catch(() => {});
    });
  }, 500); // after main article renders

  return html;
}

// ---- Mini markdown -> HTML ----

function renderMarkdown(md){
  const blocks = md.trim().split(/\n\s*\n/);
  return blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^### /.test(block)) return `<h3>${inlineMd(block.slice(4))}</h3>`;
    if (/^## /.test(block))  return `<h2>${inlineMd(block.slice(3))}</h2>`;
    if (/^# /.test(block))   return `<h1>${inlineMd(block.slice(2))}</h1>`;
    if (/^> /.test(block)){
      const text = block.split('\n').map(l => l.replace(/^> ?/, '')).join(' ');
      return `<blockquote>${inlineMd(text)}</blockquote>`;
    }
    if (/^[-*] /.test(block)){
      const items = block.split('\n').map(l => `<li>${inlineMd(l.replace(/^[-*] /, ''))}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    return `<p>${inlineMd(block.replace(/\n/g, ' '))}</p>`;
  }).join('\n');
}
function inlineMd(text){
  text = escapeHtml(text);
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => `<a href="${url}">${label}</a>`);
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return text;
}

// ---- Utilitaires ----

function parseFrontMatter(raw){
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  m[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    val = val.replace(/^["'](.*)["']$/, '$1');
    meta[key] = val;
  });
  return { meta, body: m[2].trim() };
}

function formatDate(iso){
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' });
}

function escapeHtml(s=''){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderTags(tags){
  if (!tags || !tags.length) return '';
  return `<div class="tags">${tags.map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}</div>`;
}
function splitTags(raw){
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.split(',').map(t => t.trim()).filter(Boolean);
}
function setMeta(prop, content){
  if (!content) return;
  const el = document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
  if (el) el.setAttribute('content', content);
}
