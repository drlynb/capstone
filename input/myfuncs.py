import time
import random

def choose(mylist):
    return str(random.choice(mylist))+ ','
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

def randage(age):
    if age == '10-18':
        return str(random.randint(10,19)) +','
    elif age == '19-29':
        return str(random.randint(19,30)) +','
    elif age == '30-39':
        return str(random.randint(30,40)) +','
    elif age == '40-49':
        return str(random.randint(40,50)) +','
    elif age == '50-59':
        return str(random.randint(50,60)) +','
    elif age == '60-69':
        return str(random.randint(60,70)) +','
    elif age == '70-79':
        return str(random.randint(70,80)) +','
    else:
        print('error')