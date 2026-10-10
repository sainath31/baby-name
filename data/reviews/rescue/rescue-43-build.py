import json
d=json.load(open('rescue-43-input.json'))
keep={
"Sumanyu":("Sumanyu","sumanyu","सुमन्यु","Well-disposed, good-minded (also the name of a Vedic sage)",[("su","good"),("manyu","mind, spirit")]),
"Satyadeva":("Satyadeva","satyadeva","सत्यदेव","God of truth; one whose divinity is truth",[("satya","truth"),("deva","god")]),
"Vidyananda":("Vidyananda","vidyānanda","विद्यानन्द","Bliss of knowledge",[("vidyā","knowledge"),("ānanda","bliss")]),
"Siddhananda":("Siddhananda","siddhānanda","सिद्धानन्द","Bliss of the accomplished one",[("siddha","accomplished"),("ānanda","bliss")]),
"Krishnananda":("Krishnananda","kṛṣṇānanda","कृष्णानन्द","Bliss of Krishna; one who delights in Krishna",[("kṛṣṇa","Krishna"),("ānanda","bliss")]),
"Mahipati":("Mahipati","mahīpati","महीपति","Lord of the earth, king",[("mahī","earth"),("pati","lord")]),
"Ravidatta":("Ravidatta","ravidatta","रविदत्त","Given by the sun",[("ravi","sun"),("datta","given")]),
"Haradasa":("Haradasa","haradāsa","हरदास","Servant of Hara (Shiva)",[("hara","Shiva"),("dāsa","servant")]),
"Vishnuhari":("Vishnuhari","viṣṇuhari","विष्णुहरि","Vishnu who is Hari; devotee of Vishnu-Hari",[("viṣṇu","Vishnu"),("hari","Hari")]),
"Vatsyayana":("Vatsyayana","vātsyāyana","वात्स्यायन","Descendant of Vatsa (name of a sage)",[("vatsa","calf, beloved child"),("āyana","descendant")]),
}
dem={0,1,2,6,24,26,29,30,33,38,40,41,50,51,53,55,56,59,60,63,64,65,66,67,69,74,83,84,85,110,112,114,116,129,130,132,133,141,142,146,153,163,170,171,176,183,185,186,189,191,192,194,195,197,45,60}
auth={3,4,7,10,12,14,16,17,18,20,27,31,32,34,35,36,39,42,43,44,47,48,52,54,58,61,62,68,71,73,75,76,77,78,79,80,81,82,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,105,107,115,118,119,120,122,123,127,128,131,136,138,139,140,143,144,147,148,149,150,151,154,156,157,158,160,166,167,168,172,173,177,178,179,180,182,184,187,188,190,196,198,5,8,9,13,46,134,135,111,125,109,104,21,161,174}
tit={11,15,19,23,25,28,37,49,113,124,159,165,193}
bud={22,57,72,106,117,145,152,155,175,174}
out=[]
for i,r in enumerate(d):
    n=r['name']
    if n in keep:
        f=keep[n]
        out.append({"name":n,"verdict":"fix","reason":"genuine given name","fix":{"name":f[0],"iast":f[1],"devanagari":f[2],"meaning_en":f[3],"components":[{"part":a,"gloss":b} for a,b in f[4]]}})
        continue
    if i in bud: c="buddhist_jain_figure"
    elif i in dem: c="demon_or_villain"
    elif i in tit: c="title_or_honorific"
    elif i in auth: c="author_or_scholar"
    elif i==70: c="negative_meaning"
    elif i==162 or i==164: c="obscure_figure"
    elif i in(121,169,108,114,126,137,155): c="obscure_figure"
    else: c="obscure_figure"
    out.append({"name":n,"verdict":"reject","reason":c})
json.dump(out,open('rescue-43-verdicts.json','w'),ensure_ascii=False,indent=1)
from collections import Counter
print(len(out),len(d),Counter(o['verdict'] for o in out),all(a['name']==b['name'] for a,b in zip(out,d)))
print([o['name'] for o in out if o['verdict']=='fix'])
