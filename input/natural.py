import random

# http://www.statcan.gc.ca/pub/84-215-x/84-215-x2012001-eng.htm

gender = ['M']*6 + ['F']*4          # 60% male 40% Female

# made number of records by age group
ages = ['<16']*13 + ['16-25']*43 + ['26-35']*58 + ['36-45']*107 + ['46-55']*300 + \
        ['56-65']*545+ ['66-75']*810 + ['76-85']*1400 + ['86+']*900

def choose(mylist):
    return str(random.choice(mylist))+ ','
    
def titles():
    return 'Gender,' + 'Age,' 'Agegroup'
    
def randage(age):
    if age == '<16':
        return str(random.randint(16,17)) +','
    elif age == '16-25':
        return str(random.randint(16,25)) +','
    elif age == '26-35':
        return str(random.randint(26,35)) +','
    elif age == '36-45':
        return str(random.randint(36,45)) +','
    elif age == '46-55':
        return str(random.randint(46,55)) +','
    elif age == '56-65':
        return str(random.randint(56,65)) +','
    elif age == '66-75':
        return str(random.randint(66,75)) +','
    elif age == '76-85':
        return str(random.randint(76,85)) +','
    elif age == '86+':
        return str(random.randint(86,100)) +','

output = 'natural.csv'

with open(output, 'w') as out:
    out.write(titles()+'\n')
    row = ''
    for a in ages:
        row += choose(gender)
        row += randage(a)
        row += a
        row += '\n'
    out.write(row)