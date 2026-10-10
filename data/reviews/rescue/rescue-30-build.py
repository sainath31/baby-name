import json
d=json.load(open('rescue-30-input.json'))
keep={
25:dict(name="Brihadbhanu",iast="bṛhadbhānu",devanagari="बृहद्भानु",meaning_en="Greatly radiant; a name of the sun and of Agni.",components=[{"part":"bṛhat","gloss":"great"},{"part":"bhānu","gloss":"light, sun"}]),
31:dict(name="Chitrabhanu",iast="citrabhānu",devanagari="चित्रभानु",meaning_en="Of brilliant light; the sun or fire.",components=[{"part":"citra","gloss":"bright, brilliant"},{"part":"bhānu","gloss":"light, sun"}]),
48:dict(name="Girisha",iast="girīśa",devanagari="गिरीश",meaning_en="Lord of the mountain; a name of Shiva.",components=[{"part":"giri","gloss":"mountain"},{"part":"īśa","gloss":"lord"}]),
188:dict(name="Yoganatha",iast="yoganātha",devanagari="योगनाथ",meaning_en="Lord of yoga; a name of Shiva.",components=[{"part":"yoga","gloss":"yoga"},{"part":"nātha","gloss":"lord"}]),
}
neg={11,52,177,18,162,184}
out=[]
for i,r in enumerate(d):
    if i in keep: out.append(dict(name=r['name'],verdict='fix',reason='Real, auspicious given name in usable form.',fix=keep[i]))
    else:
        if i in neg: c='negative_meaning'
        elif r['gate'].startswith('stem'): c='obscure_figure'
        else: c='compound_or_adjective'
        if i in (89,156,119,109,47,178): c='author_or_scholar'
        if i in (138,43,62,182): c='demon_or_villain'
        if i in (64,): c='nonsensical_compound'
        out.append(dict(name=r['name'],verdict='reject',reason=c))
json.dump(out,open('rescue-30-verdicts.json','w'),ensure_ascii=False,indent=1)
o=json.load(open('rescue-30-verdicts.json'))
assert [x['name'] for x in o]==[x['name'] for x in d]
print(len(o),sum(x['verdict']=='fix' for x in o))
