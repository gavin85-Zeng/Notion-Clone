import { Children, cloneElement, useContext, useState } from 'react';
import { startOfMonth, isToday, isSameDay, isSameMonth } from '../util/TimeUtil';
import useTaskData from '../hooks/useTaskData';
import styles from './CalendarView.module.scss';
import { HoverableHoc } from '../hoc/ToggleHoc';
import { ChevronLeft, ChevronRight, Plus } from 'react-bootstrap-icons';
import { TaskContext, ModifyContext, PageContext } from '../context/Context';
import Calendar from '../components/Calendar';
import { Link, Outlet } from 'react-router-dom';
import ContextMenu, { Menu } from '../components/ContextMenu';
import { deleteTask } from './BasePage';

const AddItem = ({ currentDate, pageState }) => {
	const initItem = {
		_id: crypto.randomUUID(), // temporary id
		title: '',
		date: currentDate,
		status: 'Empty',
		createAt: new Date(),
		isTrash: false,
		custProps: [],
		comments: [],
		todoList: [],
		pageId: pageState._id,
		documentId: pageState.documentId,
		isNew: true,
	};

	const { dispatch } = useContext(ModifyContext);

	const handleAddItem = () => {
		dispatch({ type: 'INIT', payload: initItem });
	};

	return (
		<Link to={`${initItem._id}`} state={pageState} onClick={handleAddItem}>
			<div className={styles.plusBox}>
				<Plus className={styles.plusIcon} size={24} />
			</div>
		</Link>
	);
};

function ItemBar({ currentDate, pageState }) {
	const { tasks, dispatch: taskDispatch } = useContext(TaskContext);
	let currentTasks = undefined;

	if (tasks !== undefined) {
		currentTasks = tasks.filter(
			(task) => task.pageId === pageState._id && isSameDay(new Date(task.date), currentDate),
		);
	}

	const FilteredItem = ({ item }) => {
		const [openMenu, setOpenMenu] = useState([
			{
				isOpen: false,
				top: 0,
				left: 0,
			},
		]);

		const { dispatch } = useContext(ModifyContext);

		const handleLinkTo = () => {
			dispatch({ type: 'INIT', payload: item });
		};

		const handleRightClick = (e) => {
			e.preventDefault();
			const { clientX, clientY } = e;
			setOpenMenu({ isOpen: true, top: clientY, left: clientX });
		};

		const handleClose = () => {
			setOpenMenu((prev) => ({ ...prev, isOpen: false }));
		};

		const handleDelete = () => {
			deleteTask(item._id);
			taskDispatch({ type: 'DELETE', payload: { value: item } });
		};

		return item.isTrash === false ? (
			<div>
				<Link
					to={item._id}
					state={pageState}
					onClick={handleLinkTo}
					onContextMenu={handleRightClick}
				>
					<div className={styles.taskItemWrapper}>
						<div className={styles.taskItem}>
							<div className="ellipsis">
								<span>
									{item.title === undefined || item.title === '' ? 'Untitled' : item.title}
								</span>
							</div>
						</div>
					</div>
				</Link>
				{openMenu.isOpen ? (
					<ContextMenu top={openMenu.top} left={openMenu.left} onClose={handleClose}>
						<Menu
							data={[
								{
									text: 'Delete',
									fn: () => {
										handleDelete();
										handleClose();
									},
								},
							]}
						/>
					</ContextMenu>
				) : null}
			</div>
		) : null;
	};

	return currentTasks !== undefined
		? currentTasks.map((item) => <FilteredItem item={item} key={item._id} />)
		: null;
}

const HoverableAdd = HoverableHoc(AddItem);

function DayCell({ currentDate, calendarDate, className, children }) {
	const pageState = useContext(PageContext);
	const Daily = () => {
		return (
			<div className={styles.cellText}>
				<span
					className={
						isToday(currentDate)
							? styles.todayPopup
							: isSameMonth(calendarDate, currentDate)
							? ''
							: styles.grey
					}
				>
					{isSameDay(startOfMonth(currentDate), currentDate) ? (
						<span className={styles['cell-sn']}>
							{Intl.DateTimeFormat('en-us', { month: 'short' }).format(currentDate.getMonth())}
						</span>
					) : null}
					{currentDate.getDate()}
				</span>
			</div>
		);
	};

	return (
		<div className={className}>
			<Daily />
			{Children.map(children, (child) =>
				cloneElement(child, { ...child.props, currentDate: currentDate, pageState: pageState }),
			)}
		</div>
	);
}

export default function CalendarView() {
	return (
		<>
			<Calendar defaultValue={new Date()} containerClass={styles.container} disableWrapper={true}>
				<div className={styles.navigation} style={{ justifyContent: 'space-between' }}>
					<Calendar.MonthOfYear />
					<div className="flex" style={{ flex: '0.3', justifyContent: 'space-evenly' }}>
						<Calendar.PrevMonth>
							<div className={styles.arrow}>
								<ChevronLeft size={14} />
							</div>
						</Calendar.PrevMonth>
						<Calendar.Today>
							<div className={'virtualBtn'} style={{ color: '#000' }}>
								Today
							</div>
						</Calendar.Today>
						<Calendar.NextMonth>
							<div className={styles.arrow}>
								<ChevronRight size={14} />
							</div>
						</Calendar.NextMonth>
					</div>
				</div>
				<Calendar.DayOfWeek type={3} />
				<Calendar.Cells className={styles.cell}>
					<DayCell>
						<HoverableAdd className={styles.absoluteWH100} />
						<ItemBar />
					</DayCell>
				</Calendar.Cells>
			</Calendar>
			<Outlet />
		</>
	);
}
