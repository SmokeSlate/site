async function loadProjects() {
  const container = document.querySelector('[data-projects]');
  if (!container) return;

  const limit = Number(container.getAttribute('data-projects-limit')) || null;

  try {
    const response = await fetch('data/projects.json');
    if (!response.ok) {
      throw new Error(`Failed to load projects: ${response.status}`);
    }
    const projects = await response.json();
    const items = Array.isArray(projects) ? projects : [];
    const selected = limit ? items.slice(0, limit) : items;

    if (!selected.length) {
      container.innerHTML = '<p class="text-gray-500">Projects will appear here soon.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    selected.forEach((project) => {
      const card = document.createElement('article');
      card.className = 'flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg';

      const time = document.createElement('p');
      time.className = 'text-sm font-medium uppercase tracking-wide text-indigo-500';
      time.textContent = project.date || '';
      card.appendChild(time);

      const title = document.createElement('h3');
      title.className = 'text-2xl font-semibold text-slate-900';
      title.textContent = project.title || 'Untitled project';
      card.appendChild(title);

      const description = document.createElement('p');
      description.className = 'text-base text-slate-600';
      description.textContent = project.description || '';
      card.appendChild(description);

      if (project.url) {
        const link = document.createElement('a');
        link.href = project.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500';
        link.innerHTML = 'Learn more <span aria-hidden="true">→</span>';
        card.appendChild(link);
      }

      fragment.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="text-red-600">Unable to load projects right now. Please try again later.</p>';
  }
}

function highlightActiveLink() {
  const { pathname } = window.location;
  const normalized = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
  const links = document.querySelectorAll('[data-nav] a');
  links.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    const current = href === 'index.html' ? '' : href.replace('./', '');
    const matchesCurrent = current
      ? normalized === `/${current}` || normalized.endsWith(`/${current}`)
      : normalized === '' || normalized === '/' || normalized === '/index.html';

    if (matchesCurrent) {
      link.classList.add('text-indigo-500');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  highlightActiveLink();
  loadProjects();
});
