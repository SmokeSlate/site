async function fetchProjects() {
  const response = await fetch('data/projects.json');
  if (!response.ok) {
    throw new Error(`Failed to load projects: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function createProjectCard(project) {
  const hasLink = Boolean(project.url);
  const card = document.createElement(hasLink ? 'a' : 'div');
  card.className =
    'flex h-full flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-500 hover:shadow';

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
    img.alt = project.title ? `${project.title} cover` : 'Project cover';
    img.loading = 'lazy';
    img.className = 'h-40 w-full rounded-md object-cover';
    card.appendChild(img);
  }

  if (project.date) {
    const date = document.createElement('p');
    date.className = 'text-xs font-semibold uppercase tracking-wide text-blue-600';
    date.textContent = project.date;
    card.appendChild(date);
  }

  const title = document.createElement('h3');
  title.className = 'text-lg font-semibold text-gray-900';
  title.textContent = project.title || 'Untitled project';
  card.appendChild(title);

  if (project.description) {
    const description = document.createElement('p');
    description.className = 'text-sm leading-6 text-gray-600';
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

    let projects = await fetchProjects();

    if (featuredOnly) {
      projects = projects.filter((item) => item.featured);
    }

    if (typeof limit === 'number' && Number.isFinite(limit)) {
      projects = projects.slice(0, limit);
    }

    if (!projects.length) {
      container.innerHTML =
        '<p class="col-span-full text-center text-sm text-gray-500">Projects will appear here soon.</p>';
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
    container.innerHTML =
      '<p class="col-span-full text-center text-sm text-red-600">Unable to load projects right now.</p>';
  }
}

function setActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const normalized = currentPath || 'index.html';

  document.querySelectorAll('[data-nav] a').forEach((link) => {
    const href = link.getAttribute('href');
    const isMatch = href === normalized || (href === 'index.html' && normalized === '');
    if (isMatch) {
      link.classList.add('text-blue-600', 'font-semibold');
      link.classList.remove('text-gray-600');
      link.setAttribute('aria-current', 'page');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  document.querySelectorAll('[data-projects]').forEach((container) => {
    hydrateProjects(container);
  });
});
