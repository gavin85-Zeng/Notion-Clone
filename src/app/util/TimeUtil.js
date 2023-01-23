// Can use date-fns package

export const getDayFromMonday = (date) => {
	let day = date.getDay();
	if (day === 0) day = 7;
	return day - 1;
};

export const startOfMonth = (date) => {
	return new Date(date.getFullYear(), date.getMonth());
};

export const endOfMonth = (date) => {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

export const prevDay = (date, howMany) => {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + -1 * howMany);
};

export const nextDay = (date, howMany) => {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + howMany);
};

export const prevMonth = (date) => {
	return new Date(date.getFullYear(), date.getMonth() - 1);
};

export const nextMonth = (date) => {
	return new Date(date.getFullYear(), date.getMonth() + 1);
};

export const prevYearOfMonth = (date, month) => {
	return new Date(date.getFullYear() - 1, month);
};

export const prevYear = (date) => {
	return prevYearOfMonth(date, 0);
};

export const nextYearOfMonth = (date, month) => {
	return new Date(date.getFullYear() + 1, month);
};

export const nextYear = (date) => {
	return nextYearOfMonth(date, 0);
};

export const prevTenYear = (date) => {
	return new Date(date.getFullYear() - 10, date.getMonth());
};

export const nextTenYear = (date) => {
	return new Date(date.getFullYear() + 10, date.getMonth());
};

// weekStartsOn
// (optional, default=0)
// 0 | 1 | 2 | 3 | 4 | 5 | 6
export const startOfWeek = (date, startMon) => {
	let curDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	let day = curDate.getDay();
	if (startMon === true) day = getDayFromMonday(curDate);
	return prevDay(curDate, day);
};

export const endOfWeek = (date, endSun) => {
	let curDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	let day = curDate.getDay();
	if (endSun === true) day = getDayFromMonday(curDate);
	return nextDay(curDate, 6 - day);
};

// change 0 (mon) ~ 6 (sun) original 0 (sun) ~ 6 (sat)
export const startMonOfWeek = (date) => {
	return startOfWeek(date, true);
};

export const endSunOfWeek = (date) => {
	return endOfWeek(date, true);
};

export const isToday = (date) => {
	return date.toDateString() === new Date().toDateString();
};

export const isSameDay = (d1, d2) => {
	return d1.toDateString() === d2.toDateString();
};

export const isSameMonth = (d1, d2) => {
	return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
};

export function monthNumToStr(num) {
	let monthStr = num;
	switch (num) {
		case 0:
			monthStr = 'January';
			break;
		case 1:
			monthStr = 'February';
			break;
		case 2:
			monthStr = 'March';
			break;
		case 3:
			monthStr = 'April';
			break;
		case 4:
			monthStr = 'May';
			break;
		case 5:
			monthStr = 'June';
			break;
		case 6:
			monthStr = 'July';
			break;
		case 7:
			monthStr = 'August';
			break;
		case 8:
			monthStr = 'September';
			break;
		case 9:
			monthStr = 'October';
			break;
		case 10:
			monthStr = 'November';
			break;
		case 11:
			monthStr = 'December';
			break;
	}
	return monthStr;
}

export function longToShort(month) {
	let mon = month;
	switch (mon) {
		case 'January':
			mon = 'Jan';
			break;
		case 'February':
			mon = 'Feb';
			break;
		case 'March':
			mon = 'Mar';
			break;
		case 'April':
			mon = 'Apr';
			break;
		case 'May':
			mon = 'May';
			break;
		case 'June':
			mon = 'Jun';
			break;
		case 'July':
			mon = 'Jul';
			break;
		case 'August':
			mon = 'Aug';
			break;
		case 'September':
			mon = 'Sep';
			break;
		case 'October':
			mon = 'Oct';
			break;
		case 'November':
			mon = 'Nov';
			break;
		case 'December':
			mon = 'Dec';
			break;
	}
	return mon;
}

export function shortMonthNameToNum(month) {
	let mon = month;
	switch (mon) {
		case 'Jan':
			mon = 0;
			break;
		case 'Feb':
			mon = 1;
			break;
		case 'Mar':
			mon = 2;
			break;
		case 'Apr':
			mon = 3;
			break;
		case 'May':
			mon = 4;
			break;
		case 'Jun':
			mon = 5;
			break;
		case 'Jul':
			mon = 6;
			break;
		case 'Aug':
			mon = 7;
			break;
		case 'Sep':
			mon = 8;
			break;
		case 'Oct':
			mon = 9;
			break;
		case 'Nov':
			mon = 10;
			break;
		case 'Dec':
			mon = 11;
			break;
	}
	return mon;
}

export function monthNumToShortName(num) {
	return longToShort(monthNumToStr(num));
}

export function fristNlastDayOfCalendar(date) {
	const frist = startOfWeek(startOfMonth(date), true);
	const last = endOfWeek(endOfMonth(date), true);

	return { fristDay: frist, lastDay: last };
}

export function timeSince(now, date) {
	const sec = Math.floor((now - date) / 1000);

	let interval = sec / 2592000;
	if (interval > 1) {
		return Intl.DateTimeFormat('en-us').format(date);
	}

	interval = sec / 86400;
	if (interval > 1) {
		return Math.floor(interval) + ' days ago';
	}

	interval = sec / 3600;
	if (interval > 1) {
		return Math.floor(interval) + ' hours ago';
	}

	interval = sec / 60;
	if (interval > 1) {
		return Math.floor(interval) + ' minutes ago';
	}

	return 'Just now';
}
