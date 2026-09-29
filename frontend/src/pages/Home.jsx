import { useNavigate } from 'react-router-dom';

function Home() {
	const navigate = useNavigate();

	return (
		<div className="min-h-full bg-background py-12 px-6 md:px-16 flex flex-col justify-between">
			<div className="max-w-4xl mx-auto text-center space-y-6 my-auto py-8">
			    <div className="inline-block  text-accent text-xs md:text-sm font-semibold px-4 py-1.5 rounded-full uppercase">
			      	Business Workflow & Automation Platform
			    </div>
			    <h1 className="text-2xl md:text-3xl font-bold text-primary">
			      	Manage work, automate steps, <br className="hidden md:inline" />
			      	<span className="text-accent">all from one platform.</span>
			    </h1>
			    <p className="text-base md:text-lg text-primary/70 max-w-2xl mx-auto leading-relaxed">
			      	Manage customer requests, assign tasks, streamline workflows, and track progress seamlessly from a centralized hub.
			    </p>

			    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
				    <button 
				        onClick={() => navigate('/login')}
				        className="bg-accent text-background font-medium px-5 py-3 w-50 rounded-xl shadow-lg hover:opacity-90 transition-all cursor-pointer text-base"
				      >
				        Get Started / Sign In
				    </button>
				    <button 
				        onClick={() => navigate('/demo')}
				        className="border-2 border-primary/20 text-primary font-medium px-5 py-3 w-50 rounded-xl hover:bg-primary/5 transition-all cursor-pointer text-base"
				      >
				        View Demo
				    </button>
			    </div>
			</div>
			<div className="max-w-6xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-12">
			    <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/10 hover:shadow-md transition-all space-y-3">
			      	<div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent text-xl">
			        	<i className="fa-solid fa-inbox"></i>
			      	</div>
			      	<h4 className="text-lg font-bold text-primary">Requests</h4>
			      	<p className="text-sm text-primary/70 leading-relaxed">Create and track incoming customer requests effortlessly.</p>
			    </div>
			    <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/10 hover:shadow-md transition-all space-y-3">
			      	<div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent text-xl">
			        	<i className="fa-solid fa-list-check"></i>
			      	</div>
			      	<h4 className="text-lg font-bold text-primary">Tasks</h4>
			      	<p className="text-sm text-primary/70 leading-relaxed">Assign responsibilities and monitor execution milestones.</p>
			    </div>
			    <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/10 hover:shadow-md transition-all space-y-3">
			      	<div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent text-xl">
			        	<i className="fa-solid fa-diagram-project"></i>
			      	</div>
			      	<h4 className="text-lg font-bold text-primary">Workflow</h4>
			      	<p className="text-sm text-primary/70 leading-relaxed">Move work smoothly through defined operational stages.</p>
			    </div>
			    <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/10 hover:shadow-md transition-all space-y-3">
				      <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent text-xl">
				        	<i className="fa-solid fa-bolt"></i>
				      </div>
				      <h4 className="text-lg font-bold text-primary">Automation</h4>
				      <p className="text-sm text-primary/70 leading-relaxed">Eliminate repetitive busywork with intelligent triggers.</p>
			    </div>
			</div>
		</div>
	);
}

export default Home;