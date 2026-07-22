import React, { useState } from 'react';
import {
  Search, Loader, X, Stethoscope, User as UserIcon, Phone, Droplet, Calendar,
  Ruler, Weight, Award, Building2, GraduationCap, RefreshCw,
  Heart, Droplets, Activity, Moon, Zap, BatteryFull, BatteryLow, BatteryWarning,
} from 'lucide-react';

const ROLE_STYLES = {
  DOCTOR: { label: 'Doctor', bg: '#eff6ff', color: '#1d4ed8', icon: Stethoscope },
  USER: { label: 'Patient', bg: '#ecfdf5', color: '#047857', icon: UserIcon },
};

const STATUS_COLORS = { online: '#10b981', away: '#f59e0b', offline: '#9ca3af' };

function RoleBadge({ role }) {
  const s = ROLE_STYLES[role] || { label: role || 'Unknown', bg: '#f1f5f9', color: '#475569', icon: UserIcon };
  const Icon = s.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700,
      padding: '3px 10px', borderRadius: 99, background: s.bg, color: s.color
    }}>
      <Icon size={11} /> {s.label}
    </span>
  );
}

function StatusDot({ status }) {
  const c = STATUS_COLORS[status] || '#9ca3af';
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 0 2px ${c}33`, display: 'inline-block' }} />;
}

function getAge(birthdate) {
  if (!birthdate) return null;
  const d = new Date(birthdate);
  if (Number.isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function formatTimeShort(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function resolveImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('/')) return `https://jeewanjyoti-backend.smart.org.np${url}`;
  return url;
}

