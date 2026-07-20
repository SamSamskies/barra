/**
 * Maps exercise names to a YouTube search URL for form demonstrations.
 * Using search URLs keeps links resilient — specific video IDs can be removed,
 * but a well-formed search always returns relevant results.
 */
const q = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

export const EXERCISE_DEMOS: Record<string, string> = {
  'Pull-ups':                q('pull up proper form calisthenics'),
  'Chin-ups':                q('chin up proper form tutorial'),
  'Dead Hang':               q('dead hang exercise form benefits'),
  'Hollow Body Hold':        q('hollow body hold tutorial calisthenics'),
  'Scapular Pull-ups':       q('scapular pull ups tutorial form'),
  'Chest-to-Bar Pull-ups':   q('chest to bar pull up tutorial'),
  'Hanging Leg Raise':       q('hanging leg raise proper form'),
  'Explosive Pull-ups':      q('explosive pull ups tutorial'),
  'High Pull-ups':           q('high pull ups calisthenics tutorial'),
  'Hollow Body Swings':      q('hollow body swing bar kip tutorial'),
  'Hip Drive Drill':         q('hip drive drill bar muscle up'),
  'Assisted Archer Pull-ups':q('archer pull up assisted tutorial'),
  'Archer Pull-ups':         q('archer pull up tutorial calisthenics'),
  'L-sit Hang':              q('l sit hang bar tutorial'),
  'Slow Negatives':          q('slow negative pull up eccentric training'),
  'Negative Muscle-ups':     q('negative muscle up tutorial'),
  'Dip Negatives':           q('dip negatives eccentric tutorial'),
  'Ring Dips':               q('ring dips tutorial calisthenics'),
  'Parallel Bar Dips':       q('parallel bar dips proper form'),
  'Banded Muscle-ups':       q('banded muscle up tutorial'),
  'Transition Practice':     q('muscle up transition wrist turnover tutorial'),
  'Muscle-up Attempts':      q('muscle up tutorial proper form'),
  'Muscle-ups':              q('muscle up proper form calisthenics'),
  'Weighted Pull-ups':       q('weighted pull ups tutorial'),
  'Ring Muscle-ups':         q('ring muscle up tutorial'),
};
