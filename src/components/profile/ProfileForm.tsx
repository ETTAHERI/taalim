---
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Props {
  profile: {
    id: string;
    name: string;
    bio?: string;
    avatar_url?: string;
  };
}

export default function ProfileForm({ profile }: Props) {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      let avatarUrl = profile.avatar_url;

      // رفع الصورة الشخصية إذا تم اختيارها
      if (avatar) {
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatar);

        if (uploadError) throw uploadError;
        avatarUrl = data.path;
      }

      // تحديث الملف الشخصي
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      setMessage('تم تحديث الملف الشخصي بنجاح');
    } catch (error: any) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('نجاح') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الاسم
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نبذة شخصية
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الصورة الشخصية
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          className="w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
      </button>
    </form>
  );
}