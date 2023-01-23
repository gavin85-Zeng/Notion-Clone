import { createContext, useContext } from 'react';
import useModifyReducer from '../hooks/useModifyReducer';
import useTaskReducer from '../hooks/useTaskReducer';

export const COLORS = {
	lightPink: 'rgb(255, 226, 221)',
	lightYellow: 'rgb(253, 236, 200)',
	lightGreen: 'rgb(219, 237, 219)',
	grey: 'rgba(55, 53, 47, 0.5)',
	blue: 'rgba(35, 131, 226, .8)',
};

export const TaskContext = createContext({
	tasks: undefined,
	dispatch: undefined,
});

export const TaskProvider = ({ middleFn, children }) => {
	const [taskState, taskDispatch] = useTaskReducer([], middleFn);

	return (
		<TaskContext.Provider
			value={{
				tasks: taskState,
				dispatch: taskDispatch,
			}}
		>
			{children}
		</TaskContext.Provider>
	);
};

export const ModifyContext = createContext({
	item: undefined,
	dispatch: undefined,
});

export const ModifyProvider = ({ initValue, children }) => {
	const [modifyItem, modifyDispatch] = useModifyReducer(initValue);

	return (
		<ModifyContext.Provider
			value={{
				item: modifyItem,
				dispatch: modifyDispatch,
			}}
		>
			{children}
		</ModifyContext.Provider>
	);
};

export const SidebarContext = createContext([]);
export const PageContext = createContext();
