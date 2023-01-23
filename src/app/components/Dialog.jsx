import { useContext, useMemo, useState } from 'react';
import styles from './Dialog.module.scss';
import { COLORS } from '../context/Context';
import { Search } from 'react-bootstrap-icons';
import { useTrashData } from '../hooks/useTaskData';
import {
	ArrowCounterclockwise,
	Trash,
	ArrowsFullscreen,
	Columns,
	ChatLeftText,
	ThreeDots,
	ClockHistory,
	Star,
} from 'react-bootstrap-icons';
import { TaskContext } from '../context/Context';
import Tooltip from './Tooltip';
import { Link, useNavigate } from 'react-router-dom';
import { updateTask, deleteTask } from '../pages/BasePage';

export function Loading() {
	return (
		<div className={styles.loadingContainer}>
			<div className={styles['lds-dual-ring']}></div>
		</div>
	);
}

const Overlayer = (props) => {
	const { className } = props;
	return (
		<div className={className} style={props.sx}>
			{props.children}
		</div>
	);
};

export const EscapeLayer = ({ handleClose, style, ...other }) => {
	return <div className={styles.escape} onClick={handleClose} style={style} {...other}></div>;
};

const EscapeDialog = (props) => {
	const { className, style, handleClose } = props;

	return (
		<Overlayer className={className}>
			<EscapeLayer handleClose={handleClose} style={style} />
			{props.children}
		</Overlayer>
	);
};

export const OptionsBar = ({ id, model }) => {
	return (
		<div className={styles.optionsBar}>
			<div className="flex">
				<div className={styles.iconWrapper}>
					<Link to={`/${id}`} state={{ _id: id, view: model }}>
						<Tooltip title="Open in full page">
							<ArrowsFullscreen size={18} color={COLORS.grey} />
						</Tooltip>
					</Link>
				</div>
				<div className={styles.iconWrapper}>
					<Tooltip title="Switch peek mode">
						<Columns size={18} color={COLORS.grey} />
					</Tooltip>
				</div>
			</div>
			<div className="flex">
				<div className={styles.iconWrapper}>
					<Tooltip title="View all comments">
						<ChatLeftText size={18} color={COLORS.grey} />
					</Tooltip>
				</div>
				<div className={styles.iconWrapper}>
					<Tooltip title="Hisotry">
						<ClockHistory size={18} color={COLORS.grey} />
					</Tooltip>
				</div>
				<div className={styles.iconWrapper}>
					<Tooltip title="Pin this page in your sidebar">
						<Star size={18} color={COLORS.grey} />
					</Tooltip>
				</div>
				<div className={styles.iconWrapper}>
					<Tooltip title="More">
						<ThreeDots size={18} color={COLORS.grey} />
					</Tooltip>
				</div>
			</div>
		</div>
	);
};

export const CenterDialog = ({ children }) => {
	const navigate = useNavigate();

	const handleDialogClose = () => {
		navigate(-1, { replace: true });
	};

	return (
		<EscapeDialog className={styles.overlay} handleClose={handleDialogClose}>
			<div className={styles.dialogAbsContainer}>{children}</div>
		</EscapeDialog>
	);
};

export const TrashDialog = () => {
	const [trashData, setTrashData] = useTrashData();
	const [query, setQuery] = useState('');

	const handleQuery = (e) => {
		setQuery(e.target.value);
	};

	const filteredData = useMemo(() => {
		if (!query) return trashData;

		return trashData.filter((item) => {
			return item.title.toLowerCase().includes(query.toLowerCase());
		});
	}, [trashData, query]);

	return (
		<div className={styles.besideContainer}>
			<div className={styles.besideWrapper}>
				<div className={styles.besideSearch}>
					<Search />
					<input
						value={query}
						onChange={handleQuery}
						type="text"
						placeholder="Filter by page title"
					/>
				</div>
				<div className={styles.bisideContentConatiner}>
					{!trashData ? (
						<Loading />
					) : (
						filteredData.map((data) => {
							return (
								<TrashItemBar key={'trash' + data._id} data={data} setTrashData={setTrashData} />
							);
						})
					)}
				</div>
			</div>
		</div>
	);
};

const TrashItemBar = ({ data, setTrashData }) => {
	const { dispatch } = useContext(TaskContext);

	const removeFromState = (id) => {
		setTrashData((prev) => prev.filter((item) => item._id !== id));
	};

	const handleRestore = async () => {
		data.isTrash = false;

		const modified = await updateTask(data);
		dispatch({
			type: 'UPDATE',
			payload: { value: modified },
		});
		removeFromState(data._id);
	};

	const handleDelete = async () => {
		const d = new Date(data.date);
		const deleted = await deleteTask(data._id);

		dispatch({
			type: 'DELETE',
			payload: { value: deleted },
		});
		removeFromState(data._id);
	};

	return (
		<div className={styles.besideContent}>
			<div className={styles.besideContentTitle}>{data.title}</div>
			<div className={'flex'}>
				<div className={styles.iconWrapper} onClick={handleRestore}>
					<Tooltip title="Restore">
						<ArrowCounterclockwise size={18} />
					</Tooltip>
				</div>
				<div className={styles.iconWrapper} onClick={handleDelete}>
					<Tooltip title="Delete permanently">
						<Trash size={18} />
					</Tooltip>
				</div>
			</div>
		</div>
	);
};
