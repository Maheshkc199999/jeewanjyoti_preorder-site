import React, { useState, useEffect, useCallback } from 'react';
import { getLeaderboard, getLeaderboardPosts, createLeaderboardPost } from '../../lib/api';

const API_BASE_URL = 'https://jeewanjyoti-backend.smart.org.np';

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

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

function Feed({ posts, loading = false }) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow">
        No posts yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const metrics = post.metrics || {};
        return (
          <div key={post.id} className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center gap-3">
              <LeaderAvatar name={post.user_name} imageUrl={getFullImageUrl(post.profile_image)} />
              <div>
                <h2 className="font-bold">{post.user_name}</h2>
                <p className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</p>
              </div>
            </div>

            <div className="mt-5">
              {post.image && (
                <img src={getFullImageUrl(post.image)} alt={post.user_name} className="mb-4 h-56 w-full rounded-xl object-cover" />
              )}
              <p className="text-sm leading-6 text-gray-600">{post.summary || 'Shared an update.'}</p>
              <div className="mt-5 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-gray-500">Calories</p>
                  <h2 className="text-2xl font-bold">{Math.round(metrics.calories || 0)}</h2>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-gray-500">Distance</p>
                  <h2 className="text-2xl font-bold">{(metrics.distance || 0).toFixed(1)} km</h2>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-gray-500">Steps</p>
                  <h2 className="text-2xl font-bold">{(metrics.steps || 0).toLocaleString()}</h2>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between border-t pt-4 text-gray-500">
              <button>❤️ {post.likes || 0}</button>
              <button>💬 {post.comments || 0}</button>
              <button>↗ Share</button>
            </div>
          </div>
        );
      })}
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
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [challengeNames, setChallengeNames] = useState([]);
  const [formData, setFormData] = useState({ name: '', photo: '', photoFile: null, miles: '', challenge: '' });
  const [showComposer, setShowComposer] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLeadersLoading(true);
      const data = await getLeaderboard();
      if (data.leaderboard && Array.isArray(data.leaderboard)) {
        setLeaders(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLeadersLoading(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    try {
      setPostsLoading(true);
      const data = await getLeaderboardPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching leaderboard posts:', error);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    fetchPosts();
  }, [fetchLeaderboard, fetchPosts]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFormData((prev) => ({ ...prev, photo: reader.result, photoFile: file }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.miles || !formData.challenge.trim()) return;

    const milesValue = Number(formData.miles);
    const stepsValue = Math.round(milesValue * 1400);
    const distanceKm = milesValue * 1.60934;
    const caloriesValue = stepsValue * 0.05;

    const payload = new FormData();
    payload.append('summary', `${formData.challenge.trim()}: Completed ${milesValue.toFixed(1)} miles!`);
    payload.append('steps', String(stepsValue));
    payload.append('distance', String(distanceKm));
    payload.append('calories', String(caloriesValue));
    payload.append('is_completed', 'true');
    if (formData.photoFile) {
      payload.append('image', formData.photoFile);
    }

    try {
      setPosting(true);
      setPostError(null);
      await createLeaderboardPost(payload);

      setChallengeNames((prev) => [formData.challenge.trim(), ...prev.filter((c) => c !== formData.challenge.trim())].slice(0, 5));
      setFormData({ name: '', photo: '', photoFile: null, miles: '', challenge: '' });
      setShowComposer(false);
      fetchPosts();
      fetchLeaderboard();
    } catch (error) {
      console.error('Failed to create post:', error);
      setPostError(error.message || 'Failed to share progress. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-4 mx-auto max-w-7xl px-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="hidden w-72 lg:block">
          <Sidebar leaders={leaders} loading={leadersLoading} />
        </div>

        <div className="flex-1 space-y-6">
          <Feed posts={posts} loading={postsLoading} />
        </div>

        <div className="hidden w-80 xl:block">
          <RightSidebar
            challenges={challengeNames}
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
            {postError && (
              <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{postError}</p>
            )}
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
              <button type="submit" disabled={posting} className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
                {posting ? 'Posting…' : 'Submit'}
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
