import { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import { COLORS } from '../context/Context';
import { timeSince } from '../util/TimeUtil';
import styles from './EditView.module.css';
import { ModifyContext } from '../context/Context';
import { StatusSelect } from '../components/Select';
import { InputCalendar } from '../components/Calendar';
import ToggleStateHoc from '../hoc/ToggleHoc';
import {
	ArrowUpCircleFill,
	PersonCircle,
	Plus,
	Square,
	CheckSquareFill,
} from 'react-bootstrap-icons';
import { CenterDialog, OptionsBar } from '../components/Dialog';

const BlurTitle = ({ ...other }) => {
	const inputRef = useRef();
	const { item, dispatch } = useContext(ModifyContext);
	const handleOnBlur = () => {
		dispatch({ type: 'TITLE', payload: inputRef.current.value });
	};
	return <Title ref={inputRef} className={styles.title} title={item.title} onBlur={handleOnBlur} />;
};

export const Title = forwardRef(({ title, className, ...other }, _ref) => (
	<div className={className}>
		<input ref={_ref} defaultValue={!title ? null : title} placeholder={'Untitled'} {...other} />
	</div>
));
Title.displayName = 'Title';

const Divide = () => {
	return <div className={styles.divide}></div>;
};

const CreateTime = ({ value }) => {
	const now = value === undefined ? new Date() : new Date(value);
	const nowStr = Intl.DateTimeFormat('en-us', {
		year: 'numeric',
		month: 'long',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	}).format(now);

	return (
		<div className={styles.properties}>
			<div>Date Created</div>
			<div className={styles['create-time']}>{nowStr}</div>
		</div>
	);
};

const TaskDate = (props) => {
	const { value, handleToggle } = props;
	const dateStr = Intl.DateTimeFormat('en-us', {
		year: 'numeric',
		month: 'long',
		day: '2-digit',
	}).format(value);

	return <div onClick={handleToggle}>{dateStr}</div>;
};

const ToggleDatePicker = ToggleStateHoc(TaskDate);

export const DatePicker = ({ value }) => {
	const { dispatch } = useContext(ModifyContext);
	const [original, setOriginal] = useState(value);

	const handleDateChange = (newValue) => {
		dispatch({
			type: 'DATE',
			payload: {
				value: newValue.toISOString(),
				from: original.toISOString(),
			},
		});
	};

	return (
		<ToggleDatePicker
			className={{
				container: styles['date-picker-container'],
				overlay: styles['overlay-transparent'],
			}}
			overlay={true}
			toggleDisable={true}
			value={value}
		>
			<InputCalendar
				containerStyle={{ position: 'absolute' }}
				defaultValue={value}
				onChange={handleDateChange}
			/>
		</ToggleDatePicker>
	);
};

const Schedule = ({ value }) => {
	return (
		<div className={styles.properties}>
			<div>Date</div>
			<DatePicker value={value} />
		</div>
	);
};

const AddProperties = () => {
	const handleClick = () => {
		// not implemented yet
	};

	return (
		<div className={styles.properties}>
			<div className={styles['property-container']} onClick={handleClick}>
				<Plus style={{ marginRight: '8px' }} size={24} />
				<div>Add a property</div>
			</div>
		</div>
	);
};

const Status = ({ value }) => {
	const { dispatch } = useContext(ModifyContext);

	const handleSelect = (newValue) => {
		dispatch({ type: 'STATUS', payload: newValue });
	};

	return (
		<div className={styles.properties}>
			<div>Status</div>
			<StatusSelect onSelect={handleSelect} value={value} />
		</div>
	);
};

const Properties = () => {
	const { item } = useContext(ModifyContext);

	return (
		<>
			<CreateTime value={item.createdAt} />
			<Status value={item.status} />
			<Schedule value={new Date(item.date)} />
			{item.custProps?.map((prop, index) => (
				<div key={prop + index} className={styles.properties}>
					<div>{prop}</div>
					<div>Empty</div>
				</div>
			))}
			<AddProperties />
		</>
	);
};

const CommentAddtion = ({ value }) => {
	const { dispatch } = useContext(ModifyContext);
	const [onFocus, setOnFoucs] = useState(false);
	const [color, setColor] = useState(COLORS.grey);
	const inputRef = useRef();

	const dispatchComment = () => {
		const inputVal = inputRef.current.value;
		if (!inputVal) return;

		const store = {
			message: inputVal,
			timestamp: new Date(),
		};

		inputRef.current.value = '';
		setColor(COLORS.grey);
		dispatch({ type: 'COMMENTS', payload: [...value, store] });
	};

	const handleColorChange = () => {
		if (inputRef.current.value.length > 0) {
			setColor(COLORS.blue);
		} else {
			setColor(COLORS.grey);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key !== 'Enter') return;
		dispatchComment();
	};

	const handleFoucs = () => {
		setOnFoucs(true);
	};

	const handleBlur = () => {
		if (inputRef.current.value.length > 0) return;
		setOnFoucs(false);
	};

	return (
		<div className={styles['addition-box']}>
			<div className={styles.addition}>
				<PersonCircle fontSize={18} />
				<input
					ref={inputRef}
					type="text"
					placeholder="Add a comment..."
					onChange={handleColorChange}
					onKeyDown={handleKeyDown}
					onFocus={handleFoucs}
					onBlur={handleBlur}
				/>
				{onFocus ? (
					<ArrowUpCircleFill fontSize={24} color={color} onClick={dispatchComment} />
				) : null}
			</div>
		</div>
	);
};

const useRefresh = (setNow) => {
	useEffect(() => {
		const timer = setInterval(() => {
			setNow(new Date());
		}, 65000);
		return () => clearInterval(timer);
	}, []);
};

const Comment = () => {
	const {
		item: { comments },
	} = useContext(ModifyContext);
	const [now, setNow] = useState(new Date());
	useRefresh(setNow);

	return (
		<div className={styles['comment-container']}>
			{comments?.map((comment, index) => {
				const timestamp = new Date(comment.timestamp);
				const text = timeSince(now, timestamp);

				return (
					<div key={'comment' + index} className={styles.comment}>
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									marginRight: '.5rem',
								}}
							>
								<PersonCircle fontSize={18} />
							</div>
							<div style={{ color: 'rgba(55, 53, 47, .6)' }}>{text}</div>
						</div>
						<div style={{ width: '100%', paddingLeft: '2rem' }}>{comment.message}</div>
					</div>
				);
			})}
			<CommentAddtion value={comments} />
		</div>
	);
};

