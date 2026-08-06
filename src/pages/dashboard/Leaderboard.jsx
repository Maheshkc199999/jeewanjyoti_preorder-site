import React, { useState, useEffect } from 'react';
import { getAccessToken } from '../../lib/tokenManager';

const API_BASE_URL = 'https://jeewanjyoti-backend.smart.org.np';

const initialPosts = [
  {
    name: 'Sarah Johnson',
    time: '2 hours ago',
    calories: 812,
    steps: 17640,
    distance: 12.6,
    likes: 214,
    comments: 34,
    challenge: '10K Steps Challenge',
    summary: 'Completed a sunrise walk and drank 2.5L of water today.',
  },
  {
    name: 'Amir Khan',
    time: '5 hours ago',
    calories: 690,
    steps: 15420,
    distance: 10.1,
    likes: 128,
    comments: 21,
    challenge: 'Marathon Month',
    summary: 'Finished a 45-minute yoga session and logged a healthy meal plan.',
  },
];

function LeaderAvatar({ name, imageUrl }) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || '?').trim().charAt(0).toUpperCase();

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="h-8 w-8 rounded-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold text-white">
      {initial}
    </div>
  );
}

function Sidebar({ leaders, loading = false }) {
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl bg-white p-5 shadow">
          <h2 className="mb-4 text-lg font-bold">Weekly Leaderboard</h2>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 text-lg font-bold">Weekly Leaderboard</h2>
        {leaders && leaders.length > 0 ? (
          leaders.map((user, index) => (
            <div key={user.user_id || index} className="flex items-center justify-between border-b py-3 text-sm">
              <div className="flex items-center gap-2 font-medium text-gray-700">
                <LeaderAvatar name={user.name} imageUrl={getFullImageUrl(user.profile_image)} />
                <div>
                  <div className="flex items-center gap-1">
                    <span>{user.badge}</span>
                    <span>{user.name}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">{user.steps.toLocaleString()} steps</div>
                <div className="text-xs text-gray-500">{user.distance.toFixed(1)} km</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">No leaders yet</p>
        )}
      </div>
    </div>
  );
}

function Feed({ posts }) {
  return (
    <div className="space-y-6">
      {posts.map((post, i) => (
        <div key={i} className="rounded-xl bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <img src={post.photo || 'https://i.pravatar.cc/100'} className="h-12 w-12 rounded-full object-cover" alt="profile" />
            <div>
              <h2 className="font-bold">{post.name}</h2>
              <p className="text-sm text-gray-500">{post.time}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
              {post.challenge}
            </div>
            <p className="text-sm leading-6 text-gray-600">{post.summary}</p>
            <div className="mt-5 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-gray-500">Calories</p>
                <h2 className="text-2xl font-bold">{post.calories}</h2>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-gray-500">Distance</p>
                <h2 className="text-2xl font-bold">{post.distance} km</h2>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-gray-500">Steps</p>
                <h2 className="text-2xl font-bold">{post.steps}</h2>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between border-t pt-4 text-gray-500">
            <button>❤️ {post.likes}</button>
            <button>💬 {post.comments}</button>
            <button>↗ Share</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const CHALLENGE_STYLES = ['bg-green-50', 'bg-red-50', 'bg-blue-50', 'bg-yellow-50', 'bg-purple-50'];

function RightSidebar({ challenges = [], onAddClick }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-white p-5 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Trending Challenges</h2>
          <button
            onClick={onAddClick}
            aria-label="Add to leaderboard"
            title="Add to leaderboard"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-lg font-semibold text-white shadow"
          >
            +
          </button>
        </div>
        <div className="space-y-3">
          {challenges.length > 0 ? (
            challenges.map((challenge, index) => (
              <div key={challenge} className={`rounded-lg p-3 ${CHALLENGE_STYLES[index % CHALLENGE_STYLES.length]}`}>
                🏆 {challenge}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No challenges yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardTab() {
  const [leaders, setLeaders] = useState([]);
  const [leadersLoading, setLeadersLoading] = useState(true);
  const [posts, setPosts] = useState(initialPosts);
  const [formData, setFormData] = useState({ name: '', photo: '', miles: '', challenge: '' });
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLeadersLoading(true);
        const accessToken = getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/leaderboard/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard: ${response.status}`);
        }

        const data = await response.json();
        if (data.leaderboard && Array.isArray(data.leaderboard)) {
          setLeaders(data.leaderboard);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLeadersLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFormData((prev) => ({ ...prev, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.photo || !formData.miles || !formData.challenge.trim()) return;

    const stepsValue = Math.round(Number(formData.miles) * 1400);
    const newEntry = {
      user_id: `local-${Date.now()}`,
      name: formData.name.trim(),
      steps: stepsValue,
      distance: Number(formData.miles) * 1.60934,
      badge: '🏅',
      profile_image: formData.photo,
    };

    setLeaders((prev) => [newEntry, ...prev].slice(0, 6));
    setPosts((prev) => [
      {
        name: formData.name.trim(),
        time: 'Just now',
        calories: 740,
        steps: Math.round(Number(formData.miles) * 1400),
        distance: Number(formData.miles),
        likes: 42,
        comments: 8,
        challenge: formData.challenge.trim(),
        summary: `Shared a fresh milestone of ${formData.miles} miles and a new healthy challenge.`,
        photo: formData.photo,
      },
      ...prev,
    ]);

    setFormData({ name: '', photo: '', miles: '', challenge: '' });
    setShowComposer(false);
  };

  return (
    <div className="mt-4 mx-auto max-w-7xl px-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="hidden w-72 lg:block">
          <Sidebar leaders={leaders} loading={leadersLoading} />
        </div>

        <div className="flex-1 space-y-6">
          <Feed posts={posts} />
        </div>

        <div className="hidden w-80 xl:block">
          <RightSidebar
            challenges={Array.from(new Set(posts.map((post) => post.challenge).filter(Boolean)))}
            onAddClick={() => setShowComposer(true)}
          />
        </div>
      </div>

      {showComposer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowComposer(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
          >
            <h2 className="mb-4 text-lg font-bold">Share your progress</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-lg border border-gray-200 px-3 py-2"
                placeholder="Your name"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="rounded-lg border border-gray-200 px-3 py-2"
              />
              <input
                type="number"
                step="0.1"
                value={formData.miles}
                onChange={(e) => setFormData((prev) => ({ ...prev, miles: e.target.value }))}
                className="rounded-lg border border-gray-200 px-3 py-2"
                placeholder="Miles"
              />
              <input
                value={formData.challenge}
                onChange={(e) => setFormData((prev) => ({ ...prev, challenge: e.target.value }))}
                className="rounded-lg border border-gray-200 px-3 py-2"
                placeholder="Challenge"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white">
                Submit
              </button>
              <button type="button" onClick={() => setShowComposer(false)} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
