import { useState, useEffect } from 'react';
import jjlogo from '../assets/jjlogo.png';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, getAccessToken } from '../lib/tokenManager';

const API_BASE_URL = 'https://jeewanjyoti-backend.smart.org.np';

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
  // Helper to construct full image URL
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
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  return (
    <div className="space-y-6">
      {posts.map((post, i) => (
        <div key={i} className="rounded-xl bg-white p-6 shadow">
          <div className="flex items-center gap-3">
            <img 
              src={post.photo || getFullImageUrl(post.profile_image) || 'https://i.pravatar.cc/100'} 
              className="h-12 w-12 rounded-full object-cover" 
              alt="profile"
              onError={(e) => {
                e.target.src = 'https://i.pravatar.cc/100';
              }}
            />
            <div>
              <h2 className="font-bold">{post.name}</h2>
              <p className="text-sm text-gray-500">{post.time}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-3 inline-flex rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
              {post.challenge}
            </div>
            {post.photo && (
              <img src={post.photo} alt={post.name} className="mb-4 h-56 w-full rounded-xl object-cover" />
            )}
            <p className="text-sm leading-6 text-gray-600">{post.summary}</p>
            <div className="mt-5 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-gray-500">Calories</p>
                <h2 className="text-2xl font-bold">{Math.round(post.calories)}</h2>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <p className="text-gray-500">Distance</p>
                <h2 className="text-2xl font-bold">{post.distance} km</h2>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-gray-500">Steps</p>
                <h2 className="text-2xl font-bold">{post.steps.toLocaleString()}</h2>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between border-t pt-4 text-gray-500">
            <button>❤️ {post.likes || 0}</button>
            <button>💬 {post.comments || 0}</button>
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
  const [formData, setFormData] = useState({ name: '', photo: '', miles: '', challenge: '' });
  const [showComposer, setShowComposer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Fetch leaderboard data from API
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching leaderboard from:', `${API_BASE_URL}/api/leaderboard/`);

        const accessToken = getAccessToken();
        const response = await fetch(`${API_BASE_URL}/api/leaderboard/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Full API Response:', data);

        if (!response.ok) {
          throw new Error(`Failed to fetch leaderboard: ${response.status}`);
        }

        if (data.leaderboard && Array.isArray(data.leaderboard)) {
          console.log('Setting leaders:', data.leaderboard);
          setLeaders(data.leaderboard);
          
          // Also create posts from leaderboard data
          const leaderboardPosts = data.leaderboard.map(leader => ({
            name: leader.name,
            time: 'Top performer',
            calories: leader.calories,
            steps: leader.steps,
            distance: leader.distance,
            likes: Math.floor(Math.random() * 300),
            comments: Math.floor(Math.random() * 50),
            challenge: 'Weekly Challenge',
            summary: `${leader.name} achieved ${leader.steps.toLocaleString()} steps this week! 🎉`,
            profile_image: leader.profile_image,
            badge: leader.badge,
          }));
          setPosts(leaderboardPosts);
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
    };

    fetchLeaderboard();
  }, []);

  // Get user data from localStorage (from login)
  useEffect(() => {
    const userData = getUserData();
    if (userData && !formData.name) {
      // Get user's full name
      const userName = userData.full_name || 
                       (userData.first_name && userData.last_name ? `${userData.first_name} ${userData.last_name}` : '') ||
                       userData.name || 
                       '';
      
      // Get user's profile photo
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
      
      // Pre-populate form with user data
      setFormData((prev) => ({
        ...prev,
        name: userName || prev.name,
        photo: userPhoto || prev.photo,
      }));
    }
  }, [user]);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.photo || !formData.miles || !formData.challenge.trim()) {
      return;
    }

    const milesValue = Number(formData.miles);
    const stepsValue = Math.round(milesValue * 1400);
    const distanceKm = milesValue * 1.60934; // Convert miles to km

    const newEntry = {
      rank: leaders.length + 1,
      user_id: Math.random(), // Temporary ID
      name: formData.name.trim(),
      profile_image: formData.photo,
      steps: stepsValue,
      distance: distanceKm,
      calories: stepsValue * 0.05, // Rough calculation
      badge: '🏅',
      activity_score: stepsValue,
    };

    setLeaders((prev) => [newEntry, ...prev].slice(0, 10));
    setPosts((prev) => [
      {
        name: formData.name.trim(),
        time: 'Just now',
        calories: stepsValue * 0.05,
        steps: stepsValue,
        distance: distanceKm,
        likes: 42,
        comments: 8,
        challenge: formData.challenge.trim(),
        summary: `Shared a fresh milestone of ${milesValue} miles and a new healthy challenge.`,
        photo: formData.photo,
      },
      ...prev,
    ]);
    setFormData({ name: '', photo: '', miles: '', challenge: '' });
    setShowComposer(false);
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

      <div className="mx-auto mt-5 flex max-w-7xl gap-6 px-4">
        <div className="hidden w-72 lg:block">
          <Sidebar leaders={leaders} loading={loading} />
          {leaders.length === 0 && !loading && (
            <div className="rounded-xl bg-yellow-50 p-4 text-yellow-700 text-sm">
              <p className="font-semibold">No leaders loaded</p>
              <p className="text-xs mt-1">Leaders count: {leaders.length}</p>
            </div>
          )}
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

            {/* User Info Display */}
            <div className="mb-4 flex items-center gap-4 border-b pb-4">
              {formData.photo && (
                <img
                  src={formData.photo}
                  alt={formData.name}
                  className="h-16 w-16 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://i.pravatar.cc/150';
                  }}
                />
              )}
              <div>
                <p className="text-sm text-gray-600">Posting as</p>
                <h3 className="text-lg font-semibold text-gray-900">{formData.name || 'User'}</h3>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Distance (miles)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.miles}
                  onChange={(e) => setFormData((prev) => ({ ...prev, miles: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="Miles"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Challenge</label>
                <input
                  value={formData.challenge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, challenge: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2"
                  placeholder="Challenge name"
                  required
                />
              </div>
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
