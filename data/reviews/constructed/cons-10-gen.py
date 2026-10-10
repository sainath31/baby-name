import json
d=json.load(open('cons-10-input.json'))
keep={'Vijnanadipa':'Lamp of knowledge; well formed, auspicious.','Vijnanapriya':'Dear to knowledge; sandhi correct, auspicious.','Vijnanapati':'Master of knowledge; sandhi correct, auspicious.'}
fix={'Vijnanesha':{'name':'Vijnaneshwara','devanagari':'विज्ञानेश्वर','iast':'vijñāneśvara','meaning_en':'Lord of knowledge.'}}
out=[]
for r in d:
    n=r['name']
    if n in keep: out.append({'name':n,'verdict':'keep','reason':keep[n]})
    elif n in fix: out.append({'name':n,'verdict':'fix','reason':'Attested form is Vijnaneshwara.','fix':fix[n]})
    else:
        if r['gender']=='girl' and n.endswith(('devi','mayi','vati')): why='Awkward feminine compound with abstract or object word; not a real name.'
        else: why='Abstract or object word (garden, creeper, tree, rain, liberated) joined to a suffix; not a name families give.'
        out.append({'name':n,'verdict':'reject','reason':why if False else 'nonsensical_compound: '+why})
json.dump(out,open('cons-10-verdicts.json','w'),ensure_ascii=False,indent=1)
o=json.load(open('cons-10-verdicts.json'))
assert [x['name'] for x in o]==[x['name'] for x in d]
from collections import Counter;print(Counter(x['verdict'] for x in o))
