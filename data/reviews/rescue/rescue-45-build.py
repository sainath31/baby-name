import json
d=json.load(open('rescue-45-input.json'))
A='author_or_scholar';D='demon_or_villain';O='obscure_figure';T='title_or_honorific';B='buddhist_jain_figure';C='compound_or_adjective';N='common_noun_or_technical_term'
R={}
def s(c,*ix):
    for i in ix:R[i]=c
s(B,0,56,57,69,70,81,84,94,113,126,128,133,142,152,118)
s(A,1,2,4,5,6,7,9,10,14,15,16,17,19,20,21,22,23,26,27,28,31,32,33,34,35,36,38,40,41,42,43,48,49,54,55,58,61,62,63,65,67,68,71,74,75,76,79,82,86,88,89,90,93,97 if False else 93,105,106,108,109,111,115,116,120,121,123,124,125,127,129,130,132,134,135,138,143,144,147,150,160,163,164,167,168,171,176,178,180 if False else 176,181,182,185,189,190,191,194,195,45 if False else 3 if False else 14)
s(D,3,8,12,44,51,52,60,64,66,72,78,83,87,95,96,100,103,104,107,131,139,141,146,153,158,166,172,174,175,177,183,184,186,187,192,193,196)
s(T,11,13,24,46,47,73,101,122,136,137,140,149,151,154,156,159,161)
s(O,18,25,29,30,37,39,45,50,53,59,77,80,85,91,92,98,110,112,114,117,119,145,148,155,157,162,165,169,170,173,179,188,197,198,60 if False else 59)
s(N,102)
s(O,180)
R.pop(97,None)
Keep={
99:dict(name='Nagadatta',iast='nāgadatta',devanagari='नागदत्त',meaning_en='Given by the Nāga (serpent deity); a gift of the Nāgas',components=[{'part':'nāga','gloss':'serpent deity'},{'part':'datta','gloss':'given'}]),
97:dict(name='Muktananda',iast='muktānanda',devanagari='मुक्तानन्द',meaning_en='Bliss of liberation',components=[{'part':'mukta','gloss':'liberated'},{'part':'ānanda','gloss':'bliss'}]),
4:dict(name='Anubhuti',iast='anubhūti',devanagari='अनुभूति',meaning_en='Direct experience, realisation',components=[{'part':'anu','gloss':'along, after'},{'part':'bhūti','gloss':'being, experience'}]),
180:dict(name='Vasusena',iast='vasusena',devanagari='वसुसेन',meaning_en='Having an army of wealth; a name of Karna',components=[{'part':'vasu','gloss':'wealth'},{'part':'sena','gloss':'army'}]),
}
out=[]
for i,r in enumerate(d):
    if i in Keep: out.append({'name':r['name'],'verdict':'fix','reason':'kept: genuine given name','fix':Keep[i]})
    else:
        assert i in R,(i,r['name'])
        out.append({'name':r['name'],'verdict':'reject','reason':R[i]})
json.dump(out,open('rescue-45-verdicts.json','w'),ensure_ascii=False,indent=1)
o=json.load(open('rescue-45-verdicts.json'))
assert [x['name'] for x in o]==[x['name'] for x in d]
print(len(o),sum(x['verdict']=='fix' for x in o))
