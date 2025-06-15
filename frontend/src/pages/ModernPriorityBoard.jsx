import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Plus,
  Trophy,
  Target,
  ArrowUp
} from 'lucide-react';

const ModernPriorityBoard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalIssues, setTotalIssues] = useState(0);
  const issuesPerPage = 10;

  const fetchIssues = async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        sort: 'supported',
        page: pageNum.toString(),
        limit: issuesPerPage.toString()
      });

      const url = `${API_ENDPOINTS.ISSUES.LIST}?${params}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url);

      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        throw new Error(`Failed to fetch issues: ${response.status}`);
      }

      const data = await response.json();
      console.log('Priority board raw data:', data);
      console.log('Data type:', typeof data);
      console.log('Is array:', Array.isArray(data));

      // Handle both old and new API response formats
      let fetchedIssues = [];
      let pagination = null;

      if (data.issues) {
        fetchedIssues = data.issues;
        pagination = data.pagination;
      } else if (Array.isArray(data)) {
        fetchedIssues = data;
      }

      if (append) {
        setIssues(prev => [...prev, ...fetchedIssues]);
      } else {
        setIssues(fetchedIssues);
      }

      // Update pagination info
      if (pagination) {
        setHasMore(pagination.hasMore);
        setTotalIssues(pagination.totalIssues);
      } else {
        setHasMore(false);
        setTotalIssues(fetchedIssues.length);
      }

    } catch (error) {
      console.error('Error fetching issues:', error);
      if (!append) {
        setIssues([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreIssues = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchIssues(nextPage, true);
    }
  };

  useEffect(() => {
    fetchIssues(1, false);
  }, []);

  const handleUpvote = async (issueId, event) => {
    // Prevent event bubbling to avoid triggering the card click
    event.stopPropagation();

    if (!user) {
      alert('Please login to upvote issues');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(API_ENDPOINTS.ISSUES.UPVOTE(issueId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upvote');
      }

      // Refresh issues after upvote
      fetchIssues(1, false);
    } catch (error) {
      console.error('Error upvoting issue:', error);
      alert(error.message);
    }
  };

  const handleIssueClick = (issueId) => {
    // Open issue detail page in new tab
    window.open(`/issues/${issueId}`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="gradient-secondary py-16 relative overflow-hidden">
        <div className="noise-bg"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Trophy size={40} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Priority Board
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Issues ranked by community support - the more upvotes, the higher the priority
            </p>
            {user && (
              <Link
                to="/upload-issue"
                className="btn-accent inline-flex items-center space-x-2 text-lg px-8 py-4"
              >
                <Plus size={20} />
                <span>Report New Issue</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="card">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600">Issues are prioritized based on community support and engagement</p>
            </div>
            <div className="card">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Real-time Ranking</h3>
              <p className="text-gray-600">Rankings update in real-time as community members vote</p>
            </div>
            <div className="card">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Collective Voice</h3>
              <p className="text-gray-600">Every vote counts towards making your community better</p>
            </div>
          </div>
        </div>
      </section>

      {/* Priority Issues */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Top Priority Issues</h2>
            <p className="text-xl text-gray-600">Ranked by community support</p>

            
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner w-12 h-12"></div>
            </div>
          ) : issues.length > 0 ? (
            <div className="space-y-6">
              {issues.map((issue, index) => (
                <div
                  key={issue._id}
                  className="card-gradient hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  onClick={() => handleIssueClick(issue._id)}
                >
                  <div className="flex items-start space-x-6">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                        'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}>
                        #{index + 1}
                      </div>
                    </div>

                    {/* Issue Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {issue.title}
                          </h3>
                          <p className="text-gray-600 line-clamp-2 mb-3">
                            {issue.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <MapPin size={16} />
                              <span>{issue.colony}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare size={16} />
                              <span>{issue.comments?.length || 0} comments</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock size={16} />
                              <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status and Priority Badges */}
                        <div className="flex flex-col space-y-2 ml-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                            {issue.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-700">
                          {issue.concernAuthority}
                        </span>
                        
                        {/* Upvote Button */}
                        <button
                          onClick={(e) => handleUpvote(issue._id, e)}
                          disabled={!user}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            user
                              ? 'bg-primary-500 text-white hover:bg-primary-600'
                              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <ArrowUp size={16} />
                          <span>{issue.upvotes?.count || 0}</span>
                          <span>Support</span>
                        </button>
                      </div>
                    </div>

                    {/* Issue Image */}
                    {issue.images && issue.images.length > 0 && (
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={issue.images[0]}
                          alt={issue.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Load More Button */}
              {hasMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMoreIssues}
                    disabled={loadingMore}
                    className="btn-primary inline-flex items-center space-x-2 px-8 py-3"
                  >
                    {loadingMore ? (
                      <>
                        <div className="spinner w-5 h-5"></div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={20} />
                        <span>Load More Issues</span>
                      </>
                    )}
                  </button>

                  <p className="text-sm text-gray-600 mt-3">
                    Showing {issues.length} of {totalIssues} issues
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <Trophy size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Issues Found</h3>
              <p className="text-gray-600 mb-6">
                {totalIssues === 0
                  ? "Be the first to report an issue and start building community support!"
                  : "No issues match the current criteria. Try adjusting your filters or check back later."
                }
              </p>
              {user && (
                <div className="space-y-4">
                  <Link
                    to="/upload-issue"
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <Plus size={20} />
                    <span>Report New Issue</span>
                  </Link>
                  <div className="text-sm text-gray-500">
                    <Link to="/issues" className="text-primary-600 hover:text-primary-700">
                      View all issues
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ModernPriorityBoard;
