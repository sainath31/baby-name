import json
d=json.load(open('rescue-37-input.json'))
K={
"Meru":("Meru","meru","मेरु","the sacred golden mountain at the centre of the world",[("meru","sacred mountain")]),
"Taranatha":("Taranatha","tāranātha","तारानाथ","lord who helps one cross over; saviour",[("tāra","crossing, saving"),("nātha","lord")]),
"Sheshadri":("Sheshadri","śeṣādri","शेषाद्रि","the mountain of Shesha (the Tirumala hill, abode of Venkateshvara)",[("śeṣa","the serpent Shesha"),("adri","mountain")]),
"Kshemendra":("Kshemendra","kṣemendra","क्षेमेन्द्र","lord of well-being and security",[("kṣema","well-being, safety"),("indra","lord, chief")]),
"Palasha":("Palash","palāśa","पलाश","the palash (flame-of-the-forest) tree with bright orange flowers",[("palāśa","butea tree")]),
"Shamkha":("Shankha","śaṅkha","शङ्ख","conch shell, symbol of auspiciousness",[("śaṅkha","conch")]),
}
out=[]
for r in d:
  n=r['name']
  if n in K:
    f=K[n]
    out.append({"name":n,"verdict":"fix","reason":"genuine given name","fix":{"name":f[0],"iast":f[1],"devanagari":f[2],"meaning_en":f[3],"components":[{"part":a,"gloss":b} for a,b in f[4]]}})
    continue
  g=r['gate'];m=r['meaning_en'].lower()
  if g=='title-or-honorific': c='title_or_honorific'
  elif any(w in m for w in['dānava','daitya','asura','rākṣasa','demon','nāga','dānava']): c='demon_or_villain'
  elif 'buddha' in m or 'bodhisattva' in m or 'jain' in m or 'arhat' in m: c='buddhist_jain_figure'
  elif 'author' in m or 'poet' in m or 'teacher' in m or 'grammarian' in m or 'astronom' in m or 'physician' in m or 'commentator' in m: c='author_or_scholar'
  else: c='obscure_figure'
  out.append({"name":n,"verdict":"reject","reason":c})
json.dump(out,open('rescue-37-verdicts.json','w'),ensure_ascii=False,indent=1)
o=json.load(open('rescue-37-verdicts.json'))
assert [x['name'] for x in o]==[x['name'] for x in d]
from collections import Counter;print(Counter(x['verdict'] for x in o))
