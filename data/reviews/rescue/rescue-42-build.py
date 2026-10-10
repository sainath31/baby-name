import json
d=json.load(open('rescue-42-input.json'))
S=lambda s:[int(x) for x in s.split()]
R={}
for c,s in {
'demon_or_villain':"5 8 9 10 11 12 14 25 29 30 36 37 38 39 40 41 42 48 49 50 51 52 64 70 73 74 76 77 78 79 80 83 89 100 102 105 108 112 123 125 129 132 136 142 143 144 145 146 150 162 164 166 170 171 176 178 179 180 183 185 186 188 189 192 193 195 35",
'obscure_figure':"2 28 45 109 121 133 140 167 72",
'buddhist_jain_figure':"6 26 34 47 57 84 90 99 104 110 155 160 175",
'title_or_honorific':"4 7 19 32 53 69 75 81 93 101 115 127 130 135 137 149 163 191 196",
'common_noun_or_technical_term':"65 174",
'author_or_scholar':"0 1 3 13 15 16 17 18 20 21 22 23 24 27 31 43 46 54 55 58 59 60 61 62 63 66 67 82 85 86 87 88 91 92 94 95 96 98 106 107 111 113 114 116 117 118 119 120 122 124 126 128 131 134 138 139 141 147 148 151 152 153 154 156 157 158 159 165 168 169 172 173 177 182 184 187 194 198 44",
}.items():
    for i in S(s):R[i]=c
K={
68:("Kavi","kavi","कवि","poet, a seer-poet; wise one",[]),
71:("Kirtivarman","kīrtivarman","कीर्तिवर्मन्","one protected by fame, i.e. renowned protector",[("kīrti","fame"),("varman","armour, protector")]),
97:("Mrityunjaya","mṛtyuñjaya","मृत्युञ्जय","conqueror of death; an epithet of Shiva",[("mṛtyu","death"),("jaya","victory, conqueror")]),
190:("Vishnudeva","viṣṇudeva","विष्णुदेव","god Vishnu; devoted to Vishnu",[("viṣṇu","Vishnu"),("deva","god")]),
197:("Yashovarman","yaśovarman","यशोवर्मन्","one whose armour is glory, glorious protector",[("yaśas","glory"),("varman","armour, protector")]),
33:("Dharma","dharma","धर्म","righteousness, duty, cosmic order",[]),
}
print([i for i in range(len(d)) if i not in R and i not in K]);out=[]
for i,r in enumerate(d):
    if i in K:
        n,ia,dv,m,c=K[i]
        out.append({"name":r["name"],"verdict":"fix","reason":"kept","fix":{"name":n,"iast":ia,"devanagari":dv,"meaning_en":m,"components":[{"part":a,"gloss":b} for a,b in c]}})
    else:
        out.append({"name":r["name"],"verdict":"reject","reason":R[i]})
json.dump(out,open('rescue-42-verdicts.json','w'),ensure_ascii=False,indent=1)
o=json.load(open('rescue-42-verdicts.json'))
assert [x['name'] for x in o]==[x['name'] for x in d]
print(len(o),sum(x['verdict']=='fix' for x in o),[x['name'] for x in o if x['verdict']=='fix'])
