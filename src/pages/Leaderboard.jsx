import { useState, useEffect, useCallback } from 'react';
import AppHeader from '../components/AppHeader';
import { getPublicLeaderboard, getPublicDailyLeaderboard, getPublicLeaderboardChallenges } from '../lib/api';

const API_BASE_URL = 'https://jeewanjyoti-backend.smart.org.np';

const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
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

function Feed({ challenges, loading = false }) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  const sortedChallenges = [...(challenges || [])].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );

  if (sortedChallenges.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400 shadow-sm">
        No challenges yet
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {sortedChallenges.map((challenge, index) => (
        <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
      ))}
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

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [leadersLoading, setLeadersLoading] = useState(true);
  const [dailyLeaders, setDailyLeaders] = useState([]);
  const [dailyLeadersLoading, setDailyLeadersLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);
  const [challengesLoading, setChallengesLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLeadersLoading(true);
      const data = await getPublicLeaderboard();
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
      const data = await getPublicDailyLeaderboard();
      if (data.leaderboard && Array.isArray(data.leaderboard)) {
        setDailyLeaders(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching daily leaderboard:', error);
    } finally {
      setDailyLeadersLoading(false);
    }
  }, []);

  const fetchChallenges = useCallback(async () => {
    try {
      setChallengesLoading(true);
      const data = await getPublicLeaderboardChallenges();
      setChallenges(data);
    } catch (error) {
      console.error('Error fetching leaderboard challenges:', error);
    } finally {
      setChallengesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    fetchDailyLeaderboard();
    fetchChallenges();
  }, [fetchLeaderboard, fetchDailyLeaderboard, fetchChallenges]);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <AppHeader />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_1fr_260px] lg:items-start">
          <div className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:space-y-5 lg:overflow-y-auto lg:pr-1">
            <Sidebar leaders={leaders} loading={leadersLoading} />
            <DailyLeaderboard leaders={dailyLeaders} loading={dailyLeadersLoading} />
          </div>

          <div>
            <Feed challenges={challenges} loading={challengesLoading} />
          </div>

          <div className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-1">
            <RightSidebar challenges={challenges.map((c) => c.name)} />
          </div>
        </div>
      </div>
    </div>
  );
}
