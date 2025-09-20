async function fetchProjectsData() {
  const response = await fetch('data/projects.json');
  if (!response.ok) {
    throw new Error(`Failed to load projects: ${response.status}`);
  }
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}

function createProjectCard(project) {
  const hasLink = Boolean(project.url);
  const card = document.createElement(hasLink ? 'a' : 'div');
  card.className = 'project-card';

  if (hasLink) {
    card.href = project.url;
    const isExternal = /^https?:\/\//i.test(project.url) && !project.url.startsWith(location.origin);
    if (isExternal) {
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }
  }

  if (project.image) {
    const img = document.createElement('img');
    img.src = project.image;
    img.alt = project.title ? `${project.title} preview` : 'Project preview';
    card.appendChild(img);
  }

  if (project.date) {
    const date = document.createElement('span');
    date.className = 'project-date';
    date.textContent = project.date;
    card.appendChild(date);
  }

  const title = document.createElement('span');
  title.className = 'project-title';
  title.textContent = project.title || 'Untitled project';
  card.appendChild(title);

  if (project.description) {
    const description = document.createElement('span');
    description.className = 'project-desc';
    description.textContent = project.description;
    card.appendChild(description);
  }

  return card;
}

async function hydrateProjects(container) {
  try {
    const featuredOnly = container.hasAttribute('data-projects-featured');
    const limitAttr = container.getAttribute('data-projects-limit');
    const limit = limitAttr ? Number.parseInt(limitAttr, 10) : undefined;

    const data = await fetchProjectsData();
    let projects = data.slice();

    if (featuredOnly) {
      projects = projects.filter((item) => item.featured);
    }

    if (typeof limit === 'number' && Number.isFinite(limit)) {
      projects = projects.slice(0, limit);
    }

    if (!projects.length) {
      container.innerHTML = '<p class="empty-state">Projects will appear here soon.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    projects.forEach((project) => {
      fragment.appendChild(createProjectCard(project));
    });

    container.innerHTML = '';
    container.appendChild(fragment);
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p class="empty-state">Unable to load projects right now.</p>';
  }
}

function setActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const normalized = currentPath === '' ? 'index.html' : currentPath;

  document.querySelectorAll('[data-nav] a').forEach((link) => {
    const href = link.getAttribute('href');
    const isMatch = href === normalized || (href === 'index.html' && normalized === '');
    if (isMatch) {
      link.classList.add('is-active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  document.querySelectorAll('[data-projects]').forEach((container) => {
    hydrateProjects(container);
  });
});
