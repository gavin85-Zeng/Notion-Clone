import {
	useContext,
	useState,
	useEffect,
	useRef,
	useReducer,
	Children,
	cloneElement,
	useCallback,
	useMemo,
} from 'react';
import styles from './Sidebar.module.scss';
import {
	ChevronDoubleLeft,
	Trash,
	Check,
	Gear,
	Search,
	Plus,
	FileText,
} from 'react-bootstrap-icons';
import ToggleStateHoc from '../hoc/ToggleHoc';
import { TrashDialog } from './Dialog';
import { useNavigate } from 'react-router-dom';
import { SidebarContext } from '../context/Context';
import { useSidebarReducer } from '../hooks/useModifyReducer';
import ContextMenu, { Menu } from './ContextMenu';

const iconDef = {
	PLUS: 'Plus',
	SEARCH: 'Search',
	GEAR: 'Gear',
	CHECK: 'Check',
	FILE: 'File',
};

function getIcon(name, size = 18) {
	switch (name) {
		case iconDef.PLUS:
			return <Plus size={size} />;
		case iconDef.SEARCH:
			return <Search size={size} />;
		case iconDef.GEAR:
			return <Gear size={size} />;
		case iconDef.CHECK:
			return <Check size={size} />;
		case iconDef.FILE:
			return <FileText size={size} />;
		default:
			return null;
	}
}

function DoubleLeft(props) {
	const { size, toggleState } = props;
	return (
		<div className={styles.chevronDoubleLeft}>
			<div className={styles.chevronDoubleLeftWrapper} onClick={toggleState}>
				<ChevronDoubleLeft size={size} />
			</div>
		</div>
	);
}

function TrashBar(props) {
	const { handleToggle } = props;
	return (
		<div className={styles.iconWrapper} onClick={handleToggle}>
			<div className={styles.icon}>
				<div className="flex">
					<Trash />
				</div>
				<div className={styles.text}>Trash</div>
			</div>
		</div>
	);
}

const ToggleTrashBar = ToggleStateHoc(TrashBar);

function BasicOption() {
	return (
		<div className={styles.block}>
			<div className={styles.iconWrapper}>
				<div className={styles.icon}>
					<div className="flex">
						<Search size={18} />
					</div>
					<div className={styles.text}>Search</div>
				</div>
			</div>
			<div className={styles.iconWrapper}>
				<div className={styles.icon}>
					<div className="flex">
						<Gear size={18} />
					</div>
					<div className={styles.text}>Setting</div>
				</div>
			</div>
		</div>
	);
}

function AddPage() {
	const { dispatch } = useContext(SidebarContext);
	const navigate = useNavigate();

	const handleClick = () => {
		const baseContent = {
			_id: crypto.randomUUID(),
			icon: 'File',
			title: '',
			view: 'Initial',
			isActive: true,
		};

		fetch('/api/pages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(baseContent),
		});
		dispatch({ type: 'INSERT', payload: baseContent });
		navigate(`/${baseContent._id}`, { state: baseContent });
	};

	return (
		<div className={styles.iconWrapper} onClick={handleClick}>
			<div className={styles.icon}>
				<div className="flex">
					<Plus size={18} />
				</div>
				<div className={styles.text}>Add Page</div>
			</div>
		</div>
	);
}

function useFetchPages() {
	const ref = useRef(false);
	const navigate = useNavigate();
	const [pages, dispatch] = useSidebarReducer([]);

	const getPages = async () => {
		if (pages.length !== 0) return;

		const response = await fetch('/api/pages');
		const fetchPages = await response.json();
		dispatch({ type: 'INIT', payload: fetchPages });

		// redirect to active page
		const page = fetchPages.find((page) => page.isActive === true);
		navigate(page._id, { state: page });
	};

	useEffect(() => {
		if (ref.current === true) {
			getPages();
		}
		return () => (ref.current = true);
	}, []);

	return [pages, dispatch];
}

export function SidebarProvider({ children }) {
	const [pages, dispatch] = useFetchPages();
	const child = Children.only(children);
	const memoChild = useMemo(() => child);

	return (
		<SidebarContext.Provider value={{ pages: pages, dispatch: dispatch }}>
			{memoChild}
		</SidebarContext.Provider>
	);
}

function PageBar({ data }) {
	const { dispatch } = useContext(SidebarContext);
	const navigate = useNavigate();

	const [openMenu, setOpenMenu] = useState([
		{
			isOpen: false,
			top: 0,
			left: 0,
		},
	]);

	const handleRightClick = (e) => {
		e.preventDefault();
		const { clientX, clientY } = e;
		setOpenMenu({ isOpen: true, top: clientY, left: clientX });
	};

	const handleClose = () => {
		setOpenMenu((prev) => ({ ...prev, isOpen: false }));
	};

	const handleClick = () => {
		dispatch({ type: 'ACTIVE', payload: data._id });
		navigate(`/${data._id}`, { state: data });
	};

	const handleDelete = () => {
		dispatch({ type: 'DELETE', payload: data._id });
	};

	return (
		<div
			key={data._id}
			className={styles.iconWrapper}
			onClick={handleClick}
			onContextMenu={handleRightClick}
		>
			<div className={styles.icon} style={data.isActive ? { background: '#F1F1F0' } : null}>
				<div className="flex">{getIcon(data.icon)}</div>
				<div className={styles.text}>{data.title === '' ? 'Untitled' : data.title}</div>
			</div>
			{openMenu.isOpen ? (
				<ContextMenu top={openMenu.top} left={openMenu.left} onClose={handleClose}>
					<Menu
						data={[
							{
								text: 'Delete',
								fn: (e) => {
									e.preventDefault();
									e.stopPropagation();
									handleDelete();
									handleClose();
								},
							},
						]}
					/>
				</ContextMenu>
			) : null}
		</div>
	);
}

function PageOption() {
	const { pages } = useContext(SidebarContext);

	return (
		<div className={styles.block}>
			{pages.map((page) => (
				<PageBar key={`pagebar-${page._id}`} data={page} />
			))}
			<AddPage />
		</div>
	);
}

export default function useSidebar(props) {
	const [open, setOpen] = useState(true);
	const toggleState = () => {
		setOpen(!open);
	};

	function Sidebar() {
		return (
			<div className={open ? styles.sidebar : styles['sidebar-close']} {...props}>
				<DoubleLeft size={24} toggleState={toggleState} />
				<BasicOption />
				<PageOption />
				<ToggleTrashBar
					className={{
						container: styles.container,
						overlay: styles.overlay,
					}}
					overlay={true}
				>
					<TrashDialog />
				</ToggleTrashBar>
			</div>
		);
	}

	return { open, toggleState, Sidebar };
}