const Todo = ({ backspaceFn, updateFn, todo }) => {
	const ref = useRef();
	const [task, setTask] = useState(todo);

	const handleCheck = () => {
		setTask((prev) => {
			const toggle = !prev.checked;
			return { ...prev, checked: toggle };
		});
	};

	const handleTextInput = () => {
		setTask((prev) => ({ ...prev, text: ref.current.value }));
	};

	const handleDelete = (e) => {
		if (e.key !== 'Backspace' || task.text.length !== 0) return;
		backspaceFn(task.uid);
	};

	const handleUpdate = () => {
		updateFn(task);
	};

	return (
		<div className={styles.todoBox}>
			<div className={styles.ckeckBox} onClick={handleCheck}>
				{task.checked ? <CheckSquareFill size={16} color={'#25a2e6'} /> : <Square size={16} />}
			</div>
			<input
				ref={ref}
				onInput={handleTextInput}
				onKeyDown={handleDelete}
				onBlur={handleUpdate}
				placeholder="To-do"
				defaultValue={task.text}
				readOnly={task.checked ? true : false}
				style={
					task.checked
						? {
								textDecoration: 'line-through',
								color: 'var(--grey)',
						  }
						: null
				}
			/>
		</div>
	);
};

const TodoList = () => {
	const {
		item: { todoList },
		dispatch,
	} = useContext(ModifyContext);

	const handleClick = () => {
		const arr = todoList.slice();
		arr.push({ uid: crypto.randomUUID(), checked: false, text: '' });
		dispatch({ type: 'TODOLIST', payload: arr });
	};

	const handleBackSpaceDelete = (id) => {
		const filtered = todoList.filter((item) => item.uid !== id);
		dispatch({ type: 'TODOLIST', payload: filtered });
	};

	const handleUpdate = (todo) => {
		const updateItems = todoList.map((item) => {
			if (item.uid === todo.uid) {
				return todo;
			}
			return item;
		});
		dispatch({ type: 'TODOLIST', payload: updateItems });
	};

	return (
		<div style={{ height: '100%' }}>
			<div style={{ color: COLORS.grey }} onClick={handleClick}>
				Click to Add To-do
			</div>
			{todoList.map((item) => (
				<Todo
					key={item.uid}
					updateFn={handleUpdate}
					backspaceFn={handleBackSpaceDelete}
					todo={item}
				/>
			))}
		</div>
	);
};

export default function EditView() {
	return (
		<div className={styles.container}>
			<BlurTitle type="text" placeholder="Untitled" />
			<div className={styles['content-wrapper']}>
				<Properties />
				<Divide />
				<Comment />
				<Divide />
				<TodoList />
			</div>
		</div>
	);
}

export function EditViewCenter() {
	const { item } = useContext(ModifyContext);

	return (
		<CenterDialog>
			<OptionsBar id={item._id} model={'Edit'} />
			<EditView />
		</CenterDialog>
	);
}
