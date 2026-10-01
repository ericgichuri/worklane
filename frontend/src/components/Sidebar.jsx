import { NavLink } from 'react-router-dom';

function Sidebar() {
	const navigationGroups = [
		{
			title: null,
			items: [
				{ name: 'Dashboard', path: '/dashboard', icon: 'fas fa-chart-pie' }
			]
		},
		{
			title: 'WORK',
			items: [
				{ name: 'Requests', path: '/requests', icon: 'fas fa-clipboard-list' },
				{ name: 'Tasks', path: '/tasks', icon: 'fas fa-tasks' },
				{ name: 'Customers', path: '/customers', icon: 'fas fa-users' }
			]
		},
		{
			title: 'PROCESS',
			items: [
				{ name: 'Workflows', path: '/workflows', icon: 'fas fa-project-diagram' },
				{ name: 'Approvals', path: '/approvals', icon: 'fas fa-check-circle' },
				{ name: 'Automations', path: '/automations', icon: 'fas fa-bolt' }
			]
		},
		{
			title: 'RESOURCES',
			items: [
				{ name: 'Documents', path: '/documents', icon: 'fas fa-folder-open' }
			]
		},
		{
			title: 'COMMUNICATION',
			items: [
				{ name: 'Notifications', path: '/notifications', icon: 'fas fa-bell' }
			]
		},
		{
			title: 'SYSTEM',
			items: [
				{ name: 'Users', path: '/users', icon: 'fas fa-user-shield' },
				{ name: 'Settings', path: '/settings', icon: 'fas fa-cog' }
			]
		}
	];

	return (
		<aside className="w-64 bg-white border-r border-primary/10 flex flex-col h-full overflow-y-auto p-4 shrink-0 hidden md:flex">
			<div className="space-y-6">
				{navigationGroups.map((group, groupIdx) => (
					<div key={groupIdx} className="space-y-1">
						{group.title && (
							<h3 className="px-3 text-[10px] font-bold tracking-wider text-primary/40 uppercase">
								{group.title}
							</h3>
						)}
						<div className="space-y-0.5">
							{group.items.map((item, itemIdx) => (
								<NavLink
									key={itemIdx}
									to={item.path}
									className={({ isActive }) =>
										`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
											isActive
												? 'bg-accent/10 text-accent font-bold'
												: 'text-primary/70 hover:bg-primary/5 hover:text-primary'
										}`
									}
								>
									<i className={`${item.icon} w-5 text-center text-sm`}></i>
									<span>{item.name}</span>
								</NavLink>
							))}
						</div>
					</div>
				))}
			</div>
		</aside>
	);
}

export default Sidebar;