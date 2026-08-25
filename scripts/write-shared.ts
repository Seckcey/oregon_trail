// `npm run shared`: write the sim's limits to shared/limits.json for the API.
import { writeFileSync } from 'node:fs';
import { sharedLimits } from '../src/sim/limits';

const path = new URL('../shared/limits.json', import.meta.url);
writeFileSync(path, `${JSON.stringify(sharedLimits(), null, 2)}\n`);
console.log(`wrote ${path.pathname}`);
