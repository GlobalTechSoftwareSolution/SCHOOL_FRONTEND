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
  BookOpen,
  MapPin,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  Table,
  AlertTriangle,
  AlertCircle,
  School,
  User,
  Building
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

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

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
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [conflictWarnings, setConflictWarnings] = useState<string[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [deletingEntryId, setDeletingEntryId] = useState<number | null>(null);

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
    { key: 'monday', label: 'Monday', shortLabel: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
    { key: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
    { key: 'friday', label: 'Friday', shortLabel: 'Fri' },
    { key: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
    { key: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
  ];

// Predefined colors for timetable entries
  // const predefinedColors = [
  //   '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  //   '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  // ];

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
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load timetable';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/teachers/`);
      const data = Array.isArray(res.data) ? res.data : [];
      const normalized: TeacherInfo[] = data.map((t: Record<string, unknown>) => {
        const email = (t.email as string) || (t.user_details && typeof t.user_details === 'object' && (t.user_details as Record<string, unknown>).email as string) || '';
        const fullname = (t.fullname as string) || (t.name as string) || (t.user_details && typeof t.user_details === 'object' && (t.user_details as Record<string, unknown>).fullname as string) || (t.email as string) || '';
        const department_name = (t.department_name as string) || (t.department as string) || undefined;
        return { email, fullname, department_name };
      }).filter(t => t.email) as TeacherInfo[];
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

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/departments/`);
      const data = Array.isArray(res.data) ? res.data : [];
      const mapped: SubjectInfo[] = data.map((dept: Record<string, unknown>) => ({
        id: dept.id as number | string,
        name: (dept.department_name as string) || (dept.name as string) || '',
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
        (slot as unknown as Record<string, unknown>)[dayKey] = combinedLabel;
        (slot as unknown as Record<string, unknown>)[`${dayKey}Data`] = entry;
      }
    });

    const slots = Array.from(slotMap.values()).sort((a, b) => a.time.localeCompare(b.time));
    setTimeSlots(slots);
  }, [entries, selectedClassId, teachers, filters]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newEntry.class_id || !newEntry.subject || !newEntry.start_time || !newEntry.end_time || !newEntry.teacher || !newEntry.day_of_week) {
      setError('Please fill all required fields');
      return;
    }

    const conflictMessage = checkForConflicts(newEntry);
    if (conflictMessage) {
      setError(formatConflictMessage(conflictMessage));
      return;
    }

    try {
      setSaving(true);
      setError('');

      // Convert day_of_week from key to proper format if needed
      let formattedDay = newEntry.day_of_week;
      // If the day is stored as a key (e.g., 'monday'), convert to proper format (e.g., 'Monday')
      if (newEntry.day_of_week && newEntry.day_of_week.length > 0) {
        formattedDay = newEntry.day_of_week.charAt(0).toUpperCase() + newEntry.day_of_week.slice(1).toLowerCase();
      }
      
      const payload: Record<string, unknown> = {
        class_id: Number(newEntry.class_id),
        subject: isNaN(Number(newEntry.subject)) ? newEntry.subject : Number(newEntry.subject),
        day_of_week: formattedDay,
        start_time: newEntry.start_time,
        end_time: newEntry.end_time,
        teacher: newEntry.teacher,
        room_number: newEntry.room_number || null,
        color_code: newEntry.color_code || null,
      };

      // Remove empty fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === '' || payload[key] === undefined) {
          delete payload[key];
        }
      });

      if (editingEntry) {
        try {
          await axios.patch(`${API_BASE}/timetable/${editingEntry.id}/`, payload);
          setError(`✅ Timetable entry updated successfully!`);
        } catch {
          // If PATCH fails, try PUT as fallback
          try {
            await axios.put(`${API_BASE}/timetable/${editingEntry.id}/`, payload);
            setError(`✅ Timetable entry updated successfully!`);
          } catch (putError: unknown) {
            // If both PATCH and PUT fail, re-throw the error
            const putErrorMessage = putError && typeof putError === 'object' && 'response' in putError &&
              putError.response && typeof putError.response === 'object' &&
              putError.response !== null && 'data' in putError.response &&
              putError.response.data && typeof putError.response.data === 'object' &&
              putError.response.data !== null && 'message' in putError.response.data ?
              (putError.response.data as { message: string }).message :
              putError instanceof Error ? putError.message : 'Unknown error';
            throw new Error(`Failed to update: ${putErrorMessage}`);
          }
        }
      } else {
        await axios.post(`${API_BASE}/timetable/`, payload);
        setError(`✅ New timetable entry created successfully!`);
      }

      if (editingEntry) {
        resetEditForm();
      } else {
        resetNewEntryForm();
      }
      await fetchTimetable();
    } catch (err: unknown) {
      // Extract detailed error information
      let errorMessage = 'Failed to save timetable entry';
      if (err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object' && err.response !== null && 'data' in err.response && err.response.data) {
        const response = err.response as { data: unknown };
        if (typeof response.data === 'object' && response.data !== null && 'message' in response.data && response.data.message) {
          errorMessage = (response.data as { message: string }).message;
        } else if (typeof response.data === 'object' && response.data !== null && 'detail' in response.data && response.data.detail) {
          errorMessage = (response.data as { detail: string }).detail;
        } else if (typeof response.data === 'string') {
          errorMessage = response.data;
        } else {
          errorMessage = JSON.stringify(response.data);
        }
      } else if (err instanceof Error && err.message) {
        errorMessage = err.message;
      }
      setError(`Failed to save timetable entry: ${errorMessage}`);
    } finally {
      setSaving(false);
      // Clear success message after 3 seconds
      setTimeout(() => {
        if (!saving && error?.startsWith('✅')) {
          setError('');
        }
      }, 3000);
    }
  };

  const checkForConflicts = (entry: typeof newEntry): string | null => {
    // Convert time strings to minutes for easier comparison
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      
      return hours * 60 + minutes;
    };

    const newStart = timeToMinutes(entry.start_time);
    const newEnd = timeToMinutes(entry.end_time);

    let firstConflict: string | null = null;
    
    // Check for exact duplicates (all fields matching)
    for (const existingEntry of entries) {
      // Skip the entry we're editing
      if (editingEntry && existingEntry.id === editingEntry.id) continue;
      
      // Check for exact duplicate entry based on Subject, Day of Week, Start Time, End Time, Teacher, Room Number
      if (existingEntry.day_of_week.toLowerCase() === entry.day_of_week.toLowerCase() &&
          existingEntry.subject === entry.subject &&
          existingEntry.teacher === entry.teacher && 
          existingEntry.start_time === entry.start_time &&
          existingEntry.end_time === entry.end_time &&
          existingEntry.room_number === entry.room_number) {
        const className = classes.find(c => c.id === existingEntry.class_id)?.class_name || 'Unknown Class';
        firstConflict = `Duplicate Entry: This exact timetable entry already exists for ${className} on ${entry.day_of_week} from ${entry.start_time} to ${entry.end_time}`;
        return firstConflict;
      }
    }
    
    // Check for conflicts with existing entries
    for (const existingEntry of entries) {
      // Skip the entry we're editing
      if (editingEntry && existingEntry.id === editingEntry.id) continue;
      
      // Only check entries on the same day
      if (existingEntry.day_of_week.toLowerCase() !== entry.day_of_week.toLowerCase()) continue;

      const existingStart = timeToMinutes(existingEntry.start_time);
      const existingEnd = timeToMinutes(existingEntry.end_time);

      // Check if time slots overlap
      const timeOverlap = (newStart < existingEnd && newEnd > existingStart);
      
      if (timeOverlap) {
        // Check for teacher conflict
        if (existingEntry.teacher === entry.teacher) {
          const className = classes.find(c => c.id === existingEntry.class_id)?.class_name || 'Unknown Class';
          firstConflict = `Conflict: Teacher ${entry.teacher} is already scheduled for ${existingEntry.subject_name || existingEntry.subject} with ${className} from ${existingEntry.start_time} to ${existingEntry.end_time} in ${existingEntry.room_number ? `Room ${existingEntry.room_number}` : 'another room'}`;
          break;
        }
        
        // Check for room conflict
        if (existingEntry.room_number && entry.room_number && 
            existingEntry.room_number === entry.room_number) {
          const className = classes.find(c => c.id === existingEntry.class_id)?.class_name || 'Unknown Class';
          firstConflict = `Conflict: Room ${entry.room_number} is already allocated to ${existingEntry.subject_name || existingEntry.subject} for ${className} with ${existingEntry.teacher} from ${existingEntry.start_time} to ${existingEntry.end_time}`;
          break;
        }
        
        // Check for class conflict
        if (existingEntry.class_id === Number(entry.class_id)) {
          firstConflict = `Conflict: Class is already scheduled for ${existingEntry.subject_name || existingEntry.subject} with ${existingEntry.teacher} from ${existingEntry.start_time} to ${existingEntry.end_time} ${existingEntry.room_number ? `in Room ${existingEntry.room_number}` : ''}`;
          break;
        }
        
        // General time slot conflict with detailed information
        const className = classes.find(c => c.id === existingEntry.class_id)?.class_name || 'Unknown Class';
        const subjectName = existingEntry.subject_name || existingEntry.subject || 'Unknown Subject';
        firstConflict = `Conflict: Time slot from ${entry.start_time} to ${entry.end_time} on ${entry.day_of_week} is already allocated to ${className} for ${subjectName} with ${existingEntry.teacher} in ${existingEntry.room_number ? `Room ${existingEntry.room_number}` : 'an unspecified room'}`;
        break;
      }
    }

    return firstConflict;
  };

  const getAllConflicts = useCallback((entry: typeof newEntry): string[] => {
    const conflicts: string[] = [];
    
    // Convert time strings to minutes for easier comparison
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const newStart = timeToMinutes(entry.start_time);
    const newEnd = timeToMinutes(entry.end_time);

    // Check for exact duplicates (all fields matching)
    for (const existingEntry of entries) {
      // Skip the entry we're editing
      if (editingEntry && existingEntry.id === editingEntry.id) continue;
      
      // Check for exact duplicate entry based on Subject, Day of Week, Start Time, End Time, Teacher, Room Number
      if (existingEntry.day_of_week.toLowerCase() === entry.day_of_week.toLowerCase() &&
          existingEntry.subject === entry.subject &&
          existingEntry.teacher === entry.teacher &&
          existingEntry.start_time === entry.start_time &&
          existingEntry.end_time === entry.end_time &&
          existingEntry.room_number === entry.room_number) {
        const className = classes.find(c => c.id === existingEntry.class_id)?.class_name || 'Unknown Class';
        conflicts.push(`Duplicate Entry: This exact timetable entry already exists for ${className} on ${entry.day_of_week} from ${entry.start_time} to ${entry.end_time}`);
        return conflicts; // Return immediately for duplicates
      }
    }
    
    // Check for conflicts with existing entries
    for (const existingEntry of entries) {
      // Skip the entry we're editing
      if (editingEntry && existingEntry.id === editingEntry.id) continue;
      
      // Only check entries on the same day
      if (existingEntry.day_of_week.toLowerCase() !== entry.day_of_week.toLowerCase()) continue;

      const existingStart = timeToMinutes(existingEntry.start_time);
      const existingEnd = timeToMinutes(existingEntry.end_time);

      // Check if time slots overlap
      const timeOverlap = (newStart < existingEnd && newEnd > existingStart);
      
      if (timeOverlap) {
        // Check for teacher conflict
        if (existingEntry.teacher === entry.teacher) {
          const className = classes.find(c => c.id === existingEntry.class_id)?.class_name || 'Unknown Class';
          conflicts.push(`Teacher ${entry.teacher} is already teaching ${existingEntry.subject_name || existingEntry.subject} to ${className} from ${existingEntry.start_time} to ${existingEntry.end_time} in ${existingEntry.room_number ? `Room ${existingEntry.room_number}` : 'another room'}`);
        }
        
        // Check for room conflict
        if (existingEntry.room_number && entry.room_number && 
            existingEntry.room_number === entry.room_number) {
          const className = classes.find(c => c.id === existingEntry.class_id)?.class_name || 'Unknown Class';
          conflicts.push(`Room ${entry.room_number} is already booked for ${existingEntry.subject_name || existingEntry.subject} with ${className} and ${existingEntry.teacher} from ${existingEntry.start_time} to ${existingEntry.end_time}`);
        }
        
        // Check for class conflict
        if (existingEntry.class_id === Number(entry.class_id)) {
          conflicts.push(`Class is already scheduled for ${existingEntry.subject_name || existingEntry.subject} with ${existingEntry.teacher} from ${existingEntry.start_time} to ${existingEntry.end_time} ${existingEntry.room_number ? `in Room ${existingEntry.room_number}` : ''}`);
        }
        
        // General time slot conflict with detailed information
        if (conflicts.length === 0) { // Only add general conflict if no specific conflicts found
          const className = classes.find(c => c.id === existingEntry.class_id)?.class_name || 'Unknown Class';
          const subjectName = existingEntry.subject_name || existingEntry.subject || 'Unknown Subject';
          conflicts.push(`Time slot from ${entry.start_time} to ${entry.end_time} on ${entry.day_of_week} overlaps with ${className}'s ${subjectName} scheduled with ${existingEntry.teacher} from ${existingEntry.start_time} to ${existingEntry.end_time} ${existingEntry.room_number ? `in Room ${existingEntry.room_number}` : ''}`);
        }
      }
    }

    // Check for general time slot conflicts (when no specific resource conflict but time overlaps)
    const hasSpecificConflict = conflicts.length > 0;
    if (!hasSpecificConflict) {
      for (const existingEntry of entries) {
        // Skip the entry we're editing
        if (editingEntry && existingEntry.id === editingEntry.id) continue;
        
        // Only check entries on the same day
        if (existingEntry.day_of_week.toLowerCase() !== entry.day_of_week.toLowerCase()) continue;

        const existingStart = timeToMinutes(existingEntry.start_time);
        const existingEnd = timeToMinutes(existingEntry.end_time);

        // Check if time slots overlap
        const timeOverlap = (newStart < existingEnd && newEnd > existingStart);
        
        if (timeOverlap) {
          const className = classes.find(c => c.id === existingEntry.class_id)?.class_name || 'Unknown Class';
          const subjectName = existingEntry.subject_name || existingEntry.subject || 'Unknown Subject';
          conflicts.push(`Time slot from ${entry.start_time} to ${entry.end_time} on ${entry.day_of_week} is already allocated to ${className} for ${subjectName} with ${existingEntry.teacher} ${existingEntry.room_number ? `in Room ${existingEntry.room_number}` : ''}`);
        }
      }
    }

    return conflicts;
  }, [entries, classes, editingEntry]);

  const formatConflictMessage = (message: string): string => {
    return `⚠️ ${message}`;
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

  const handleDelete = (id: number) => {
    setDeletingEntryId(id);
    setShowDeleteConfirm(true);
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

  const getEntriesForCurrentDay = () => {
    const currentDay = days[currentDayIndex].key;
    return entries.filter(entry => 
      entry.day_of_week.toLowerCase() === currentDay &&
      (selectedClassId === 'all' || entry.class_id === selectedClassId)
    ).sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const nextDay = () => {
    setCurrentDayIndex((prev) => (prev + 1) % days.length);
  };

  const prevDay = () => {
    setCurrentDayIndex((prev) => (prev - 1 + days.length) % days.length);
  };

  // Responsive Mobile Card View
  const CardView = () => {
    const dayEntries = getEntriesForCurrentDay();
    
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/60 overflow-hidden">
        {/* Day Navigation Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <button
              onClick={prevDay}
              className="p-2 sm:p-3 hover:bg-blue-700/50 rounded-xl transition-all duration-200 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-bold">{days[currentDayIndex].label}</h2>
              <p className="text-blue-100 text-sm sm:text-base mt-1">
                {dayEntries.length} {dayEntries.length === 1 ? 'class' : 'classes'}
              </p>
            </div>
            
            <button
              onClick={nextDay}
              className="p-2 sm:p-3 hover:bg-blue-700/50 rounded-xl transition-all duration-200 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Cards Container */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-gray-500">
              <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 animate-spin mb-3" />
              <span className="text-sm sm:text-base text-gray-600">Loading timetable...</span>
            </div>
          ) : dayEntries.length === 0 ? (
            <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-gray-500">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
              <p className="font-medium text-gray-600 text-base sm:text-lg">No classes scheduled</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            dayEntries.map((entry) => {
              const teacherInfo = teachers.find(t => t.email === entry.teacher);
              const subjectName = entry.subject_name || String(entry.subject);
              const classInfo = classes.find(c => c.id === entry.class_id);
              
              return (
                <div
                  key={entry.id}
                  className={`border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 ${getSubjectColor(subjectName, entry)} group`}
                >
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {subjectName}
                      </h3>
                      <div className="flex items-center text-sm hidden lg:block text-gray-600 mb-1 sm:mb-2">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{entry.start_time.slice(0,5)} - {entry.end_time.slice(0,5)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                    {entry.room_number && (
                      <span className="bg-gray-100 text-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center shadow-sm">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Room {entry.room_number}
                      </span>
                    )}
                    {teacherInfo?.department_name && (
                      <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm">
                        {teacherInfo.department_name}
                      </span>
                    )}
                    {classInfo && (
                      <span className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm">
                        <School className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                        {classInfo.class_name} {classInfo.sec && `- ${classInfo.sec}`}
                      </span>
                    )}
                  </div>
                  
                  {/* Tap to view details on mobile */}
                  <div className="mt-3 sm:mt-4 lg:hidden">
                    <button
                      onClick={() => showEntryDetails(entry)}
                      className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border-t border-gray-100 pt-3"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Professional Table View for Desktop
  const TableView = () => (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-200/60">
      {/* Days Header */}
      <div className="grid grid-cols-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="p-3 sm:p-4 text-center font-semibold border-r border-blue-500/50">
          <div className="hidden xs:block">Time</div>
          <div className="xs:hidden text-sm">Time</div>
        </div>
        {days.map((day) => (
          <div
            key={day.key}
            className="p-3 sm:p-4 text-center font-semibold border-r border-blue-500/50 last:border-r-0"
          >
            <div className="hidden sm:block text-sm lg:text-base">{day.label}</div>
            <div className="sm:hidden text-xs xs:text-sm">{day.shortLabel}</div>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      {loading && timeSlots.length === 0 ? (
        <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-gray-500">
          <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 animate-spin mb-3" />
          <span className="text-sm sm:text-base text-gray-600">Loading timetable...</span>
        </div>
      ) : timeSlots.length === 0 ? (
        <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-gray-500 gap-3 sm:gap-4">
          <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
          <div className="text-center">
            <p className="font-medium text-gray-600 text-base sm:text-lg mb-1">No timetable entries found</p>
            <p className="text-sm text-gray-500">Try adjusting your filters or create a new entry</p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {timeSlots.map((slot, index) => (
            <div
              key={slot.id}
              className={`grid grid-cols-8 ${
                index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
              } hover:bg-blue-50/30 transition-all duration-200 group`}
            >
              {/* Time Column */}
              <div className="p-3 sm:p-4 border-r border-gray-200 flex items-center justify-center font-medium text-gray-700 bg-white">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">{slot.time}</span>
              </div>

              {/* Day Columns */}
              {days.map((day) => {
                const entryData = slot[`${day.key}Data` as keyof TimeSlot] as TimetableEntry;
                const rawContent = slot[day.key as keyof TimeSlot];
                const cellContent = typeof rawContent === 'string' ? rawContent : '';
                const subjectForColor = cellContent ? cellContent.split(' - ')[0] : '';


                return (
                  <div
                    key={day.key}
                    className={`p-2 sm:p-3 border-r border-gray-200 last:border-r-0 min-h-[80px] sm:min-h-[100px] group relative ${getSubjectColor(
                      subjectForColor,
                      entryData
                    )}`}
                  >
                    {cellContent ? (
                      <div className="h-full flex flex-col">
                        <span className="font-semibold text-gray-800 text-xs sm:text-sm mb-1 line-clamp-2">
                          {cellContent.split(' - ')[0]}
                        </span>
                        {cellContent.includes(' - ') && (
                          <span className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {cellContent.split(' - ').slice(1).join(' - ')}
                          </span>
                        )}
                        {entryData?.room_number && (
                          <span className="text-xs text-gray-500 mt-2 flex items-center">
                            <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                            Room {entryData.room_number}
                          </span>
                        )}
                        
                        {/* Action Buttons */}
                        {entryData && (
                          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(entryData)}
                              className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs shadow-sm transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(entryData.id)}
                              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs shadow-sm transition-colors"
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
  );

  const checkConflictsInRealTime = useCallback(() => {
    // Only check for conflicts if all required fields are filled
    if (!newEntry.class_id || !newEntry.subject || !newEntry.start_time || !newEntry.end_time || !newEntry.teacher || !newEntry.day_of_week) {
      setConflictWarnings([]);
      return;
    }

    const conflicts = getAllConflicts(newEntry);
    setConflictWarnings(conflicts);
  }, [newEntry, getAllConflicts]);

  useEffect(() => {
    checkConflictsInRealTime();
  }, [checkConflictsInRealTime]);

  const showEntryDetails = (entry: TimetableEntry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEntry(null);
  };

  const handleSubmit = handleCreate;

  // Function to reset form specifically for new entries
  const resetNewEntryForm = () => {
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
    setConflictWarnings([]);
  };

  // Function to reset form specifically for editing
  const resetEditForm = () => {
    setEditingEntry(null);
    setShowForm(false);
    setConflictWarnings([]);
  };

  const confirmDelete = async () => {
    if (!deletingEntryId) return;
    
    try {
      await axios.delete(`${API_BASE}/timetable/${deletingEntryId}/`);
      await fetchTimetable();
      setShowDeleteConfirm(false);
      setDeletingEntryId(null);
      setError(`✅ Timetable entry deleted successfully!`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete timetable entry';
      setError(errorMessage);
      setShowDeleteConfirm(false);
      setDeletingEntryId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50/30 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl shadow-lg">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Timetable Management
                </h1>
              </div>
              <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
                Create and manage your school timetable with real-time conflict detection
              </p>
            </div>
            
            {/* Action Buttons - Responsive stacking on small screens */}
            <div className="flex flex-wrap justify-center lg:justify-end gap-2 sm:gap-3">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    setEditingEntry(null);
                    // Reset form to default values for new entry
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
                    setShowForm(true);
                  }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 active:scale-95"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="max-xs:hidden">Create New Entry</span>
                  <span className="xs:hidden">New</span>
                </button>

                {/* View Mode Toggle */}
                <div className="flex rounded-xl sm:rounded-2xl overflow-hidden border border-gray-300 shadow-sm">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 ${
                      viewMode === 'cards' 
                        ? 'bg-blue-600 text-white shadow-inner' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <LayoutList className="w-4 h-4 sm:hidden" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium border-l border-r border-gray-300 transition-all duration-200 ${
                      viewMode === 'table' 
                        ? 'bg-blue-600 text-white shadow-inner' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Table className="w-4 h-4 sm:hidden" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                </div>

                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-white text-xs sm:text-sm px-3 sm:px-4 py-2.5 border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-w-[120px]"
                >
                  <option value="all">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name} {cls.sec ? `- ${cls.sec}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => fetchTimetable()}
                  disabled={loading}
                  className="px-3 sm:px-4 py-2.5 bg-white border border-gray-300 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1 sm:gap-2 transition-all duration-200 shadow-sm active:scale-95"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden xs:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
                </button>

                <button
                  onClick={exportTimetable}
                  className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Advanced Filters - Better responsive layout */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200/60 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <h3 className="text-sm sm:text-base font-semibold text-gray-700">Advanced Filters</h3>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter by teacher..."
                  value={filters.teacher}
                  onChange={(e) => setFilters(prev => ({ ...prev, teacher: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter by room..."
                  value={filters.room}
                  onChange={(e) => setFilters(prev => ({ ...prev, room: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter by subject..."
                  value={filters.subject}
                  onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Timetable Display */}
        <div className="mb-6 sm:mb-8">
          {viewMode === 'cards' ? <CardView /> : <TableView />}
        </div>

        {/* Entry Detail Modal for Mobile */}
        {showDetailModal && selectedEntry && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-2xl sm:rounded-t-3xl">
                <h3 className="text-lg sm:text-xl font-semibold">Timetable Entry Details</h3>
                <button
                  onClick={closeDetailModal}
                  className="p-1.5 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {(() => {
                  const classInfo = classes.find(c => c.id === selectedEntry.class_id);
                  const teacherInfo = teachers.find(t => t.email === selectedEntry.teacher);
                  const subjectName = selectedEntry.subject_name || String(selectedEntry.subject);
                  
                  return (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="text-center sm:text-left">
                        <h4 className="font-bold text-xl sm:text-2xl text-gray-800">{subjectName}</h4>
                        <p className="text-blue-600 font-medium text-sm sm:text-base">{selectedEntry.day_of_week}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-200">
                          <p className="text-xs text-gray-500 mb-1">Class</p>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">
                            {classInfo ? `${classInfo.class_name} ${classInfo.sec || ''}` : 'Unknown Class'}
                          </p>
                        </div>
                        
                        <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200">
                          <p className="text-xs text-gray-500 mb-1">Teacher</p>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">
                            {teacherInfo ? teacherInfo.fullname : selectedEntry.teacher}
                          </p>
                        </div>
                        
                        <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-200">
                          <p className="text-xs text-gray-500 mb-1">Room</p>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">
                            {selectedEntry.room_number || 'Not assigned'}
                          </p>
                        </div>
                        
                        <div className="bg-yellow-50 p-3 sm:p-4 rounded-xl border border-yellow-200">
                          <p className="text-xs text-gray-500 mb-1">Time</p>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">
                            {selectedEntry.start_time?.slice(0,5)} - {selectedEntry.end_time?.slice(0,5)}
                          </p>
                        </div>
                      </div>
                      
                      {teacherInfo?.department_name && (
                        <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Department</p>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">{teacherInfo.department_name}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
              <div className="px-4 sm:px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl sm:rounded-b-3xl">
                <button
                  onClick={() => {
                    handleEdit(selectedEntry);
                    closeDetailModal();
                  }}
                  className="px-4 sm:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete(selectedEntry.id);
                    closeDetailModal();
                  }}
                  className="px-4 sm:px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-2xl sm:rounded-t-3xl">
                <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                  {editingEntry ? (
                    <>
                      <Edit2 className="w-5 h-5" />
                      Edit Timetable Entry
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Create New Timetable Entry
                    </>
                  )}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingEntry(null);
                    setConflictWarnings([]);
                  }}
                  className="p-1.5 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Conflict warnings */}
                {conflictWarnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
                      <h4 className="font-medium text-amber-800">Conflicts Detected</h4>
                    </div>
                    <ul className="space-y-2">
                      {conflictWarnings.map((warning, index) => (
                        <li key={index} className="flex items-start">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-amber-700 text-sm">{warning}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-amber-600 text-xs mt-2">Please resolve these conflicts before saving.</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4 sm:gap-5">
                  {/* Section Header - New Entry */}
                  {!editingEntry && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-2">
                      <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create New Timetable Entry
                      </h3>
                      <p className="text-blue-600 text-sm mt-1">
                        Fill in the details below to add a new class to the timetable
                      </p>
                    </div>
                  )}
                  
                  {/* Section Header - Edit Entry */}
                  {editingEntry && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-2">
                      <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                        <Edit2 className="w-5 h-5" />
                        Edit Timetable Entry
                      </h3>
                      <p className="text-amber-600 text-sm mt-1">
                        Modify the details below and save to update this timetable entry
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class *
                    </label>
                    <select
                      value={newEntry.class_id || ''}
                      onChange={(e) => setNewEntry({...newEntry, class_id: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select a class</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name} {cls.sec ? `- ${cls.sec}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      value={newEntry.subject || ''}
                      onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day of Week *
                    </label>
                    <select
                      value={newEntry.day_of_week || ''}
                      onChange={(e) => setNewEntry({...newEntry, day_of_week: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      {days.map((day) => (
                        <option key={day.key} value={day.key}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={newEntry.start_time}
                        onChange={(e) => setNewEntry({...newEntry, start_time: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={newEntry.end_time}
                        onChange={(e) => setNewEntry({...newEntry, end_time: e.target.value})}
                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teacher *
                    </label>
                    <select
                      value={newEntry.teacher || ''}
                      onChange={(e) => setNewEntry({...newEntry, teacher: e.target.value})}
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.email} value={teacher.email}>
                          {teacher.fullname} {teacher.department_name ? `(${teacher.department_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number
                    </label>
                    <input
                      type="text"
                      value={newEntry.room_number}
                      onChange={(e) => setNewEntry({...newEntry, room_number: e.target.value})}
                      placeholder="e.g., Room 101"
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingEntry) {
                        resetEditForm();
                      } else {
                        resetNewEntryForm();
                      }
                    }}
                    className="px-4 sm:px-6 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {editingEntry ? 'Update Entry' : 'Create Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Popup */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md">
              <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-2xl sm:rounded-t-3xl">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <h3 className="text-lg sm:text-xl font-semibold">Confirm Deletion</h3>
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-gray-600 text-sm sm:text-base">
                  Are you sure you want to delete this timetable entry? This action cannot be undone.
                </p>
              </div>
              <div className="px-4 sm:px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl sm:rounded-b-3xl">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 sm:px-6 py-2.5 border border-gray-300 rounded-lg sm:rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg sm:rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Error/Success Popup */}
        {error && (
          <div className={`fixed top-4 right-4 px-4 py-3 rounded-xl shadow-lg z-50 flex items-center max-w-md animate-slide-in-right ${error.startsWith('✅') ? 'bg-green-500 text-white' : error.startsWith('⚠️') ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'}`}>
            {error.startsWith('✅') ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : error.startsWith('⚠️') ? (
              <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <span className="text-sm flex-1">{error.startsWith('✅') || error.startsWith('⚠️') ? error.substring(2) : error}</span>
            <button
              onClick={() => setError('')}
              className="ml-3 text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS for animations and responsive enhancements */}
      <style jsx global>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        
        /* Responsive breakpoints for better control */
        @media (max-width: 375px) {
          .max-xs\\:hidden {
            display: none;
          }
          .xs\\:hidden {
            display: inline-block;
          }
        }
        
        @media (min-width: 376px) {
          .max-xs\\:hidden {
            display: inline-block;
          }
          .xs\\:hidden {
            display: none;
          }
        }
        
        /* Enhanced mobile card view */
        @media (max-width: 640px) {
          .line-clamp-1,
          .line-clamp-2 {
            -webkit-line-clamp: 2;
          }
          
          .sm\\:min-h-\\[100px\\] {
            min-height: 80px;
          }
        }
        
        /* Tablet optimization */
        @media (min-width: 641px) and (max-width: 1024px) {
          .sm\\:rounded-2xl {
            border-radius: 1rem;
          }
        }
        
        /* Desktop optimization */
        @media (min-width: 1025px) {
          .lg\\:text-left {
            text-align: left;
          }
          .lg\\:justify-end {
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
