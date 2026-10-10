import json
d=json.load(open('rescue-38-input.json'))
keep={
'Purna':('Purna','pūrṇa','पूर्ण','Full, complete, fulfilled',[('pūrṇa','full, complete')]),
'Sukirti':('Sukirti','sukīrti','सुकीर्ति','Of good fame; one of excellent renown',[('su','good'),('kīrti','fame')]),
'Jnananidhi':('Jnananidhi','jñānanidhi','ज्ञाननिधि','Treasure of knowledge',[('jñāna','knowledge'),('nidhi','treasure')]),
'Virasimha':('Virasimha','vīrasiṃha','वीरसिंह','Heroic lion; lion among heroes',[('vīra','hero'),('siṃha','lion')]),
'Dhanika':('Dhanika','dhanika','धनिक','Wealthy one; prosperous',[('dhana','wealth')]),
}
out=[]
for r in d:
    n=r['name']
    if n in keep:
        a,b,c,m,comp=keep[n]
        out.append({'name':n,'verdict':'fix','reason':'kept','fix':{'name':a,'iast':b,'devanagari':c,'meaning_en':m,'components':[{'part':p,'gloss':g} for p,g in comp]}})
        continue
    m=r['meaning_en'].lower()
    if any(k in m for k in ['rākṣasa','asura','daitya','dānava','nāga','serpent','demon','gandharva','vānara','monkey','enemy']): c='demon_or_villain'
    elif any(k in m for k in ['buddha','bodhisattva','jaina']): c='buddhist_jain_figure'
    elif any(k in m for k in ['author','poet','grammarian','commentator','astronomer','physician','philosopher','teacher','ṛṣi','āṅgirasa','brahman']): c='author_or_scholar'
    elif r['gate']=='title-or-honorific' or 'śarman' in r['iast'] or 'svāmin' in r['iast'] or 'bhaṭṭa' in r['iast'] or 'ācārya' in r['iast']: c='title_or_honorific'
    else: c='obscure_figure'
    out.append({'name':n,'verdict':'reject','reason':c})
json.dump(out,open('rescue-38-verdicts.json','w'),ensure_ascii=False,indent=1)
o=json.load(open('rescue-38-verdicts.json'))
assert [x['name'] for x in o]==[x['name'] for x in d]
from collections import Counter;print(Counter(x['reason'] for x in o))
