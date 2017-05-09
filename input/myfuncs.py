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
