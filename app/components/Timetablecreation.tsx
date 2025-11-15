'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { 
  RefreshCw, 
  Plus, 
  X, 
  Edit2, 
  Trash2, 
  Filter, 
  Download,
  Calendar,
  Clock,
  Users,
  BookOpen,
  MapPin
} from 'lucide-react';

interface TimeSlot {
  id: string;
  time: string;
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  mondayData?: TimetableEntry;
  tuesdayData?: TimetableEntry;
  wednesdayData?: TimetableEntry;
  thursdayData?: TimetableEntry;
  fridayData?: TimetableEntry;
  saturdayData?: TimetableEntry;
  sundayData?: TimetableEntry;
}

interface TimetableEntry {
  id: number;
  class_id: number;
  subject: number | string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  teacher: string;
  room_number: string;
  subject_name?: string;
  color_code?: string;
}

interface TeacherInfo {
  email: string;
  fullname: string;
  department_name?: string;
}

interface ClassInfo {
  id: number;
  class_name: string;
  sec?: string;
}

interface SubjectInfo {
  id: number | string;
  name: string;
  color_code?: string;
}

const API_BASE = 'https://globaltechsoftwaresolutions.cloud/school-api/api';

export default function Timetablecreation() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [teachers, setTeachers] = useState<TeacherInfo[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [filters, setFilters] = useState({
    teacher: '',
    room: '',
    subject: ''
  });

  const [newEntry, setNewEntry] = useState({
    class_id: '',
    subject: '',
    day_of_week: 'Monday',
    start_time: '',
    end_time: '',
    teacher: '',
    room_number: '',
    color_code: '#3B82F6'
  });

  const days = [
    { key: 'time', label: 'Time', shortLabel: 'Time' },
    { key: 'monday', label: 'Monday', shortLabel: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
    { key: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
    { key: 'friday', label: 'Friday', shortLabel: 'Fri' },
    { key: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
    { key: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
  ];

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const getSubjectColor = (subject: string, entry?: TimetableEntry): string => {
    if (entry?.color_code) {
      return `bg-[${entry.color_code}]/10 border-l-4 border-[${entry.color_code}]`;
    }

    const colorMap: { [key: string]: string } = {
      'Mathematics': 'bg-blue-100 border-l-4 border-blue-500',
      'Physics': 'bg-green-100 border-l-4 border-green-500',
      'Chemistry': 'bg-purple-100 border-l-4 border-purple-500',
      'Biology': 'bg-yellow-100 border-l-4 border-yellow-500',
      'English': 'bg-red-100 border-l-4 border-red-500',
      'Break': 'bg-gray-100 border-l-4 border-gray-400',
      'Yoga': 'bg-indigo-100 border-l-4 border-indigo-500',
      'Meditation': 'bg-pink-100 border-l-4 border-pink-500',
      'Sports': 'bg-orange-100 border-l-4 border-orange-500',
      'Lunch Break': 'bg-gray-200 border-l-4 border-gray-500',
      'Holiday': 'bg-gray-300 border-l-4 border-gray-600',
    };
    
    return colorMap[subject] || 'bg-white border-l-4 border-gray-300';
  };

  const fetchTimetable = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get(`${API_BASE}/timetable/`);
      const data = Array.isArray(res.data) ? res.data : [];
      setEntries(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/teachers/`);
      const data = Array.isArray(res.data) ? res.data : [];
      const normalized: TeacherInfo[] = data.map((t: any) => ({
        email: t.email || t.user_details?.email || '',
        fullname: t.fullname || t.name || t.user_details?.fullname || t.email || '',
        department_name: t.department_name || t.department || undefined,
      })).filter(t => t.email);
      setTeachers(normalized);
    } catch (err) {
      console.error('Failed to load teachers:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/classes/`);
      const data = Array.isArray(res.data) ? res.data : [];
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes:', err);
    }
  };

  // Load "subjects" from departments API so each option represents a department
  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/departments/`);
      const data = Array.isArray(res.data) ? res.data : [];

      // Map department response into SubjectInfo shape
      const mapped: SubjectInfo[] = data.map((dept: any) => ({
        id: dept.id,
        name: dept.department_name || dept.name || '',
      }));

      setSubjects(mapped);
    } catch (err) {
      console.error('Failed to load subjects (departments):', err);
    }
  };

  useEffect(() => {
    fetchTimetable();
    fetchTeachers();
    fetchClasses();
    fetchSubjects();
  }, [fetchTimetable]);

  useEffect(() => {
    if (!entries || entries.length === 0) {
      setTimeSlots([]);
      return;
    }

    let filtered = selectedClassId === 'all' 
      ? entries 
      : entries.filter(e => e.class_id === selectedClassId);

    // Apply additional filters
    if (filters.teacher) {
      filtered = filtered.filter(e => 
        e.teacher.toLowerCase().includes(filters.teacher.toLowerCase())
      );
    }
    if (filters.room) {
      filtered = filtered.filter(e => 
        e.room_number.toLowerCase().includes(filters.room.toLowerCase())
      );
    }
    if (filters.subject) {
      filtered = filtered.filter(e => 
        String(e.subject).toLowerCase().includes(filters.subject.toLowerCase()) ||
        e.subject_name?.toLowerCase().includes(filters.subject.toLowerCase())
      );
    }

    const teacherMap = new Map<string, TeacherInfo>();
    teachers.forEach(t => {
      teacherMap.set(t.email.toLowerCase(), t);
    });

    const slotMap = new Map<string, TimeSlot>();

    filtered.forEach((entry) => {
      const label = `${entry.start_time?.slice(0,5)} - ${entry.end_time?.slice(0,5)}`;
      if (!slotMap.has(label)) {
        slotMap.set(label, {
          id: label,
          time: label,
        });
      }

      const slot = slotMap.get(label)!;

      const teacherKey = entry.teacher?.toLowerCase?.() || '';
      const teacherInfo = teacherKey ? teacherMap.get(teacherKey) : undefined;
      const subjectLabel = entry.subject_name || String(entry.subject) || '';
      const teacherName = teacherInfo?.fullname || entry.teacher || '';
      const deptName = teacherInfo?.department_name || '';

      const combinedLabel = deptName
        ? `${subjectLabel} - ${teacherName} (${deptName})`
        : teacherName
        ? `${subjectLabel} - ${teacherName}`
        : subjectLabel;

      const dayKey = entry.day_of_week.toLowerCase();
      if (['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].includes(dayKey)) {
        (slot as any)[dayKey] = combinedLabel;
        (slot as any)[`${dayKey}Data`] = entry;
      }
    });

    const slots = Array.from(slotMap.values()).sort((a, b) => a.time.localeCompare(b.time));
    setTimeSlots(slots);
  }, [entries, selectedClassId, teachers, filters]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.class_id || !newEntry.subject || !newEntry.start_time || !newEntry.end_time || !newEntry.teacher) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = {
        class_id: Number(newEntry.class_id),
        subject: newEntry.subject,
        day_of_week: newEntry.day_of_week,
        start_time: newEntry.start_time,
        end_time: newEntry.end_time,
        teacher: newEntry.teacher,
        room_number: newEntry.room_number,
        color_code: newEntry.color_code,
      };

      if (editingEntry) {
        await axios.put(`${API_BASE}/timetable/${editingEntry.id}/`, payload);
      } else {
        await axios.post(`${API_BASE}/timetable/`, payload);
      }

      resetForm();
      await fetchTimetable();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save timetable entry');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      class_id: String(entry.class_id),
      subject: String(entry.subject),
      day_of_week: entry.day_of_week,
      start_time: entry.start_time,
      end_time: entry.end_time,
      teacher: entry.teacher,
      room_number: entry.room_number,
      color_code: entry.color_code || '#3B82F6',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this timetable entry?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/timetable/${id}/`);
      await fetchTimetable();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete timetable entry');
    }
  };

  const resetForm = () => {
    setNewEntry({
      class_id: '',
      subject: '',
      day_of_week: 'Monday',
      start_time: '',
      end_time: '',
      teacher: '',
      room_number: '',
      color_code: '#3B82F6'
    });
    setEditingEntry(null);
    setShowForm(false);
  };

  const exportTimetable = () => {
    const csvContent = [
      ['Class', 'Subject', 'Day', 'Start Time', 'End Time', 'Teacher', 'Room'],
      ...entries.map(entry => [
        entry.class_id,
        entry.subject_name || entry.subject,
        entry.day_of_week,
        entry.start_time,
        entry.end_time,
        entry.teacher,
        entry.room_number
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetable-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Timetable Management
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Comprehensive schedule management with real-time updates and advanced filtering
          </p>
        </div>

        {/* Controls Section */}
        <div className="mb-6 space-y-4">
          {/* Main Controls */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-200 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedClassId === 'all' ? '' : selectedClassId}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedClassId(value === '' ? 'all' : Number(value));
                  }}
                  className="px-3 py-1.5 border-0 bg-transparent text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name} {cls.sec && `- ${cls.sec}`}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => fetchTimetable()}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>

              <button
                onClick={exportTimetable}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            <button
              onClick={() => setShowForm(prev => !prev)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              {showForm ? 'Close Form' : 'Add New Entry'}
            </button>
          </div>

          {/* Advanced Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <h3 className="text-sm font-semibold text-gray-700">Advanced Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Filter by teacher..."
                value={filters.teacher}
                onChange={(e) => setFilters(prev => ({ ...prev, teacher: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Filter by room..."
                value={filters.room}
                onChange={(e) => setFilters(prev => ({ ...prev, room: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Filter by subject..."
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingEntry ? 'Edit Timetable Entry' : 'Create New Timetable Entry'}
              </h2>
              <button
                onClick={resetForm}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Class *
                </label>
                <select
                  value={newEntry.class_id}
                  onChange={(e) => setNewEntry({ ...newEntry, class_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name} {cls.sec && `- ${cls.sec}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  Subject *
                </label>
                <select
                  value={newEntry.subject}
                  onChange={(e) => setNewEntry({ ...newEntry, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Day *
                </label>
                <select
                  value={newEntry.day_of_week}
                  onChange={(e) => setNewEntry({ ...newEntry, day_of_week: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Start Time *
                </label>
                <input
                  type="time"
                  value={newEntry.start_time}
                  onChange={(e) => setNewEntry({ ...newEntry, start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  End Time *
                </label>
                <input
                  type="time"
                  value={newEntry.end_time}
                  onChange={(e) => setNewEntry({ ...newEntry, end_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Email *
                </label>
                <select
                  value={newEntry.teacher}
                  onChange={(e) => setNewEntry({ ...newEntry, teacher: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.email} value={teacher.email}>
                      {teacher.fullname} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Room Number
                </label>
                <input
                  type="text"
                  value={newEntry.room_number}
                  onChange={(e) => setNewEntry({ ...newEntry, room_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Code
                </label>
                <div className="flex gap-2">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewEntry({ ...newEntry, color_code: color })}
                      className={`w-6 h-6 rounded-full border-2 ${
                        newEntry.color_code === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {saving ? 'Saving...' : editingEntry ? 'Update Entry' : 'Create Entry'}
                </button>
                {editingEntry && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Timetable Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Days Header */}
          <div className="grid grid-cols-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            {days.map((day) => (
              <div
                key={day.key}
                className="p-4 text-center font-semibold border-r border-blue-500 last:border-r-0"
              >
                <div className="hidden sm:block">{day.label}</div>
                <div className="sm:hidden text-sm">{day.shortLabel}</div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          {loading && timeSlots.length === 0 ? (
            <div className="py-16 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mr-3" />
              <span className="text-gray-600">Loading timetable...</span>
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500 gap-3">
              <Calendar className="w-12 h-12 text-gray-400" />
              <div className="text-center">
                <p className="font-medium text-gray-600 mb-1">No timetable entries found</p>
                <p className="text-sm">Try adjusting your filters or create a new entry</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {timeSlots.map((slot, index) => (
                <div
                  key={slot.id}
                  className={`grid grid-cols-8 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-blue-50 transition-colors duration-200`}
                >
                  {/* Time Column */}
                  <div className="p-4 border-r border-gray-200 flex items-center justify-center font-medium text-gray-700 bg-white">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    {slot.time}
                  </div>

                  {/* Day Columns */}
                  {days.slice(1).map((day) => {
                    const entryData = slot[`${day.key}Data` as keyof TimeSlot] as TimetableEntry;
                    const rawContent = slot[day.key as keyof TimeSlot];
                    const cellContent = typeof rawContent === 'string' ? rawContent : '';
                    const subjectForColor = cellContent ? cellContent.split(' - ')[0] : '';

                    return (
                      <div
                        key={day.key}
                        className={`p-3 border-r border-gray-200 last:border-r-0 min-h-[80px] group relative ${getSubjectColor(
                          subjectForColor,
                          entryData
                        )}`}
                      >
                        {cellContent ? (
                          <div className="h-full flex flex-col">
                            <span className="font-semibold text-gray-800 text-sm mb-1">
                              {cellContent.split(' - ')[0]}
                            </span>
                            {cellContent.includes(' - ') && (
                              <span className="text-xs text-gray-600 mt-1">
                                {cellContent.split(' - ').slice(1).join(' - ')}
                              </span>
                            )}
                            {entryData?.room_number && (
                              <span className="text-xs text-gray-500 mt-2 flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                Room {entryData.room_number}
                              </span>
                            )}

                            {/* Action Buttons */}
                            {entryData && (
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEdit(entryData)}
                                  className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(entryData.id)}
                                  className="p-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <span className="text-gray-400 text-sm">-</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats and Legend */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Timetable Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{entries.length}</div>
                <div className="text-sm text-gray-600">Total Entries</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Array.from(new Set(entries.map(e => e.class_id))).length}
                </div>
                <div className="text-sm text-gray-600">Classes</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Array.from(new Set(entries.map(e => e.teacher))).length}
                </div>
                <div className="text-sm text-gray-600">Teachers</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Array.from(new Set(entries.map(e => e.subject))).length}
                </div>
                <div className="text-sm text-gray-600">Subjects</div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Legend</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { subject: 'Mathematics', color: 'bg-blue-100 border-l-4 border-blue-500' },
                { subject: 'Physics', color: 'bg-green-100 border-l-4 border-green-500' },
                { subject: 'Chemistry', color: 'bg-purple-100 border-l-4 border-purple-500' },
                { subject: 'Biology', color: 'bg-yellow-100 border-l-4 border-yellow-500' },
                { subject: 'English', color: 'bg-red-100 border-l-4 border-red-500' },
                { subject: 'Break', color: 'bg-gray-100 border-l-4 border-gray-400' },
                { subject: 'Sports', color: 'bg-orange-100 border-l-4 border-orange-500' },
                { subject: 'Other', color: 'bg-white border-l-4 border-gray-300' },
              ].map((item) => (
                <div key={item.subject} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-4 h-8 rounded ${item.color}`}></div>
                  <span className="text-sm text-gray-700 font-medium">{item.subject}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}