import { Children, cloneElement, useContext, useEffect, memo } from 'react';
import { useLocation } from 'react-router-dom';
import {
	TaskContext,
	ModifyContext,
	ModifyProvider,
	PageContext,
	SidebarContext,
} from '../context/Context';
import { withoutMultiProperty, withoutProperty } from '../util/utility';
import EditView from './EditView';
import InitialView from './InitialView';

const Switch = memo(({ state, children }) => {
	const childrenArray = Children.toArray(children);
	const child = childrenArray.find((child) => {
		return child.props.type === state?.view;
	});
	return (
		<PageContext.Provider value={state}>
			{!child
				? null
				: cloneElement(child, {
						...child.props,
						key: state._id,
				  })}
		</PageContext.Provider>
	);
});
Switch.displayName = 'Switch';

function ViewModel({ children }) {
	const { pages } = useContext(SidebarContext);
	const { state } = useLocation();

	let someState = pages.find(
		(page) => page._id === state?._id || page.children?._id === state?._id,
	);

	if (!someState) {
		someState = state;
	}

	console.log(someState);

	return (
		<ModifyProvider initValue={undefined}>
			<Switch state={someState}>{children}</Switch>
			<Autosave locationState={state} />
		</ModifyProvider>
	);
}

const createTask = async (value) => {
	const res = await fetch('/api/task', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(value),
	});
	const data = await res.json();
	return data;
};

export const updateTask = async (value) => {
	const res = await fetch('/api/task/' + value._id, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(value),
	});
	const data = await res.json();
	return data;
};

export const deleteTask = async (id) => {
	const res = await fetch('/api/task/' + id, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	const data = await res.json();
	return data;
};

function Autosave() {
	const { dispatch } = useContext(TaskContext);
	const { item, dispatch: modifyDispatch } = useContext(ModifyContext);

	const postData = async (isExistItem, data) => {
		if (isExistItem) {
			return await updateTask(data);
		} else {
			return await createTask(data);
		}
	};

	const deleteSchedule = (isScheduleChange, isExistItem, value) => {
		if (!isScheduleChange || !isExistItem) return;
		dispatch({
			type: 'DELETE',
			payload: { value: value },
		});
	};

	const update = (value, isExistItem) => {
		dispatch({
			type: 'UPDATE',
			payload: { value: value, isExistItem: isExistItem },
		});
	};
	useEffect(() => {
		if (!item?.isChanged) return;

		const save = async () => {
			// remove unused key-value
			let modified = withoutMultiProperty(item, ['isChanged', 'isNew', 'from']);

			const isExistItem = !item.isNew;

			if (!isExistItem) {
				// Is new item remove temporary id
				modified = withoutProperty(item, '_id');
			}

			const isScheduleChange = !!item.from;
			const retrieve = await postData(isExistItem, modified);
			deleteSchedule(isScheduleChange, isExistItem, retrieve);
			update(retrieve, isExistItem);
			modifyDispatch({ type: 'INIT', payload: retrieve });
		};
		save();
	}, [item]);
}

export default function BasePage(props) {
	return (
		<ViewModel>
			<InitialView type="Initial" />
			<EditView type="Edit" />
		</ViewModel>
	);
}
