import {
	useState,
	useRef,
	useMemo,
	useContext,
	createContext,
	Children,
	cloneElement,
} from 'react';
import {
	nextDay,
	prevMonth,
	nextMonth,
	isSameMonth,
	fristNlastDayOfCalendar,
	isSameDay,
} from '../util/TimeUtil';
import { clx } from '../util/utility.js';
import { ChevronLeft, ChevronRight } from 'react-bootstrap-icons';
import styles from './Calendar.module.scss';

const dateIsValid = (date) => {
	return date instanceof Date && !isNaN(date);
};

const dayOfweekDef = {
	2: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
	3: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};

export const CalendarContext = createContext({
	defaultValue: new Date(),
	stateValue: null,
	setStateDate: null,
	parentOnChange: null,
	ref: null,
});

export const generateDaysOfMonth = ({ value, acrossMonth = false, twoDArray = true }) => {
	const { fristDay, lastDay } = fristNlastDayOfCalendar(value);
	const DAY_MIL = 1000 * 60 * 60 * 24;
	const diff = (lastDay.getTime() - fristDay.getTime()) / DAY_MIL;
	const days = [];
	let row = [];

	for (let next = 1; next <= diff + 1; next++) {
		let date = nextDay(fristDay, next - 1);
		const day = !acrossMonth ? (isSameMonth(value, date) ? date : null) : date;
		row.push(day);

		if (twoDArray && next % 7 === 0) {
			days.push(row);
			row = [];
		}
	}
	return twoDArray ? days : row;
};

function Input() {
	const { stateValue, setStateDate, parentOnChange, ref } = useContext(CalendarContext);
	const handleBlur = (e) => {
		e.preventDefault();
		e.stopPropagation();

		const commaIdx = ref.current.value.indexOf(',');
		const inputDate = new Date(ref.current.value);
		const illegal = commaIdx === -1 || !dateIsValid(inputDate) || isSameDay(inputDate, stateValue);
		const formatDate = illegal ? stateValue : inputDate;

		const format = Intl.DateTimeFormat('en-us', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
		}).format(formatDate);
		ref.current.value = format;

		if (illegal) return;
		setStateDate(inputDate);
		parentOnChange(inputDate);
	};

	const handleKeyDown = (e) => {
		if (e.key !== 'Enter') return;

		handleBlur(e);
	};
	return (
		<input
			type="text"
			ref={ref}
			onBlur={handleBlur}
			onKeyDown={handleKeyDown}
			className={styles.navInput}
			defaultValue={Intl.DateTimeFormat('en-us', {
				year: 'numeric',
				month: 'short',
				day: '2-digit',
			}).format(stateValue)}
		/>
	);
}

function DayOfWeek({ className, style, type = 2 }) {
	if (type !== 2 && type !== 3) throw Error('DayOfWeek type must be [2] or [3]');
	const clazz = !className ? styles.weekHeader : clx(styles.weekHeader, className);
	return (
		<div className={clazz} style={style}>
			{dayOfweekDef[type].map((day) => (
				<div key={crypto.randomUUID()}>{day}</div>
			))}
		</div>
	);
}

function Row({ children }) {
	return (
		<div className={styles.picker}>
			<div className="flex">{children}</div>
		</div>
	);
}

function Column({ date }) {
	const { defaultValue, setStateDate, parentOnChange, ref } = useContext(CalendarContext);

	const handleDateChange = (day) => {
		setStateDate(day);
		parentOnChange(day);
		ref.current.value = Intl.DateTimeFormat('en-us', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
		}).format(day);
	};

	return !date ? (
		<div></div>
	) : (
		<div>
			<div
				className={styles.button}
				onClick={(e) => {
					e.stopPropagation();
					handleDateChange(date);
				}}
				style={
					isSameDay(defaultValue, date) ? { background: 'rgb(35,131,226)', color: '#fff' } : null
				}
			>
				{date.getDate()}
			</div>
		</div>
	);
}

function Columns({ items }) {
	return items.map((date) => (
		<Column date={date} key={!date ? 'column' + crypto.randomUUID() : date.toDateString()} />
	));
}

