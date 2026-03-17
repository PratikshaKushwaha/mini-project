import React, { useState, useEffect } from 'react';
import { updateArtistProfile, getArtistProfile } from '../../services/api';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '../Button';
import Input from '../Input';

const ProfileSettings = () => {
    const { user } = useSelector(state => state.auth);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [dbCategories, setDbCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    
    // File state
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [bannerImageFile, setBannerImageFile] = useState(null);

    useEffect(() => {
        const fetchDbCategories = async () => {
            try {
                const res = await api.get('/categories');
                setDbCategories(res.data.data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchDbCategories();
    }, []);

    useEffect(() => {
        // Load User baseline
        if (user) {
            setValue('fullName', user.fullName || '');
            setValue('username', user.username || '');
            if (user.dob) {
                setValue('dob', user.dob.split('T')[0]); // YYYY-MM-DD
            }
        }

        const fetchProfile = async () => {
            try {
                // Fetch artist-specific profile.
                const res = await getArtistProfile(user._id);
                const profile = res.data.data;
                if (profile) {
                    setValue('bio', profile.bio || '');
                    setValue('location', profile.location || '');
                    setValue('website', profile.website || '');
                    setValue('instagram', profile.instagram || '');
                    setValue('twitter', profile.twitter || '');
                    setSelectedCategories(profile.categories || []);
                }
            } catch (error) {
                console.error("Could not fetch profile", error);
            }
        };
        if(user?.role === 'artist') fetchProfile();
    }, [user, setValue]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            // 1. Update Core User Info (including images) via FormData
            const userFormData = new FormData();
            if (data.fullName) userFormData.append('fullName', data.fullName);
            if (data.username) userFormData.append('username', data.username);
            if (data.dob) userFormData.append('dob', data.dob);
            if (profileImageFile) userFormData.append('profileImage', profileImageFile);
            if (bannerImageFile) userFormData.append('bannerImage', bannerImageFile);

            await updateProfile(userFormData);

            // 2. Update Artist Specific Info (JSON)
            if (user.role === 'artist') {
                const artistData = {
                    bio: data.bio,
                    location: data.location,
                    website: data.website,
                    instagram: data.instagram,
                    twitter: data.twitter,
                    categories: selectedCategories
                };
                await updateArtistProfile(artistData);
            }
            
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
            <h2 className="text-2xl font-playfair mb-6">Profile Settings</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                
                <h3 className="text-lg font-semibold text-deep-cocoa border-b border-stone-200 pb-2">Basic Info</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="Full Name" 
                        placeholder="Jane Doe"
                        {...register('fullName')}
                    />
                    <Input 
                        label="Username" 
                        placeholder="janedoe123"
                        {...register('username')}
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        type="date"
                        label="Date of Birth" 
                        {...register('dob')}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-deep-cocoa mb-1">Avatar / Profile Image</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setProfileImageFile(e.target.files[0])}
                            className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cat-cream file:text-text-brown hover:file:bg-orange-100 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-deep-cocoa mb-1">Banner Image</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setBannerImageFile(e.target.files[0])}
                            className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cat-cream file:text-text-brown hover:file:bg-orange-100 transition"
                        />
                    </div>
                </div>

                {user.role === 'artist' && (
                    <>
                        <h3 className="text-lg font-semibold text-deep-cocoa border-b border-stone-200 pb-2 pt-4">Artist Profile</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-deep-cocoa mb-1">Bio</label>
                            <textarea 
                                {...register('bio')}
                                className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-muted-taupe bg-stone-50"
                                rows="4"
                                placeholder="Tell clients about yourself and your art style..."
                            ></textarea>
                        </div>

                        <Input 
                            label="Location" 
                            placeholder="e.g. New York, Remote"
                            {...register('location')}
                        />

                <div>
                    <label className="block text-sm font-medium text-deep-cocoa mb-3">Categories</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {dbCategories.map(cat => (
                            <label key={cat._id} className="flex items-center space-x-2 text-sm text-stone-700">
                                <input 
                                    type="checkbox"
                                    className="rounded border-stone-300 text-btn-brown focus:ring-btn-brown"
                                    checked={selectedCategories.includes(cat.name)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedCategories([...selectedCategories, cat.name]);
                                        } else {
                                            setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                                        }
                                    }}
                                />
                                <span>{cat.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-stone-200">
                    <h3 className="text-lg font-semibold text-deep-cocoa mb-4">External Links</h3>
                    <div className="space-y-4">
                        <Input 
                            label="Personal Website or Portfolio" 
                            placeholder="https://myart.com"
                            {...register('website')}
                        />
                        <Input 
                            label="Instagram Username" 
                            placeholder="@artistname"
                            {...register('instagram')}
                        />
                        <Input 
                            label="Twitter / X Username" 
                            placeholder="@artistname"
                            {...register('twitter')}
                        />
                    </div>
                </div>
                </>
                )}

                <Button type="submit" isLoading={loading}>Save Profile</Button>
            </form>
        </div>
    );
};

export default ProfileSettings;
