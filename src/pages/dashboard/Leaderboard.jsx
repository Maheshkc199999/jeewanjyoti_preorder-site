import React, { useState, useEffect, useCallback } from 'react';
import { getLeaderboard, getDailyLeaderboard, getLeaderboardPosts, createLeaderboardPost, updateLeaderboardPost, deleteLeaderboardPost, getLeaderboardChallenges, createLeaderboardChallenge } from '../../lib/api';
import { getUserData } from '../../lib/tokenManager';

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

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getChallengeStatus = (startDate, endDate) => {
  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  if (start && now < start) return { label: 'Upcoming', className: 'bg-blue-100 text-blue-700' };
  if (end && now > end) return { label: 'Ended', className: 'bg-slate-200 text-slate-600' };
  return { label: 'Active', className: 'bg-emerald-100 text-emerald-700' };
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
        <div className="max-h-[40vh] overflow-y-auto pr-1">
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
    </div>
  );
}

function DailyLeaderboard({ leaders, loading = false }) {
  if (loading) {
    return (
      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 text-lg font-bold">Daily Leaderboard</h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-5 shadow">
      <h2 className="mb-4 text-lg font-bold">Daily Leaderboard</h2>
      <div className="max-h-[40vh] overflow-y-auto pr-1">
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

const EMPTY_CHALLENGE_FORM = {
  name: '',
  description: '',
  goal: '',
  steps: '',
  distance: '',
  calories: '',
  start_date: '',
  end_date: '',
  imageFile: null,
};

const METRIC_CONFIG = [
  { key: 'calories', label: 'Calories', format: (v) => Math.round(v || 0).toLocaleString() },
  { key: 'distance', label: 'Distance', format: (v) => `${(v || 0).toFixed(1)} km` },
  { key: 'steps', label: 'Steps', format: (v) => (v || 0).toLocaleString() },
];

function PostMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative ml-auto">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Post options"
        className="rounded-full px-2 py-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
      >
        ⋮
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-32 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => { setOpen(false); onEdit(); }}
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); onDelete(); }}
              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ExpandableImage({ src, alt, className }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={() => setExpanded(true)}
        className={`${className} cursor-zoom-in`}
      />
      {expanded && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4"
          onClick={() => setExpanded(false)}
        >
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Close"
            className="absolute right-4 top-4 text-2xl text-white/80 transition-colors hover:text-white"
          >
            ✕
          </button>
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </>
  );
}

