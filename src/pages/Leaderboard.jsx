import { useState, useEffect, useCallback } from 'react';
import jjlogo from '../assets/jjlogo.png';
import { useAuth } from '../contexts/AuthContext';
import { getUserData } from '../lib/tokenManager';
import { getLeaderboard, getLeaderboardPosts, createLeaderboardPost, updateLeaderboardPost, deleteLeaderboardPost } from '../lib/api';

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

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <a href="/" className="flex items-center gap-2 md:gap-3">
          <img src={jjlogo} alt="JJ Logo" className="h-8 w-8 md:h-10 md:w-10 object-contain" />
          <h1 className="text-xl font-bold whitespace-nowrap text-blue-500 md:text-2xl" style={{ fontFamily: 'DM Sans, Inter, sans-serif' }}>
            DIGITAL CARE
          </h1>
        </a>
        <input className="w-96 rounded-full bg-gray-100 px-5 py-2" placeholder="Search people..." />
        <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150" alt="avatar" />
      </div>
    </nav>
  );
}

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

function PostMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative ml-auto">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Post options"
        className="rounded-full px-2 py-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
      >
        ⋮
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-1 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => { setOpen(false); onEdit(); }}
              className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
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

function Feed({ posts, loading = false, currentUserId, onEdit, onDelete }) {
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
        const canManage = currentUserId != null && post.user != null && Number(post.user) === Number(currentUserId);
        return (
          <div key={post.id} className="rounded-xl bg-white p-6 shadow">
            <div className="flex items-center gap-3">
              <LeaderAvatar name={post.user_name} imageUrl={getFullImageUrl(post.profile_image)} />
              <div>
                <h2 className="font-bold">{post.user_name}</h2>
                <p className="text-sm text-gray-500">{formatTimeAgo(post.created_at)}</p>
              </div>
              {canManage && <PostMenu onEdit={() => onEdit(post)} onDelete={() => onDelete(post.id)} />}
            </div>

            <div className="mt-5">
              {post.image && (
                <ExpandableImage
                  src={getFullImageUrl(post.image)}
                  alt={post.user_name}
                  className="mb-4 h-auto max-h-[36rem] w-full rounded-xl object-contain"
                />
              )}
              <p className="text-sm leading-6 text-gray-600">{post.summary || 'Shared an update.'}</p>
              <div className="mt-5 grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-gray-500">Calories</p>
                  <h2 className="text-2xl font-bold">{Math.round(post.calories || 0)}</h2>
                </div>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="text-gray-500">Distance</p>
                  <h2 className="text-2xl font-bold">{(post.distance || 0).toFixed(1)} km</h2>
                </div>
                <div className="rounded-lg bg-green-50 p-4">
                  <p className="text-gray-500">Steps</p>
                  <h2 className="text-2xl font-bold">{(post.steps || 0).toLocaleString()}</h2>
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
        <div className="max-h-[45vh] space-y-3 overflow-y-auto pr-1">
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

      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="text-lg font-bold">Your Progress</h2>
        <div className="mt-5 space-y-4">
          <div>
            Calories
            <div className="mt-2 h-2 rounded bg-gray-200">
              <div className="h-2 w-4/5 rounded bg-red-500"></div>
            </div>
          </div>
          <div>
            Steps
            <div className="mt-2 h-2 rounded bg-gray-200">
              <div className="h-2 w-3/4 rounded bg-green-500"></div>
            </div>
          </div>
          <div>
            Distance
            <div className="mt-2 h-2 rounded bg-gray-200">
              <div className="h-2 w-2/3 rounded bg-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [challengeNames] = useState([]);
  const [formData, setFormData] = useState({ summary: '', steps: '', distance: '', calories: '', is_completed: false, photoFile: null });
  const [profile, setProfile] = useState({ name: '', photo: '' });
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState(null);
  const [currentUserId] = useState(() => getUserData()?.id ?? null);
  const [editingPost, setEditingPost] = useState(null);
  const [editFormData, setEditFormData] = useState({ summary: '', steps: '', distance: '', calories: '', is_completed: false, photoFile: null });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);
  const { user } = useAuth();

  // Fetch leaderboard rankings from API
  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getLeaderboard();

      if (data.leaderboard && Array.isArray(data.leaderboard)) {
        setLeaders(data.leaderboard);
      } else {
        console.warn('No leaderboard data in response');
        setError('No leaderboard data available');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch posts feed from API
  const fetchPosts = useCallback(async () => {
    try {
      setPostsLoading(true);
      const data = await getLeaderboardPosts();
      setPosts(data);
    } catch (err) {
      console.error('Error fetching leaderboard posts:', err);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    fetchPosts();
  }, [fetchLeaderboard, fetchPosts]);

  // Get user data from localStorage (from login) to show a "Posting as" preview
  useEffect(() => {
    const userData = getUserData();
    if (userData && !profile.name) {
      const userName = userData.full_name ||
                       (userData.first_name && userData.last_name ? `${userData.first_name} ${userData.last_name}` : '') ||
                       userData.name ||
                       '';

      let userPhoto = '';
      if (userData.profile_image) {
        userPhoto = userData.profile_image.startsWith('http')
          ? userData.profile_image
          : `${API_BASE_URL}${userData.profile_image.startsWith('/') ? '' : '/'}${userData.profile_image}`;
      } else if (userData.avatar) {
        userPhoto = userData.avatar.startsWith('http')
          ? userData.avatar
          : `${API_BASE_URL}${userData.avatar.startsWith('/') ? '' : '/'}${userData.avatar}`;
      }

      setProfile({ name: userName, photo: userPhoto });
    }
  }, [user]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, photoFile: file }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.summary.trim() && !formData.photoFile) {
      return;
    }

    const payload = new FormData();
    payload.append('summary', formData.summary);
    payload.append('steps', String(formData.steps || 0));
    payload.append('distance', String(formData.distance || 0));
    payload.append('calories', String(formData.calories || 0));
    payload.append('is_completed', String(formData.is_completed));
    if (formData.photoFile) {
      payload.append('image', formData.photoFile);
    }

    try {
      setPosting(true);
      setPostError(null);
      await createLeaderboardPost(payload);

      setFormData({ summary: '', steps: '', distance: '', calories: '', is_completed: false, photoFile: null });
      setShowComposer(false);
      fetchPosts();
      fetchLeaderboard();
    } catch (err) {
      console.error('Failed to create post:', err);
      setPostError(err.message || 'Failed to share progress. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const openEditPost = (post) => {
    setEditError(null);
    setEditFormData({
      summary: post.summary || '',
      steps: post.steps ?? '',
      distance: post.distance ?? '',
      calories: post.calories ?? '',
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
    payload.append('steps', String(editFormData.steps || 0));
    payload.append('distance', String(editFormData.distance || 0));
    payload.append('calories', String(editFormData.calories || 0));
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
    } catch (err) {
      console.error('Failed to update post:', err);
      setEditError(err.message || 'Failed to update post. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;

    try {
      await deleteLeaderboardPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err.message || 'Failed to delete post. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
          <p className="font-bold">Error Loading Leaderboard</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">Check browser console for more details</p>
        </div>
      )}

      <div className="mx-auto mt-5 flex max-w-7xl items-start gap-6 px-4">
        <div className="hidden w-72 shrink-0 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
          <Sidebar leaders={leaders} loading={loading} />
          {leaders.length === 0 && !loading && (
            <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700 text-sm">
              <p className="font-semibold">No leaders loaded</p>
              <p className="text-xs mt-1">Leaders count: {leaders.length}</p>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <Feed
            posts={posts}
            loading={postsLoading}
            currentUserId={currentUserId}
            onEdit={openEditPost}
            onDelete={handleDeletePost}
          />
        </div>

        <div className="hidden w-80 shrink-0 xl:sticky xl:top-20 xl:block xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto xl:pr-1">
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

            {/* User Info Display */}
            <div className="mb-4 flex items-center gap-4 border-b pb-4">
              {profile.photo && (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="h-16 w-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://i.pravatar.cc/150';
                  }}
                />
              )}
              <div>
                <p className="text-sm text-gray-600">Posting as</p>
                <h3 className="text-lg font-semibold text-gray-900">{profile.name || 'User'}</h3>
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  rows={3}
                  placeholder="Had a great workout today! 💪🔥"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
                  <input
                    type="number"
                    value={formData.steps}
                    onChange={(e) => setFormData((prev) => ({ ...prev, steps: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.distance}
                    onChange={(e) => setFormData((prev) => ({ ...prev, distance: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                  <input
                    type="number"
                    value={formData.calories}
                    onChange={(e) => setFormData((prev) => ({ ...prev, calories: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_completed}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_completed: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                />
                <span className="text-sm text-gray-600">Mark as completed</span>
              </label>
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

      {editingPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditingPost(null)}
        >
          <form
            onSubmit={handleEditSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
          >
            <h2 className="mb-4 text-lg font-bold">Edit post</h2>
            {editError && (
              <p className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{editError}</p>
            )}

            <div className="grid gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                <textarea
                  value={editFormData.summary}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, summary: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  rows={3}
                  placeholder="Share an update..."
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Steps</label>
                  <input
                    type="number"
                    value={editFormData.steps}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, steps: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editFormData.distance}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, distance: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories</label>
                  <input
                    type="number"
                    value={editFormData.calories}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, calories: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditPhotoChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-500"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editFormData.is_completed}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, is_completed: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                />
                <span className="text-sm text-gray-600">Mark as completed</span>
              </label>
            </div>

            <div className="mt-4 flex gap-3">
              <button type="submit" disabled={editSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
                {editSubmitting ? 'Saving…' : 'Save changes'}
              </button>
              <button type="button" onClick={() => setEditingPost(null)} className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
