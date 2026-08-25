// The crew: twelve inked heads, each with the hair, hat, and accessory from
// the asset list, and a face that changes with health. A row of them makes
// the crew panel; one at a time they sit beside their balloons. §4.

import { INK, PAPER, RED, SKY, YELLOW, ink, svg, text } from './art-shared';
import { castMember, type CastMember } from './cast';
import type { CrewMood } from './layout';

const TURQUOISE = '#2AB7A9';
const SICK = '#B5DFA0';
const ASH = '#C9C9C9';

function hairFor(m: CastMember): string {
  const h = m.hair;
  switch (m.hairStyle) {
    case 'bandana':
      return `<path d="M52 82 q48 -60 96 0 v-10 q-48 -50 -96 0z" fill="${h}" ${ink()}/><path d="M50 84 q50 -14 100 0 v14 q-50 -10 -100 0z" fill="${RED}" ${ink()}/><path d="M146 88 l22 -14 l-6 20 l14 6 z" fill="${RED}" ${ink()}/>`;
    case 'natural':
      return `<circle cx="100" cy="72" r="58" fill="${h}" ${ink()}/><circle cx="60" cy="90" r="18" fill="${h}" ${ink()}/><circle cx="140" cy="90" r="18" fill="${h}" ${ink()}/>`;
    case 'trucker-cap':
      return `<path d="M52 84 q48 -66 96 0z" fill="${h}" ${ink()}/><path d="M52 78 q48 -60 96 0 v6 h-96z" fill="#3D8B3D" ${ink()}/><path d="M52 78 q48 -60 96 0 v-8 q-48 -40 -96 0z" fill="${PAPER}" ${ink()}/><path d="M40 84 h60 v10 h-60z" fill="#3D8B3D" ${ink()}/>`;
    case 'straw-hat':
      return `<path d="M56 86 q44 -70 88 0z" fill="${h}" ${ink()}/><ellipse cx="100" cy="80" rx="80" ry="14" fill="${YELLOW}" ${ink()}/><path d="M64 80 q0 -50 36 -50 q36 0 36 50z" fill="${YELLOW}" ${ink()}/><rect x="64" y="66" width="72" height="10" fill="${RED}"/>`;
    case 'braid':
      return `<path d="M50 90 q50 -70 100 0 v-6 q-50 -56 -100 0z" fill="${h}" ${ink()}/><path d="M140 96 q20 40 10 90" fill="none" stroke="${h}" stroke-width="16" stroke-linecap="round"/><path d="M140 96 q20 40 10 90" fill="none" ${ink()} stroke-width="3"/><path d="M144 120 l-6 12 M148 140 l-8 12 M150 160 l-8 12" ${ink()} stroke-width="3"/>`;
    case 'bald-beard':
      return `<path d="M60 150 q40 60 80 0 v-20 h-80z" fill="${h}" ${ink()}/><path d="M60 88 q40 -50 80 0" fill="none" ${ink()} stroke-width="3"/>`;
    case 'undercut':
      return `<path d="M58 84 q42 -70 84 0z" fill="#333333" ${ink()}/><path d="M64 80 q10 -60 60 -50 q30 4 30 40 l-10 -6 q-30 -20 -60 8z" fill="${TURQUOISE}" ${ink()}/>`;
    case 'tousled':
      return `<path d="M50 90 l10 -40 l14 24 l10 -44 l14 30 l12 -40 l12 32 l12 -30 l8 40 l12 -20 l-4 48z" fill="${h}" ${ink()}/>`;
    case 'long':
      return `<path d="M46 150 v-70 q54 -80 108 0 v70 h-14 v-60 q-40 -40 -80 0 v60z" fill="${h}" ${ink()}/>`;
    case 'buzz':
      return `<path d="M54 86 q46 -60 92 0z" fill="${h}" ${ink()}/>`;
    case 'sun-hat':
      return `<path d="M60 84 q40 -50 80 0z" fill="${h}" ${ink()}/><ellipse cx="100" cy="82" rx="90" ry="16" fill="#D9A66B" ${ink()}/><path d="M66 82 q0 -44 34 -44 q34 0 34 44z" fill="#D9A66B" ${ink()}/>`;
    case 'backwards-cap':
      return `<path d="M52 84 q48 -60 96 0z" fill="${h}" ${ink()}/><path d="M54 80 q46 -58 92 0 v6 h-92z" fill="#1F8FD6" ${ink()}/><path d="M140 84 h44 v10 h-44z" fill="#1F8FD6" ${ink()}/>`;
    case 'curly':
      // Short curls on top, faded at the sides.
      return `<path d="M56 92 q0 -20 16 -22 q4 -22 26 -18 q10 -18 30 -8 q18 -8 24 12 q14 4 8 24 q-52 -14 -104 12z" fill="${h}" ${ink()}/><circle cx="72" cy="66" r="9" fill="${h}" ${ink()} stroke-width="3"/><circle cx="96" cy="52" r="10" fill="${h}" ${ink()} stroke-width="3"/><circle cx="122" cy="58" r="9" fill="${h}" ${ink()} stroke-width="3"/>`;
  }
}

