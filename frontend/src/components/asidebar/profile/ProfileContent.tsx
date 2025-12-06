// src/components/asidebar/profile/ProfileContent.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { UserType, ProfileForm as ProfileFormType } from '@/types/api.type';
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { getCurrentUserProfile, updateUserName, updateUserPassword } from '@/lib/api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ProfileContentProps {
  onClose?: () => void;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

const ProfileContent: React.FC<ProfileContentProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState<UserType | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false); 

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<ProfileFormType>();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // ✅ Auto close modal setelah 2 detik jika success
  useEffect(() => {
    if (success && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const fetchCurrentUser = async () => {
    try {
      const data = await getCurrentUserProfile();
      setUser(data.user);
      setValue('name', data.user.name);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      console.error('Error fetching user:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormType) => {
    setLoading(true);
    setMessage('');
    setError('');
    setSuccess(false);

    try {      
      let nameUpdated = false;
      let passwordUpdated = false;

      if (data.name && data.name !== user?.name) {
        await updateUserName({ name: data.name });
        nameUpdated = true;
      }
      

      if (data.currentPassword && data.newPassword) {
        await updateUserPassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        });
        passwordUpdated = true;
      }

      await fetchCurrentUser();

      if (nameUpdated && passwordUpdated) {
        setMessage('Profile and password updated successfully!');
      } else if (nameUpdated) {
        setMessage('Name updated successfully!');
      } else if (passwordUpdated) {
        setMessage('Password updated successfully!');
      } else {
        setMessage('No changes detected.');
      }

      if (nameUpdated || passwordUpdated) {
        setSuccess(true);
      }

      reset({
        name: data.name,
        currentPassword: '',
        newPassword: ''
      });

    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
                {user?.profilePicture ? (
                  <Avatar className="size-[60px] rounded-lg font-bold ">
                    <AvatarFallback className="rounded-lg bg-gradient-to-tl text-[35px]  to-black from-black text-white">
                      {user?.name?.split(" ")?.[0]?.charAt(0) || "W"}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <span className="text-xl font-bold text-blue-600">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{user?.name}</h2>
              <p className="text-gray-600 text-sm mt-1">{user?.email}</p>
              
              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${user?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Member Sejak:</span>
                  <span className="font-medium text-right">
                   {user?.createdAt ? formatDate(user.createdAt.toString()) : '-'}
                  </span>
                </div>
                {user?.currentWorkspace && (
                  <div className="flex justify-between">
                    <span>Workspace:</span>
                    <span className="font-medium">
                      {user.currentWorkspace.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama *
              </label>
              <input
                type="text"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Enter your display name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Password Update Section */}
            <div className="border-t pt-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Edit Password</h3>
              
              <div className="space-y-3">
                {/* Current Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password Sekarang
                  </label>
                  <input
                    type="password"
                    {...register('currentPassword', {
                      validate: (value) => {
                        const newPassword = watch('newPassword');
                        if (newPassword && !value) {
                          return 'Current password is required when setting new password';
                        }
                        return true;
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter your current password"
                  />
                  {errors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    {...register('newPassword', {
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      },
                      validate: (value) => {
                        const currentPassword = watch('currentPassword');
                        if (currentPassword && !value) {
                          return 'New password is required when current password is provided';
                        }
                        return true;
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter new password"
                  />
                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Kosongkan kolom password jika tidak ingin mengubah password
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {message && (
              <div className={`p-3 border rounded-lg ${
                success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center">
                  {success ? (
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={`text-sm font-medium ${
                    success ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    {message} {success}
                  </span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              {onClose && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex items-center"
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Batal
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={loading || success}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </div>
                ) : success ? (
                  'Updated!'
                ) : (
                  'Simpan'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;