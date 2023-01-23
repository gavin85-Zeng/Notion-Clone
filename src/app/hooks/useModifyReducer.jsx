import { useReducer, useState } from 'react';
import { insertItem, replaceItem } from '../util/utility';

const modifyReducerFunc = (state, action) => {
	switch (action.type) {
		case 'TITLE':
			return { ...state, title: action.payload, isChanged: true };
		case 'STATUS':
			return { ...state, status: action.payload, isChanged: true };
		case 'DATE':
			return {
				...state,
				date: action.payload.value,
				isChanged: true,
				from: action.payload.from,
			};
		case 'COMMENTS':
			return {
				...state,
				comments: action.payload,
				isChanged: true,
			};
		case 'CUSTPROPS':
			return {
				...state,
				custProps: action.payload,
				isChanged: true,
			};
		case 'TODOLIST':
			return {
				...state,
				todoList: action.payload,
				isChanged: true,
			};
		case 'CHANGED': {
			return { ...state, isChanged: true };
		}
		case 'INIT':
			return action.payload;
		default:
			return state;
	}
};

export const sidebarReducerFunc = (state, action) => {
	switch (action.type) {
		case 'INSERT': {
			let newArray = state.slice();
			newArray.forEach((element) => {
				element.isActive = false;
			});
			return insertItem(newArray, { index: state.length, value: action.payload });
		}
		case 'UPDATE': {
			let newArray = state.slice();
			return replaceItem(newArray, action.payload);
		}
		case 'ACTIVE': {
			let newArray = state.slice();
			for (let i = 0; i < newArray.length; i++) {
				if (newArray[i]._id === action.payload) newArray[i].isActive = true;
				else newArray[i].isActive = false;
			}
			return newArray;
		}
		case 'DELETE': {
			return state.filter((page) => page._id !== action.payload);
		}
		case 'ADD_DB': {
			const { pageId, documentId } = action.payload;
			const page = state.find((page) => page._id === pageId);
			page['documentId'] = documentId;
			let newArray = state.slice();
			return replaceItem(newArray, page);
		}
		case 'INIT': {
			return action.payload;
		}
		default:
			return state;
	}
};

/**
 * Block onchage character post request
 * Each pageId queue size: 2
 */
class TitleQueue {
	pendingList = [];
	run = false;
	constructor() {}

	add(obj) {
		const sameIdSize = this.pendingList.filter((o) => o.id === obj.id).length;
		if (sameIdSize > 1) {
			const otherIds = this.pendingList.filter((o) => o.id !== obj.id);
			const newArr = [...otherIds, obj];
			this.pendingList = newArr;
		} else {
			this.pendingList.push(obj);
		}
	}

	isRun() {
		return this.run;
	}

	size() {
		return this.pendingList.length;
	}

	/**
	 * recursion check character change
	 * interval 2s
	 */
	start() {
		if (this.run || this.pendingList.length === 0) return;
		this.run = true;
		const _this = this;

		const clone = _this.pendingList.slice();
		let fetches = [];
		for (let i = 0; i < clone.length; i++) {
			const obj = clone[i];
			fetches.push(
				fetch('/api/pages/title/' + obj.id, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ title: obj.title }),
				})
					.then((res) => res.json())
					.then((data) => {
						const removeIndex = _this.pendingList.findIndex((o) => o.title === obj.title);
						_this.pendingList.splice(removeIndex, 1);
					})
					.catch((err) => {
						const removeIndex = _this.pendingList.findIndex((o) => o.title === obj.title);
						_this.pendingList.splice(removeIndex, 1);
						console.error('Failed to update page title', err);
					}),
			);
		}

		setTimeout(() => {
			Promise.all(fetches).then(function () {
				_this.run = false;
				_this.start();
			});
		}, 2000);
	}
}

const titleQueue = new TitleQueue();
function postSidebarData(state, action) {
	switch (action.type) {
		case 'ACTIVE': {
			fetch('/api/pages/active/' + action.payload, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			return;
		}
		case 'UPDATE': {
			titleQueue.add({
				id: action.payload._id,
				title: action.payload.title,
			});

			if (!titleQueue.isRun()) {
				titleQueue.start();
			}
			return;
		}
		case 'DELETE': {
			fetch('/api/pages/' + action.payload, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			return;
		}
		case 'ADD_DB': {
			const { pageId, documentId } = action.payload;
			fetch('/api/pages/' + pageId, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ documentId: documentId }),
			});

			return;
		}
		default:
			return;
	}
}

const useReducerWithMiddleware = (reducer, initialState, middlewareFn) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	const dispatchWithMiddleware = (action) => {
		dispatch(action);
		middlewareFn(state, action);
	};

	return [state, dispatchWithMiddleware];
};

export function useSidebarReducer(initValue) {
	return useReducerWithMiddleware(sidebarReducerFunc, initValue, postSidebarData);
}

export default function useModifyReducer(initValue) {
	return useReducer(modifyReducerFunc, initValue);
}
