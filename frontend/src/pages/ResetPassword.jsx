import { useState ,useEffect} from 'react';
import { Link,useNavigate } from 'react-router-dom';

function ResetPassword() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: ""
	});
	const [formError, setFormError] = useState({
		password: false,
		confirmPassword: false
	});

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData({
			...formData,
			[name]: value
		});
		// Clear field error when user types
		if (formError[name]) {
			setFormError({ ...formError, [name]: false });
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		const newError = {};
		if (formData.password.trim().length === 0) {
			newError.password = true;
		}

		if (formData.confirmPassword.trim().length === 0) {
			newError.confirmPassword = true;
		}
		setFormError(newError);

		if (Object.keys(newError).length > 0) {
			return;
		}
		
		setLoading(true);
		setSuccess("");
		setError("");

		try {
			// Simulate login action
			setSuccess('Password reset Successful');
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-full bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
			<div className="max-w-md w-full bg-white shadow-xl rounded-2xl border border-primary/10 p-8 space-y-6">
				
				<div className="text-center space-y-2">
					<h1 className="text-xl sm:text-2xl font-bold text-primary">
						Reset Password
					</h1>
					<p className="text-sm text-primary/70">
						Please reset password to your account
					</p>
				</div>

				{success && (
					<div className="text-xs bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-xl font-medium">
						{success}
					</div>
				)}
				{error && (
					<div className="text-xs bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl font-medium">
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-1.5">
						<label className="block text-sm font-semibold text-primary">Password</label>
						<input 
							type="password" 
							name="password" 
							value={formData.password} 
							onChange={handleChange}
							placeholder="new password" 
							className={`w-full px-4 py-2.5 text-sm rounded-xl text-primary bg-background border transition-all outline-none focus:ring-2 ${
								formError.password 
									? 'border-red-500 focus:ring-red-200 placeholder-red-400' 
									: 'border-primary/20 focus:border-accent focus:ring-accent/20 placeholder-gray-400'
							}`} 
						/>
						{formError.password && <p className="text-xs text-red-500">Password is required</p>}
					</div>

					<div className="space-y-1.5">
						<div className="flex justify-between items-center">
							<label className="block text-sm font-semibold text-primary">Confirm Password</label>
							<Link 
								to="/forgot-password" 
								className="text-xs text-accent hover:underline font-medium"
							>
								Resend Link?
							</Link>
						</div>
						<input 
							type="password" 
							name="confirmPassword" 
							value={formData.confirmPassword}
							onChange={handleChange} 
							placeholder="retype password"
							className={`w-full px-4 py-2.5 text-sm rounded-xl text-primary bg-background border transition-all outline-none focus:ring-2 ${
								formError.password 
									? 'border-red-500 focus:ring-red-200 placeholder-red-400' 
									: 'border-primary/20 focus:border-accent focus:ring-accent/20 placeholder-gray-400'
							}`} 
						/>
						{formError.confirmPassword && <p className="text-xs text-red-500">confirm Password is required</p>}
					</div>

					<button 
						type="submit"
						disabled={loading}
						className="w-full mt-2 bg-accent text-background font-semibold py-3 px-4 rounded-xl shadow-lg hover:opacity-95 transition-all cursor-pointer text-sm disabled:opacity-50"
					>
						{loading ? 'Resetting password...' : 'Save'}
					</button>
				</form>

				<div className="text-center pt-2 border-t border-primary/5">
					<p className="text-sm text-primary/70">
						Go Back to{' '}
						<Link to="/demo" className="text-accent font-semibold hover:underline">
							 login
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default ResetPassword;