function Cells({ acrossMonth = true, className, children }) {
	const { stateValue } = useContext(CalendarContext);
	const days = useMemo(
		() =>
			generateDaysOfMonth({
				value: stateValue,
				acrossMonth: acrossMonth,
				twoDArray: false,
			}),
		[stateValue],
	);

	const child = Children.only(children);

	return (
		<div className={styles['g-7']}>
			{days.map((item) => (
				<div className={className} key={item.toDateString()}>
					{cloneElement(child, {
						...child.props,
						currentDate: item,
						calendarDate: stateValue,
					})}
				</div>
			))}
		</div>
	);
}

function CellContainer() {
	const { stateValue } = useContext(CalendarContext);
	const days = generateDaysOfMonth({
		value: stateValue,
		acrossMonth: false,
		twoDArray: true,
	});
	return (
		<div className={styles.cellContainer}>
			<DayOfWeek type={2} />
			{days.map((item) => (
				<Row key={'row' + crypto.randomUUID()}>
					<Columns items={item} />
				</Row>
			))}
		</div>
	);
}

function MonthOfYear() {
	const { stateValue } = useContext(CalendarContext);
	return (
		<div className={styles.navTitle}>
			{Intl.DateTimeFormat('en-us', {
				year: 'numeric',
				month: 'long',
			}).format(stateValue)}
		</div>
	);
}

function PrevMonth({ children }) {
	const { stateValue, setStateDate } = useContext(CalendarContext);
	const child = Children.only(children);
	const handleClickPrev = () => {
		const prev = prevMonth(stateValue);
		setStateDate(prev);
	};
	return cloneElement(child, {
		...child.props,
		onClick: handleClickPrev,
	});
}

function Today({ children }) {
	const { setStateDate } = useContext(CalendarContext);
	const child = Children.only(children);
	const handleClick = () => setStateDate(new Date());

	return cloneElement(child, {
		...child.props,
		onClick: handleClick,
	});
}

function NextMonth({ children }) {
	const { stateValue, setStateDate } = useContext(CalendarContext);
	const child = Children.only(children);
	const handleClickNext = () => {
		const next = nextMonth(stateValue);
		setStateDate(next);
	};
	return cloneElement(child, {
		...child.props,
		onClick: handleClickNext,
	});
}

function Navigation() {
	return (
		<div className={styles.navigation}>
			<MonthOfYear />
			<div className={styles.navController}>
				<PrevMonth>
					<div className={styles.navPrev}>
						<ChevronLeft size={24} />
					</div>
				</PrevMonth>
				<NextMonth>
					<div className={styles.navNext}>
						<ChevronRight size={24} />
					</div>
				</NextMonth>
			</div>
		</div>
	);
}

function Wrapper({ disable, className = styles.wrapper, style, children }) {
	return !disable ? (
		<div className={className} style={style}>
			{children}
		</div>
	) : (
		<>{children}</>
	);
}

function Base({ children }) {
	return (
		<>
			<Navigation />
			<CellContainer />
			{children}
		</>
	);
}

function BaseLayout({ children }) {
	return (
		<>
			<Base />
			{children}
		</>
	);
}

export function InputCalendar({ children, ...other }) {
	return (
		<Calendar {...other}>
			<Input />
			<Base />
			{children}
		</Calendar>
	);
}

Calendar.Input = Input;
Calendar.MonthOfYear = MonthOfYear;
Calendar.DayOfWeek = DayOfWeek;
Calendar.PrevMonth = PrevMonth;
Calendar.Today = Today;
Calendar.NextMonth = NextMonth;
Calendar.Cells = Cells;
Calendar.BaseLayout = BaseLayout;
Calendar.Base = Base;

export default function Calendar({
	onChange,
	defaultValue = new Date(),
	containerClass = styles.container,
	containerStyle,
	disableWrapper = false,
	children,
}) {
	const [date, setDate] = useState(defaultValue);

	const ctx = {
		defaultValue: defaultValue,
		stateValue: date,
		setStateDate: setDate,
		parentOnChange: onChange,
		ref: useRef(),
	};

	return (
		<CalendarContext.Provider value={ctx}>
			<div className={containerClass} style={containerStyle}>
				<Wrapper disable={disableWrapper}>{!children ? <BaseLayout /> : children}</Wrapper>
			</div>
		</CalendarContext.Provider>
	);
}
