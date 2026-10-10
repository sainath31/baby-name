import json
d=json.load(open('rescue-39-input.json'))
K={
'Giridhara':('Giridhara','giridhara','गिरिधर','Holder of the mountain; an epithet of Krishna who lifted Govardhana',[('giri','mountain'),('dhara','holder')]),
'Subandhu':('Subandhu','subandhu','सुबन्धु','Good friend or kinsman; a Vedic seer',[('su','good'),('bandhu','friend, kinsman')]),
'Suhotra':('Suhotra','suhotra','सुहोत्र','One who performs good sacrifice; a Vedic seer and a king',[('su','good'),('hotra','sacrificial offering')]),
'Prabuddha':('Prabuddha','prabuddha','प्रबुद्ध','Fully awakened, enlightened',[('pra','fully'),('buddha','awakened')]),
'Virabhanu':('Virabhanu','vīrabhānu','वीरभानु','Heroic sun; brave and radiant',[('vīra','hero'),('bhānu','sun')]),
'Ganendra':('Ganendra','gaṇendra','गणेन्द्र','Lord of the ganas; an epithet of Ganesha',[('gaṇa','host, attendants of Shiva'),('indra','lord')]),
}
out=[];n=0
for r in d:
  if r['name'] in K:
    a=K[r['name']];n+=1
    out.append({'name':r['name'],'verdict':'fix','reason':'usable given name','fix':{'name':a[0],'iast':a[1],'devanagari':a[2],'meaning_en':a[3],'components':[{'part':p,'gloss':g} for p,g in a[4]]}})
  else:
    g=r['gate'];m=r['meaning_en'].lower()
    out.append({'name':r['name'],'verdict':'reject','reason':'other'})
json.dump(out,open('rescue-39-verdicts.json','w'),ensure_ascii=False,indent=1)
print(n,len(out))
R={}
def s(code,idx):
  for i in idx: R[i]=code
s('demon_or_villain',[2,4,5,6,9,11,15,28,30,34,36,37,38,39,53,54,60,62,65,71,77,79,84,85,87,90,92,94,102,106,107,110,111,113,133,134,141,146,149,153,155,162,163,164,165,179,184,185,186,122,152,73,187,172,38])
s('buddhist_jain_figure',[0,7,29,40,43,58,95,105,126,127,136,138,150,170,171,178,47,198,3])
s('title_or_honorific',[1,20,24,25,27,31,42,46,50,51,52,57,59,63,74,76,86,96,97,100,112,125,128,130,154,156,157,159,176,190,191,192,195,196])
s('author_or_scholar',[8,10,12,13,14,16,17,18,19,21,22,23,26,32,33,35,41,44,49,55,56,61,64,66,67,68,69,70,72,75,78,80,81,82,83,88,89,91,93,98,99,101,103,104,108,109,114,115,116,117,118,119,120,121,123,124,129,131,132,135,137,139,140,142,143,144,145,147,148,151,158,166,167,168,169,173,174,175,177,180,181,182,183,188,189,193,194,197,48,45])
for i,o in enumerate(out):
  if o['verdict']=='reject':
    o['reason']=R.get(i,'other')
    if i not in R: print('unassigned',i,o['name'])
json.dump(out,open('rescue-39-verdicts.json','w'),ensure_ascii=False,indent=1)
