import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Users, 
  MessageSquare, 
  ThumbsUp,
  ThumbsDown,
  Timer,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const IssueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [userUpvote, setUserUpvote] = useState(null);
  const [undoTimeLeft, setUndoTimeLeft] = useState(0);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  useEffect(() => {
    // Check if user has upvoted and set up undo timer
    if (issue && user) {
      const upvote = issue.upvotes?.users?.find(u => u.userId._id === user.id);
      if (upvote) {
        setUserUpvote(upvote);
        const upvoteTime = new Date(upvote.upvotedAt);
        const currentTime = new Date();
        const timeDifference = (currentTime - upvoteTime) / 1000; // in seconds
        const undoTimeLimit = 60; // 1 minute
        
        if (timeDifference < undoTimeLimit) {
          setUndoTimeLeft(undoTimeLimit - timeDifference);
          
          // Start countdown timer
          const timer = setInterval(() => {
            const newTimeDifference = (new Date() - upvoteTime) / 1000;
            const newTimeLeft = undoTimeLimit - newTimeDifference;
            
            if (newTimeLeft <= 0) {
              setUndoTimeLeft(0);
              clearInterval(timer);
            } else {
              setUndoTimeLeft(newTimeLeft);
            }
          }, 1000);
          
          return () => clearInterval(timer);
        }
      }
    }
  }, [issue, user]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.ISSUES.DETAIL(id));
      
      if (!response.ok) {
        throw new Error('Failed to fetch issue');
      }
      
      const data = await response.json();
      setIssue(data.issue);
    } catch (error) {
      console.error('Error fetching issue:', error);
      toast.error('Failed to load issue details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      toast.error('Please login to upvote issues');
      return;
    }

    if (userUpvote) {
      toast.error('You have already upvoted this issue');
      return;
    }

    try {
      setUpvoting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.ISSUES.UPVOTE(id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upvote');
      }

      toast.success('Upvote added successfully!');
      fetchIssue(); // Refresh issue data
    } catch (error) {
      console.error('Error upvoting issue:', error);
      toast.error(error.message);
    } finally {
      setUpvoting(false);
    }
  };

  const handleRemoveUpvote = async () => {
    if (!userUpvote) {
      toast.error('You have not upvoted this issue');
      return;
    }

    try {
      setUpvoting(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(API_ENDPOINTS.ISSUES.REMOVE_UPVOTE(id), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove upvote');
      }

      toast.success('Upvote removed successfully!');
      setUserUpvote(null);
      setUndoTimeLeft(0);
      fetchIssue(); // Refresh issue data
    } catch (error) {
      console.error('Error removing upvote:', error);
      toast.error(error.message);
    } finally {
      setUpvoting(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <AlertCircle size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Issue Not Found</h2>
          <p className="text-gray-600 mb-6">The issue you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/issues')}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ArrowLeft size={20} />
            <span>Back to Issues</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/issues')}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Issues</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{issue.title}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                  {issue.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                  {issue.priority} priority
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Images */}
            {issue.images && issue.images.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {issue.images.map((image, index) => (
                    <div key={index} className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`Issue image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{issue.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upvote Section */}
            <div className="card-gradient">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support This Issue</h3>
              
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {issue.upvotes?.count || 0}
                </div>
                <div className="text-sm text-gray-600">supporters</div>
              </div>

              {user && (
                <div className="space-y-3">
                  {!userUpvote ? (
                    <button
                      onClick={handleUpvote}
                      disabled={upvoting}
                      className="btn-primary w-full inline-flex items-center justify-center space-x-2"
                    >
                      <ThumbsUp size={20} />
                      <span>{upvoting ? 'Supporting...' : 'Support Issue'}</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 py-2 px-4 rounded-lg">
                        <ThumbsUp size={16} />
                        <span className="text-sm font-medium">You supported this issue</span>
                      </div>
                      
                      {undoTimeLeft > 0 && (
                        <div className="space-y-2">
                          <button
                            onClick={handleRemoveUpvote}
                            disabled={upvoting}
                            className="btn-secondary w-full inline-flex items-center justify-center space-x-2"
                          >
                            <ThumbsDown size={20} />
                            <span>{upvoting ? 'Removing...' : 'Undo Support'}</span>
                          </button>
                          
                          <div className="flex items-center justify-center space-x-2 text-orange-600 bg-orange-50 py-2 px-3 rounded-lg">
                            <Timer size={16} />
                            <span className="text-sm">
                              Undo available for {Math.ceil(undoTimeLeft)}s
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {!user && (
                <p className="text-sm text-gray-600 text-center">
                  Please login to support this issue
                </p>
              )}
            </div>

            {/* Issue Details */}
            <div className="card-gradient">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{issue.colony}</div>
                    <div className="text-sm text-gray-600">Pincode: {issue.pincode}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Users size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Reported by</div>
                    <div className="text-sm text-gray-600">{issue.reporter?.name || 'Anonymous'}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Reported on</div>
                    <div className="text-sm text-gray-600">
                      {new Date(issue.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MessageSquare size={16} className="text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Authority</div>
                    <div className="text-sm text-gray-600">{issue.concernAuthority}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;