function accessoryFor(m: CastMember, mood: CrewMood): string {
  switch (m.accessory) {
    case 'aviators':
      return `<path d="M66 100 h28 v18 q-14 8 -28 0z M106 100 h28 v18 q-14 8 -28 0z M94 102 h12" fill="${INK}" ${ink()} stroke-width="3"/>`;
    case 'round-glasses':
      return `<circle cx="80" cy="106" r="14" fill="none" stroke="#7A4E2D" stroke-width="5"/><circle cx="120" cy="106" r="14" fill="none" stroke="#7A4E2D" stroke-width="5"/><line x1="94" y1="106" x2="106" y2="106" stroke="#7A4E2D" stroke-width="5"/>`;
    case 'headphones':
      return `<path d="M52 150 q0 30 20 30 q6 0 8 -6 v-24 h-28z M148 150 q0 30 -20 30 q-6 0 -8 -6 v-24 h28z" fill="${INK}"/><path d="M56 166 q44 30 88 0" fill="none" ${ink()} stroke-width="5"/>`;
    case 'mustache':
      return `<path d="M70 124 q30 -14 30 0 q0 -14 30 0 q-14 14 -30 6 q-16 8 -30 -6z" fill="${m.hair}" ${ink()} stroke-width="3"/>`;
    case 'camera':
      return `<rect x="120" y="160" width="46" height="30" rx="4" fill="${INK}"/><circle cx="143" cy="175" r="9" fill="${SKY}" ${ink()} stroke-width="3"/><path d="M60 150 q60 40 100 12" fill="none" ${ink()} stroke-width="4"/>`;
    case 'reading-glasses':
      return `<rect x="66" y="98" width="28" height="18" rx="4" fill="none" stroke="${INK}" stroke-width="4"/><rect x="106" y="98" width="28" height="18" rx="4" fill="none" stroke="${INK}" stroke-width="4"/><path d="M66 106 q-20 30 -10 70 M134 106 q20 30 10 70" fill="none" ${ink()} stroke-width="2"/>`;
    case 'nose-ring':
      return `<circle cx="106" cy="120" r="4" fill="none" stroke="${INK}" stroke-width="3"/>`;
    case 'rag':
      return `<path d="M40 170 q10 -30 30 -20 q-10 20 4 40 q-20 10 -34 -20z" fill="${RED}" ${ink()} stroke-width="3"/>`;
    case 'earrings':
      return `<circle cx="50" cy="128" r="6" fill="${TURQUOISE}" ${ink()} stroke-width="3"/><circle cx="150" cy="128" r="6" fill="${TURQUOISE}" ${ink()} stroke-width="3"/>`;
    case 'big-grin':
      return mood === 'lost' || mood === 'critical' ? '' : `<path d="M66 126 q34 34 68 0z" fill="${PAPER}" ${ink()} stroke-width="3"/><line x1="70" y1="132" x2="130" y2="132" ${ink()} stroke-width="2"/>`;
    case 'binoculars':
      return `<rect x="78" y="160" width="18" height="30" rx="4" fill="${INK}"/><rect x="104" y="160" width="18" height="30" rx="4" fill="${INK}"/><path d="M64 150 q36 26 72 0" fill="none" ${ink()} stroke-width="3"/>`;
    case 'braces':
      return mood === 'lost' ? '' : `<path d="M78 128 q22 12 44 0" fill="none" stroke="#8E8E8E" stroke-width="4"/><path d="M84 130 v4 M96 133 v4 M108 133 v4 M118 130 v4" stroke="#8E8E8E" stroke-width="3"/>`;
    case 'blue-circle':
      // The blue circle — the awareness symbol for diabetes — on the shirt, and a small CGM on the arm.
      return `<circle cx="100" cy="176" r="9" fill="${SKY}" ${ink()} stroke-width="3"/><ellipse cx="156" cy="180" rx="7" ry="9" fill="${PAPER}" ${ink()} stroke-width="3"/>`;
  }
}

