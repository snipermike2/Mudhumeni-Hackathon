import React, { useState, useEffect } from 'react';
import { User, MapPin, Phone, Mail, Calendar, Briefcase, Edit3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { User as UserType } from '../types';

const UserProfile: React.FC = () => {
  const { t } = useLanguage();
  const [user, setUser] = useState<UserType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserType>>({});

  useEffect(() => {
    // Mock user data - in real app, this would come from context/API
    const mockUser: UserType = {
      id: '1',
      name: 'John Farmer',
      email: 'john@example.com',
      phone: '+263 77 123 4567',
      location: 'Harare, Zimbabwe',
      farmSize: 5,
      preferredLanguage: 'en',
      createdAt: new Date('2023-01-15'),
      primaryCrops: ['Maize', 'Tomatoes', 'Beans'],
      joinedAt: new Date('2023-01-15')
    };

    setUser(mockUser);
    setEditForm(mockUser);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (user && editForm) {
      setUser({ ...user, ...editForm });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setEditForm(user);
    }
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof UserType, value: string | number | string[]) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCropChange = (crops: string) => {
    const cropArray = crops.split(',').map((c: string) => c.trim()).filter(Boolean);
    handleInputChange('primaryCrops', cropArray);
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Profile</h1>
          <p className="text-gray-600">Manage your farming profile and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 h-32"></div>
          
          <div className="relative px-6 pb-6">
            <div className="flex items-center justify-between -mt-16 mb-6">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <User className="w-16 h-16 text-gray-600" />
              </div>
              
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-900">{user.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-900">{user.phone}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-900">{user.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Farming Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Farming Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm Size (hectares)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.1"
                        value={editForm.farmSize || ''}
                        onChange={(e) => handleInputChange('farmSize', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-gray-900">{user.farmSize} hectares</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Language
                    </label>
                    {isEditing ? (
                      <select
                        value={editForm.preferredLanguage || 'en'}
                        onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="en">English</option>
                        <option value="sn">Shona</option>
                        <option value="nd">Ndebele</option>
                      </select>
                    ) : (
                      <span className="text-gray-900">
                        {user.preferredLanguage === 'en' && 'English'}
                        {user.preferredLanguage === 'sn' && 'Shona'}
                        {user.preferredLanguage === 'nd' && 'Ndebele'}
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Crops
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.primaryCrops?.join(', ') || ''}
                        onChange={(e) => handleCropChange(e.target.value)}
                        placeholder="e.g., Maize, Tomatoes, Beans"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {user.primaryCrops && user.primaryCrops.length > 0 ? (
                          user.primaryCrops.map((crop: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                            >
                              {crop}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No crops specified</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-900">
                        {user.joinedAt && new Date(user.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Created
                    </label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    {t.common.save}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Farm Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{user.farmSize}</div>
              <div className="text-sm text-blue-800">Hectares</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {user.primaryCrops ? user.primaryCrops.length : 0}
              </div>
              <div className="text-sm text-green-800">Crop Types</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user.joinedAt ? 
                  Math.floor((new Date().getTime() - new Date(user.joinedAt).getTime()) / (1000 * 60 * 60 * 24)) 
                  : 0
                }
              </div>
              <div className="text-sm text-purple-800">Days as Member</div>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Profile updated successfully</span>
              <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Weather forecast checked</span>
              <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Crop recommendations requested</span>
              <span className="text-xs text-gray-500 ml-auto">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;