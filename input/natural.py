from myfuncs import *

# http://www.statcan.gc.ca/pub/84-215-x/84-215-x2012001-eng.htm

gender = ['M']*6 + ['F']*4          # 60% male 40% Female

# made number of records by age group
ages = ['10-18']*13 + ['19-29']*43 + ['30-39']*107 + ['40-49']*300 + ['50-59']*545 + ['60-69']*810+ ['70-79']*1400
def titles():
    return 'Gender,' + 'Age,' 'Agegroup'
output = 'natural.csv'

def getGroup(a):
    if a < 19:
        return '10-18'
    elif a < 30:
        return '19-29'
    elif a < 40:
        return '30-39'
    elif a < 50:
        return '40-49'
    elif a < 60:
        return '50-59'
    elif a < 70:
        return '60-69'
    elif a < 80:
        return '70-79'

with open(output, 'w') as out:
    out.write(titles()+'\n')
    row = ''
    for i in range(10,80):
        row += choose(gender)
        row += str(i)+','
        row += getGroup(i)
        row += '\n'
    for a in ages:
        row += choose(gender)
        row += randage(a)
        row += a
        row += '\n'
    out.write(row)