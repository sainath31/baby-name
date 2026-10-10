import json
d=json.load(open('rescue-25-input.json'))
O='obscure_figure';C='common_noun_or_technical_term';N='negative_meaning';CA='compound_or_adjective';E='epithet_not_given_name';DV='demon_or_villain';T='title_or_honorific';B='buddhist_jain_figure'
R={0:T,1:C,2:O,3:O,4:C,5:O,6:CA,7:N,8:O,9:O,10:O,11:O,12:O,13:O,14:O,15:O,16:C,17:CA,18:O,19:B,20:C,21:CA,22:B,23:O,24:O,25:O,26:O,27:O,28:O,29:O,30:CA,31:O,33:DV,34:O,35:N,36:CA,37:O,38:N,39:O,40:O,41:O,42:O,43:'female_name',44:E,45:O,46:O,47:O,50:C,51:O,52:N,53:O,54:CA,55:E,56:O,57:C,58:N,59:'multiple_names_or_phrase',60:DV,62:O,63:'place_or_river',64:O,65:O,66:O,67:E,68:T,69:O,70:CA,71:O,72:O,73:'place_or_river',74:O,75:C,76:O,77:C,78:O,79:N,80:C,81:C,82:O,83:O,84:N,85:O,86:CA,87:C,88:N,89:C,90:O,91:O,92:CA,93:O,94:C,95:None,96:O,97:O,98:E,99:O,100:O,101:O,102:C,103:CA,105:O,106:CA,107:O,108:O,109:O,110:O,111:O,112:O,113:C,115:O,116:CA,117:CA,118:C,119:N,120:CA,121:O,122:O,124:CA,125:O,126:O,127:C,128:O,129:O,130:O,131:C,132:O,133:O,134:C,135:O,137:CA,138:O,140:CA,141:O,142:O,143:O,144:O,145:DV,146:N,147:N,148:O,149:O,150:O,151:O,152:CA,153:O,154:N,155:O,156:O,157:O,158:O,159:O,160:O,161:O,162:C,163:O,164:O,165:N,166:CA,167:O,168:CA,169:N,170:O,171:O,172:O,173:E,174:CA,175:CA,176:O,177:O,178:CA,179:O}
K={32:('Dhruvasena','dhruvasena','ध्रुवसेन','one whose army is steadfast','dhruva','steadfast','sena','army'),
123:('Suryaprabha','sūryaprabha','सूर्यप्रभ','radiance of the sun','sūrya','sun','prabhā','radiance'),
114:('Shukadeva','śukadeva','शुकदेव','divine Shuka, after the sage Shuka','śuka','parrot; the sage Shuka','deva','god, divine'),
48:('Jayananda','jayānanda','जयानन्द','joy of victory','jaya','victory','ānanda','joy'),
104:('Satyapala','satyapāla','सत्यपाल','protector of truth','satya','truth','pāla','protector'),
95:('Ratnapala','ratnapāla','रत्नपाल','protector of jewels','ratna','jewel','pāla','protector'),
49:('Jnanadatta','jñānadatta','ज्ञानदत्त','given knowledge; gift of knowledge','jñāna','knowledge','datta','given'),
139:('Vasudatta','vasudatta','वसुदत्त','given wealth; gift of wealth','vasu','wealth','datta','given'),
136:('Vajradatta','vajradatta','वज्रदत्त','given the thunderbolt','vajra','thunderbolt','datta','given'),
61:('Kshemavan','kṣemavān','क्षेमवान्','one who is secure and prosperous','kṣema','safety, well-being','-vān','possessing')}
out=[]
for i,r in enumerate(d):
    if i in K:
        n,ia,dv,m,a,b,c,e=K[i]
        out.append({'name':r['name'],'verdict':'fix','reason':'usable given name','fix':{'name':n,'iast':ia,'devanagari':dv,'meaning_en':m,'components':[{'part':a,'gloss':b},{'part':c,'gloss':e}]}})
    else:
        out.append({'name':r['name'],'verdict':'reject','reason':R[i]})
json.dump(out,open('rescue-25-verdicts.json','w'),ensure_ascii=False,indent=1)
v=json.load(open('rescue-25-verdicts.json'))
assert [x['name'] for x in v]==[x['name'] for x in d]
assert all(x['reason'] for x in v)
print(len(v),sum(x['verdict']=='fix' for x in v))
