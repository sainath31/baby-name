// Automatic quality gate for dictionary-generated names, from the priest-reviewer findings
// (data/reviews/review-001-commentary.md). Hand-compiled names skip this gate.
// Returns { listed, reason }. Unlisted names stay in the data but are not shown to users.
const GENERIC_MEANING = /^name of (a|an|the|one of the)?\s*(\w+\s){0,2}?(man|men|person|prince|king|author|poet|son|teacher|pupil|minister|sage|brahman|warrior|scholar|being)\.?$/i;
const BAD_MEANING = /\b(asura|rākṣasa|raksasa|daitya|dānava|danava|nāga|naga|serpent|gandharva|vānara|monkey|buddha|arhat|bodhisattva|jain|jaina|tīrtha-?kara|author|poet|commentator|scholiast|physician|teacher|philosopher|grammarian|astronomer|charioteer|dhṛtarāṣṭra|kaurava|demon|villain|enemy|disease|sin|wife|daughter|goddess|apsaras|queen|princess|mother|sister|horse|donkey|tax|cheat|thief)\b/i;
const MARKUP = /\(cf\.|\(v\.l\.|\bComm\.|;\s*[ivx]+,\s*\d+|\b\d{3,}\b|\bKz|\bSz|\bNj|\bN\.\s*of\b/;
const BAD_SUFFIX = /(ācārya|acarya|tīrtha|tirtha|paṇḍita|pandita|gaṇi|bhaṭṭa|bhatta|dīkṣita|diksita|yogin|sarasvatī|sarasvati|varman|śarman|sharman|svāmin|svamin|ānanda-?tīrtha)$/i;

// Generated names are listed only when the dictionary says the name belongs to a deity or a major figure;
// everything else is the reviewer's "obscure figure" class and stays in the data as a candidate.
const MAJOR = /\b(Śiva|Viṣṇu|Kṛṣṇa|Indra|Agni|Brahmā|Gaṇeśa|Skanda|Kārttikeya|Sūrya|Varuṇa|Yama|Kubera|Vāyu|Soma\b|Rāma|Hanumat|Garuḍa|Balarāma|Śeṣa|Candra|Bṛhaspati|Nārāyaṇa|Rudra|Mahādeva|Vāsudeva|Pāṇḍava|Arjuna|Bhīma|Yudhiṣṭhira|Nakula|Sahadeva|Karṇa|Lakṣmaṇa|Bharata|Śatrughna|Daśaratha|Janaka|Hariścandra|Pṛthu|Manu\b|Vyāsa|Vasiṣṭha|Viśvāmitra|Nārada|Bharadvāja|Agastya|Atri\b|Gautama|Jamadagni|Kaśyapa|Vālmīki|Dhruva|Prahlāda|Aṅgada|Sugrīva|Lava\b|Kuśa\b|Abhimanyu|Parīkṣit|Janamejaya|Bhīṣma|Droṇa|Kṛpa|Vidura|Sañjaya|Ṛṣabha|Mahāvīra)\b/;

const IDENTITY = new RegExp('^Name of (?:the |a |an )?(?:sage |god |deity |great |famous |celebrated )?' + MAJOR.source.slice(2, -2) + '(?:[ ,;.]|$)');

export function assess(n) {
  if (!n.curation) return { listed: true, reason: '' };          // hand-compiled
  if (n.origin === 'constructed') return { listed: false, reason: 'awaiting-review' }; // rule-built names go live only after a reviewer keeps them
  const iast = n.iast || '';
  const meaning = (n.meaning_en || '').replace(/\s+/g, ' ').trim();
  if (/[ḥ\s]/.test(iast)) return { listed: false, reason: 'visarga-or-phrase' };
  if (n.name.length > 14) return { listed: false, reason: 'too-long' };
  if ((n.components || []).length > 2) return { listed: false, reason: 'overlong-compound' };
  if (BAD_SUFFIX.test(iast)) return { listed: false, reason: 'title-or-honorific' };
  if (/[āī]$/.test(iast)) return { listed: false, reason: 'likely-feminine-stem' };
  if (!/[aāiīuūeo]$/.test(iast) && !/(an|in|as|at)$/.test(iast)) return { listed: false, reason: 'consonant-stem-ending' };
  if (/(n|t|s|r|m)$/.test(iast) && n.kind !== 'name') return { listed: false, reason: 'stem-form' };
  if (MARKUP.test(meaning) || /\(\s*[,)]|sacrifice|\bcf\b/i.test(meaning)) return { listed: false, reason: 'dictionary-markup' };
  if (BAD_MEANING.test(meaning)) return { listed: false, reason: 'villain-minor-or-unsuitable-role' };
  if (GENERIC_MEANING.test(meaning) || meaning.replace(/^name of /i, '').length < 8) return { listed: false, reason: 'generic-meaning' };
  if (n.kind === 'word') return { listed: false, reason: 'common-word-not-a-name' };
  if (!IDENTITY.test(meaning) || /\bsee\b|[’ʼ']s\b|\bsons?\b|\bfather\b/i.test(meaning)) return { listed: false, reason: 'obscure-figure' };
  return { listed: true, reason: '' };
}
