# Review 001: boy-name database (694 records)

Reviewer: an AI playing a traditional purohit and Sanskrit scholar. Suitability calls reflect common naming practice and are opinions, not rulings. Where an etymology is uncertain (Rahul, Sachin, Nitin, Karan) the verdict says so rather than asserting a meaning. Nothing was checked against external texts in this session.

## Counts

| Set | keep | fix | reject | total |
|---|---|---|---|---|
| Hand-compiled (records 0-393) | 297 | 25 | 72 | 394 |
| Dictionary-generated, "unreviewed" (394-693) | 0 | 13 | 287 | 300 |
| Total | 297 | 38 | 359 | 694 |

The dictionary-generated sample was about 96% unusable (287 of 300). Only 13 survive, and each needs a rewritten meaning. The hand-compiled set is mostly sound, but its last block (records 290-393, the Vishnu Sahasranama epithets) is 60-70% unsuitable. Of the 72 hand-compiled rejects, 66 are in that block.

## Fifteen most common reject reasons (359 rejects)

1. obscure_figure (120): a minor epic or historical person known only from "Name of a man". Examples: Akrida, Arjunasimha, Ashvabahu, Avikshipa, Bhadrasara.
2. epithet_not_given_name (36): a Sahasranama or Vedic epithet not used for people. Examples: Bhutakrit, Bhutatma, Paramatma, Dhata, Babhru.
3. compound_or_adjective_not_a_name (33): a dictionary adjective or compound. Examples: Amritapaksha, Atisuhita, Brihadanika, Dadhrishvani.
4. inauspicious_or_negative_meaning (25): Examples: Agrahya, Lohitaksha, Duradharsha, Vyala, Pradosha, Kshudrabuddhi.
5. overlong_compound (24): Examples: Bhutabhavyabhavatprabhu, Narasimhavapu, Anadinidhana, Dhaturuttama.
6. demon_or_villain (20): asuras, rakshasas, nagas and Kaurava princes. Examples: Aniha, Dushpradharshana, Mayadhara, Sumali.
7. author_or_scholar_name (20): a poet, commentator or physician whose name was gathered from a colophon. Examples: Ballaladeva, Bhimakalambaka, Gokhala.
8. female_name (15): Examples: Sakshi, Bhavana, Siddhi, Kritih, Urmi, Ritu, Varaaroha.
9. common_noun_or_generic_term (14): Examples: Yoga, Sarva, Bharta, Rasabha (donkey), Tandula (rice).
10. title_or_honorific (13): Examples: Shamkaracharya, Padmapadacharya, Nitivarman, Devasharman.
11. technical_or_ritual_term (9): Examples: Vashatkara, Purusha, Kshetrajna, Krama, Samvatsara.
12. weapon_plant_or_animal (7): Examples: Sala, Shalyaka, Sarasiruh, Kachchhapa.
13. multiple_names_or_phrase (5): Examples: Lavkush, Muktanam Parama Gati, Yogavidam Neta, Nidhiravyaya.
14. place (4): Examples: Tirumala, Mathura, Shambhala, Nivartana.
15. buddhist_jain_figure (4): Examples: Merukuta, Trilokavira, Vasupujyaraj. Close behind: visarga_or_common_noun (3: Ahah, Samah, Vasumanah), surname_or_clan (2: Yadav, Sharma).

## Systemic problems

1. **Filter admits anything the dictionary labels "Name of ...".** The 300-record sample contained no mainstream names. The generator treats being a masculine proper name in the dictionary as sufficient. Most such entries are colophon authors, dynastic kings, Buddhist and Jain figures and demons.
2. **The meaning field is the dictionary gloss.** Some are empty ("Name of a man", "Name of a person") and some leak dictionary markup: "and 2088", "; vii, 5594", "(cf. giri-kzipa.)", "(v.l. su-mati)", "Comm. on.". The dictionary's Kz/Sz/Nj ASCII codes appear in the notes. Some glosses describe a different person from the name (Trinetra, Kusha, Ritu: the first is Shiva's epithet and the other two are given as obscure persons or a season).
3. **The hand-compiled set was extended mechanically with Vishnu Sahasranama epithets.** Records 290-393 contain whole phrases (Muktanam Parama Gati), sandhi-joined pairs (Nidhiravyaya, Sthaviro Dhruva), visarga forms (Ahah, Kritih, Pushkarakshah, Vasumanah, Samah), stem forms ending in -n/-t (Vishwakarma as विश्वकर्मन्) and abstract terms (Sarva, Yoga, Krama, Pratyaya).
4. **Stem form vs name form.** Devanagari is stored in dictionary stem form (शर्मन्, अथर्वन्, जटिन्, यतिन्, विजयिन्, श्रीमान्, तेजस्). Modern names normally drop the final halant or -n/-s stem ending, and the Devanagari field should match the form a family would write.
5. **Name and script do not agree in several hand-compiled records.** Mayank (मयाङ्क, should be मयंक), Nitin (नीतिमान् nītimat), Amol (अमूल्य), Sumeet (सुमित sumita), Karan (कर्ण karṇa), Ranjit (rañjita vs raṇajit), Yash (yaśas), Dhiren (धीरेन्द्र), Jaswant (यशस्वन्त). The generator mixes the modern vernacular name with a Sanskrit etymon from a different word.
6. **Transliteration patterns.**
   - ś and ṣ both become "sh" (Shiva, Shukla, Shrishtachaya). This loses information but is the accepted modern convention, so use it only for the display name and keep IAST exact.
   - ṛ becomes "ri" (Rijishvan, Hrishikesha); this is conventional.
   - c becomes "ch" and ch (छ) becomes "chh", with no consistent rule: Chhandana's IAST is "chandana", which is wrong for छ and collides with Chandana (sandalwood). Snehachchheda has irregular doubling.
   - Anusvara is rendered inconsistently: Shamkaracharya and Samtati use "m", while Shankar and Sanjay use "n".
   - ñ and ṅ appear as "n" (Sanjay, Shankar), also conventional.
   - Mixed long-vowel spellings: Poot- (Pootatma) vs Pu-, Apoorv vs Apurva, Jeevan vs Jivan, Aaditya vs Aditya, Deepak vs Dipak. The generator needs one rule: a primary display spelling plus a variants list.
