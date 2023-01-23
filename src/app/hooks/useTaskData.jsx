import { useContext, useEffect, useRef, useState } from 'react';
import { TaskContext } from '../context/Context';

const useTaskData = (uri) => {
	const { tasks, dispatch } = useContext(TaskContext);
	const ref = useRef(false);

	const dataFetch = async () => {
		const idIndex = uri.indexOf('pageId');

		let param = uri.substring(idIndex);
		const nextIndex = param.indexOf('&');
		if (nextIndex != -1) {
			param = param.substring(0, nextIndex);
		}

		const pageId = param.substring(7);

		const dataExists = tasks.findIndex((task) => task.pageId === pageId) !== -1;
		if (dataExists) return;

		await fetch(uri)
			.then((res) => res.json())
			.then((data) => {
				dispatch({ type: 'FETCH', payload: { value: data } });
			})
			.catch((err) => console.log(err));
	};

	useEffect(() => {
		if (ref.current === true) dataFetch();

		return () => (ref.current = true);
	}, [uri]);

	return { data: tasks };
};

export const useTrashData = () => {
	const ref = useRef(false);
	const [trashData, setTrashData] = useState();

	const dataFetch = async () => {
		await fetch('/api/task/?isTrash=true')
			.then((res) => res.json())
			.then((data) => {
				setTrashData(data);
			})
			.catch((err) => console.log(err));
	};

	useEffect(() => {
		if (ref.current === true) dataFetch();

		return () => (ref.current = true);
	}, []);

	return [trashData, setTrashData];
};

export default useTaskData;
