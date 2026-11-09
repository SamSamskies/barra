const q = (query: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
// Search links are labeled as such: examples do not replace the setup/safety cues.
export const EXERCISE_DEMOS: Record<string, string> = {
  'Supported Hang': q('feet supported dead hang beginner tutorial'),
  'Supported Scapular Pull-ups': q('feet supported scapular pull ups straight arms tutorial'),
  'Assisted Pull-ups': q('band assisted pull up safe setup platform tutorial'),
  'Strict Pull-ups': q('strict pull up controlled form tutorial'),
  'Supported Straight-Bar Support': q('straight bar support hold feet assisted safe setup'),
  'Straight-Bar Support': q('straight bar support hold safe mount platform'),
  'Assisted Straight-Bar Dips': q('feet assisted straight bar dip beginner tutorial'),
  'Straight-Bar Dips': q('straight bar dip controlled technique tutorial'),
  'Assisted Chest-to-Bar Pull-ups': q('band assisted chest to bar pull up strict tutorial'),
  'Chest-to-Bar Pull-ups': q('strict chest to bar pull up technique'),
  'Higher Pulls': q('bar muscle up high pull technique controlled'),
  'Feet-Supported Bar Turnover': q('low bar feet supported muscle up transition drill'),
  'Band-Assisted Bar Muscle-ups': q('band assisted bar muscle up safe band setup tutorial'),
  'Controlled Muscle-Up Attempts': q('controlled bar muscle up progression technique'),
  'Controlled Bar Muscle-ups': q('controlled bar muscle up clean technique tutorial'),
};
