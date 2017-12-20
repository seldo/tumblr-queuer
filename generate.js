/* An experiment in automating: this is really hard.
It's hard to decide what's important and what's not.
Also this thing disagrees with https://www.timeanddate.com/sun/usa/san-francisco on how long the day is, exactly.
*/

// San Francisco lat/long: 37.7484922,-122.4876299
var moment = require('moment')
var SolarCalc = require('solar-calc')

var start = moment('2017-12-21')
var end = moment('2018-03-12')
var today = start

do {

  // calculate
  var yesterday = moment(today).subtract(1,'day')

  var solarDay = new SolarCalc(today.toDate(),37.7484922,-122.4876299)
  var solarYesterday = new SolarCalc(yesterday.toDate(),37.7484922,-122.4876299)

  var sunrise = moment(solarDay.sunrise)
  var sunset = moment(solarDay.sunset)
  var sunriseYesterday = moment(solarYesterday.sunrise)
  var sunsetYesterday = moment(solarYesterday.sunset)

  var lengthOfDaySeconds = sunset.diff(sunrise,'seconds')
  var lengthOfDayMinutes = Math.floor(lengthOfDaySeconds / 60)
  var lengthOfDayHours = Math.floor(lengthOfDaySeconds / 3600)
  var lengthOfDayRemainderMinutes = Math.floor((lengthOfDaySeconds%3600)/60)
  var lengthOfDayRemainderSeconds = lengthOfDaySeconds%60

  var lengthOfYesterdaySeconds = sunsetYesterday.diff(sunriseYesterday,'seconds')
  var lengthOfYesterdayMinutes = Math.floor(lengthOfYesterdaySeconds / 60)
  var lengthOfYesterdayHours = Math.floor(lengthOfYesterdaySeconds / 3600)
  var lengthOfYesterdayRemainderMinutes = Math.floor((lengthOfYesterdaySeconds%3600)/60)
  var lengthOfYesterdayRemainderSeconds = lengthOfYesterdaySeconds%60

  var lengthDiffSeconds = lengthOfDaySeconds - lengthOfYesterdaySeconds
  var lengthDiffMinutes = lengthOfDayMinutes - lengthOfYesterdayMinutes
  var lengthDiffHours = lengthOfDayHours - lengthOfYesterdayHours
  var lengthDiffRemainderMinutes = Math.floor((lengthDiffSeconds%3600)/60)
  var lengthDiffRemainderSeconds = lengthDiffSeconds%60

  var sunriseDiffSeconds = sunriseYesterday.add(1,'day').diff(sunrise,'seconds')
  var sunsetDiffSeconds = sunsetYesterday.add(1,'day').diff(sunset,'seconds')

  // output
  console.log(today.format('YYYY-MM-DD'))
  console.log(`Day was ${lengthOfDayHours} hours, ${lengthOfDayRemainderMinutes} minutes, ${lengthOfDayRemainderSeconds} seconds long`)
  console.log(`This is ${lengthDiffHours} hours, ${lengthDiffRemainderMinutes} minutes, ${lengthDiffRemainderSeconds} seconds more than yesterday`)
  console.log(`Sunset was ${sunsetDiffSeconds} seconds later`)
  console.log(`Sunrise was ${sunriseDiffSeconds} seconds earlier`)

  // iterate
  today.add(1,'day')

} while (today.isBefore(end))
