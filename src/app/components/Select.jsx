import { Children, cloneElement, useState } from 'react';
import { EscapeLayer } from './Dialog';
import styles from './Select.module.scss';
import { clx } from '../util/utility.js';

function Option({ children, onClick, value }) {
	return (
		<div onClick={onClick} className={clx(styles.pl12, styles.item)} value={value}>
			{children}
		</div>
	);
}

function Span({ className, style, children }) {
	const clazz = className !== undefined ? clx(styles.itemText, className) : styles.itemText;
	return (
		<span className={clazz} style={style}>
			{children}
		</span>
	);
}

Option.Span = Span;
Select.Option = Option;

export default function Select({ children, selectValue, onSelect }) {
	const [open, setOpen] = useState(false);

	const handleToggle = (e) => {
		setOpen(!open);
	};

	const handleClick = (child) => (e) => {
		e.stopPropagation();
		const { value } = child.props;
		onSelect(value);
		handleToggle();
	};

	return !open ? (
		<div onClick={handleToggle}>{selectValue}</div>
	) : (
		<div className={styles.boxWrapper}>
			<EscapeLayer handleClose={handleToggle} style={{ position: 'fixed', top: 0, left: 0 }} />
			<div className={styles.selectBox}>
				<div className={styles.py8}>
					<div className={clx(styles.pl16, styles.remain)}>Select an option</div>
				</div>
				<div className={styles.flexColumnAlignCenter}>
					{Children.map(children, (child) => {
						return cloneElement(child, {
							...child.props,
							onClick: handleClick(child),
						});
					})}
				</div>
			</div>
		</div>
	);
}

export function StatusSelect({ value, onSelect }) {
	return (
		<Select selectValue={value} onSelect={onSelect}>
			<Select.Option value={'To Do'}>
				<Select.Option.Span className={styles.lightPink}>To Do</Select.Option.Span>
			</Select.Option>
			<Select.Option value={'Doing'}>
				<Select.Option.Span className={styles.lightYellow}>Doing</Select.Option.Span>
			</Select.Option>
			<Select.Option value={'Done'}>
				<Select.Option.Span className={styles.lightGreen}>Done</Select.Option.Span>
			</Select.Option>
		</Select>
	);
}
