const fs = require('fs');

const sponsors = [
  { id: 'royal_enfield', name: 'Royal Enfield' },
  { id: 'ansys', name: 'Ansys' },
  { id: 'easemytrip', name: 'EaseMyTrip' },
  { id: 'skill_ap', name: 'Skill AP' },
  { id: 'smev', name: 'SMEV' },
  { id: 'ck_birla', name: 'CK Birla Group' },
  { id: 'luminous', name: 'Luminous' },
  { id: 'hero_electric', name: 'Hero Electric' },
  { id: 'roshi_motors', name: 'Roshi Motors' },
  { id: 'altair', name: 'Altair' }
];

sponsors.forEach(s => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200" width="100%" height="100%">
  <rect width="400" height="200" fill="transparent" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" font-weight="900" fill="#2B303A" letter-spacing="2" text-transform="uppercase">
    ${s.name}
  </text>
</svg>`;
  fs.writeFileSync(`public/sponsors/${s.id}.svg`, svg);
});
console.log("SVGs generated.");
