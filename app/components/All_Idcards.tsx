'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';

import axios from 'axios';
import { Download, IdCardIcon, ShieldCheck, Users } from 'lucide-react';

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

interface IdCardRecord {
  id: number;
  user_email: string;
  user_name: string;
  id_card_url?: string; // Make optional
  pdf_url?: string; // Alternative field name
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
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  defaultEmail: string;
}

const IdCardForm: React.FC<IdCardFormProps> = ({ onSubmit, onCancel, defaultEmail }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError('');
      await onSubmit();
    } catch (err: unknown) {
      console.error('ID card generation failed:', err);
      let errorMessage = 'Unable to generate ID card. The backend service may be experiencing issues. Please contact your administrator or try again later.';
      
      if (axios.isAxiosError(err)) {
        console.error('Axios error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers
        });
        
        // Try to get a more specific error message
        if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response?.data === 'string' && err.response.data.includes('S3Error')) {
          errorMessage = 'Storage error: ID card generation is temporarily unavailable due to file storage issues. Please contact your administrator.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error: ID card generation service is temporarily unavailable. Please try again later.';
        } else if (err.response?.status === 400) {
          errorMessage = 'Invalid request: Please check your information and try again.';
        } else if (err.response?.status === 401) {
          errorMessage = 'Unauthorized: Please log in and try again.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Access denied: You do not have permission to generate ID cards.';
        } else if (err.message) {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Your ID Card</h2>
      <p className="text-gray-600 mb-6">
        Click the button below to automatically generate your digital ID card for the logged-in account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={defaultEmail}
            readOnly
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
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
            {submitting ? 'Generating...' : 'Generate ID Card'}
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

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
        
        const cardsRes = await axios.get<IdCardRecord[]>(`${API_BASE}/id_cards/`, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000 // 10 second timeout
        });
        
        setIdCards(cardsRes.data || []);
        
        // Only fetch students if needed
        try {
          const studentsRes = await axios.get<StudentRecord[]>(`${API_BASE}/students/`, {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 second timeout
          });
          setStudents(studentsRes.data || []);
        } catch (studErr) {
          console.warn('Failed to fetch students:', studErr);
          // Continue even if students fetch fails
        }
      } catch (err: unknown) {
        console.error('ID cards fetch error:', err);
        if (axios.isAxiosError(err)) {
          console.error('Error response:', err.response);
          console.error('Error status:', err.response?.status);
          console.error('Error data:', err.response?.data);
        }
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

  const isStudent = (userRole || '').toLowerCase() === 'student';

  const filteredCards = useMemo(() => {
    if (!userEmail) {
      return [];
    }
    const emailLower = userEmail.toLowerCase();
    const cards = idCards.filter((card) => card.user_email?.toLowerCase() === emailLower);
    return cards;
  }, [idCards, userEmail]);

  const handleCreateCard = async () => {
    try {
      if (!userEmail) {
        throw new Error('No user email found in localStorage. Please log in again.');
      }

      // Use the correct API endpoint for generating ID cards
      await axios.post(`${API_BASE}/id_cards/generate/`, {
        email: userEmail
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 30000 // 30 second timeout
      });

      // Refresh the ID cards list after generation
      const cardsRes = await axios.get<IdCardRecord[]>(`${API_BASE}/id_cards/`, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
      });
      setIdCards(cardsRes.data || []);
      setShowForm(false);
    } catch (err: unknown) {
      console.error('ID card generation error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        response: axios.isAxiosError(err) ? err.response?.data : undefined,
        status: axios.isAxiosError(err) ? err.response?.status : undefined,
        statusText: axios.isAxiosError(err) ? err.response?.statusText : undefined
      });
      // Re-throw so the form can handle it
      throw err;
    }
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
            We couldn&apos;t find a digital ID card linked to your account. Generate one now automatically.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Generate ID Card
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

                  {(card.id_card_url || card.pdf_url) ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(card.id_card_url || card.pdf_url || '');
                          setTimeout(() => {
                            if (previewRef.current) {
                              previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 0);
                        }}
                        className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-white text-purple-700 border border-purple-300 rounded-xl font-semibold shadow-sm hover:shadow-md hover:bg-purple-50 transition-all"
                      >
                        <IdCardIcon className="w-4 h-4" />
                        View ID Card
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = card.id_card_url || card.pdf_url || '';
                          link.download = 'id_card.pdf';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="inline-flex items-center justify-center gap-2 flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download ID Card
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-800">
                        ⚠️ ID card is being generated. Please wait or try regenerating.
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await axios.post(`${API_BASE}/id_cards/generate/`,{ 
                              email: card.user_email 
                            }, {
                              headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                              },
                              timeout: 30000 // 30 second timeout
                            });
                            // Refresh the list
                            const cardsRes = await axios.get<IdCardRecord[]>(`${API_BASE}/id_cards/`, {
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              timeout: 10000 // 10 second timeout
                            });
                            setIdCards(cardsRes.data || []);
                            alert('ID card regeneration started. Please refresh in a moment.');
                          } catch (err: unknown) {
                            console.error('Regeneration error:', err);
                            console.error('Regeneration error details:', {
                              message: err instanceof Error ? err.message : 'Unknown error',
                              response: axios.isAxiosError(err) ? err.response?.data : undefined,
                              status: axios.isAxiosError(err) ? err.response?.status : undefined,
                              statusText: axios.isAxiosError(err) ? err.response?.statusText : undefined
                            });
                            
                            let errorMessage = 'Failed to regenerate ID card. Please try again.';
                            if (axios.isAxiosError(err)) {
                              if (typeof err.response?.data === 'string' && err.response.data.includes('S3Error')) {
                                errorMessage = 'Storage error: ID card regeneration is temporarily unavailable due to file storage issues. Please contact your administrator.';
                              } else if (err.response?.status === 500) {
                                errorMessage = 'Server error: ID card regeneration service is temporarily unavailable.';
                              } else if (err.response?.status === 400) {
                                errorMessage = 'Invalid request: Please check your information.';
                              } else if (err.response?.status === 401) {
                                errorMessage = 'Unauthorized: Please log in again.';
                              } else if (err.response?.status === 403) {
                                errorMessage = 'Access denied: You do not have permission.';
                              } else if (err.response?.data?.detail) {
                                errorMessage = err.response.data.detail;
                              } else if (err.response?.data?.error) {
                                errorMessage = err.response.data.error;
                              } else if (err.response?.data?.message) {
                                errorMessage = err.response.data.message;
                              }
                            }
                            alert(errorMessage);
                          }
                        }}
                        className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        <IdCardIcon className="w-4 h-4" />
                        Regenerate ID Card
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <IdCardForm
          defaultEmail={userEmail}
          onSubmit={handleCreateCard}
          onCancel={() => setShowForm(false)}
        />
      )}

      {previewUrl && (
        <div
          ref={previewRef}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 space-y-4"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-2">ID Card Preview</h2>
          <p className="text-gray-600 text-sm mb-4">
            This is a preview of your ID card. Use the Download ID Card button above if you want to save it.
          </p>
          <div className="w-full aspect-[3/4] max-w-md mx-auto border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <iframe
              src={previewUrl}
              title="ID Card Preview"
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AllIdCards;
