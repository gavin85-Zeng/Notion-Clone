import { useReducer } from 'react';

const transaction = (action, state) => {
	switch (action.type) {
		case 'ACTIVE': {
			const { id, pageId } = action.payload;

			fetch('/api/tabs/active/' + id, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ pageId: pageId }),
			});
			return;
		}
		case 'ADD': {
			const { documentId, pageId } = action.payload;
			let label = 'New view';
			let childElementName = label;
			if (documentId) {
				label = 'Calendar';
				childElementName = label;
			}

			const id = crypto.randomUUID();
			const newTab = {
				id: id,
				pageId: pageId,
				label: label,
				isActive: true,
				childElementName: childElementName,
			};
			fetch('/api/tabs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newTab),
			});
			return;
		}
		case 'DELETE': {
			const { id, isActive } = action.payload;
			if (state.length === 1) return;
			fetch('/api/tabs/' + id, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			// get prev || next element ID
			let removeIndex = -1;
			let placeIndex = -1;
			const newTabs = state.slice();
			for (let i = 0; i < newTabs.length; i++) {
				if (newTabs[i].id !== id) {
					continue;
				}
				removeIndex = i;
				if (removeIndex === 0 && isActive) {
					placeIndex = removeIndex + 1;
				} else if (isActive || removeIndex === newTabs.length - 1) {
					placeIndex = removeIndex - 1;
				}
			}

			if (placeIndex === -1) return;

			const tab = newTabs[placeIndex];
			fetch('/api/tabs/active/' + tab.id, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			return;
		}
		case 'VIEW_CHANGE': {
			const { id, label, childElementName } = action.payload;
			fetch('/api/tabs/' + id, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ label: label, childElementName: childElementName }),
			});
			return;
		}
		default: {
			return;
		}
	}
};

const tabReducerFunc = (state, action) => {
	switch (action.type) {
		case 'ACTIVE': {
			const { id } = action.payload;

			const newTabs = state.slice();
			newTabs.map((tab) => {
				if (tab.id === id) {
					tab.isActive = true;
				} else {
					tab.isActive = false;
				}
			});
			return newTabs;
		}
		case 'ADD': {
			const { documentId, pageId } = action.payload;

			let label = 'New view';
			let childElementName = label;
			if (documentId) {
				label = 'Calendar';
				childElementName = label;
			}

			const newTabs = state.slice();
			newTabs.map((tab) => (tab.isActive = false));
			const id = crypto.randomUUID();
			newTabs.push({
				id: id,
				pageId: pageId,
				label: label,
				isActive: true,
				childElementName: childElementName,
			});
			return newTabs;
		}
		case 'DELETE': {
			const { id, isActive } = action.payload;

			let removeIndex = -1;
			const newTabs = state.slice();
			for (let i = 0; i < newTabs.length; i++) {
				if (newTabs[i].id !== id) {
					continue;
				}

				removeIndex = i;
				if (removeIndex === 0 && isActive) {
					newTabs[removeIndex + 1].isActive = true;
				} else if (isActive || removeIndex === newTabs.length - 1) {
					newTabs[removeIndex - 1].isActive = true;
				}
			}
			newTabs.splice(removeIndex, 1);
			return newTabs;
		}
		case 'VIEW_CHANGE': {
			const { id, label, childElementName } = action.payload;
			const newTabs = state.slice();
			const targetTab = newTabs.find((tab) => tab.id === id);
			targetTab.label = label;
			targetTab.childElementName = childElementName;
			return newTabs;
		}
		case 'INIT': {
			const { data } = action.payload;
			return data;
		}
		default: {
			return state;
		}
	}
};

const useReducerWithMiddleware = (reducer, initialState, middlewareFn) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	const dispatchWithMiddleware = (action) => {
		dispatch(action);
		middlewareFn(action, state);
	};

	return [state, dispatchWithMiddleware];
};

export default function useTabReducer(initValue) {
	return useReducerWithMiddleware(tabReducerFunc, initValue, transaction);
}
