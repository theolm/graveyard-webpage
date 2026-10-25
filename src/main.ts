import './style.css';
import { projects, type Project } from './projects';
import { createScene } from './scene';

const list = document.getElementById('project-list')!;
const dialog = document.getElementById('project-dialog') as HTMLDialogElement;
const motionButton = document.getElementById('motion-toggle') as HTMLButtonElement;
const resetButton = document.getElementById('view-reset') as HTMLButtonElement;
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = motionQuery.matches;
let world: ReturnType<typeof createScene> | undefined;

function artwork(project: Project) {
  if (project.id === 'chatlaunch') {
    return '<img src="/images/chatlaunch-demo.gif" alt="ChatLaunch demonstration: starting a WhatsApp conversation from the Android quick settings tile" loading="lazy" /><span class="art-caption">APP DEMO / ANDROID</span>';
  }
  // Original project illustrations, not simulated app screenshots.
  const accent = project.accent;
  const art = project.id === 'rinku'
    ? '<path d="M115 100h50v50h-50zm80 0h50v50h-50zm-80 80h50v50h-50zm80 0h50v50h-50z"/><path d="M140 150v30m80-30v30m-55-55h30m-30 80h30" stroke-width="5"/>'
    : project.id === 'smartnotes'
      ? '<path d="M100 170v20m20-45v70m20-105v140m20-110v80m20-130v180m20-150v120m20-90v60m20-45v30m20-60v90" stroke-width="8"/>'
      : '<path d="M140 105h80v15h15v90h-15v15h-80v-15h-15v-90h15z"/><path d="M105 170v50l25 25h100l25-25v-50m-75 75v35m-35 0h70" stroke-width="6"/><rect x="158" y="140" width="44" height="50" fill="currentColor" stroke="none"/>';
  return `<svg viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${project.name} original geometric project artwork" style="color:${accent}"><defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="${accent}" stroke-opacity=".09"/></pattern></defs><path fill="url(#grid)" d="M0 0h360v360H0z"/><g stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="square">${art}</g></svg><span class="art-caption">${project.name.toUpperCase()} / PROJECT ARTWORK</span>`;
}

function openProject(id: string) {
  const project = projects.find(p => p.id === id);
  if (!project) return;
  document.getElementById('dialog-title')!.textContent = project.name;
  document.getElementById('dialog-kind')!.textContent = project.kind;
  document.getElementById('dialog-description')!.textContent = project.description;
  document.getElementById('dialog-tags')!.replaceChildren(...project.tags.map(tag => {
    const li = document.createElement('li'); li.textContent = tag; return li;
  }));
  const github = document.getElementById('dialog-github') as HTMLAnchorElement;
  github.href = project.github;
  const extra = document.getElementById('dialog-extra') as HTMLAnchorElement;
  extra.hidden = !project.extra;
  if (project.extra) { extra.href = project.extra.url; extra.textContent = project.extra.label; }
  else { extra.removeAttribute('href'); extra.textContent = ''; }
  const art = document.getElementById('dialog-art')!;
  art.innerHTML = artwork(project);
  art.style.background = `linear-gradient(145deg, ${project.accent}22, #141b20)`;
  if (paused) {
    // Keep the animated demo still when reduced motion or pause is selected.
    const image = art.querySelector('img');
    if (image) image.src = '/images/chatlaunch-still.png';
  }
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  world?.setPaused(true);
}

projects.forEach((project, index) => {
  const card = document.createElement('button');
  card.type = 'button'; card.className = 'project-card'; card.dataset.project = project.id;
  card.style.setProperty('--accent', project.accent);
  card.setAttribute('aria-label', `Explore ${project.name}: ${project.summary}`);
  card.setAttribute('aria-haspopup', 'dialog');
  card.innerHTML = `<div class="card-top"><span class="project-symbol" aria-hidden="true">${project.symbol}</span><span class="project-number">0${index + 1}</span></div><h3>${project.name}</h3><p>${project.summary}</p><div class="card-bottom"><span>${project.kind.split(' / ')[0]} / ${project.id === 'smartnotes' ? 'FLUTTER' : project.id === 'chatlaunch' ? 'ANDROID' : 'KOTLIN MULTIPLATFORM'}</span><span class="card-arrow" aria-hidden="true">↗</span></div>`;
  card.addEventListener('click', () => openProject(project.id));
  card.addEventListener('pointerenter', () => world?.highlight(project.id));
  card.addEventListener('pointerleave', () => world?.highlight(null));
  card.addEventListener('focus', () => world?.highlight(project.id));
  card.addEventListener('blur', () => world?.highlight(null));
  list.appendChild(card);
});

dialog.querySelector('.dialog-close')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  // A queued close event must not affect a newly opened project.
  // The native dialog already restores focus to its original trigger.
  if (dialog.open) return;
  document.body.style.overflow = '';
  world?.setPaused(paused);
});

function updateMotionButton() {
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.setAttribute('aria-label', paused ? 'Resume scene animation' : 'Pause scene animation');
  motionButton.title = paused ? 'Resume scene animation' : 'Pause scene animation';
  motionButton.textContent = paused ? '▷' : 'Ⅱ';
}
motionButton.addEventListener('click', () => { paused = !paused; world?.setPaused(paused); updateMotionButton(); });
motionQuery.addEventListener('change', event => { paused = event.matches; world?.setPaused(paused || dialog.open); updateMotionButton(); });
resetButton.addEventListener('click', () => world?.reset());
document.getElementById('year')!.textContent = String(new Date().getFullYear());
updateMotionButton();

try {
  world = createScene(document.getElementById('world')!, {
    reducedMotion: paused,
    onSelect: openProject,
    onHover(id) {
      document.querySelectorAll<HTMLButtonElement>('.project-card').forEach(card => card.classList.toggle('is-hovered', card.dataset.project === id));
    },
  });
} catch (error) {
  console.warn('The 3D garden could not be started. All projects remain available below.', error);
  const status = document.getElementById('world-status')!;
  status.className = 'world-loading is-error';
  status.textContent = 'The spirits are resting. Explore every project in the list below.';
  document.getElementById('scene-hint')!.textContent = 'ALL PROJECTS ARE AVAILABLE BELOW';
  motionButton.disabled = true; resetButton.disabled = true;
}

// Vite hot updates dispose WebGL resources instead of leaking contexts.
if (import.meta.hot) import.meta.hot.dispose(() => world?.dispose());
