import json
d=json.load(open('rescue-40-input.json'))
K={
'Parashara':('Parashara','parāśara','पराशर','Name of the Vedic sage, father of Vyasa; etymology uncertain',[]),
'Vishvavasu':('Vishvavasu','viśvāvasu','विश्वावसु','Possessing all wealth; also a celestial musician (Gandharva)',[('viśva','all'),('vasu','wealth')]),
'Vishoka':('Vishoka','viśoka','विशोक','Free from sorrow',[('vi','without'),('śoka','sorrow')]),
'Devaprabha':('Devaprabha','devaprabha','देवप्रभ','Radiance of the gods',[('deva','god'),('prabhā','radiance')]),
'Ratnaketu':('Ratnaketu','ratnaketu','रत्नकेतु','Jewel-bannered; one whose banner is a jewel',[('ratna','jewel'),('ketu','banner')]),
'Vararuchi':('Vararuchi','vararuci','वररुचि','Of excellent splendour',[('vara','excellent'),('ruci','splendour')]),
'Pradatta':('Pradatta','pradatta','प्रदत्त','Given, bestowed (as a gift of God)',[('pra','forth'),('datta','given')]),
'Samvarana':('Samvarana','saṃvaraṇa','संवरण','Restraint, protection; name of an ancient king, father of Kuru',[]),
'Chakradatta':('Chakradatta','cakradatta','चक्रदत्त','Given by the discus (Vishnu\'s chakra)',[('cakra','discus'),('datta','given')]),
'Jayavarman':('Jayavarma','jayavarma','जयवर्म','Armour of victory',[('jaya','victory'),('varma','armour')]),
'Vishnuchandra':('Vishnuchandra','viṣṇucandra','विष्णुचन्द्र','Moon of Vishnu',[('viṣṇu','Vishnu'),('candra','moon')]),
'Vagbhata':('Vagbhata','vāgbhaṭa','वाग्भट','Master of speech; eloquent',[('vāc','speech'),('bhaṭa','master, warrior')]),
}
out=[]
for r in d:
    n=r['name']
    if n in K:
        a=K[n];f={'name':a[0],'iast':a[1],'devanagari':a[2],'meaning_en':a[3]}
        if a[4]:f['components']=[{'part':p,'gloss':g} for p,g in a[4]]
        out.append({'name':n,'verdict':'fix','reason':'other','fix':f})
    else:
        m=r['meaning_en'].lower()
        c='demon_or_villain' if any(x in m for x in ['asura','demon','rākṣasa','dānava','daitya','nāga','dhṛtarāṣṭra']) else 'title_or_honorific' if r['gate'].startswith('title') else 'obscure_figure'
        out.append({'name':n,'verdict':'reject','reason':c})
json.dump(out,open('/home/user/baby-name/data/reviews/rescue/rescue-40-verdicts.json','w'),ensure_ascii=False,indent=1)
assert [o['name'] for o in out]==[r['name'] for r in d]
import collections;print(collections.Counter(o['verdict'] for o in out))
