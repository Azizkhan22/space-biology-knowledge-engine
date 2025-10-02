const SpaceBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Main gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      
      {/* Animated nebula clouds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-purple-500/20 via-blue-500/10 to-transparent rounded-full opacity-70 animate-float blur-xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-radial from-pink-500/20 via-purple-500/10 to-transparent rounded-full opacity-50 animate-float blur-xl" style={{animationDelay: '2s'}}></div>
      <div className="absolute top-1/2 left-1/6 w-48 h-48 bg-gradient-radial from-blue-500/15 via-cyan-500/8 to-transparent rounded-full opacity-60 animate-float blur-xl" style={{animationDelay: '4s'}}></div>
      
      {/* Distant stars */}
      <div className="absolute inset-0">
        {/* Large twinkling stars */}
        <div className="absolute top-20 left-1/5 w-1 h-1 bg-white rounded-full animate-twinkle shadow-sm shadow-white/50"></div>
        <div className="absolute top-32 right-1/3 w-0.5 h-0.5 bg-blue-200 rounded-full animate-twinkle shadow-sm shadow-blue-200/50" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-10 w-1 h-1 bg-purple-200 rounded-full animate-twinkle shadow-sm shadow-purple-200/50" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-1/3 right-20 w-0.5 h-0.5 bg-white rounded-full animate-twinkle shadow-sm shadow-white/50" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/4 left-1/2 w-0.5 h-0.5 bg-pink-200 rounded-full animate-twinkle shadow-sm shadow-pink-200/50" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/2 left-1/4 w-1 h-1 bg-cyan-200 rounded-full animate-twinkle shadow-sm shadow-cyan-200/50" style={{animationDelay: '0.5s'}}></div>
        
        {/* Medium stars */}
        <div className="absolute top-40 right-1/4 w-0.5 h-0.5 bg-white/80 rounded-full animate-twinkle" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute bottom-40 left-1/3 w-0.5 h-0.5 bg-blue-100 rounded-full animate-twinkle" style={{animationDelay: '1.8s'}}></div>
        <div className="absolute top-1/3 right-1/6 w-0.5 h-0.5 bg-purple-100 rounded-full animate-twinkle" style={{animationDelay: '3.2s'}}></div>
        <div className="absolute bottom-1/4 left-1/5 w-0.5 h-0.5 bg-white/70 rounded-full animate-twinkle" style={{animationDelay: '0.8s'}}></div>
        
        {/* Small distant stars */}
        <div className="absolute top-16 left-1/3 w-px h-px bg-white/60 rounded-full animate-twinkle" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-3/4 right-1/5 w-px h-px bg-blue-50 rounded-full animate-twinkle" style={{animationDelay: '2.2s'}}></div>
        <div className="absolute bottom-16 left-1/2 w-px h-px bg-purple-50 rounded-full animate-twinkle" style={{animationDelay: '3.7s'}}></div>
        <div className="absolute top-1/6 right-2/5 w-px h-px bg-white/50 rounded-full animate-twinkle" style={{animationDelay: '1.3s'}}></div>
        <div className="absolute bottom-2/3 left-3/4 w-px h-px bg-pink-50 rounded-full animate-twinkle" style={{animationDelay: '2.8s'}}></div>
      </div>
      
      {/* Subtle grid overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.01] to-transparent"></div>
    </div>
  );
};

export default SpaceBackground;
