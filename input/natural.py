from myfuncs import *

# http://www.statcan.gc.ca/pub/84-215-x/84-215-x2012001-eng.htm

gender = ['M']*6 + ['F']*4          # 60% male 40% Female

# made number of records by age group
ages = ['<16']*13 + ['16-25']*43 + ['26-35']*58 + ['36-45']*107 + ['46-55']*300 + \
        ['56-65']*545+ ['66-75']*810 + ['76-85']*1400 + ['86+']*900

def titles():
    return 'Gender,' + 'Age,' 'Agegroup'
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