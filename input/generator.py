import random
import uuid #universally unique identifiers
import time

output = 'mock.csv'
#http://www.cra-arc.gc.ca/gncy/stts/itsa-sipr/2014/menu-eng.html -- income info
'''Data includes:
    People - gender, age(group), is homeless(may not include)
    Place - city, neighbourhood, type of building
    Event - suspected consumed substance, is first event, Death (location, age group, is dead, from coroner’s reports [what was consumed, how it was consumed])
        For first responder, need to know if patient has had responses with medication during last 30 days and how
    Time - Date, Time of day
    '''

# bc coroners statistical reports into bc fatalities

TF = [True, False]

#Vancouver map data

#People data
gender = ['M']*6 + ['F']*4          # 60% male 40% Female
ages = ['<16']*1 + ['16-25']*20 + ['26-35']*25 + ['36-45']*25 + ['46-55']*19 + ['56-65']*3+ ['66-75']*1 + ['76-85']*1 + ['86+']*1
homeless = TF                       #


#Place data
#city = ['Anmore', 'Delta', 'Abbotsford', 'Belcarra', 'Langley', 'Agassiz', 'Burnaby', 'Surrey',
#       'Chilliwack', 'Coquitlam', 'White Rock', 'Harrison Hot Springs', 'New Westminster',
#       'Hope', 'Maple Ridge', 'District of Kent', 'Pitt Meadows', 'Mission', 'Port Coquitlam',
#       'Boston Bar', 'Port Moody']
city = ['Burnaby', 'Coquitlam', 'South Surrey/White Rock', 'Surrey', 'New Westminster', 'Delta',
        'Maple Ridge', 'Chilliwack', 'Langley', 'Abbotsford', 'Mission', 'Hope', 'Agassiz-Harrison']

#Vancouver is ([49.3, 49.2] , [-123.2, -123.0])
#lat = []

#lng = []

building = ['private residence', 'other residence', 'other inside', 'outside', 'unknown']

#Event
substance = ['fentanyl', 'crack', 'heroine']

firstevent = TF

dead = TF


naloxone = TF
#Time data
datetime = []

# Other
hospitals = ['Delta', 'Abbotsford', 'Langley', 'Burnaby', 'Surrey', 'Chilliwack', 'White Rock',
            'New Westminster', 'Hope', 'Maple Ridge', 'Mission', 'Port Moody']

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
    
def latnlng(city):
    if city == 'Burnaby':
        return [49.255877,-122.963321]
    elif city == 'Coquitlam':
        return [49.276495,-122.801672]
    elif city == 'South Surrey/White Rock':
        return [49.034278,-122.792890]
    elif city == 'Surrey':
        return [ 49.122842,-122.803788]
    elif city == 'New Westminster':
        return [49.209467,-122.918884]
    elif city == 'Delta':
        return [ 49.086991,-123.027825]
    elif city == 'Maple Ridge':
        return [49.228140,-122.615202]
    elif city == 'Chilliwack':
        return [49.159448,-121.936125]
    elif city == 'Langley':
        return [49.103677,-122.661125]
    elif city == 'Abbotsford':
        return [49.057336,-122.312989]
    elif city == 'Mission':
       return [49.136887,-122.322956]
    elif city == 'Hope':
        return [ 49.384400,-121.443311]
    elif city == 'Agassiz-Harrison':
        return [ 49.271338,-121.776529]


def randomDate(start, end, prop):
    return timeFunc(start, end, '%m/%Y', prop)

def choose(mylist):
    return str(random.choice(mylist))+ ','
    
def titles():
    return 'id,' + 'Gender,' + 'Agegroup,'+ 'Age,' + 'Homeless,' + 'City,' + 'EventLat,' + 'EventLng,' + 'Building,' + \
            'SuspectedSubstance,' + 'FirstEvent,' + 'Dead,' + 'DeathLat,' + 'DeathLng,' + 'ConfirmedSubstance,' + \
            'ReceivedNaloxone,' + 'Datetime'
            
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

dates = [("1/2007", "12/2007")*20, ("1/2008", "12/2008")*18,
        ("1/2009", "12/2009")*20, ("1/2010", "12/2010")*21,
        ("1/2011", "12/2011")*29, ("1/2012", "12/2012")*26,
        ("1/2013", "12/2013")*33, ("1/2014", "12/2014")*36,
        ("1/2015", "12/2015")*51, ("1/2016", "12/2016")*92]
