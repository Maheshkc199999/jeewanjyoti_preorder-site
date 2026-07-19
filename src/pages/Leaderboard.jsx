import { useState } from 'react';
import jjlogo from '../assets/jjlogo.png';

const initialLeaders = [
  { name: 'John', steps: 18300, miles: 13.8, badge: '🥇', photo: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Sarah', steps: 17500, miles: 12.4, badge: '🥈', photo: 'https://i.pravatar.cc/150?img=47' },
  { name: 'David', steps: 16800, miles: 11.7, badge: '🥉', photo: 'https://i.pravatar.cc/150?img=15' },
];

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

function Sidebar({ leaders }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 text-lg font-bold">Weekly Leaderboard</h2>
        {leaders.map((user, index) => (
          <div key={index} className="flex items-center justify-between border-b py-3 text-sm">
            <div className="flex items-center gap-2 font-medium text-gray-700">
              <img src={user.photo} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
              <div>
                <div className="flex items-center gap-1">
                  <span>{user.badge}</span>
                  <span>{user.name}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{user.steps.toLocaleString()} steps</div>
              <div className="text-xs text-gray-500">{user.miles.toFixed(1)} mi</div>
            </div>
          </div>
        ))}
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
            {post.photo && (
              <img src={post.photo} alt={post.name} className="mb-4 h-56 w-full rounded-xl object-cover" />
            )}
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

function RightSidebar() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-white p-5 shadow">
        <h2 className="mb-4 text-lg font-bold">Trending Challenges</h2>
        <div className="space-y-3">
          <div className="rounded-lg bg-green-50 p-3">🚶 10K Steps Challenge</div>
          <div className="rounded-lg bg-red-50 p-3">🔥 Burn 500 Calories</div>
          <div className="rounded-lg bg-blue-50 p-3">🏃 Marathon Month</div>
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
  const [leaders, setLeaders] = useState(initialLeaders);
  const [posts, setPosts] = useState(initialPosts);
  const [formData, setFormData] = useState({ name: '', photo: '', miles: '', challenge: '' });
  const [showComposer, setShowComposer] = useState(false);

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

    const newEntry = {
      name: formData.name.trim(),
      steps: Math.round(Number(formData.miles) * 1400),
      miles: Number(formData.miles),
      badge: '🏅',
      photo: formData.photo,
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
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="mx-auto mt-5 flex max-w-7xl gap-6 px-4">
        <div className="hidden w-72 lg:block">
          <Sidebar leaders={leaders} />
        </div>

        <div className="flex-1 space-y-6">
          {!showComposer ? (
            <button
              onClick={() => setShowComposer(true)}
              className="w-full rounded-xl bg-green-600 px-4 py-3 text-left font-semibold text-white shadow"
            >
              Add to leaderboard
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl bg-white p-5 shadow">
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
          )}

          <Feed posts={posts} />
        </div>

        <div className="hidden w-80 xl:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
