import { useState ,useEffect} from 'react';
import { Link,useNavigate,useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ResetPassword() {
	const { token } = useParams()
	const navigate = useNavigate()
	const { isAuthenticated } = useAuth();
	const [isLegit,setIsLegit] = useState(false)
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [formData, setFormData] = useState({
		token:"",
		password: "",
		confirmPassword: ""
	});
	const [formError, setFormError] = useState({
		password: false,
		confirmPassword: false
	});
	// check if logged in
	useEffect(() => {
		if (isAuthenticated) {
			navigate('/dashboard', { replace: true });
		}
	}, [isAuthenticated, navigate]);

	// check the reset token if not redirect
	useEffect(() => {
		const fetchToken = async () => {
			setLoading(true);
			try {
				const response = await fetch(`/api/auth/reset-password/${token}`);
				const results = await response.json();
				if (!response.ok || !results.success) {
					throw new Error(results.message || 'Request failed');
				}
				if (results.success) {
					setFormData(prev => ({ ...prev, token: results.data['token'] }));
					setIsLegit(true);
				} else {
					setError(results.message);
				}
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		if (token) {
			fetchToken();
		}
	}, [token]);

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

	const handleSubmit = async(event) => {
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
			const response = await fetch('/api/auth/reset-password',{
				method:"POST",
				headers:{
					'Content-Type':'application/json'
				},
				body:JSON.stringify(formData),
				credentials: 'include'
			});
			const results=await response.json()
			if(!response.ok || !results.success){
				throw new Error(results.message || "request failed")
			}
			if(results.success){
				setSuccess(results.message)
				setTimeout(() => {
					navigate('/login', { replace: true });
				}, 1000);
				setFormData({
					token:"",
					password: "",
					confirmPassword: ""
				})
				setFormError({
					password:false,
					confirmPassword:false
				})
			}
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

				{isLegit ? (

					<form onSubmit={handleSubmit} className="space-y-4">
						<input type="hidden" name="token" value={formData.token} onChange={handleChange} />
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
									formError.confirmPassword 
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
				) : (
					<p className="text-sm text-primary/70">
						<Link to="/forgot-password" className="text-accent font-semibold hover:underline">
							Resend link again
						</Link>
					</p>
				)}

				<div className="text-center pt-2 border-t border-primary/5">
					<p className="text-sm text-primary/70">
						Go Back to{' '}
						<Link to="/login" className="text-accent font-semibold hover:underline">
							login
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default ResetPassword;