7. **Names with visarga or bad endings.** Ahah, Kritih, Samah, Vasumanah, Pushkarakshah, Sthaviro Dhruva. Other names end in consonant clusters (Rijishvan, Sarasiruh, Priyakrit, Nrijit, Ghoshavat) or an unusual cluster before the ending (Hiranyashthivin).
8. **Gender is not checked.** Female or unisex forms went in: Sakshi, Siddhi, Bhavana, Kriti, Ritu, Urmi, Avanti, Ida, Gira, Ghritachi, Tapasya, Divi, Samtati, Varaaroha; and unisex Kiran, Gunjan, Dhanvi, Medhavi, Pavitra.
9. **Villain and negative-meaning entries pass.** Demons (Sumali, Makaraksha, Mayadhara), Kauravas (Dushpradharshana), "Not liberal", "Interruption of friendship", "Small-minded", "Horse-faced", "Vomiting gold".
10. **Place, community and surname words** are not separated from personal names (Tirumala, Yadav, Sharma, Mathura, Shambhala, Prajapati).
11. **Duplicates and near duplicates.** Vikram/Vikrami, Trilok/Tribhuvan, Sarvesh/Akhilesh/Sarveshwara, Chandana/Chhandana, Mahesh/Maheshachandra.
12. **Some hand-compiled meanings are weak**: "Name of a revered Vedic sage" (Agastya, Bharadwaj), "capable, efficient" (Rahul), "lotus" (Kunal), "cow-herd" (Gokul), "Protector of the people" (Janardan).

## Prioritized generator rule changes

1. **Gate on a positive allow-list, not on "masculine proper name".** Require at least one of: (a) an entry in a curated list of epic, Puranic and deity names; (b) attested modern frequency; (c) a manual approval flag. Anything else stays out of the user-facing data.
2. **Drop entries whose meaning is only "Name of ..." with no descriptive term.** If the gloss is "Name of a man/person/prince/king/author/poet/son of X", reject automatically. Only keep it when a meaning for the compound can be derived from its two parts and is checked by a human.
3. **Strip dictionary markup from meaning text** (regex for "(cf. ...)", "(v.l. ...)", "Comm. on", stray numbers, "; vii, 5594", "Kz/Sz" codes) before writing. Reject if the stripped text is under about 15 characters.
4. **Reject on keyword lists** in the meaning or name: Asura, Rākṣasa, Daitya, dānava, Nāga, Dhṛtarāṣṭra, Gandharva, Vānara (villain/minor mythic), Buddha, Arhat, Bodhisattva, Jain terms, author, poet, commentator, physician, teacher, philosopher, charioteer, horse, tax, sin (agha), disease.
5. **Reject titles and suffixes**: -ācārya, -tīrtha, -paṇḍita, -gaṇi, -bhaṭṭa, -dīkṣita, -yogin, -sarasvatī, -varman, -śarman. Vedic stem endings such as -mat/-vat are allowed only after a human check.
6. **Length and structure limits**: max about 14 Latin letters and at most two compound members; reject sandhi-joined pairs, spaces, verse lines and anything containing a visarga.
7. **Normalize endings once**: drop final visarga, final halant and -n/-s stem endings in the modern name (jaṭin to Jatin, śarman to Sharma/Sharman only if approved). Keep the Sanskrit stem in a separate field called `stem`.
8. **Gender filter**: reject names ending in -ā, -ī, -i for feminine nouns (-ā/-ī stems) unless they are in a male allow-list (Hari, Gopal, Prabhu); reject all meanings containing wife, daughter, goddess, apsara, queen.
9. **Reject common nouns and technical terms**: parts of speech other than proper nouns/epithets, grammar and ritual terms, weapons, plants, animals, places, rivers, seasons and units. Run a stop list and a meaning-type check ("tree", "city", "river").
10. **Transliteration rule table**: one function from IAST to display name, applied consistently: ś/ṣ to sh, c to ch, ch to chh, ṛ to ri, ṭ/ḍ/ṇ to t/d/n, ñ/ṅ/ṃ to n (m before labials). Always store IAST and Devanagari alongside. Validate by round-tripping IAST to Devanagari to the display name and flagging mismatches (Mayank, Nitin, Amol, Sumeet, Karan, Ranjit, Dhiren).
11. **Separate the display name from variants.** Store one primary spelling and an array of variants (Aditya, Aaditya; Dhruv, Dhruva; Deepak, Dipak).
12. **De-duplicate** on a normalized key (lowercase, vowel length folded, final -a dropped, sh/s folded) and merge variants under the most common spelling.
13. **Add flags in the schema**: `gender_confidence`, `meaning_confidence` (so uncertain etymologies like Rahul, Sachin, Nitin are shown as such) and `curation`. Treat all dictionary-derived records as not user-visible until a reviewer sets `curation` to `reviewed`.
14. **Meaning rewrite pass for hand-compiled names**: apply the 38 fixes in the verdicts file, then check each remaining gloss for generic wording ("Name of a sage") and replace it with the gotra, deity or story link.
