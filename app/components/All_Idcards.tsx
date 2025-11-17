'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Download, IdCardIcon, ShieldCheck, Users } from 'lucide-react';

const API_BASE = 'https://globaltechsoftwaresolutions.cloud/school-api/api';

interface IdCardRecord {
  id: number;
  user_email: string;
  user_name: string;
  id_card_url: string;
  created_at: string;
  updated_at: string;
}

interface StudentRecord {
  email: string;
  fullname: string;
  class_name?: string;
  section?: string;
  class_id?: number;
}

interface IdCardFormProps {
  onSubmit: (data: {
    user_email: string;
    user_name: string;
    id_card_url: string;
  }) => Promise<void>;
  onCancel: () => void;
  defaultName: string;
  defaultEmail: string;
}

const IdCardForm: React.FC<IdCardFormProps> = ({ onSubmit, onCancel, defaultName, defaultEmail }) => {
  const [formData, setFormData] = useState({
    user_name: defaultName,
    user_email: defaultEmail,
    id_card_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_card_url) {
      setError('Please provide a link to your ID card file.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await onSubmit(formData);
    } catch (err: any) {
      console.error('ID card creation failed:', err);
      setError(err?.response?.data?.detail || 'Unable to create ID card. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your ID Card</h2>
      <p className="text-gray-600 mb-6">
        Provide the link to your digital ID card. Our team will review and activate it for you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            readOnly
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="user_email"
            value={formData.user_email}
            onChange={handleChange}
            readOnly
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ID Card URL *</label>
          <input
            type="url"
            name="id_card_url"
            value={formData.id_card_url}
            onChange={handleChange}
            placeholder="https://example.com/your-id-card.pdf"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const AllIdCards = () => {
  const [idCards, setIdCards] = useState<IdCardRecord[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const userInfo =
    (typeof window !== 'undefined' && localStorage.getItem('userInfo')) ||
    (typeof window !== 'undefined' && localStorage.getItem('userData'));
  const parsedUser = userInfo ? JSON.parse(userInfo) : {};
  const userEmail = parsedUser?.email || '';
  const userRole = parsedUser?.role || 'Student';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [cardsRes, studentsRes] = await Promise.all([
          axios.get<IdCardRecord[]>(`${API_BASE}/id_cards/`),
          axios.get<StudentRecord[]>(`${API_BASE}/students/`),
        ]);

        setIdCards(cardsRes.data || []);
        setStudents(studentsRes.data || []);
      } catch (err) {
        console.error('ID cards fetch error:', err);
        setError('Unable to load ID cards. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const studentMap = useMemo(() => {
    const map = new Map<string, StudentRecord>();
    students.forEach((stu) => {
      if (stu?.email) {
        map.set(stu.email.toLowerCase(), stu);
      }
    });
    return map;
  }, [students]);

  const loggedStudent = userEmail ? studentMap.get(userEmail.toLowerCase()) : undefined;
  const isStudent = (userRole || '').toLowerCase() === 'student';

  const filteredCards = useMemo(() => {
    if (!userEmail) return [];
    const emailLower = userEmail.toLowerCase();
    return idCards.filter((card) => card.user_email?.toLowerCase() === emailLower);
  }, [idCards, userEmail]);

  const handleCreateCard = async (payload: {
    user_email: string;
    user_name: string;
    id_card_url: string;
  }) => {
    await axios.post(`${API_BASE}/id_cards/`, payload);
    const cardsRes = await axios.get<IdCardRecord[]>(`${API_BASE}/id_cards/`);
    setIdCards(cardsRes.data || []);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading ID cards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-purple-500 font-semibold">
              Digital Identity
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">ID Card Wallet</h1>
            <p className="text-gray-600 mt-2">
              View and download your verified ID cards. Students see their classmates&apos; cards
              for quick verification.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm bg-purple-50 text-purple-700 px-4 py-2 rounded-full border border-purple-200">
              <ShieldCheck className="w-4 h-4" />
              Secure Access
            </div>
            <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-full border border-blue-200">
              <Users className="w-4 h-4" />
              {isStudent ? 'Classmates Included' : 'Personal'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {filteredCards.length === 0 && !showForm && (
        <div className="text-center bg-white rounded-3xl shadow-lg border border-dashed border-purple-200 p-10">
          <IdCardIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">No ID card found</h3>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find a digital ID card linked to your account. You can request one now.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Create your new card
          </button>
        </div>
      )}

      {filteredCards.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredCards.map((card) => {
            const emailLower = card.user_email?.toLowerCase();
            const studentRecord = emailLower ? studentMap.get(emailLower) : undefined;
            return (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.4em] text-white/80">ID CARD</p>
                      <h3 className="text-2xl font-bold mt-1">{card.user_name || card.user_email}</h3>
                      <p className="text-white/80">{card.user_email}</p>
                    </div>
                    <IdCardIcon className="w-10 h-10 text-white/80" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {studentRecord?.class_name && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Class</span>
                      <span className="font-semibold text-gray-900">{studentRecord.class_name}</span>
                    </div>
                  )}
                  {studentRecord?.section && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Section</span>
                      <span className="font-semibold text-gray-900">{studentRecord.section}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Created</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(card.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <a
                    href={card.id_card_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download ID Card
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <IdCardForm
          defaultEmail={userEmail}
          defaultName={parsedUser?.name || parsedUser?.fullname || 'Student'}
          onSubmit={handleCreateCard}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default AllIdCards;