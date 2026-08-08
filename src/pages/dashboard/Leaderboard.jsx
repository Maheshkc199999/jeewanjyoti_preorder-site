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

function LeaderAvatar({ name, imageUrl, size = 'h-8 w-8' }) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || '?').trim().charAt(0).toUpperCase();

  if (imageUrl && !imgError) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`${size} rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={`${size} rounded-full bg-blue-500 flex items-center justify-center text-sm font-semibold text-white`}>
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

const METRIC_CONFIG = [
  { key: 'calories', label: 'Calories', format: (v) => Math.round(v || 0).toLocaleString() },
  { key: 'distance', label: 'Distance', format: (v) => `${(v || 0).toFixed(1)} km` },
  { key: 'steps', label: 'Steps', format: (v) => (v || 0).toLocaleString() },
];

function PostCard({ post, index }) {
  const metrics = post.metrics || {};
  return (
    <article
      style={{ animationDelay: `${index * 60}ms` }}
      className="animate-[fadeIn_0.4s_ease-out_both] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <header className="flex items-center gap-3">
        <LeaderAvatar name={post.user_name} imageUrl={getFullImageUrl(post.profile_image)} size="h-10 w-10" />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{post.user_name}</h3>
          <p className="text-xs text-slate-400">{formatTimeAgo(post.created_at)}</p>
        </div>
      </header>

      {post.image && (
        <img
          src={getFullImageUrl(post.image)}
          alt={post.user_name}
          className="mt-4 h-48 w-full rounded-xl border border-slate-100 object-cover"
        />
      )}

      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        {post.summary || 'Shared an update.'}
      </p>

      <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/60">
        {METRIC_CONFIG.map(({ key, label, format }) => (
          <div key={key} className="px-3 py-3 text-center">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-base font-bold text-blue-700">{format(metrics[key])}</p>
          </div>
        ))}
      </div>

      <footer className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
        <button className="flex items-center gap-1.5 transition-colors hover:text-blue-600">
          <span>❤️</span> {post.likes || 0}
        </button>
        <button className="flex items-center gap-1.5 transition-colors hover:text-blue-600">
          <span>💬</span> {post.comments || 0}
        </button>
        <button className="flex items-center gap-1.5 transition-colors hover:text-blue-600">
          <span>↗</span> Share
        </button>
      </footer>
    </article>
  );
}

function Feed({ posts, loading = false }) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
        No posts yet
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}

function RightSidebar({ challenges = [], onAddClick }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Trending Challenges
        </h2>
        <button
          onClick={onAddClick}
          aria-label="Add to leaderboard"
          title="Add to leaderboard"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
        >
          +
        </button>
      </div>

      <div className="space-y-2 px-5 py-4">
        {challenges.length > 0 ? (
          challenges.map((challenge) => (
            <div
              key={challenge}
              className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2.5 text-sm text-slate-700"
            >
              <span>🏆</span>
              <span className="truncate">{challenge}</span>
            </div>
          ))
        ) : (
          <p className="py-4 text-center text-sm text-slate-400">No challenges yet</p>
        )}
      </div>
    </section>
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
    <div className="mx-auto mt-4 max-w-6xl px-4">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr_260px]">
        <div className="hidden lg:block">
          <Sidebar leaders={leaders} loading={leadersLoading} />
        </div>

        <div>
          <Feed posts={posts} loading={postsLoading} />
        </div>

        <div className="hidden lg:block">
          <RightSidebar challenges={challengeNames} onAddClick={() => setShowComposer(true)} />
        </div>
      </div>

      {showComposer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => setShowComposer(false)}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Share your progress</h2>
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                aria-label="Close"
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {postError && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{postError}</p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="col-span-2 sm:col-span-1">
                <span className="mb-1 block text-xs font-medium text-slate-500">Your name</span>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="e.g. Aarav Shrestha"
                />
              </label>
              <label className="col-span-2 sm:col-span-1">
                <span className="mb-1 block text-xs font-medium text-slate-500">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-blue-600 focus:border-blue-400 focus:outline-none"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-slate-500">Miles</span>
                <input
                  type="number"
                  step="0.1"
                  value={formData.miles}
                  onChange={(e) => setFormData((prev) => ({ ...prev, miles: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="3.5"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-slate-500">Challenge</span>
                <input
                  value={formData.challenge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, challenge: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Morning Walk"
                />
              </label>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={posting}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {posting ? 'Posting…' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}