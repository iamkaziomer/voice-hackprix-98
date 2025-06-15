import React, { useState, useEffect } from 'react';
import ModernHeroSection from '../components/ModernHeroSection';
import { TrendingUp, Users, CheckCircle, Clock } from 'lucide-react';

const ModernPrimaryPage = () => {
  const [analytics, setAnalytics] = useState({
    totalIssues: 0,
    resolvedIssues: 0,
    pendingIssues: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/issues/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set default values if API fails
      setAnalytics({
        totalIssues: 2500,
        resolvedIssues: 1800,
        pendingIssues: 700,
        totalUsers: 10000
      });
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Real-time Tracking",
      description: "Monitor the progress of your reported issues with live updates and status changes.",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Build consensus around issues through upvotes and community engagement.",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: CheckCircle,
      title: "Verified Resolution",
      description: "Get confirmation when issues are resolved with before/after documentation.",
      color: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    {
      icon: Users,
      label: "Active Citizens",
      value: analytics.totalUsers?.toLocaleString() || "10,000+",
      color: "text-blue-600"
    },
    {
      icon: TrendingUp,
      label: "Issues Reported",
      value: analytics.totalIssues?.toLocaleString() || "2,500+",
      color: "text-green-600"
    },
    {
      icon: CheckCircle,
      label: "Issues Resolved",
      value: analytics.resolvedIssues?.toLocaleString() || "1,800+",
      color: "text-purple-600"
    },
    {
      icon: Clock,
      label: "Pending Issues",
      value: analytics.pendingIssues?.toLocaleString() || "700+",
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <ModernHeroSection />
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4`}>
                  <stat.icon size={32} className={stat.color} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose VOICE?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides the tools and community support you need to create lasting change in your neighborhood.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card-gradient text-center group hover:scale-105 transition-transform duration-300">
                <div className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple Steps to Make a Difference</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started with VOICE is easy. Follow these simple steps to begin creating positive change in your community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="card text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Sign Up & Login</h3>
                <p className="text-gray-600">
                  Create your account using email or Google OAuth. Join our community of active citizens working for change.
                </p>
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform translate-x-4"></div>
            </div>
            
            <div className="relative">
              <div className="card text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Report Issues</h3>
                <p className="text-gray-600">
                  Document problems in your community with photos, descriptions, and location details for maximum impact.
                </p>
              </div>
              {/* Connector Line */}
              <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-gradient-to-r from-green-500 to-teal-500 transform translate-x-4"></div>
            </div>
            
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your issue's progress, gather community support, and celebrate when problems get resolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary relative overflow-hidden">
        <div className="noise-bg"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who are already creating positive change in their communities. 
            Your voice matters, and together we can build better neighborhoods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-accent text-lg px-8 py-4">
              Start Reporting Issues
            </button>
            <button className="btn-secondary bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 text-lg px-8 py-4">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernPrimaryPage;