export default function AdminMembers({ users = [], loading = false, error = null, refreshUsers }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const filtered = users.filter(u => {
    const name = `${u.first_name || ''} ${u.last_name || ''}`.trim();
    const matchesSearch = !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const doctorCount = users.filter(u => u.role === 'DOCTOR').length;
  const patientCount = users.filter(u => u.role === 'USER').length;

  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'hidden', position: 'relative' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>All Users ({users.length})</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 3 }}>
            {[
              { id: 'all', label: `All (${users.length})` },
              { id: 'DOCTOR', label: `Doctors (${doctorCount})` },
              { id: 'USER', label: `Patients (${patientCount})` },
            ].map(t => (
              <button key={t.id} onClick={() => setRoleFilter(t.id)} style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 700,
                background: roleFilter === t.id ? '#3b82f6' : 'transparent',
                color: roleFilter === t.id ? '#fff' : '#64748b',
                transition: 'background 0.15s'
              }}>{t.label}</button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" style={{
              paddingLeft: 34, paddingRight: 14, height: 36, background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 10, fontSize: 13, outline: 'none', color: '#0f172a', width: 220
            }} />
          </div>
          {refreshUsers && (
            <button onClick={refreshUsers} title="Refresh" style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <RefreshCw size={14} color="#6b7280" />
            </button>
          )}
        </div>
      </div>

      {/* Detail Modal — role, gender, phone and other profile fields live here, opened by clicking a member's name */}
      {selectedUser && (
        <>
          <div onClick={() => setSelectedUser(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 1000, width: 380, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ padding: 20, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
              {resolveImageUrl(selectedUser.profile_image) ? (
                <img src={resolveImageUrl(selectedUser.profile_image)} alt="" style={{ width: 48, height: 48, borderRadius: 12, objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#3b82f6' }}>
                  {`${selectedUser.first_name?.[0] || ''}${selectedUser.last_name?.[0] || ''}`.toUpperCase() || 'U'}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{`${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() || 'Unknown'}</div>
                <RoleBadge role={selectedUser.role} />
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} color="#64748b" />
              </button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <DetailRow icon={UserIcon} label="Email" value={selectedUser.email} />
              <DetailRow icon={Phone} label="Phone" value={selectedUser.phone_number} />
              <DetailRow icon={Calendar} label="Age / Gender" value={[getAge(selectedUser.birthdate) ? `${getAge(selectedUser.birthdate)} yrs` : null, selectedUser.gender === 'M' ? 'Male' : selectedUser.gender === 'F' ? 'Female' : selectedUser.gender].filter(Boolean).join(' • ')} />

              {selectedUser.role === 'DOCTOR' ? (
                <>
                  <DetailRow icon={Stethoscope} label="Specialization" value={selectedUser.specialization} />
                  <DetailRow icon={Building2} label="Hospital" value={selectedUser.hospital_name} />
                  <DetailRow icon={Award} label="License No." value={selectedUser.license_number} />
                  <DetailRow icon={GraduationCap} label="Education" value={selectedUser.education} />
                  <DetailRow icon={Calendar} label="Experience" value={selectedUser.experience != null ? `${selectedUser.experience} yrs` : null} />
                  {selectedUser.description && (
                    <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                      {selectedUser.description}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <DetailRow icon={Droplet} label="Blood Group" value={selectedUser.blood_group} />
                  <DetailRow icon={Ruler} label="Height" value={selectedUser.height != null ? `${selectedUser.height} cm` : null} />
                  <DetailRow icon={Weight} label="Weight" value={selectedUser.weight != null ? `${selectedUser.weight} kg` : null} />
                </>
              )}
            </div>
          </div>
        </>
      )}

      {loading ? (
        <div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}>
          <Loader className="animate-spin" size={30} color="#3b82f6" />
        </div>
      ) : error ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#ef4444', fontSize: 14, fontWeight: 500 }}>{error}</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
          {search ? 'No users found matching your search.' : 'No users found.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Member', 'Status', 'Heart Rate', 'SpO₂', 'BP', 'Sleep', 'HRV', 'Battery'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown User';
                const image = resolveImageUrl(u.profile_image);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => setSelectedUser(u)}>
                        {image ? (
                          <img src={image} alt={name} style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 38, height: 38, borderRadius: 12, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#3b82f6' }}>
                            {name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{name}</div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StatusDot status={u.status} />
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                          background: u.status === 'online' ? '#d1fae5' : u.status === 'away' ? '#fef3c7' : '#f1f5f9',
                          color: u.status === 'online' ? '#065f46' : u.status === 'away' ? '#92400e' : '#6b7280',
                          textTransform: 'capitalize'
                        }}>{u.status || 'offline'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.vitals?.heartrate ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Heart size={14} color={u.vitals.heartrate.once_heart_value > 100 ? '#ef4444' : '#10b981'} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{u.vitals.heartrate.once_heart_value} <span style={{ color: '#9ca3af', fontWeight: 400 }}>bpm</span></span>
                          </div>
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, marginLeft: 20 }}>{formatTimeShort(u.vitals.heartrate.date)}</div>
                        </div>
                      ) : <span style={{ color: '#d1d5db', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.vitals?.spo2 ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Droplets size={14} color="#3b82f6" />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{u.vitals.spo2.Blood_oxygen} <span style={{ color: '#9ca3af', fontWeight: 400 }}>%</span></span>
                          </div>
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, marginLeft: 20 }}>{formatTimeShort(u.vitals.spo2.date)}</div>
                        </div>
                      ) : <span style={{ color: '#d1d5db', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.vitals?.bloodpressure ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Activity size={14} color="#8b5cf6" />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{u.vitals.bloodpressure.sbp}/{u.vitals.bloodpressure.dbp}</span>
                          </div>
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, marginLeft: 20 }}>{formatTimeShort(u.vitals.bloodpressure.date)}</div>
                        </div>
                      ) : <span style={{ color: '#d1d5db', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.vitals?.sleep ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Moon size={14} color="#6366f1" />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{u.vitals.sleep.duration} <span style={{ color: '#9ca3af', fontWeight: 400 }}>hrs</span></span>
                          </div>
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, marginLeft: 20 }}>{formatTimeShort(u.vitals.sleep.date)}</div>
                        </div>
                      ) : <span style={{ color: '#d1d5db', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.vitals?.hrv_iso ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Zap size={14} color="#f59e0b" />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{u.vitals.hrv_iso.hrv} <span style={{ color: '#9ca3af', fontWeight: 400 }}>ms</span></span>
                          </div>
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, marginLeft: 20 }}>{formatTimeShort(u.vitals.hrv_iso.date)}</div>
                        </div>
                      ) : <span style={{ color: '#d1d5db', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.vitals?.battery ? (() => {
                        const pct = u.vitals.battery.percentage;
                        const color = pct <= 20 ? '#ef4444' : pct <= 40 ? '#f59e0b' : '#10b981';
                        const BatteryIcon = pct <= 20 ? BatteryWarning : pct <= 40 ? BatteryLow : BatteryFull;
                        return (
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <BatteryIcon size={14} color={color} />
                              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{pct} <span style={{ color: '#9ca3af', fontWeight: 400 }}>%</span></span>
                            </div>
                            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, marginLeft: 20 }}>{formatTimeShort(u.vitals.battery.timestamp)}</div>
                          </div>
                        );
                      })() : <span style={{ color: '#d1d5db', fontSize: 13 }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  if (!value) return null;
  const Icon = icon;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={13} color="#64748b" />
      </div>
      <div>
        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}
