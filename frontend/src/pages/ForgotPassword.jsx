import {useState,useEffect} from 'react'; 
import {Link,useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ForgotPassword() {
	const navigate=useNavigate()
	const { isAuthenticated } = useAuth();
	const [loading,setLoading] = useState(false)
	const [error,setError] = useState('')
	const [success,setSuccess] = useState('')
	const [formData,setFormData] = useState({
		email:''
	})
	const [formError,setFormError] = useState({
		email:false
	})
	useEffect(() => {
		if (isAuthenticated) {
			navigate('/dashboard', { replace: true });
		}
	}, [isAuthenticated, navigate]);

	const handleChange=(event)=>{
		const {name,value} = event.target
		setFormData({
			...formData, 
			[name]:value
		})
		if(formError[name]){
			setFormError({
				...formError,[name]:false
			})
		}
	}

	const handleSubmit=async(event)=>{
		event.preventDefault()
		const newError={}
		if(formData.email.trim().length===0){
			newError.email=true
		}

		setFormError(newError)
		if(Object.keys(newError).length>0){
			return
		}

		setLoading(true)
		setError("")
		setSuccess("")
		try{
			const response = await fetch('/api/auth/recover-password',{
				method:"POST",
				headers:{
					'Content-Type':'application/json'
				},
				body:JSON.stringify(formData),
				credentials: 'include'
			});
			const results = await response.json()
			if(!response.ok || !results.success){
				throw new Error(results.message || "request failed")
			}
			if (results.success) {
				setSuccess(results.message);
				setFormData({
					email: ''
				});
				setFormError({
					email: false
				});
			} else {
				setError(results.message);
			}
		}catch(error){
			setError(error.message)
		}finally{
			setLoading(false)
		}
	}
	return (
		<div className="min-h-full bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
			<div className="max-w-md w-full bg-white shadow-xl rounded-2xl border border-primary/10 p-8 space-y-6">
				
				<div className="text-center space-y-2">
					<h1 className="text-xl sm:text-2xl font-bold text-primary">
						Recover Password
					</h1>
					<p className="text-sm text-primary/70">
						Please provide your email address
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
				<form onSubmit={handleSubmit} className="space-y-2">
					<div className="space-y-1.5">
						<label className="block text-sm font-semibold text-primary">Email Address</label>
						<input 
							type="email" 
							name="email" 
							value={formData.email} 
							onChange={handleChange}
							placeholder="name@example.com" 
							className={`w-full px-4 py-2.5 text-sm rounded-xl text-primary bg-background border transition-all outline-none focus:ring-2 ${
								formError.email 
									? 'border-red-500 focus:ring-red-200 placeholder-red-400' 
									: 'border-primary/20 focus:border-accent focus:ring-accent/20 placeholder-gray-400'
							}`} 
						/>
						{formError.email && <p className="text-xs text-red-500">Email is required</p>}
					</div>
					<button 
						type="submit"
						disabled={loading}
						className="w-full mt-2 bg-accent text-background font-semibold py-3 px-4 rounded-xl shadow-lg hover:opacity-95 transition-all cursor-pointer text-sm disabled:opacity-50"
					>
						{loading ? 'Resetting password...' : 'Reset Password'}
					</button>
				</form>

				<div className="text-center pt-2 border-t border-primary/5">
					<p className="text-sm text-primary/70">
						Remembered password?{' '}
						<Link to="/login" className="text-accent font-semibold hover:underline">
							Back to Login
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}

export default ForgotPassword