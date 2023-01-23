import { useReducer } from 'react';
import { replaceItem, removeItemById } from '../util/utility';

const taskReducerFunc = (state, action) => {
	const { value } = action.payload;
	switch (action.type) {
		case 'UPDATE': {
			if (value === undefined) return state;
			return replaceItem(state, value);
		}
		case 'FETCH': {
			return value;
		}
		case 'DELETE': {
			return removeItemById(state, value);
		}
		default: {
			return state;
		}
	}
};

export default function useTaskReducer(initValue) {
	return useReducer(taskReducerFunc, initValue);
}
