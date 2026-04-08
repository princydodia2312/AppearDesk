import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import api from '../../api/axios';

export default function Profile() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then(r => r.data)
  });

  const [formData, setFormData] = useState({ name: '', phone: '' });

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/users/${user._id}`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['me']);
      setSuccessMsg('Profile updated!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update profile');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user) {
      updateMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex items-center space-x-6 mb-8">
          <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
          <div className="space-y-3">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-12 bg-gray-200 rounded w-full"></div>
          <div className="h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">My Profile</h1>

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      {/* Header Card */}
      <div className="card p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="h-24 w-24 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-3xl font-medium text-gray-600 shrink-0">
          {initials}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-4 text-gray-600">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              <Shield className="h-3.5 w-3.5" />
              {user.role} role
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
              <Calendar className="h-3.5 w-3.5" />
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn-outline shrink-0 mt-4 md:mt-0"
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="card p-6 md:p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Edit Details</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    className="input pl-10 w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    className="input pl-10 w-full"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ name: user.name || '', phone: user.phone || '' });
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={updateMutation.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
