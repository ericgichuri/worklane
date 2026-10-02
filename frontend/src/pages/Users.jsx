import { useState, useEffect } from 'react';

function Users() {
	const [loading, setLoading] = useState({
		users: true,
		roles: false
	});
	const [tab, setTab] = useState({
		usersTab: true,
		rolesTab: false
	});
	const [users, setUsers] = useState([]);
	const [roles, setRoles] = useState([]);

	const [formUsers, setFormUsers] = useState({
		id: "",
		name: "",
		email: "",
		phone: "",
		role: "",
		password: ""
	});

	const [formRoles, setFormRoles] = useState({
		id: "",
		name: "",
		description: ""
	});

	const [modalOpen, setModalOpen] = useState({
		usersModal: false,
		rolesModal: false
	});

	const [usersApiError, setUsersApiError] = useState("");
	const [rolesApiError, setRolesApiError] = useState("");
	
	const [isSubmitting, setIsSubmitting] = useState({
		users: false,
		roles: false
	});

	const fetchUsers = async () => {
		try {
			setLoading(prev => ({ ...prev, users: true }));
			const response = await fetch('/api/users/', { credentials: 'include' });
			const results = await response.json();
			if (!response.ok || !results.success) {
				throw new Error(results.message || 'Request failed');
			}
			setUsers(results.data);
			setUsersApiError("");
		} catch (error) {
			setUsersApiError(error.message);
		} finally {
			setLoading(prev => ({ ...prev, users: false }));
		}
	};

	const fetchRoles = async () => {
		try {
			setLoading(prev => ({ ...prev, roles: true }));
			const response = await fetch('/api/users/roles', { credentials: 'include' });
			const results = await response.json();
			if (!response.ok || !results.success) {
				throw new Error(results.message || 'Request failed');
			}
			setRoles(results.data);
			setRolesApiError("");
		} catch (error) {
			setRolesApiError(error.message);
		} finally {
			setLoading(prev => ({ ...prev, roles: false }));
		}
	};

	useEffect(() => {
		fetchUsers();
		fetchRoles(); // Fetch roles on load so dropdown options are always available
	}, []);

	const callUsers = () => {
		setTab({ usersTab: true, rolesTab: false });
		fetchUsers();
	};

	const callRoles = () => {
		setTab({ usersTab: false, rolesTab: true });
		fetchRoles();
	};

	const openAddUserModal = () => {
		setFormUsers({ id: "", name: "", email: "", phone: "", role: "", password: "" });
		setModalOpen({ usersModal: true, rolesModal: false });
	};

	const openEditUserModal = (user) => {
		setFormUsers({
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
			password: "" // leave blank for optional update
		});
		setModalOpen({ usersModal: true, rolesModal: false });
	};

	const openAddRoleModal = () => {
		setFormRoles({ id: "", name: "", description: "" });
		setModalOpen({ usersModal: false, rolesModal: true });
	};

	const openEditRoleModal = (role) => {
		setFormRoles({
			id: role.id,
			name: role.name,
			description: role.description
		});
		setModalOpen({ usersModal: false, rolesModal: true });
	};

	const handleSubmitUser = async (event) => {
		event.preventDefault();
		setIsSubmitting(prev => ({ ...prev, users: true }));
		try {
			const payload = {
				user_id: formUsers.id || undefined,
				name: formUsers.name,
				email: formUsers.email,
				phone: formUsers.phone,
				role: formUsers.role,
				password: formUsers.password
			};

			const response = await fetch('/api/users/upsert', {
				method: formUsers.id ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload)
			});
			const results = await response.json();
			if (!response.ok || !results.success) {
				throw new Error(results.message || 'Failed to save user');
			}
			setModalOpen(prev => ({ ...prev, usersModal: false }));
			fetchUsers();
		} catch (error) {
			alert(error.message);
		} finally {
			setIsSubmitting(prev => ({ ...prev, users: false }));
		}
	};

	const handleSubmitRole = async (event) => {
		event.preventDefault();
		setIsSubmitting(prev => ({ ...prev, roles: true }));
		try {
			const payload = {
				role_id: formRoles.id || undefined,
				name: formRoles.name,
				description: formRoles.description
			};

			const response = await fetch('/api/users/roles/upsert', {
				method: formRoles.id ? 'PUT' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(payload)
			});
			const results = await response.json();
			if (!response.ok || !results.success) {
				throw new Error(results.message || 'Failed to save role');
			}
			setModalOpen(prev => ({ ...prev, rolesModal: false }));
			fetchRoles();
		} catch (error) {
			alert(error.message);
		} finally {
			setIsSubmitting(prev => ({ ...prev, roles: false }));
		}
	};

	return (
		<>
			<div className="text-primary bg-background flex flex-col gap-2 h-full overflow-y-hidden">
				<div className="h-[10vh] flex justify-between items-center px-4 py-2 border-b border-primary/10">
					<div className="flex gap-2 items-center">
						<button 
							onClick={callUsers} 
							className={`${tab.usersTab ? `bg-accent/10 border-b-2 border-accent text-accent` : `bg-background text-primary/70 border-b-2 border-transparent`} px-4 py-2 w-30 shadow-sm cursor-pointer font-medium transition-all rounded-t-lg`}
						>
							Users
						</button>
						<button 
							onClick={callRoles} 
							className={`${tab.rolesTab ? `bg-accent/10 border-b-2 border-accent text-accent` : `bg-background text-primary/70 border-b-2 border-transparent`} px-4 py-2 w-30 shadow-sm cursor-pointer font-medium transition-all rounded-t-lg`}
						>
							Roles
						</button>
					</div>
					<div className="flex gap-2">
						{tab.usersTab ? (
							<button onClick={openAddUserModal} className="bg-accent text-background cursor-pointer text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all">
								<i className="fa-solid fa-plus"></i> Add User
							</button>
						) : (
							<button onClick={openAddRoleModal} className="bg-accent text-background cursor-pointer text-sm font-medium py-2 px-4 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all">
								<i className="fa-solid fa-plus"></i> Add Role
							</button>
						)}
					</div>
				</div>

				<div className="flex-1 overflow-y-auto p-4">
					{tab.usersTab ? (
						<div className="min-h-[60vh] w-full">
							<table className="w-full border-collapse">
								<thead className="bg-primary/10 text-sm font-semibold text-primary">
									<tr>
										<th className="py-3 px-3 text-left w-20">Token</th>
										<th className="py-3 px-3 text-left">Name</th>
										<th className="py-3 px-3 text-left">Contact Info</th>
										<th className="py-3 px-3 text-left">Role</th>
										<th className="py-3 px-3 text-center">Action</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-primary/10 text-sm">
									{loading.users && <tr><td className="text-center py-6 text-primary/70" colSpan="5">Loading users...</td></tr>}
									{!loading.users && usersApiError && <tr><td className="text-center py-6 text-red-500" colSpan="5">{usersApiError}</td></tr>}

									{!loading.users && !usersApiError && (
										users.length === 0 ? (
											<tr><td className="text-center py-6 text-primary/70" colSpan="5">No user found</td></tr>
										) : (
											users.map(user => (
												<tr key={user.id} className="hover:bg-primary/5 transition-colors">
													<td className="py-3 px-3">{user.user_token}</td>
													<td className="py-3 px-3 font-medium">{user.name}</td>
													<td className="py-3 px-3">
														<p className="text-xs">Tel: {user.phone}</p>
														<p className="text-xs text-primary/70">Email: {user.email}</p>
													</td>
													<td className="py-3 px-3">
														<span className="bg-accent/10 text-accent px-2.5 py-1 rounded-full text-xs font-semibold">
															{user.role}
														</span>
													</td>
													<td className="py-3 px-3 text-center">
														<button 
															onClick={() => openEditUserModal(user)}
															className="bg-primary/10 text-primary hover:bg-accent hover:text-background px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer"
														>
															Edit
														</button>
													</td>
												</tr>
											))
										)
									)}
								</tbody>
							</table>
						</div>
					) : (
						<div className="min-h-[60vh] w-full">
							<table className="w-full border-collapse">
								<thead className="bg-primary/10 text-sm font-semibold text-primary">
									<tr>
										<th className="py-3 px-3 text-left w-20">No</th>
										<th className="py-3 px-3 text-left">Name</th>
										<th className="py-3 px-3 text-left">Description</th>
										<th className="py-3 px-3 text-center">Action</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-primary/10 text-sm">
									{loading.roles && <tr><td className="text-center py-6 text-primary/70" colSpan="4">Loading roles...</td></tr>}
									{!loading.roles && rolesApiError && <tr><td className="text-center py-6 text-red-500" colSpan="4">{rolesApiError}</td></tr>}

									{!loading.roles && !rolesApiError && (
										roles.length === 0 ? (
											<tr><td className="text-center py-6 text-primary/70" colSpan="4">No role found</td></tr>
										) : (
											roles.map((role, index) => (
												<tr key={role.id} className="hover:bg-primary/5 transition-colors">
													<td className="py-3 px-3">{index + 1}</td>
													<td className="py-3 px-3 font-medium">{role.name}</td>
													<td className="py-3 px-3 text-primary/80">{role.description}</td>
													<td className="py-3 px-3 text-center">
														<button 
															onClick={() => openEditRoleModal(role)}
															className="bg-primary/10 text-primary hover:bg-accent hover:text-background px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer"
														>
															Edit
														</button>
													</td>
												</tr>
											))
										)
									)}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* USERS MODAL */}
			{modalOpen.usersModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
					<div className="bg-background border border-primary/20 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
						<div className="space-y-1 text-center">
							<h3 className="text-lg font-bold text-primary">
								{formUsers.id ? 'Edit User' : 'Add User'}
							</h3>
							<p className="text-sm text-primary/70">
								{formUsers.id ? 'Update user details' : 'Create a new system user'}
							</p>
						</div>

						<form onSubmit={handleSubmitUser} className="space-y-3">
							<input type="hidden" name="user_id" value={formUsers.id} />
							
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-primary/80 mb-1">Name</label>
								<input 
									type="text" 
									name="name" 
									required
									value={formUsers.name}
									onChange={(e) => setFormUsers({...formUsers, name: e.target.value})}
									className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-background text-primary text-sm focus:outline-accent"
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-primary/80 mb-1">Email</label>
								<input 
									type="email" 
									name="email" 
									required
									value={formUsers.email}
									onChange={(e) => setFormUsers({...formUsers, email: e.target.value})}
									className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-background text-primary text-sm focus:outline-accent"
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-primary/80 mb-1">Phone</label>
								<input 
									type="tel" 
									name="phone" 
									required
									value={formUsers.phone}
									onChange={(e) => setFormUsers({...formUsers, phone: e.target.value})}
									className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-background text-primary text-sm focus:outline-accent"
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-primary/80 mb-1">Role</label>
								<select 
									name="role" 
									required
									value={formUsers.role}
									onChange={(e) => setFormUsers({...formUsers, role: e.target.value})}
									className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-background text-primary text-sm focus:outline-accent"
								>
									<option value="">Select Role</option>
									{roles.map(r => (
										<option key={r.id} value={r.name}>{r.name}</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-primary/80 mb-1">
									Password {formUsers.id && '(Leave blank to keep current)'}
								</label>
								<input 
									type="password" 
									name="password" 
									required={!formUsers.id}
									value={formUsers.password}
									onChange={(e) => setFormUsers({...formUsers, password: e.target.value})}
									className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-background text-primary text-sm focus:outline-accent"
								/>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									disabled={isSubmitting.users}
									onClick={() => setModalOpen({ usersModal: false, rolesModal: false })}
									className="flex-1 px-4 py-2.5 rounded-xl border border-primary/20 text-primary font-semibold text-sm hover:bg-primary/5 transition-all cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmitting.users}
									className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-background font-semibold text-sm shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
								>
									{isSubmitting.users ? 'Saving...' : 'Save'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* ROLES MODAL */}
			{modalOpen.rolesModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
					<div className="bg-background border border-primary/20 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
						<div className="space-y-1 text-center">
							<h3 className="text-lg font-bold text-primary">
								{formRoles.id ? 'Edit Role' : 'Add Role'}
							</h3>
							<p className="text-sm text-primary/70">
								{formRoles.id ? 'Update role details' : 'Create a new system role'}
							</p>
						</div>

						<form onSubmit={handleSubmitRole} className="space-y-3">
							<input type="hidden" name="role_id" value={formRoles.id} />
							
							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-primary/80 mb-1">Name</label>
								<input 
									type="text" 
									name="name" 
									required
									value={formRoles.name}
									onChange={(e) => setFormRoles({...formRoles, name: e.target.value})}
									className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-background text-primary text-sm focus:outline-accent"
								/>
							</div>

							<div>
								<label className="block text-xs font-semibold uppercase tracking-wider text-primary/80 mb-1">Description</label>
								<input 
									type="text" 
									name="description" 
									required
									value={formRoles.description}
									onChange={(e) => setFormRoles({...formRoles, description: e.target.value})}
									className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-background text-primary text-sm focus:outline-accent"
								/>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									disabled={isSubmitting.roles}
									onClick={() => setModalOpen({ usersModal: false, rolesModal: false })}
									className="flex-1 px-4 py-2.5 rounded-xl border border-primary/20 text-primary font-semibold text-sm hover:bg-primary/5 transition-all cursor-pointer"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={isSubmitting.roles}
									className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-background font-semibold text-sm shadow-md hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
								>
									{isSubmitting.roles ? 'Saving...' : 'Save'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}

export default Users;