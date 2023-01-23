import { forwardRef } from 'react';
import { useContext, useRef, useState } from 'react';
import { Plus } from 'react-bootstrap-icons';
import { StatusSelect } from '../components/Select';
import { COLORS, TaskContext, ModifyContext, PageContext } from '../context/Context';
import { DatePicker } from './EditView';
import styles from './TableView.module.scss';

const EditableDiv = forwardRef(({ children, ...other }, ref) => {
	return (
		<div ref={ref} className={styles.td} contentEditable suppressContentEditableWarning {...other}>
			{children}
		</div>
	);
});
EditableDiv.displayName = 'EditableDiv';

function TableHeader() {
	const head = ['Title', 'Date', 'Date Created', 'Status'];
	return (
		<div className={styles.th}>
			{head.map((th, index) => (
				<div key={`table-head-${th}-${index}`} className={styles.td}>
					{th}
				</div>
			))}
		</div>
	);
}

function TitleValue({ value }) {
	const ref = useRef();
	const { dispatch } = useContext(ModifyContext);

	const handleBlur = () => {
		const currentText = ref.current.textContent;
		if (value === currentText) return;
		dispatch({ type: 'TITLE', payload: currentText });
	};

	return (
		<EditableDiv ref={ref} onBlur={handleBlur}>
			{value}
		</EditableDiv>
	);
}

function TaskDateValue({ value }) {
	return (
		<div className={styles.td}>
			<DatePicker value={new Date(value)} />
		</div>
	);
}

function TaskStatusValue({ value }) {
	const { dispatch } = useContext(ModifyContext);
	const handleSelect = (newValue) => {
		dispatch({ type: 'STATUS', payload: newValue });
	};

	return (
		<div className={styles.td}>
			<StatusSelect onSelect={handleSelect} value={value} />
		</div>
	);
}

function TableBody() {
	const { tasks } = useContext(TaskContext);
	const { dispatch } = useContext(ModifyContext);

	const FormatCreatedDate = ({ date }) =>
		Intl.DateTimeFormat('en-us', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		}).format(new Date(date));

	const dispatchModifyData = (task) => {
		dispatch({ type: 'INIT', payload: task });
	};

	return tasks.map((task, index) => (
		<div
			key={`table-body-task-${index}`}
			className={styles.tr}
			onClick={() => dispatchModifyData(task)}
		>
			<TitleValue value={task.title} />
			<TaskDateValue value={task.date} />
			<div className={styles.td}>
				<FormatCreatedDate date={task.createdAt} />
			</div>
			<TaskStatusValue value={task.status} />
		</div>
	));
}

function AddItem() {
	const pageState = useContext(PageContext);
	const { dispatch } = useContext(ModifyContext);

	const initItem = {
		title: '',
		date: new Date(),
		status: 'Empty',
		createAt: new Date(),
		isTrash: false,
		custProps: [],
		comments: [],
		todoList: [],
		pageId: pageState._id,
		documentId: pageState.documentId,
		isNew: true,
		isChanged: true,
	};
	const handleAdd = () => {
		dispatch({ type: 'INIT', payload: initItem });
	};

	return (
		<div className={styles.tr} onClick={handleAdd}>
			<div className={`${styles.td} ${styles.new}`}>
				<Plus size={18} color={COLORS.grey} />
				<span>New</span>
			</div>
		</div>
	);
}

export default function TableView() {
	return (
		<div style={{ marginTop: '1rem' }}>
			<TableHeader />
			<TableBody />
			<AddItem />
		</div>
	);
}
