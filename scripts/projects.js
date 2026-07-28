/* === Mokimo — Project index ===
   Single source of truth for the project cards shown on the examples pages.

   Add a project once here and it appears on every discipline page whose tag it
   carries, so multidisciplinary work is reachable from more than one place.
   Long-form content lives in the project's own page under /examples/projects/.

   Available tags: mechanical, electronics, firmware, production, requirements */

const MOKIMO_DISCIPLINES = {
  mechanical: { label: 'Mechanical', url: '/examples/mechanical/' },
  electronics: { label: 'Electronics', url: '/examples/electronics/' },
  firmware: { label: 'Firmware', url: '/examples/firmware/' },
  production: { label: 'Production', url: '/examples/production/' },
  requirements: { label: 'Requirements & systems', url: '/examples/process/' }
};

const MOKIMO_PROJECTS = [
  {
    slug: 'bikestow',
    title: 'Bikestow',
    subtitle: 'Automated post-op machining centre',
    context: 'Personal project',
    summary: 'A machining centre for post-operation work, with a storage buffer at the front and automatic component detection so it keeps cycling without an operator stood over it.',
    image: '/images/examples/bikestow-cnc-gantry.jpg',
    imageAlt: 'Custom CNC gantry mechanism during assembly',
    tags: ['mechanical', 'electronics', 'firmware', 'production']
  },
  {
    slug: 'strain-wave-demonstrator',
    title: 'Strain-wave gear demonstrator',
    subtitle: 'Teaching rig for a university engineering department',
    context: 'For a university engineering department',
    summary: 'A working strain-wave gearbox with a visible flex-spline and a live reduction-ratio dial, built so students could see a mechanism that is usually only ever drawn.',
    image: '/images/examples/harmonic-drive-demonstrator.jpg',
    imageAlt: '3D-printed strain-wave gear demonstrator with a reduction-ratio dial',
    tags: ['mechanical', 'electronics']
  },
  {
    slug: 'rotating-assembly-test-rig',
    title: 'Rotating assembly test rig',
    subtitle: 'Repeatable validation under load',
    context: 'Assembly validation',
    summary: 'A dedicated functional test rig that exercises a rotating assembly through its operating envelope, so failure modes show up as measurements rather than opinions.',
    image: '/images/examples/functional-test-rig.jpg',
    imageAlt: 'Functional test rig for a rotating mechanical assembly',
    tags: ['production', 'mechanical']
  }
];

function mokimoProjectCard(project, currentTag) {
  const tags = project.tags
    .filter(tag => MOKIMO_DISCIPLINES[tag])
    .map(tag => {
      const discipline = MOKIMO_DISCIPLINES[tag];
      const current = tag === currentTag ? ' tag--current' : '';
      return `<span class="tag${current}">${discipline.label}</span>`;
    })
    .join('');

  return `
    <a class="project-card" href="/examples/projects/${project.slug}/">
      <img src="${project.image}" alt="${project.imageAlt}" loading="lazy">
      <div class="project-card-body">
        <p class="project-card-context">${project.context}</p>
        <h3 class="project-card-title">${project.title}</h3>
        <p class="project-card-subtitle">${project.subtitle}</p>
        <p class="project-card-summary">${project.summary}</p>
        <div class="tag-list">${tags}</div>
      </div>
    </a>`;
}

/* Renders cards into [data-projects] containers. Set data-projects to a tag to
   filter by discipline, or "all" for everything, and data-exclude to drop a
   project from the list (used for "related work" on a project's own page). */
function mokimoRenderProjects() {
  document.querySelectorAll('[data-projects]').forEach(container => {
    const tag = container.dataset.projects;
    const exclude = (container.dataset.exclude || '').split(',').map(s => s.trim());

    const matches = MOKIMO_PROJECTS.filter(project => {
      if (exclude.includes(project.slug)) return false;
      return tag === 'all' || project.tags.includes(tag);
    });

    if (!matches.length) {
      const section = container.closest('[data-projects-section]');
      if (section) section.hidden = true;
      return;
    }

    container.innerHTML = matches
      .map(project => mokimoProjectCard(project, tag === 'all' ? null : tag))
      .join('');
  });
}

document.addEventListener('DOMContentLoaded', mokimoRenderProjects);
