import json
d=json.load(open('cons-01-input.json'))
keep={'Ambhojakanta','Ambhojamitra','Ambhojananda','Ambhojapriya','Ambhojesha','Archanapriya','Ashramananda','Bakulakanta','Bakulananda','Bakulapriya','Bakulashekhara','Bakulasundari','Bhajanapriya','Dhamananda','Divyatejasvin','Divyasunetra','Divyasattva','Divyollasa','Homapriya','Japananda','Japapriya','Japaprakasha','Ambhojanatha','Bakulanandana'}
out=[]
for r in d:
    n=r['name']
    if n in keep: out.append({'name':n,'verdict':'keep','reason':'Sandhi correct, parts coherent, auspicious and plausible as a given name.'})
    elif r['gender']=='girl' and n.startswith('Arundhati'): out.append({'name':n,'verdict':'reject','reason':'other'})
    elif n.startswith('Divya'): out.append({'name':n,'verdict':'reject','reason':'nonsensical_compound'})
    elif r['gender']=='girl': out.append({'name':n,'verdict':'reject','reason':'nonsensical_compound'})
    else: out.append({'name':n,'verdict':'reject','reason':'nonsensical_compound'})
json.dump(out,open('cons-01-verdicts.json','w'),ensure_ascii=False,indent=1)
o=json.load(open('cons-01-verdicts.json'))
assert [x['name'] for x in o]==[x['name'] for x in d]
print(len(o),sum(x['verdict']=='keep' for x in o))