function PostCard({ post, index, currentUserId, onEdit, onDelete }) {
  const canManage = currentUserId != null && post.user != null && Number(post.user) === Number(currentUserId);

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
        {canManage && <PostMenu onEdit={() => onEdit(post)} onDelete={() => onDelete(post.id)} />}
      </header>

      {post.image && (
        <ExpandableImage
          src={getFullImageUrl(post.image)}
          alt={post.user_name}
          className="mt-4 h-auto max-h-[36rem] w-full rounded-xl border border-slate-100 object-contain"
        />
      )}

      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        {post.summary || 'Shared an update.'}
      </p>

      {(post.calories || post.distance || post.steps) ? (
        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/60">
          {METRIC_CONFIG.map(({ key, label, format }) => (
            <div key={key} className="px-3 py-3 text-center">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
              <p className="mt-1 text-base font-bold text-blue-700">{format(post[key])}</p>
            </div>
          ))}
        </div>
      ) : null}

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

const CHALLENGE_METRIC_CONFIG = [
  { key: 'steps', label: 'Step Goal', format: (v) => (v ? Number(v).toLocaleString() : '—') },
  { key: 'distance', label: 'Distance Goal', format: (v) => (v ? `${Number(v).toFixed(1)} km` : '—') },
  { key: 'calories', label: 'Calorie Goal', format: (v) => (v ? Math.round(Number(v)).toLocaleString() : '—') },
];

function ChallengeCard({ challenge, index }) {
  const status = getChallengeStatus(challenge.start_date, challenge.end_date);

  return (
    <article
      style={{ animationDelay: `${index * 60}ms` }}
      className="animate-[fadeIn_0.4s_ease-out_both] rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 shadow-sm"
    >
      <header className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-400 text-lg text-white shadow-sm">
          🏆
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Challenge
            </span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${status.className}`}>
              {status.label}
            </span>
          </div>
          <h3 className="mt-1 truncate text-base font-bold text-slate-900">{challenge.name}</h3>
          {challenge.user_name && (
            <p className="text-xs text-slate-400">Created by {challenge.user_name}</p>
          )}
        </div>
      </header>

      {challenge.image && (
        <ExpandableImage
          src={getFullImageUrl(challenge.image)}
          alt={challenge.name}
          className="mt-4 h-auto max-h-[36rem] w-full rounded-xl border border-amber-100 object-contain"
        />
      )}

      {challenge.description && (
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{challenge.description}</p>
      )}

      <div className="mt-4 grid grid-cols-3 divide-x divide-amber-100 rounded-xl border border-amber-100 bg-amber-50/60">
        {CHALLENGE_METRIC_CONFIG.map(({ key, label, format }) => (
          <div key={key} className="px-3 py-3 text-center">
            <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700/70">{label}</p>
            <p className="mt-1 text-base font-bold text-amber-700">{format(challenge[key])}</p>
          </div>
        ))}
      </div>

      <footer className="mt-4 flex items-center justify-center gap-2 border-t border-amber-100 pt-3 text-sm font-medium text-slate-500">
        <span>📅</span>
        <span>{formatDate(challenge.start_date)} – {formatDate(challenge.end_date)}</span>
      </footer>
    </article>
  );
}

function buildFeedItems(posts, challenges) {
  const postItems = (posts || []).map((post) => ({
    type: 'post',
    key: `post-${post.id}`,
    sortKey: post.created_at || 0,
    data: post,
  }));
  const challengeItems = (challenges || []).map((challenge) => ({
    type: 'challenge',
    key: `challenge-${challenge.id}`,
    sortKey: challenge.created_at || 0,
    data: challenge,
  }));

  return [...postItems, ...challengeItems].sort(
    (a, b) => new Date(b.sortKey) - new Date(a.sortKey)
  );
}

function Feed({ posts, challenges, loading = false, currentUserId, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  const feedItems = buildFeedItems(posts, challenges);

  if (feedItems.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
        No posts yet
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {feedItems.map((item, index) =>
        item.type === 'challenge' ? (
          <ChallengeCard key={item.key} challenge={item.data} index={index} />
        ) : (
          <PostCard
            key={item.key}
            post={item.data}
            index={index}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      )}
    </div>
  );
}

function RightSidebar({ challenges = [] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Trending Challenges
        </h2>
      </div>

      <div className="max-h-[60vh] space-y-2 overflow-y-auto px-5 py-4">
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
  const [dailyLeaders, setDailyLeaders] = useState([]);
  const [dailyLeadersLoading, setDailyLeadersLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [formData, setFormData] = useState({ summary: '', is_completed: false, photoFile: null });
  const [showComposer, setShowComposer] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [showChallengeComposer, setShowChallengeComposer] = useState(false);
  const [challengeFormData, setChallengeFormData] = useState(EMPTY_CHALLENGE_FORM);
  const [challengeSubmitting, setChallengeSubmitting] = useState(false);
  const [challengeError, setChallengeError] = useState(null);
  const [currentUserId] = useState(() => getUserData()?.id ?? null);
  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState({ summary: '', is_completed: false, photoFile: null });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);

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

  const fetchDailyLeaderboard = useCallback(async () => {
    try {
      setDailyLeadersLoading(true);
      const data = await getDailyLeaderboard();
      if (data.leaderboard && Array.isArray(data.leaderboard)) {
        setDailyLeaders(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching daily leaderboard:', error);
    } finally {
      setDailyLeadersLoading(false);
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

  const fetchChallenges = useCallback(async () => {
    try {
      const data = await getLeaderboardChallenges();
      setChallenges(data);
    } catch (error) {
      console.error('Error fetching leaderboard challenges:', error);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    fetchDailyLeaderboard();
    fetchPosts();
    fetchChallenges();
  }, [fetchLeaderboard, fetchDailyLeaderboard, fetchPosts, fetchChallenges]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, photoFile: file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.summary.trim() && !formData.photoFile) return;

    const payload = new FormData();
    payload.append('summary', formData.summary);
    payload.append('is_completed', String(formData.is_completed));
    if (formData.photoFile) {
      payload.append('image', formData.photoFile);
    }

    try {
      setPosting(true);
      setPostError(null);
      await createLeaderboardPost(payload);

      setFormData({ summary: '', is_completed: false, photoFile: null });
      setShowComposer(false);
      fetchPosts();
      fetchLeaderboard();
      fetchDailyLeaderboard();
    } catch (error) {
      console.error('Failed to create post:', error);
      setPostError(error.message || 'Failed to share progress. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const handleChallengeFieldChange = (field) => (event) => {
    setChallengeFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleChallengeImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setChallengeFormData((prev) => ({ ...prev, imageFile: file }));
  };

  const handleAddChallenge = async (event) => {
    event.preventDefault();
    const name = challengeFormData.name.trim();
    if (!name) return;

    const payload = new FormData();
    payload.append('name', name);
    payload.append('description', challengeFormData.description);
    payload.append('goal', challengeFormData.goal);
    payload.append('steps', challengeFormData.steps);
    payload.append('distance', challengeFormData.distance);
    payload.append('calories', challengeFormData.calories);
    payload.append('start_date', challengeFormData.start_date);
    payload.append('end_date', challengeFormData.end_date);
    if (challengeFormData.imageFile) {
      payload.append('image', challengeFormData.imageFile);
    }

    try {
      setChallengeSubmitting(true);
      setChallengeError(null);
      await createLeaderboardChallenge(payload);

      setChallengeFormData(EMPTY_CHALLENGE_FORM);
      setShowChallengeComposer(false);
      fetchChallenges();
    } catch (error) {
      console.error('Failed to create challenge:', error);
      setChallengeError(error.message || 'Failed to create challenge. Please try again.');
    } finally {
      setChallengeSubmitting(false);
    }
  };

  const openEditPost = (post) => {
    setEditError(null);
    setEditFormData({
      summary: post.summary || '',
      is_completed: !!post.is_completed,
      photoFile: null,
    });
    setEditingPost(post);
  };

  const handleEditPhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setEditFormData((prev) => ({ ...prev, photoFile: file }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingPost) return;

    const payload = new FormData();
    payload.append('summary', editFormData.summary);
    payload.append('is_completed', String(editFormData.is_completed));
    if (editFormData.photoFile) {
      payload.append('image', editFormData.photoFile);
    }

    try {
      setEditSubmitting(true);
      setEditError(null);
      await updateLeaderboardPost(editingPost.id, payload);
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Failed to update post:', error);
      setEditError(error.message || 'Failed to update post. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;

    try {
      await deleteLeaderboardPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert(error.message || 'Failed to delete post. Please try again.');
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr_260px] lg:items-start">
        <div className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:space-y-5 lg:overflow-y-auto lg:pr-1">
          <Sidebar leaders={leaders} loading={leadersLoading} />
          <DailyLeaderboard leaders={dailyLeaders} loading={dailyLeadersLoading} />
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowComposer(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
            >
              <span className="text-base leading-none">+</span> Add Post
            </button>
            <button
              type="button"
              onClick={() => setShowChallengeComposer(true)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <span className="text-base leading-none">+</span> Add Challenge
            </button>
          </div>
          <Feed
            posts={posts}
            challenges={challenges}
            loading={postsLoading}
            currentUserId={currentUserId}
            onEdit={openEditPost}
            onDelete={handleDeletePost}
          />
        </div>

        <div className="hidden lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
          <RightSidebar challenges={challenges.map((c) => c.name)} />
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

            <div className="grid gap-3">
              <label>
                <span className="mb-1 block text-xs font-medium text-slate-500">Summary</span>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  rows={3}
                  placeholder="Had a great workout today! 💪🔥"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-slate-500">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-blue-600 focus:border-blue-400 focus:outline-none"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_completed}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_completed: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                />
                <span className="text-sm text-slate-600">Mark as completed</span>
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

      {showChallengeComposer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => setShowChallengeComposer(false)}
        >
          <form
            onSubmit={handleAddChallenge}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Add a challenge</h2>
              <button
                type="button"
                onClick={() => setShowChallengeComposer(false)}
                aria-label="Close"
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {challengeError && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{challengeError}</p>
            )}

            <div className="grid gap-3">
              <label>
                <span className="mb-1 block text-xs font-medium text-slate-500">Challenge name</span>
                <input
                  value={challengeFormData.name}
                  onChange={handleChallengeFieldChange('name')}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="10K Steps Challenge"
                  autoFocus
                  required
                />
              </label>

              <label>
                <span className="mb-1 block text-xs font-medium text-slate-500">Description</span>
                <textarea
                  value={challengeFormData.description}
                  onChange={handleChallengeFieldChange('description')}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  rows={3}
                  placeholder="Walk 10,000 steps every day for one week!"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-500">Goal</span>
                  <input
                    type="number"
                    value={challengeFormData.goal}
                    onChange={handleChallengeFieldChange('goal')}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="10000"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-500">Steps</span>
                  <input
                    type="number"
                    value={challengeFormData.steps}
                    onChange={handleChallengeFieldChange('steps')}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="10000"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-500">Distance (km)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={challengeFormData.distance}
                    onChange={handleChallengeFieldChange('distance')}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="7.5"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-500">Calories</span>
                  <input
                    type="number"
                    value={challengeFormData.calories}
                    onChange={handleChallengeFieldChange('calories')}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="500"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-500">Start date</span>
                  <input
                    type="date"
                    value={challengeFormData.start_date}
                    onChange={handleChallengeFieldChange('start_date')}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-medium text-slate-500">End date</span>
                  <input
                    type="date"
                    value={challengeFormData.end_date}
                    onChange={handleChallengeFieldChange('end_date')}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              </div>

              <label>
                <span className="mb-1 block text-xs font-medium text-slate-500">Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChallengeImageChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-blue-600 focus:border-blue-400 focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={challengeSubmitting}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {challengeSubmitting ? 'Adding…' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowChallengeComposer(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {editingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
          onClick={() => setEditingPost(null)}
        >
          <form
            onSubmit={handleEditSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Edit post</h2>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                aria-label="Close"
                className="text-slate-400 transition-colors hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {editError && (
              <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{editError}</p>
            )}

            <div className="grid gap-3">
              <label>
                <span className="mb-1 block text-xs font-medium text-slate-500">Summary</span>
                <textarea
                  value={editFormData.summary}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  rows={3}
                  placeholder="Share an update..."
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-medium text-slate-500">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditPhotoChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-blue-600 focus:border-blue-400 focus:outline-none"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFormData.is_completed}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, is_completed: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400"
                />
                <span className="text-sm text-slate-600">Mark as completed</span>
              </label>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={editSubmitting}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
              >
                {editSubmitting ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
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