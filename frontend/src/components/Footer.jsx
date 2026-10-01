import { Link } from 'react-router-dom';

function Footer() {
	return (
	    <footer className="bg-white border-t border-primary/10 text-primary py-8 px-6 md:px-16 mt-auto">
		    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

		        <div className="space-y-2 text-center md:text-left">
			        <div className="flex justify-center md:justify-start gap-2 items-center">
			            <img src="/worklane.svg" alt="Worklane Logo" className="h-8 w-8 object-contain" />
			            <span className="text-lg font-black tracking-tight text-primary">
			              	WORK<span className="text-accent">LANE</span>
			            </span>
			        </div>
			        <p className="text-xs text-primary/70 max-w-sm mx-auto md:mx-0">
			            Business workflow & automation platform designed to simplify your operations, track tasks, and streamline requests.
			        </p>
		        </div>

		        <div className="flex justify-center space-x-6 text-sm font-medium">
		          	<Link to="/" className="hover:text-accent transition-colors">Home</Link>
		          	<Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
		          	<Link to="/demo" className="hover:text-accent transition-colors">Demo</Link>
		        </div>

		        <div className="text-center md:text-right text-xs text-primary/60">
		          	<p>&copy; {new Date().getFullYear()} Worklane. All rights reserved.</p>
		        </div>

		    </div>
	    </footer>
	);
}

export default Footer;