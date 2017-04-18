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
def strTimeProp(start, end, format, prop):
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
    return strTimeProp(start, end, '%m/%d/%Y %I:%M %p', prop)

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

dates = [("1/1/2007 1:00 AM", "12/31/2007 11:59 PM")*20, ("1/1/2008 1:00 AM", "12/31/2008 11:59 PM")*18,
        ("1/1/2009 1:00 AM", "12/31/2009 11:59 PM")*20, ("1/1/2010 1:00 AM", "12/31/2010 11:59 PM")*21,
        ("1/1/2011 1:00 AM", "12/31/2011 11:59 PM")*29, ("1/1/2012 1:00 AM", "12/31/2012 11:59 PM")*26,
        ("1/1/2013 1:00 AM", "12/31/2013 11:59 PM")*33, ("1/1/2014 1:00 AM", "12/31/2014 11:59 PM")*36,
        ("1/1/2015 1:00 AM", "12/31/2015 11:59 PM")*51, ("1/1/2016 1:00 AM", "12/31/2016 11:59 PM")*92]
def datetimes():
    return random.choice(dates)

lats = [49.2893, 49.0111]
longs = [-123.0246, -122.1270]
with open(output, 'w') as out:
	out.write(titles()+'\n')
	row = ''
	for i in range(5000):
		row += str(uuid.uuid4())+','						#id
		row += choose(gender)								#Gender
		temp = choose(ages)
		row += temp									#agegroup
		row += randage(temp[:-1])              #age
		row += choose(homeless)								#homeless
		row += choose(city)									#city
		row += str(random.uniform(lats[1], lats[0]))+','			#EventLat
		row += str(random.uniform(longs[1], longs[0]))+','		#EventLng
		row += choose(building)								#Building
		row += choose(substance)							#SuspectedSubstance
		row += choose(firstevent)							#FirstEvent
		temp = choose(dead)
		row += str(temp)									#Dead
		if 'True' in temp:							#if they're dead
			row += str(random.uniform(lats[1], lats[0]))+','		#DeathLat
			row += str(random.uniform(longs[1], longs[0]))+','	#DeathLng
			row += choose(substance)						#ConfirmedSubstance

		else:												#if not decieced no confirmed substance and death loc
			row += str('NA') +','+str('NA') +','+str('NA') +','
        
		row += choose(naloxone)								#ReceivedNaloxone
		temp2 = datetimes()
		#row += randomDate("1/1/2007 1:00 AM", "12/31/2016 11:59 PM", random.random())
		row += randomDate(temp2[0], temp2[1], random.random())
		row +='\n'
	out.write(row)
    
    
'''

Your algorithm is correct, how about something more elegant:

import random
my_list = ['A'] * 5 + ['B'] * 5 + ['C'] * 90
random.choice(my_list)

	
it's not necessary to generate 100 list items, as long as the number of items remains proportional. 
In this instance, you can do ['A', 'B'] + ['C'] * 18

 random.sample(population, k)

    Return a k length list of unique elements chosen from the population sequence. Used for random sampling without replacement.
    

random.choice(seq)

    Return a random element from the non-empty sequence seq. If seq is empty, raises IndexError.

 '''