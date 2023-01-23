import { createContext, forwardRef, useContext, useEffect, useRef, useState } from 'react';
import styles from './InitialView.module.scss';
import { Plus, FolderPlus } from 'react-bootstrap-icons';
import { COLORS, PageContext, SidebarContext } from '../context/Context';
import CalendarView from './CalendarView';
import { Title } from './EditView';
import ContextMenu, { Menu } from '../components/ContextMenu';
import Drawer from '../components/Drawer';
import useTabReducer from '../hooks/useTabReducer';
import TableView from './TableView';
import useTaskData from '../hooks/useTaskData';

export const PageTitle = () => {
	const pageState = useContext(PageContext);
	const { dispatch } = useContext(SidebarContext);
	const ref = useRef();

	const handleUpdatePageTitle = () => {
		const newTitle = ref.current.value;
		pageState.title = newTitle;
		dispatch({ type: 'UPDATE', payload: pageState });
	};

	return (
		<Title
			ref={ref}
			className={styles.title}
			title={pageState.title}
			onInput={handleUpdatePageTitle}
		/>
	);
};

const Tab = forwardRef(({ label, handleActive, handleDelete, handleChangeView, ...other }, ref) => {
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

	return (
		<div ref={ref} {...other} onContextMenu={handleRightClick}>
			<div className={styles.tab} onClick={handleActive}>
				<span>{label}</span>
			</div>
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
							{
								text: 'Edit View',
								fn: () => {
									handleChangeView();
									handleClose();
								},
							},
						]}
					/>
				</ContextMenu>
			) : null}
		</div>
	);
});
Tab.displayName = Tab;

const useFetchTabs = (pageId) => {
	const ref = useRef(false);
	const [tabs, dispatch] = useTabReducer([]);

	const getTabs = async () => {
		if (tabs.length !== 0) return;

		const response = await fetch('/api/tabs/' + pageId);
		const tabJson = await response.json();
		dispatch({ type: 'INIT', payload: { data: tabJson } });
	};

	useEffect(() => {
		if (ref.current === true) {
			getTabs();
		}
		return () => (ref.current = true);
	}, [pageId]);

	return [tabs, dispatch];
};

