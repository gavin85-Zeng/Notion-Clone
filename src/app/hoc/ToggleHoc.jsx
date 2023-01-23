import { useState } from 'react';

export const HoverableHoc = (Component) => {
	const HoverComponent = (props) => {
		const { className, ...other } = props;
		const [toggle, setToggle] = useState(false);

		const handleToggle = () => {
			setToggle(!toggle);
		};

		return (
			<div className={className} onMouseEnter={handleToggle} onMouseLeave={handleToggle}>
				{toggle ? <Component {...other} /> : null}
			</div>
		);
	};

	return HoverComponent;
};

/**
 * connect two component to implement switch card
 */
export const SwitchHoc = (Component2) => {
	const SwitchComponent2 = (Component1) => {
		const SwitchComponent1 = (props) => {
			const { className, children, ...other } = props;
			const [toggle, setToggle] = useState(false);

			const handleToggle = () => {
				setToggle(!toggle);
			};

			return (
				<div className={className} onClick={handleToggle}>
					{toggle ? (
						<Component1 {...other}>{children}</Component1>
					) : (
						<Component2 {...other}>{children}</Component2>
					)}
				</div>
			);
		};
		return SwitchComponent1;
	};
	return SwitchComponent2;
};

const ToggleStateHoc = (Component) => {
	const StateComponent = (props) => {
		const { className, overlay = false, toggleDisable = false, children, ...other } = props;
		const [toggle, setToggle] = useState(false);

		const handleToggle = (e) => {
			setToggle(!toggle);
		};

		return (
			<div className={className.container}>
				{overlay && toggle ? <div className={className.overlay} onClick={handleToggle} /> : null}
				{toggle && toggleDisable ? null : <Component {...other} handleToggle={handleToggle} />}
				{toggle ? children : null}
			</div>
		);
	};

	return StateComponent;
};

export default ToggleStateHoc;
