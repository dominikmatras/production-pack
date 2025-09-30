export const UserBox = (props: any) => {
	return (
		<div className="userbox">
			<span className="dot" />
			<span>{props.role}</span>
			<button className="logout" onClick={props.logout}>
				Wyloguj
			</button>
		</div>
	)
}