function TabPanel() {
	const pageState = useContext(PageContext);
	const { data } = useTaskData('/api/task?isTrash=false&pageId=' + pageState._id);
	if (!data) return;

	const indicatorRef = useRef([]);
	const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

	const drawerRef = useRef();
	const [drawer, setDrawer] = useState({ isOpen: false, isNewdatabase: false });
	const handleDrawerToggle = (isNewdatabase) =>
		setDrawer((prev) => ({ isOpen: !prev.isOpen, isNewdatabase: isNewdatabase }));

	const [changeViewId, setChangeViewId] = useState(null);

	const [tabs, dispatch] = useFetchTabs(pageState._id);

	useEffect(() => {
		if (indicatorRef.current.length === 0) return;

		indicatorRef.current = indicatorRef.current.slice(0, tabs.length);
		if (tabs.length === 1) {
			const { width } = indicatorRef.current[0].getBoundingClientRect();
			setIndicatorStyle({ left: 0, width: width });
		} else {
			const activeIndex = tabs.findIndex((tab) => tab.isActive === true);
			const { left: startX } = indicatorRef.current[0].getBoundingClientRect();
			const { left, width } = indicatorRef.current[activeIndex].getBoundingClientRect();
			setIndicatorStyle({ left: left - startX, width: width });
		}
	}, [tabs]);

	function ChildElement() {
		const find = tabs.find((tab) => tab.isActive === true);
		if (!find) {
			return <></>;
		} else {
			switch (find.childElementName) {
				case 'Calendar':
					return <CalendarView key={`tab-calendarview-${find._id}`} />;
				case 'Table':
					return <TableView key={`tab-tableview-${find._id}`} />;
				default:
					return <NewView handleToggle={handleDrawerToggle} />;
			}
		}
	}

	function OpenDrawer({ children }) {
		return drawer.isOpen ? (
			<Drawer onClose={handleDrawerToggle} ref={drawerRef}>
				{children}
			</Drawer>
		) : null;
	}

	return (
		<div className={styles.viewtabContainer}>
			<div className={styles.tabs} ref={drawerRef}>
				{tabs.map((tab, index) => (
					<Tab
						key={tab.label + index}
						label={tab.label}
						ref={(el) => (indicatorRef.current[index] = el)}
						handleActive={() => {
							if (tab.isActive) return;
							dispatch({ type: 'ACTIVE', payload: { id: tab.id, pageId: tab.pageId } });
						}}
						handleDelete={() => {
							if (tabs.length === 1) return;
							dispatch({ type: 'DELETE', payload: { id: tab.id, isActive: tab.isActive } });
						}}
						handleChangeView={() => {
							setChangeViewId(tab.id);
							handleDrawerToggle(false);
						}}
					/>
				))}
				<div
					className="flex"
					onClick={() =>
						dispatch({
							type: 'ADD',
							payload: {
								documentId: pageState.documentId,
								pageId: pageState._id,
							},
						})
					}
				>
					<Plus size={18} color={COLORS.grey} />
				</div>
				<span className={styles.indicator} style={indicatorStyle}></span>
			</div>
			<ChildElement />
			<OpenDrawer>
				{drawer.isNewdatabase ? (
					<NewDatabase
						handleAdd={() => {
							const activeTab = tabs.find((tab) => tab.isActive === true);
							dispatch({
								type: 'VIEW_CHANGE',
								payload: {
									id: activeTab.id,
									label: 'Calendar',
									childElementName: 'Calendar',
								},
							});
							handleDrawerToggle(false);
						}}
					/>
				) : (
					<SelectView
						onClick={(label) => {
							dispatch({
								type: 'VIEW_CHANGE',
								payload: { id: changeViewId, label: label, childElementName: label },
							});
							handleDrawerToggle(false);
						}}
					/>
				)}
			</OpenDrawer>
		</div>
	);
}

export default function InitialView() {
	return (
		<div className={styles.container}>
			<PageTitle />
			<TabPanel />
		</div>
	);
}

export const NewView = forwardRef(({ handleToggle, child }, ref) => {
	return (
		<div className={'flex'} style={{ height: '250px', justifyContent: 'center' }} ref={ref}>
			<div
				style={{
					color: COLORS.grey,
					fontSize: 14,
				}}
			>
				<div className="flex" style={{ justifyContent: 'center' }}>
					<FolderPlus color={COLORS.grey} size={32} />
				</div>
				<div style={{ textAlign: 'center' }}>No data source</div>
				<div className={styles.database} onClick={() => handleToggle(true)}>
					Select a database
				</div>
				to continue
			</div>
			{child ? child : null}
		</div>
	);
});
NewView.displayName = 'NewView';

function NewDatabase({ handleAdd }) {
	const pageState = useContext(PageContext);
	const { dispatch } = useContext(SidebarContext);
	const handleClick = () => {
		dispatch({
			type: 'ADD_DB',
			payload: { pageId: pageState._id, documentId: crypto.randomUUID() },
		});
		handleAdd();
	};
	return (
		<div className={styles['wh-100']}>
			<div className={styles.drawerItem} onClick={handleClick}>
				<div className="flex">
					<Plus size={20} color={COLORS.grey} />
					<div style={{ display: 'inline', color: 'var(--grey)' }}>New database</div>
				</div>
			</div>
		</div>
	);
}

function SelectView({ onClick }) {
	return (
		<div className={styles['wh-100']}>
			<div className={styles.drawerItem}>
				<div style={{ color: 'var(--grey)' }} onClick={() => onClick('Table')}>
					Table
				</div>
				<div style={{ color: 'var(--grey)' }} onClick={() => onClick('Calendar')}>
					Calendar
				</div>
			</div>
		</div>
	);
}
