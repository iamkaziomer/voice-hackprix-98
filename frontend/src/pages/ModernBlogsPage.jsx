import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  User, 
  ArrowRight, 
  TrendingUp,
  MessageSquare,
  Heart,
  Share2
} from 'lucide-react';

const ModernBlogsPage = () => {
  // Sample blog data - in a real app, this would come from an API
  const blogs = [
    {
      id: 1,
      title: "How Community Reporting Changed Our Neighborhood",
      excerpt: "A success story about how citizen engagement through VOICE platform led to significant improvements in our local area.",
      author: "Sarah Johnson",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "Success Stories",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop",
      likes: 24,
      comments: 8
    },
    {
      id: 2,
      title: "The Power of Collective Voice in Urban Planning",
      excerpt: "Exploring how citizen participation in reporting issues can influence municipal decision-making and urban development.",
      author: "Dr. Michael Chen",
      date: "2024-01-12",
      readTime: "8 min read",
      category: "Urban Planning",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
      likes: 42,
      comments: 15
    },
    {
      id: 3,
      title: "Digital Democracy: Making Your Voice Heard",
      excerpt: "Understanding how technology platforms like VOICE are revolutionizing civic engagement and community participation.",
      author: "Emma Rodriguez",
      date: "2024-01-10",
      readTime: "6 min read",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
      likes: 31,
      comments: 12
    }
  ];

  const categories = ["All", "Success Stories", "Urban Planning", "Technology", "Community", "Policy"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="gradient-accent py-16 relative overflow-hidden">
        <div className="noise-bg"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <BookOpen size={40} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Community Blog
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Stories, insights, and updates from our community of changemakers
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  category === "All"
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Article</h2>
          </div>
          
          <div className="card-gradient overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="relative h-64 lg:h-auto">
                <img
                  src={blogs[0].image}
                  alt={blogs[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Featured
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="text-primary-600 font-medium text-sm">
                    {blogs[0].category}
                  </span>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  {blogs[0].title}
                </h3>
                
                <p className="text-gray-600 text-lg mb-6">
                  {blogs[0].excerpt}
                </p>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <User size={16} />
                      <span>{blogs[0].author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>{new Date(blogs[0].date).toLocaleDateString()}</span>
                    </div>
                    <span>{blogs[0].readTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Heart size={16} />
                      <span>{blogs[0].likes}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <MessageSquare size={16} />
                      <span>{blogs[0].comments}</span>
                    </div>
                  </div>
                  
                  <button className="btn-primary inline-flex items-center space-x-2">
                    <span>Read More</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Articles */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Articles</h2>
            <p className="text-xl text-gray-600">Stay updated with the latest community insights</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.slice(1).map((blog) => (
              <article key={blog.id} className="card group cursor-pointer">
                <div className="relative h-48 mb-6 overflow-hidden rounded-lg">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      {blog.category}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {blog.title}
                  </h3>
                  
                  <p className="text-gray-600 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <User size={14} />
                      <span>{blog.author}</span>
                    </div>
                    <span>{blog.readTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Heart size={16} className="text-gray-400" />
                        <span className="text-gray-500">{blog.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageSquare size={16} className="text-gray-400" />
                        <span className="text-gray-500">{blog.comments}</span>
                      </div>
                    </div>
                    
                    <button className="text-primary-600 hover:text-primary-700 font-medium">
                      Read More
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 gradient-primary relative overflow-hidden">
        <div className="noise-bg"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Get the latest community stories and insights delivered to your inbox
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50"
            />
            <button className="btn-accent px-8 py-3">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernBlogsPage;
