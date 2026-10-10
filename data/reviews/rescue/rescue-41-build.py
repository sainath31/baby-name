import json
d=json.load(open('rescue-41-input.json'))
D='demon_or_villain';A='author_or_scholar';T='title_or_honorific';B='buddhist_jain_figure';O='obscure_figure'
R={}
def s(code,names):
    for n in names.split(): R[n]=code
s(D,"Adhikarna Akuli Andhaka Apakunja Balivira Bhasakarna Bhimavega Brahmapeta Chakraksha Dadhi Dantidaitya Dhritapada Dhumrita Dramita Durmarsha Elaparna Gavaksha Goshirsha Hastibhadra Hrasvakarna Kaitabha Karkota Kashipati Keshi Khanja Kirtisena Kuhara Kumbhanda Kupata Kuthana Madya Mahajaya Mahartha Mallasura Maninaga Narmara Nichandra Pakshu Pidapara Pitharaka Purnangada Raktamukha Rashmiketu Raupyanabha Shamkhakhya Shankhapinda Sthirabuddhi Sudamshtra Sukara Svabala Takshaka Timirgha Tryaksha Uchchhikha Upasunda Vairochi Varya Vatsasura Vemachitra Vidyutkesha Vikataksha Vivida Yajnopeta Dumbara Dvara Brihaka")
s(A,"Amaru Argata Aryashura Ashvadeva Aviraga Bashkali Bhaunda Bhudda Bijaka Bodhayana_ Chandrakavi Charpati Chitradhara Devasthali Dharkata Gajareva Gangadeva Gobhila Hala Harinabha Havirdhana Indrasimha Jagadrama Jalhana Jitamanyu Jumara Kalarnava Kallarya Kankalaya Kapalika Kapora Kautsa Korandaka Krishnadeva Kritnu Lalamani Lilachandra Loshtadeva Manasoka Mankada Masuraksha Maulugi Mayuraksha Minanatha Modosha Mrilika Munjaditya Naduvaha Nagayya Nandadasa Nipatithi Padmananda Panchara Paravastu Parshvadeva Paushpindi Pragahi Prajnapti Pranakrishna Priyaprada Raghumani Rayana Ruchinatha Rudrasuri Sadhukirti Sajoka Samvargya Saptavadhri Sarvadasa Satyabodha Savya Shaishira Shalika Shapeya Sharvadatta Shaurpanayya Shihlana Shivarnava Shrimitra Shrushti Shubhasana Shurasimha Shyavashva Soluka Somavyasa Sullana Uvata Vaguri Vakkuta Vancheshvara Vasunaga Vibhandaka Viradatta Vrishashushna Yajnaghosha Yashomitra Vishvaveda Vishnuchitta_")
s(T,"Agratirtha Astracharya Balacharya Bhadrasharman Bhanubhatta Devabhatta Dharmavarman Jatavarman Kshemasharman Mahibhatta Ramasharman Shakavarman Singabhatta Surabhatta Suribhatta Suryavarman Vidyabhatta Vindhyavarman Viravarman Yogibhatta")
s(B,"Gunaketu Jehila Nishpulaka Pratishtha Ratnakirti Sammatiya Shatakirti Simhadhvaja Vajragarbha Vararupa Vishvabhu Pushpadanta")
s(O,"Bhayamana")
keep={
'Maitreya':('Maitreya','maitreya','मैत्रेय','friendly, benevolent one; derived from mitra (friend)',[('mitra','friend'),('-eya','descended from / related to')]),
'Bodhayana':('Bodhayana','bodhāyana','बोधायन','descendant of Bodha; name of an ancient sage',[('bodha','awakening, knowledge')]),
'Punya':('Punya','puṇya','पुण्य','virtuous, meritorious, auspicious',[('puṇya','merit, virtue')]),
'Vishnuchitta':('Vishnuchitta','viṣṇucitta','विष्णुचित्त','one whose mind is on Vishnu',[('viṣṇu','Vishnu'),('citta','mind')]),
}
out=[]
for r in d:
    n=r['name']
    if n in keep:
        k=keep[n]
        out.append({'name':n,'verdict':'fix','reason':'genuine given name','fix':{'name':k[0],'iast':k[1],'devanagari':k[2],'meaning_en':k[3],'components':[{'part':a,'gloss':b} for a,b in k[4]]}})
    else:
        c=R.get(n) or R.get(n+'_')
        assert c,n
        out.append({'name':n,'verdict':'reject','reason':c})
json.dump(out,open('rescue-41-verdicts.json','w'),ensure_ascii=False,indent=1)
assert [o['name'] for o in out]==[r['name'] for r in d]
print(len(out),sum(o['verdict']=='fix' for o in out))