def datetimes():
    return random.choice(dates)
    
deathsbymonth = [[15,18,23,16,24,20,20,22,41,84],
                    [14,8,15,14,24,17,21,39,30,59],
                    [19,17,10,15,25,25,33,28,30,80],
                    [24,18,8,9,26,31,31,29,34,69],
                    [10,18,19,22,22,19,28,40,42,49],
                    [18,18,16,21,22,25,25,28,34,69],
                    [11,24,19,23,33,29,38,25,36,67],
                    [21,16,27,24,22,19,21,37,53,52],
                    [14,12,16,20,22,16,28,31,46,56],
                    [15,10,13,18,23,19,19,35,53,67],
                    [19,9,18,18,27,28,31,28,47,128],
                    [22,15,17,11,24,21,37,24,67,142]]

#lats = [49.2893, 49.0111]
#longs = [-123.0246, -122.1270]
with open(output, 'w') as out:
    out.write(titles()+'\n')
    rows = ''
    for month,deaths in enumerate(deathsbymonth):
        for year in range(10):
            for j in range(deaths[year]):
                rows += str(uuid.uuid4())+','						#id
                rows += choose(gender)								#Gender
                temp = choose(ages)
                rows += temp									#agegroup
                rows += randage(temp[:-1])              #age
                rows += choose(homeless)								#homeless
                temp = choose(city)
                rows += temp									#city
                loc = latnlng(temp[:-1])
                rows += str(loc[0] + random.randrange(-19,19,1)/1000.0)+','			#EventLat
                rows += str(loc[1] + random.randrange(-19,19,1)/1000.0)+','		#EventLng
                rows += choose(building)								#Building
                rows += choose(substance)							#SuspectedSubstance
                rows += choose(firstevent)							#FirstEvent
                temp = str(True)+','
                rows += str(temp)									#Dead
                if 'True' in temp:							#if they're dead
                	rows += str(loc[0] + random.randrange(-19,19,1)/1000.0)+','		#DeathLat
                	rows += str(loc[1] + random.randrange(-19,19,1)/1000.0)+','	#DeathLng
                	rows += choose(substance)						#ConfirmedSubstance
                
                else:												#if not decieced no confirmed substance and death loc
                	rows += str('NA') +','+str('NA') +','+str('NA') +','
                
                rows += choose(naloxone)								#ReceivedNaloxone
                #temp2 = datetimes()
                #row += randomDate("1/1/2007 1:00 AM", "12/31/2016 11:59 PM", random.random())
                rows += str(month+1)+'/'+str(year+2007)
                rows +='\n'
                
    for i in range(5000):
        rows += str(uuid.uuid4())+','						#id
        rows += choose(gender)								#Gender
        temp = choose(ages)
        rows += temp									#agegroup
        rows += randage(temp[:-1])              #age
        rows += choose(homeless)								#homeless
        temp = choose(city)
        rows += temp									#city
        loc = latnlng(temp[:-1])
        rows += str(loc[0] + random.randrange(-19,19,1)/1000.0)+','			#EventLat
        rows += str(loc[1] + random.randrange(-19,19,1)/1000.0)+','		#EventLng
        rows += choose(building)								#Building
        rows += choose(substance)							#SuspectedSubstance
        rows += choose(firstevent)							#FirstEvent
        temp = str(False)+','
        rows += str(temp)									#Dead
        if 'True' in temp:							#if they're dead
        	rows += str(loc[0] + random.randrange(-19,19,1)/1000.0)+','		#DeathLat
        	rows += str(loc[1] + random.randrange(-19,19,1)/1000.0)+','	#DeathLng
        	rows += choose(substance)						#ConfirmedSubstance
        
        else:												#if not decieced no confirmed substance and death loc
        	rows += str('NA') +','+str('NA') +','+str('NA') +','
        
        rows += choose(naloxone)								#ReceivedNaloxone
        #temp2 = datetimes()
        rows += randomDate("1/2007", "12/2016", random.random())
        #rows += str(month+1)+'/'+str(year+2007)
        rows +='\n'
    out.write(rows)