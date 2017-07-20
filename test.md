```js
let userNumber = 0,
	timeStamp = 0,
	daysGap = 2,
	users = ['杨明', '陈佳会', '陈红梅', '罗治豪'],
	dayMap = ['天', '一', '二', '三', '四', '五', '六']

function isSameMonth (oldTimeStamp, newTimeStamp) {
	return new Date(oldTimeStamp).getMonth() === new Date(newTimeStamp).getMonth()
}

function addDays (timeStamp) {
	return timeStamp + daysGap * 24 * 3600 * 1000
}

function getUser () {
	if (userNumber === users.length) {
		userNumber = 0
	}
	userNumber++

	return userNumber
}

function getDay (timeStamp) {
	let time = new Date(timeStamp)
	return '星期' + dayMap[time.getDay()] + ' ' + time.getDate() + '号'
}

function getFirstTimeStamp () {
	let month = new Date().getMonth() + 1
	return new Date('2017/' + (month > 9 ? month : '0' + month) + '/01').getTime()
}

function compute (time) {
	let newTimeStamp = addDays(time)

	if (isSameMonth(time, newTimeStamp)) {

		if (time > +new Date) {
			console.log(users[getUser() - 1], getDay(time))
		}

		compute(newTimeStamp)
	}
}

console.warn('本月剩余天数打扫清洁顺序表（顺序固定）')
compute(getFirstTimeStamp())
```
