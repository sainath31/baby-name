import json
d=json.load(open('rescue-34-input.json'))
R={}
def g(code,s):
    for n in s.split(): R[n]=code
g('obscure_figure','Abhyavartin Asamaujas Ashushravas Bahvashin Balivardin Bhanumatin Bhrigvangiras Brihanmanas Chakrayodhin Chulin Devashravas Dhanadharman Dirghatapas Gaurashiras Ghodacholin Gritsatamas Iddhatejas Jaras Kabandhin Kakavarnin Karotin Keshin Kritaujas Kshataujas Kshetradharman Mahaloman Malyavan Marshtimat Mayas Meghavasas Nagadhanvan Naradin Prabhavan Prapathin Rajadharman Randhas Rochishmat Rukmavat Sannatimat Sarpirmalin Satyasahas Shaundrin Shrutarvan Somarajan Strimanin Sutashravas Tamas Tushtimat Ulkamalin Vakshas Varchasvin Vedashiras Vratin Dashaspati Gomat Manimat')
g('author_or_scholar','Chandragomin Charpatin Haribrahman Mahiman Shivayajvan Svamishastrin Tapurmurdhan Shrilakshman Shalishiras')
g('demon_or_villain','Dvimurdhan Gandhamalin Pishachakin Vaitalin Vrishaparvan')
g('epithet_not_given_name','Kapalin Konavadin Paridhin Samavartin Sarvavyapin Urdhvaretas Yajnahan Hasas Didhitimat Tripat Tigmatejas Kupapa Hindikanta Ishasakhi Smarankusha Shiromauli Pandavat Udayin')
g('buddhist_jain_figure','Vipashyin Sthiramati')
g('title_or_honorific','Rajavetrin Sadbhritya Sukshatriya Sushishya Vidvajjana Suhrijjana Sudeshika Purvajina Mahasadhu')
g('negative_meaning','Anudbhasin Aravan Nishkanta Kamavasha Laghukrita Chhagamitra')
g('female_name','Surasa Sindhuja Bhurati')
g('compound_or_adjective','Agnibhrajas Agrayayin Alpavayas Amshupati Atigargya Atisvastha Atyanila Avashtabdha Bahugandha Bhadrakumbha Brahmakuta Chandrardha Dharmakupa Dridhabuddhi Dridhanira Drishtiguru Hemakaksha Jvalanabhu Kshubdharnava Madhyaditya Mrigapota Nrisoma Pashuraja Pratiharsha Pratyarka Priyasatya Punaraja Pushtikanta Ratnabahu Ribhushthira Samujjvala Shantarava Shashija Shikhikana Shuddhabhava Shukrashocha Suprayoga Suryaloka Suvarnaksha Svarnaraga Ugragandha Urusvana Utprabha Vahnidhauta Vatavega Vayuketu Vijayishtha Virashreshtha Vishvasakha Vitashanka Yashoyuta Arkaja Apamnidhi Anayya')
g('common_noun_or_technical_term','Bhagin Dhrishat Jayakankshin Jeman Munjavat Nipaka Praharin Prakashaka Prithupajas Sahabhavin Sahvan Samjayin Shachivat Shubhvan Shvasin Sunritavat Tattvartha Vibhavin Vilasin Vishadatman Prabhavan')
F={
'Dhimat':('Dhiman','dhīman','धीमन्','intelligent, wise one',[('dhī','intellect'),('-man','possessing')]),
'Dyutimat':('Dyutiman','dyutimān','द्युतिमान्','radiant, full of splendour',[('dyuti','splendour'),('-mat','possessing')]),
'Vasumat':('Vasuman','vasumān','वसुमान्','wealthy, possessor of treasure',[('vasu','wealth'),('-mat','possessing')]),
'Satyavritta':('Satyavrat','satyavrata','सत्यव्रत','one whose vow is truth',[('satya','truth'),('vrata','vow')]),
'Puramjaya':('Puranjaya','purañjaya','पुरञ्जय','conqueror of cities',[('pura','city'),('jaya','conquest')]),
'Satyadhvaja':('Satyadhvaja','satyadhvaja','सत्यध्वज','one whose banner is truth',[('satya','truth'),('dhvaja','banner')]),
}
out=[]
for r in d:
    n=r['name']
    if n in F:
        a=F[n]
        out.append({'name':n,'verdict':'fix','reason':'usable given name after normalising stem ending','fix':{'name':a[0],'iast':a[1],'devanagari':a[2],'meaning_en':a[3],'components':[{'part':p,'gloss':q} for p,q in a[4]]}})
    else:
        assert n in R,n
        out.append({'name':n,'verdict':'reject','reason':R[n]})
json.dump(out,open('rescue-34-verdicts.json','w'),ensure_ascii=False,indent=1)
print(len(out),sum(o['verdict']=='fix' for o in out),len(set(R)-{r['name'] for r in d}))
