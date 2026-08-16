import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  UserGroupIcon, 
  PlusCircleIcon, 
  MagnifyingGlassIcon,
  GlobeAltIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const Communities = () => {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Other',
    isPrivate: false
  });

  const categories = [
    'Coding', 'AI', 'Cricket', 'Music', 'Gaming', 
    'Photography', 'Dance', 'Literature', 'Science', 
    'Business', 'Other'
  ];

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const { data } = await api.get('/communities');
      setCommunities(data);
    } catch (error) {
      console.error('Error fetching communities:', error);
      toast.error('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/communities', formData);
      setCommunities(prev => [data, ...prev]);
      toast.success('Community created successfully!');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', category: 'Other', isPrivate: false });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create community');
    }
  };

  const handleJoin = async (communityId) => {
    try {
      await api.post(`/communities/${communityId}/join`);
      toast.success('Joined community!');
      fetchCommunities();
    } catch (error) {
      toast.error('Failed to join community');
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-start justify-between mb-6 sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold">Communities</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 mt-2 text-white transition-colors bg-blue-600 rounded-lg sm:mt-0 hover:bg-blue-700"
          >
            <PlusCircleIcon className="w-5 h-5 mr-2" />
            Create Community
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search communities..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="p-8 text-center bg-white shadow-sm rounded-xl">
            <UserGroupIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg text-gray-500">No communities found</p>
            <p className="text-sm text-gray-400">Create your own community or join existing ones</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCommunities.map((community) => {
              const isMember = community.members.some(m => m._id === community.admin._id);
              
              return (
                <div
                  key={community._id}
                  className="overflow-hidden transition-shadow bg-white shadow-sm rounded-xl hover:shadow-md"
                >
                  {community.coverImage ? (
                    <img
                      src={community.coverImage}
                      alt={community.name}
                      className="object-cover w-full h-32"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{community.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {community.members.length} members
                        </p>
                      </div>
                      {community.isPrivate ? (
                        <LockClosedIcon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <GlobeAltIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {community.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded-full">
                        {community.category}
                      </span>
                      {community.admin && (
                        <span className="px-2 py-1 text-xs text-purple-800 bg-purple-100 rounded-full">
                          Admin: {community.admin.name}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex mt-4 space-x-2">
                      <Link
                        to={`/communities/${community._id}`}
                        className="flex-1 px-4 py-2 text-sm text-center text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        View
                      </Link>
                      
                      {isMember ? (
                        <span className="flex-1 px-4 py-2 text-sm text-center text-green-700 bg-green-100 rounded-lg">
                          Member
                        </span>
                      ) : (
                        <button
                          onClick={() => handleJoin(community._id)}
                          className="flex-1 px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          Join
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Community Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
              <h3 className="mb-4 text-xl font-bold">Create Community</h3>
              
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Community Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isPrivate}
                      onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Private Community</span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Private communities require approval to join
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Communities;