import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Users, MessageSquare, TrendingUp, Shield } from 'lucide-react';

const ModernHeroSection = () => {
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: 'Active Citizens', value: '10,000+' },
    { icon: MessageSquare, label: 'Issues Reported', value: '2,500+' },
    { icon: TrendingUp, label: 'Issues Resolved', value: '1,800+' },
    { icon: Shield, label: 'Communities Served', value: '50+' }
  ];

  return (
    <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                🎯 Empowering Communities Since 2024
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Your{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                VOICE
              </span>{' '}
              Matters
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 text-white/90 leading-relaxed">
              Transform your community by reporting issues, gathering support, and driving real change. 
              Join thousands of citizens making their voices heard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {user ? (
                <Link
                  to="/upload-issue"
                  className="btn-accent inline-flex items-center justify-center space-x-2 text-lg px-8 py-4"
                >
                  <span>Report an Issue</span>
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <button className="btn-accent inline-flex items-center justify-center space-x-2 text-lg px-8 py-4">
                  <span>Get Started</span>
                  <ArrowRight size={20} />
                </button>
              )}
              
              <Link
                to="/priority"
                className="btn-secondary inline-flex items-center justify-center space-x-2 text-lg px-8 py-4 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              >
                <span>View Priority Board</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-2 backdrop-blur-sm">
                    <stat.icon size={24} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Interactive Cards */}
          <div className="relative">
            <div className="grid gap-6">
              {/* Feature Card 1 */}
              <div className="glass p-6 rounded-2xl transform hover:scale-105 transition-all duration-300 animate-slide-up">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <MessageSquare size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Report Issues</h3>
                    <p className="text-white/80">
                      Easily report community issues with photos, location, and detailed descriptions.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="glass p-6 rounded-2xl transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <Users size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Gather Support</h3>
                    <p className="text-white/80">
                      Rally community members to support your cause and amplify your voice.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="glass p-6 rounded-2xl transform hover:scale-105 transition-all duration-300 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <TrendingUp size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Drive Change</h3>
                    <p className="text-white/80">
                      Watch as your issues get prioritized and resolved by local authorities.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl animate-bounce-slow"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse-slow"></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default ModernHeroSection;