function faceFor(mood: CrewMood, bigGrin: boolean): string {
  const eyes = (() => {
    switch (mood) {
      case 'good':
      case 'fair':
        return `<circle cx="82" cy="106" r="5" fill="${INK}"/><circle cx="118" cy="106" r="5" fill="${INK}"/>`;
      case 'poor':
        return `<path d="M72 104 q10 -8 20 0" fill="none" ${ink()} stroke-width="4"/><path d="M108 104 q10 -8 20 0" fill="none" ${ink()} stroke-width="4"/><path d="M140 96 q10 14 0 22 q-10 -8 0 -22z" fill="${SKY}" ${ink()} stroke-width="2"/>`;
      case 'critical':
        return `<path d="M82 106 m-8 0 a8 8 0 1 0 16 0 a5 5 0 1 0 -10 0 a2 2 0 1 0 4 0" fill="none" ${ink()} stroke-width="3"/><path d="M118 106 m-8 0 a8 8 0 1 0 16 0 a5 5 0 1 0 -10 0 a2 2 0 1 0 4 0" fill="none" ${ink()} stroke-width="3"/>`;
      case 'lost':
        return `<path d="M74 98 l16 16 M90 98 l-16 16 M110 98 l16 16 M126 98 l-16 16" ${ink()} stroke-width="4"/>`;
    }
  })();
  const brows =
    mood === 'poor' || mood === 'critical'
      ? `<path d="M70 92 l22 4 M130 92 l-22 4" ${ink()} stroke-width="4"/>`
      : `<path d="M70 92 q12 -8 24 0 M106 92 q12 -8 24 0" fill="none" ${ink()} stroke-width="4"/>`;
  const mouth = bigGrin
    ? ''
    : (() => {
        switch (mood) {
          case 'good':
            return `<path d="M82 128 q18 16 36 0" fill="none" ${ink()} stroke-width="4"/>`;
          case 'fair':
            return `<path d="M84 130 h32" ${ink()} stroke-width="4"/>`;
          case 'poor':
            return `<path d="M80 132 q8 -8 16 0 t16 0 t8 -6" fill="none" ${ink()} stroke-width="4"/>`;
          case 'critical':
            return `<path d="M82 136 q18 -14 36 0" fill="none" ${ink()} stroke-width="4"/>`;
          case 'lost':
            return `<path d="M88 132 h24" ${ink()} stroke-width="3"/>`;
        }
      })();
  return `${brows}${eyes}${mouth}`;
}

/** One head-and-shoulders portrait in a circle, 200×200. */
export function crewHeadSvg(id: number, mood: CrewMood): string {
  const m = castMember(id);
  const skin = mood === 'critical' ? SICK : mood === 'lost' ? ASH : m.skin;
  const shirt = mood === 'lost' ? ASH : m.shirt;
  return svg(
    '0 0 200 200',
    `<circle cx="100" cy="100" r="96" fill="${mood === 'lost' ? '#EDEDED' : '#FFF6D6'}" ${ink()}/>
<clipPath id="head-clip-${id}"><circle cx="100" cy="100" r="93"/></clipPath>
<g clip-path="url(#head-clip-${id})">
<path d="M40 200 q0 -50 60 -50 q60 0 60 50z" fill="${shirt}" ${ink()}/>
<rect x="86" y="130" width="28" height="30" fill="${skin}" ${ink()}/>
<ellipse cx="100" cy="106" rx="46" ry="52" fill="${skin}" ${ink()}/>
${hairFor(m)}
${faceFor(mood, m.accessory === 'big-grin' && mood !== 'lost' && mood !== 'critical')}
${accessoryFor(m, mood)}
${mood === 'lost' ? `<rect x="0" y="0" width="200" height="200" fill="${INK}" opacity=".18"/>` : ''}
</g>`,
    { attrs: `data-cast="${m.id}" data-mood="${mood}" aria-label="${m.name}, ${mood}"` },
  );
}

/** The crew crammed shoulder to shoulder behind a windshield, 8:3. */
export function crewRowSvg(cast: readonly number[], moods: readonly CrewMood[]): string {
  const n = Math.max(1, Math.min(cast.length, 8));
  const heads: string[] = [];
  const spacing = 1000 / n;
  for (let i = 0; i < n; i++) {
    const id = cast[i] ?? i + 1;
    const mood = moods[i] ?? 'good';
    const x = 100 + spacing * i + spacing / 2;
    const bob = i % 2 === 0 ? 0 : 30;
    // Reuse the head drawing, minus its own <svg> wrapper.
    const inner = crewHeadSvg(id, mood).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    heads.push(`<g transform="translate(${x - 90} ${130 + bob}) scale(0.9)">${inner}</g>`);
  }
  return svg(
    '0 0 1200 450',
    `<rect x="0" y="0" width="1200" height="450" fill="${SKY}"/>
<path d="M60 430 l40 -330 q500 -60 1000 0 l40 330z" fill="#BFE7F5" ${ink()} stroke-width="10"/>
${heads.join('')}
<rect x="0" y="400" width="1200" height="50" fill="${PAPER}" ${ink()}/>
${text(600, 438, cast.length ? 'THE CREW' : 'NOBODY ABOARD YET', { size: 30, spacing: 2 })}`,
  );
}
