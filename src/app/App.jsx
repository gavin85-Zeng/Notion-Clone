import styles from './App.module.scss';
import useSidebar, { SidebarProvider } from './components/Sidebar';
import PageContainer from './pages/PageContainer';
import { List } from 'react-bootstrap-icons';
import { COLORS, TaskProvider, SidebarContext, TaskContext } from './context/Context';
import { BrowserRouter, useLocation, Link } from 'react-router-dom';
import { useContext } from 'react';

function Breadcrumb() {
	const location = useLocation();
	const { pages } = useContext(SidebarContext);
	const { tasks } = useContext(TaskContext);

	const CrumbString = () => {
		const crumbStr = pages.map((page) => {
			if (page._id === location.state?._id) {
				return (
					<span key={`${page.title}_${page._id}`} style={{ color: COLORS.grey }}>
						{!page.title ? 'Untitled' : page.title}
					</span>
				);
			} else {
				const index = tasks.findIndex((task) => task._id === location.state?._id);
				if (index === -1) return '';
				if (tasks[index].pageId !== page._id) return '';

				const title = !tasks[index].title ? ' / Untitled' : ' / ' + tasks[index].title;
				return (
					<span key={page.title + crypto.randomUUID()}>
						<span>
							<Link to={`/${page._id}`} state={page}>
								{!page.title ? 'Untitled' : page.title}
							</Link>
						</span>
						<span style={{ color: COLORS.grey }}>{title}</span>
					</span>
				);
			}
		});
		return crumbStr;
	};
	return <CrumbString />;
}

function TopHeader(props) {
	const { open, toggleState } = props;

	function Hunburger({ size }) {
		return (
			<div className={styles.hunburger}>
				<div className={styles['hunburger-wrapper']} onClick={toggleState}>
					<List size={size} />
				</div>
			</div>
		);
	}

	return (
		<div className={styles.breadcrumb}>
			{!open ? <Hunburger size={24} /> : null}
			<div className={styles['router-text']}>
				<Breadcrumb />
			</div>
		</div>
	);
}

function Navigation({ children }) {
	const { open, toggleState, Sidebar } = useSidebar();
	return (
		<SidebarProvider>
			<TaskProvider>
				<div className={styles['app-main']}>
					<Sidebar />
					<main>
						<TopHeader open={open} toggleState={toggleState} />
						{children}
					</main>
				</div>
			</TaskProvider>
		</SidebarProvider>
	);
}

function App() {
	return (
		<BrowserRouter>
			<Navigation>
				<PageContainer />
			</Navigation>
		</BrowserRouter>
	);
}

export default App;
