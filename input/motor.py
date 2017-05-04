import random
import time


output = 'motor.csv'

# bc coroners statistical reports into bc fatalities

TF = [True, False]

#People data
gender = ['M']*7 + ['F']*3          # 60% male 40% Female
ages = ['<16']*1 + ['16-25']*8 + ['26-35']*6 + ['36-45']*7 + ['46-55']*6 + ['56-65']*6+ ['66-75']*6 + ['76-85']*12 + ['86+']*14


# https://stackoverflow.com/questions/553303/generate-a-random-date-between-two-other-dates
def timeFunc(start, end, format, prop):
    '''Get a time at a proportion of a range of two formatted times.
    start and end should be strings specifying times formated in the
    given format (strftime-style), giving an interval [start, end].
    prop specifies how a proportion of the interval to be taken after
    start.  The returned time will be in the specified format.
    '''

    stime = time.mktime(time.strptime(start, format))
    etime = time.mktime(time.strptime(end, format))

    ptime = stime + prop * (etime - stime)

    return time.strftime(format, time.localtime(ptime))


def randomDate(start, end, prop):
    return timeFunc(start, end, '%m/%Y', prop)

def choose(mylist):
    return str(random.choice(mylist))+ ','
    
def titles():
    return 'Date,AgeGroup,Gender'

# 2007 - 2015
motordeathsperyear = [423, 376, 390, 382, 311, 292, 288, 307, 300]

#monthxyear
motordeathsbymonth = [[44,28,28,20,36,28,17,21,29,28],
                    [30,26,31,33,31,17,30,17,18,17],
                    [34,29,32,23,23,22,30,24,11,17],
                    [32,29,17,23,29,16,24,17,12,19],
                    [31,35,28,29,23,14,22,24,20,21],
                    [48,26,30,38,37,28,12,22,33,25],
                    [46,48,50,39,35,32,22,26,32,30],
                    [36,37,36,40,44,32,27,31,29,34],
                    [29,50,31,31,37,32,28,38,36,30],
                    [44,39,28,33,32,36,26,21,28,24],
                    [34,35,27,40,25,27,30,24,25,29],
                    [23,41,38,41,30,27,24,23,34,26]]

with open(output, 'w') as out:
    out.write(titles()+'\n')
    rows = ''
    for month,deaths in enumerate(motordeathsbymonth):
        for year in range(10):
            for j in range(deaths[year]):
                rows += str(month+1)+'/'+str(year+2007)+ ','
                rows += choose(ages)								#age
                rows += choose(gender)							#Gender
                rows = rows[:-1]
                rows +='\n'
    print(rows)
    out.write(rows)
