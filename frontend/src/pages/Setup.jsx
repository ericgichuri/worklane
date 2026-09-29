import {useState,useEffect} from 'react'
import {Link,useNavigate} from 'react-router-dom'

function Setup() {
	const [loading, setLoading] = useState(false)
	const [accountExist,setAccountExist ] = useState(false)
	const [error,setError] = useState('')
	const [success,setSuccess] = useState('')
	const [formData,setFormData] = useState({
		name:'',
		phone:'',
		email:'',
		password:''
	})
	const [formError,setFormError] = useState({
		name:false,
		phone: false,
		email: false,
		password: false
	})
	const navigate=useNavigate()
	const handleChange=(event)=>{
		const {name,value} = event.target;
		setFormData({
			...formData, 
			[name]:value
		})
		if(formError[name]){
			setFormError({...formError, [name]:false})
		}
	}
	const handleSubmit=(event)=>{
		event.preventDefault()
		const newError = {};
		if (formData.name.trim().length === 0) {
			newError.name = true;
		}
		if (formData.phone.trim().length === 0) {
			newError.phone = true;
		}
		if (formData.email.trim().length === 0) {
			newError.email = true;
		}
		if (formData.password.trim().length === 0) {
			newError.password = true;
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
			setSuccess('Login Successful');
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	}
	return (
		<div className="min-h-full bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
			<div className="max-w-md w-full bg-white shadow-xl rounded-2xl border border-primary/10 p-8 space-y-6">
				
				<div className="text-center space-y-2">
					<h1 className="text-xl sm:text-2xl font-bold text-primary">
						Setup WORK<span className="text-accent">LANE</span>
					</h1>
					<p className="text-sm text-primary/70">
						Please setup your Admin account
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
						<label className="block text-sm font-semibold text-primary">Name</label>
						<input 
							type="text" 
							name="name" 
							value={formData.name} 
							onChange={handleChange}
							placeholder="your name" 
							className={`w-full px-4 py-2.5 text-sm rounded-xl text-primary bg-background border transition-all outline-none focus:ring-2 ${
								formError.name 
									? 'border-red-500 focus:ring-red-200 placeholder-red-400' 
									: 'border-primary/20 focus:border-accent focus:ring-accent/20 placeholder-gray-400'
							}`} 
						/>
						{formError.name && <p className="text-xs text-red-500">Name is required</p>}
					</div>
					<div className="space-y-1.5">
						<label className="block text-sm font-semibold text-primary">Phone No</label>
						<input 
							type="tel" 
							name="phone" 
							value={formData.phone} 
							onChange={handleChange}
							placeholder="+254........." 
							className={`w-full px-4 py-2.5 text-sm rounded-xl text-primary bg-background border transition-all outline-none focus:ring-2 ${
								formError.phone 
									? 'border-red-500 focus:ring-red-200 placeholder-red-400' 
									: 'border-primary/20 focus:border-accent focus:ring-accent/20 placeholder-gray-400'
							}`} 
						/>
						{formError.phone && <p className="text-xs text-red-500">Phone No is required</p>}
					</div>
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

					<div className="space-y-1.5">
						<div className="flex justify-between items-center">
							<label className="block text-sm font-semibold text-primary">Password</label>
							<Link 
								to="/login" 
								className="text-xs text-accent hover:underline font-medium"
							>
								Go to Login
							</Link>
						</div>
						<input 
							type="password" 
							name="password" 
							value={formData.password}
							onChange={handleChange} 
							placeholder="••••••••"
							className={`w-full px-4 py-2.5 text-sm rounded-xl text-primary bg-background border transition-all outline-none focus:ring-2 ${
								formError.password 
									? 'border-red-500 focus:ring-red-200 placeholder-red-400' 
									: 'border-primary/20 focus:border-accent focus:ring-accent/20 placeholder-gray-400'
							}`} 
						/>
						{formError.password && <p className="text-xs text-red-500">Password is required</p>}
					</div>

					<button 
						type="submit"
						disabled={loading}
						className="w-full mt-2 bg-accent text-background font-semibold py-3 px-4 rounded-xl shadow-lg hover:opacity-95 transition-all cursor-pointer text-sm disabled:opacity-50"
					>
						{loading ? 'Setting up account...' : 'Create Account'}
					</button>
				</form>

				<div className="text-center pt-2 border-t border-primary/5">
					<p className="text-sm text-primary/70">
						I want to?{' '}
						<Link to="/demo" className="text-accent font-semibold hover:underline">
							Book Demo
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}

export default Setup;