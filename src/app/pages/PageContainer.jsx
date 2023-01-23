import styles from './PageContainer.module.scss';
import { Route, Routes } from 'react-router-dom';
import { EditViewCenter } from './EditView';
import BasePage from './BasePage';

const PageContainer = () => {
	return (
		<div className={styles.container}>
			<Routes>
				<Route element={<BasePage />} path={':id'}>
					<Route element={<EditViewCenter />} path={':taskId'} />
				</Route>
				<Route element={<div>nothing here!</div>} path={'*'}></Route>
			</Routes>
		</div>
	);
};

export default PageContainer;
