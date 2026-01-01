"use client";

import React, { useEffect, useState, JSX } from "react";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  BookOpen,
  FileText,
  RefreshCw,
  Send,
  Shield,
  Clock,
  Award,
  ChevronRight,
  BarChart3,
  CheckSquare,
  AlertTriangle
} from "lucide-react";
import DashboardLayout from "@/app/components/DashboardLayout";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

type Student = { id: number; email?: string; class_id?: number };
type ExamDetails = { id: number; title?: string; class_id?: number };
type MCQRow = {
  id: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_option?: number | null;
  student_answer?: number | null;
  result?: boolean | null;
  exam_details?: ExamDetails;
  student_email?: string | null;
};

export default function StudentsOnlineTestPage(): JSX.Element {


  const [loggedEmail, setLoggedEmail] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[] | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const [availableExams, setAvailableExams] = useState<{ id: number; title: string }[] | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [examRowsRaw, setExamRowsRaw] = useState<MCQRow[] | null>(null);
  const [uniqueQuestions, setUniqueQuestions] = useState<MCQRow[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [serverAnsweredQuestionIds, setServerAnsweredQuestionIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [fetchingExams, setFetchingExams] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [hasAlreadyTakenTest, setHasAlreadyTakenTest] = useState<boolean>(false);

  /* -------- helpers -------- */
  function readEmailFromLocalStorage(): string | null {
    // 1. Try JSON objects first
    const jsonKeys = ["userData", "userInfo"];
    for (const k of jsonKeys) {
      try {
        const v = localStorage.getItem(k);
        if (v) {
          const parsed = JSON.parse(v);
          if (parsed && parsed.email) return parsed.email;
        }
      } catch {
        // ignore json parse errors
      }
    }

    // 2. Try simple strings
    const keys = ["student_email", "studentEmail", "userEmail", "email"];

    for (const k of keys) {
      try {
        const v = localStorage.getItem(k);

        if (v && v.trim()) return v.trim();
      } catch {
        // Ignore localStorage errors
      }
    }

    return null;
  }

  /* -------- A. read logged email -------- */
  useEffect(() => {
    const e = readEmailFromLocalStorage();
    setLoggedEmail(e);

  }, []);

  /* -------- B. fetch students list -------- */
  useEffect(() => {
    if (!loggedEmail) {

      return;
    }

    setError(null);
    const url = `${API_BASE}/students/`;


    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Students fetch failed (${res.status})`);
        const data = await res.json();

        setStudents(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("❌ Students Error:", err);
        setError("Failed to load students.");
        setStudents(null);
      });
  }, [loggedEmail]);

  /* -------- C. resolve class_id for logged student -------- */
  useEffect(() => {
    if (!students || !loggedEmail) return;
    const me = students.find((s) => (s.email || "").toLowerCase() === loggedEmail.toLowerCase());

    if (!me) {
      setClassId(null);
      setError("Student record not found in students list.");
      return;
    }
    setClassId(Number(me.class_id ?? null) || null);
    setError(null);
  }, [students, loggedEmail]);

  /* -------- D. fetch all MCQs and derive available exams for the class -------- */
  useEffect(() => {
    if (classId == null) {

      return;
    }

    setFetchingExams(true);
    setError(null);

    const url = `${API_BASE}/exams/`;

    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Exams fetch failed (${res.status})`);
        const data = await res.json();

        // Data is expected to be an array of exams
        const allExams = Array.isArray(data) ? data : [];

        // Filter exams by classId
        const myExams = allExams.filter((ex: { id: number; class_id: number; title?: string }) => Number(ex.class_id) === Number(classId));

        const examsArr = myExams.map((ex: { id: number; title?: string }) => ({
          id: ex.id,
          title: ex.title || `Exam ${ex.id}`
        }));

        setAvailableExams(examsArr);

        // Auto-select logic
        if (examsArr.length === 1) {
          setSelectedExamId(examsArr[0].id);
        } else if (examsArr.length > 1) {
          // Default: select the latest one
          const pick = examsArr.reduce((a, b) => (Number(a.id) > Number(b.id) ? a : b)).id;
          setSelectedExamId(pick);
        } else {
          setSelectedExamId(null);
          // Don't set error here, just show empty state UI
        }

        setFetchingExams(false);
      })
      .catch((err) => {
        console.error("❌ Exams fetch error:", err);
        setError("Failed to load exams.");
        setAvailableExams([]);
        setSelectedExamId(null);
        setFetchingExams(false);
      });
  }, [classId]);

  /* -------- E. when selectedExamId changes, fetch exam details via get_all_mcq/?exam_id=ID -------- */
  useEffect(() => {
    if (!selectedExamId) {

      setExamRowsRaw(null);
      setUniqueQuestions([]);
      setAnswers({});
      setServerAnsweredQuestionIds(new Set());
      setHasAlreadyTakenTest(false);
      return;
    }

    setLoading(true);
    setError(null);

    const url = `${API_BASE}/get_all_mcq/?exam_id=${selectedExamId}`;


    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`get_all_mcq GET failed (${res.status})`);
        }
        const data = await res.json();


        const rows: MCQRow[] = Array.isArray(data?.mcq_answers) ? data.mcq_answers : [];

        // 🔒 HARD BLOCK if exam class does not match
        const validRows = rows.filter(
          r => Number(r.exam_details?.class_id) === Number(classId) &&
            Number(r.exam_details?.id) === Number(selectedExamId)
        );

        if (validRows.length === 0) {
          setError("This exam does not belong to your class.");
          setUniqueQuestions([]);
          setExamRowsRaw([]);
          setAnswers({});
          setServerAnsweredQuestionIds(new Set());
          setLoading(false);
          return;
        }

        // Deduplicate by question text but preserve the first encountered row as template
        const seen = new Set<string>();
        const unique: MCQRow[] = [];
        for (const r of validRows) {
          const q = (r.question || "").trim();
          if (!q) continue;
          if (!seen.has(q)) {
            seen.add(q);
            unique.push(r);
          } else {

          }
        }

        // Preload server-stored answers for loggedEmail
        const answeredSet = new Set<number>();
        const preload: Record<number, number> = {};
        // Check raw rows directly with robust matching
        // API returns emails like "std101@school.com (Student) - Approved", so we extract just the email part
        const extractEmail = (s: string | null | undefined): string => {
          const raw = (s || "").trim().toLowerCase();
          // Extract email before space or parenthesis
          const match = raw.match(/^([^\s(]+)/);
          return match ? match[1] : raw;
        };
        const myEmail = extractEmail(loggedEmail);

        // Scan for answers
        if (myEmail) {
          for (const r of rows) {
            const rEmail = extractEmail(r.student_email);

            if (rEmail === myEmail) {
              // Found a row for this student
              // Match to unique question
              const rQ = (r.question || "").trim();
              const match = unique.find((u) => (u.question || "").trim() === rQ);

              if (match && r.student_answer != null) {
                const ans = Number(r.student_answer);
                if (!isNaN(ans)) {
                  preload[match.id] = ans;
                  answeredSet.add(match.id);
                }
              }
            }
          }
        }

        const alreadyTakenTest = Object.keys(preload).length > 0;

        // DEBUG: Log attendance check results
        console.log("🔍 DEBUG - Exam Attendance Check:");
        console.log("   Student Email (from localStorage):", myEmail);
        console.log("   Total rows from API:", rows.length);
        console.log("   Unique questions:", unique.length);
        console.log("   Rows matching student email:", rows.filter(r => extractEmail(r.student_email) === myEmail).length);
        console.log("   Preloaded answers:", preload);
        console.log("   Already taken test:", alreadyTakenTest);
        console.log("   Answered question IDs:", Array.from(answeredSet));




        setExamRowsRaw(rows);
        setUniqueQuestions(unique);
        setAnswers(preload);
        setServerAnsweredQuestionIds(answeredSet);
        setHasAlreadyTakenTest(alreadyTakenTest);

        if (alreadyTakenTest) {
          setShowAnswers(true);
        }

        // Log the status for verification


        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Exam fetch error:", err);
        setError("Failed to load exam data.");
        setExamRowsRaw(null);
        setUniqueQuestions([]);
        setAnswers({});
        setServerAnsweredQuestionIds(new Set());
        setLoading(false);
      });
  }, [selectedExamId, loggedEmail, classId]);

  /* -------- UI actions -------- */
  function handleOptionSelect(questionId: number, option: number) {
    if (serverAnsweredQuestionIds.has(questionId)) {

      return;
    }

    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function submitAnswers() {


    // Double check if test has already been taken before allowing submission
    if (hasAlreadyTakenTest) {

      alert("You have already taken this exam. You cannot submit again.");
      return;
    }

    if (!selectedExamId) {
      alert("No exam selected");
      return;
    }
    if (!loggedEmail) {
      alert("No logged email found in localStorage");
      return;
    }

    // Build answer array using unique question IDs (these are the template IDs we kept)
    const payloadAnswers = uniqueQuestions.map((q) => {
      const student_answer = answers[q.id] ?? null;
      return { id: q.id, student_answer };
    });

    // check unanswered
    const total = payloadAnswers.length;
    const answeredCount = payloadAnswers.filter((a) => a.student_answer != null).length;
    if (answeredCount < total) {
      const proceed = confirm(`You answered ${answeredCount}/${total}. Submit anyway?`);
      if (!proceed) return;
    }

    const payload = {
      exam_id: selectedExamId,
      student_email: loggedEmail,
      answers: payloadAnswers,
    };



    setSubmitting(true);
    setError(null);

    try {
      const url = `${API_BASE}/submit_multiple_mcq/`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);


      if (!res.ok) {
        // Try to parse error message if possible
        const errorMsg = data?.error || data?.message || JSON.stringify(data) || `Status ${res.status}`;

        if (errorMsg.includes("already completed") || errorMsg.includes("duplicate")) {

          setHasAlreadyTakenTest(true);
          alert("You have already completed this exam. Reloading your answers.");
          // Refresh to show answers
          setSelectedExamId((prev) => {
            const cur = prev;
            setTimeout(() => setSelectedExamId(cur), 200);
            return null;
          });
          return;
        }

        setError(`Submit failed: ${errorMsg}`);
        alert(`Submit failed: ${errorMsg}`);
      } else {
        alert("✅ Submitted successfully");
        // Show answers after successful submission
        setShowAnswers(true);
        // Update the already taken state to reflect that the test has been submitted
        setHasAlreadyTakenTest(true);
        // re-fetch exam to show saved answers/results

        setSelectedExamId((prev) => {
          const cur = prev;
          setTimeout(() => setSelectedExamId(cur), 200);
          return null;
        });
      }
    } catch (err) {
      console.error("❌ Submit error:", err);

      // Check if the error is due to duplicate submission
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("duplicate") || errorMessage.includes("already exists") || errorMessage.includes("already completed")) {

        setHasAlreadyTakenTest(true);
        alert("You have already taken this exam. You cannot submit again.");
      } else {
        setError("Failed to submit answers");
        alert("Submit failed — check console");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Calculate progress
  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = uniqueQuestions.length;
  const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  // Calculate score
  const correctAnswers = uniqueQuestions.filter(q => {
    const serverRow = (examRowsRaw || []).find(r => {
      const rEmailRaw = (r.student_email || "").trim().toLowerCase();
      const rEmail = rEmailRaw.match(/^([^\s(]+)/)?.[1] || rEmailRaw;
      const myEmail = (loggedEmail || "").trim().toLowerCase();
      return r.question?.trim() === q.question?.trim() && rEmail === myEmail;
    });
    return serverRow?.result === true;
  }).length;

  /* -------- render -------- */
  return (
    <DashboardLayout role="students">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  Online Examination Platform
                </h1>
                <p className="text-gray-600 text-lg">Complete your assessments with confidence</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm">
                  <User className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Student</p>
                    <p className="font-medium text-gray-900 truncate max-w-[180px]">
                      {loggedEmail?.split('@')[0] || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Class</p>
                    <p className="font-medium text-gray-900">
                      {classId ? `#${classId}` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            {uniqueQuestions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Questions</p>
                      <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Answered</p>
                      <p className="text-2xl font-bold text-green-600">{answeredQuestions}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckSquare className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Progress</p>
                      <p className="text-2xl font-bold text-blue-600">{Math.round(progressPercentage)}%</p>
                    </div>
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {correctAnswers}/{totalQuestions}
                      </p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Award className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Exam Selection Card */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Select Exam</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Exams
                    </label>

                    {fetchingExams ? (
                      <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mr-2" />
                        <span className="text-gray-600">Loading exams...</span>
                      </div>
                    ) : availableExams && availableExams.length === 0 ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                        <p className="text-yellow-800 text-sm">No exams available</p>
                      </div>
                    ) : availableExams && availableExams.length > 0 ? (
                      <div className="space-y-2">
                        <select
                          value={selectedExamId ?? ""}
                          onChange={async (e) => {
                            const v = Number(e.target.value) || null;

                            // If an exam is selected, check if it's already been taken
                            if (v) {


                              // Fetch exam details to check if already taken
                              const url = `${API_BASE}/get_all_mcq/?exam_id=${v}`;
                              try {
                                const res = await fetch(url);
                                if (!res.ok) {
                                  throw new Error(`get_all_mcq GET failed (${res.status})`);
                                }
                                const data = await res.json();

                                const rows: MCQRow[] = Array.isArray(data?.mcq_answers) ? data.mcq_answers : [];

                                // Filter to this classId
                                const validRows = rows.filter(
                                  r => Number(r.exam_details?.class_id) === Number(classId)
                                );

                                // Deduplicate by question text but preserve the first encountered row as template
                                const seen = new Set<string>();
                                const unique: MCQRow[] = [];
                                for (const r of validRows) {
                                  const q = (r.question || "").trim();
                                  if (!q) continue;
                                  if (!seen.has(q)) {
                                    seen.add(q);
                                    unique.push(r);
                                  }
                                }

                                // Check if student has already answered any questions (backend prevents any further submissions)
                                const answeredCount = unique.filter(q => {
                                  const rEmail = (q.student_email || "").toLowerCase();
                                  return rEmail === loggedEmail?.toLowerCase() && q.student_answer != null;
                                }).length;

                                const alreadyTakenTest = unique.length > 0 && answeredCount > 0;


                                if (alreadyTakenTest) {

                                  setHasAlreadyTakenTest(true);
                                  // We allow selection so they can see results
                                } else {

                                  setHasAlreadyTakenTest(false);
                                }
                              } catch (err) {
                                console.error("❌ Error checking exam status:", err);
                                setError("Failed to check exam status.");
                                return; // Don't select the exam if there's an error
                              }
                            }

                            setSelectedExamId(v);
                          }}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                        >
                          <option value="">Select an exam</option>
                          {availableExams.map((ex) => (
                            <option key={ex.id} value={ex.id} className="py-2">
                              {ex.title} (ID: {ex.id})
                            </option>
                          ))}
                        </select>

                        <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Auto-saved on selection
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Progress Section */}
                  {uniqueQuestions.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                        <span>Completion</span>
                        <span>{answeredQuestions}/{totalQuestions}</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-700">{answeredQuestions}</div>
                          <div className="text-xs text-blue-600">Answered</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-700">{totalQuestions - answeredQuestions}</div>
                          <div className="text-xs text-gray-600">Remaining</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls Card */}
              {uniqueQuestions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Exam Controls</h3>
                  <div className="space-y-3">
                    <button
                      onClick={submitAnswers}
                      disabled={submitting || hasAlreadyTakenTest || serverAnsweredQuestionIds.size === totalQuestions}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-200"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : hasAlreadyTakenTest || serverAnsweredQuestionIds.size === totalQuestions ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Already Submitted
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Submit Exam
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setSelectedExamId(prev => {
                        const cur = prev;
                        setTimeout(() => setSelectedExamId(cur), 200);
                        return null;
                      })}
                      className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh Exam
                    </button>

                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Time left: <span className="font-medium">Unlimited</span></span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Secure connection</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {/* Loading State */}
              {loading && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mb-4">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Exam</h3>
                  <p className="text-gray-600">Preparing your assessment....</p>
                </div>
              )}

              {/* No Exam Selected */}
              {!loading && !selectedExamId && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-4">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Exam Selected</h3>
                  <p className="text-gray-600 mb-6">Please select an exam from the sidebar to begin</p>
                  <div className="inline-flex items-center gap-2 text-blue-600">
                    <ChevronRight className="w-4 h-4" />
                    <span>Choose from available exams</span>
                  </div>
                </div>
              )}

              {/* No Questions */}
              {!loading && selectedExamId && uniqueQuestions.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-4">
                    <AlertTriangle className="w-12 h-12 text-yellow-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h3>
                  <p className="text-gray-600">This exam does not contain any questions yet.</p>
                </div>
              )}

              {/* Test Already Taken */}
              {/* Test Already Taken - Removed blocking view to show answers instead */}

              {/* Questions List */}
              {!loading && uniqueQuestions.length > 0 && (
                <div className="space-y-6">
                  {/* Exam Header */}
                  <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">
                          {uniqueQuestions[0]?.exam_details?.title ?? `Exam ${selectedExamId}`}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-300">
                          <span>Exam ID: {selectedExamId}</span>
                          <span>•</span>
                          <span>Questions: {totalQuestions}</span>
                          <span>•</span>
                          <span>Status: {
                            hasAlreadyTakenTest || serverAnsweredQuestionIds.size === totalQuestions
                              ? 'Submitted'
                              : 'In Progress'
                          }</span>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                        <div className="flex items-center gap-2">
                          {hasAlreadyTakenTest || serverAnsweredQuestionIds.size === totalQuestions ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="font-medium">Completed</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 text-yellow-400" />
                              <span className="font-medium">Active</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-red-800">Error</p>
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Questions */}
                  <div className="space-y-4">
                    {uniqueQuestions.map((q, idx) => {
                      const selected = answers[q.id] ?? null;
                      const serverHas = serverAnsweredQuestionIds.has(q.id);
                      const correctOpt = q.correct_option ?? null;
                      const serverRowForMe = (examRowsRaw || []).find((r) => {
                        const rQ = (r.question || "").trim();
                        const qQ = (q.question || "").trim();
                        // Extract email before space/parenthesis (API returns "email@domain.com (Student) - Approved")
                        const rEmailRaw = (r.student_email || "").trim().toLowerCase();
                        const rEmail = rEmailRaw.match(/^([^\s(]+)/)?.[1] || rEmailRaw;
                        const myEmailLower = (loggedEmail || "").trim().toLowerCase();
                        return rQ === qQ && myEmailLower && rEmail === myEmailLower;
                      }); return (
                        <div
                          key={q.id}
                          className={`bg-white rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${serverHas
                            ? serverRowForMe?.result
                              ? 'border-green-200'
                              : 'border-red-200'
                            : 'border-gray-200'
                            }`}
                        >
                          <div className="p-6">
                            {/* Question Header */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${serverHas
                                    ? serverRowForMe?.result
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    <span className="flex items-center gap-2">
                                      <span className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
                                        {idx + 1}
                                      </span>
                                      Question {idx + 1}
                                    </span>
                                  </div>

                                  {serverHas && serverRowForMe?.result != null && (
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium ${serverRowForMe.result
                                      ? 'bg-green-50 text-green-700'
                                      : 'bg-red-50 text-red-700'
                                      }`}>
                                      {serverRowForMe.result ? (
                                        <>
                                          <CheckCircle className="w-3.5 h-3.5" />
                                          Correct
                                        </>
                                      ) : (
                                        <>
                                          <XCircle className="w-3.5 h-3.5" />
                                          Incorrect
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                                  {q.question}
                                </h3>
                              </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                              {[1, 2, 3, 4].map((opt) => {
                                const label = q[`option_${opt}` as keyof MCQRow] as unknown as string;
                                const isChecked = selected === opt;
                                const isCorrect = correctOpt === opt;
                                const isServerAnswer = serverRowForMe?.student_answer === opt;
                                const isWrongServerAnswer = isServerAnswer && !isCorrect;
                                // Only show correct answer after submission
                                const showCorrect = (showAnswers || serverHas) && serverRowForMe?.student_answer != null;

                                return (
                                  <label
                                    key={opt}
                                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isChecked
                                      ? isCorrect && showCorrect
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                      } ${serverHas ? 'cursor-not-allowed' : ''} ${showCorrect && isCorrect ? 'border-green-500 bg-green-50' : ''
                                      }`}
                                  >
                                    <div className="flex items-center h-6 mt-1">
                                      <input
                                        type="radio"
                                        name={`q-${q.id}`}
                                        checked={isChecked}
                                        onChange={() => handleOptionSelect(q.id, opt)}
                                        disabled={serverHas}
                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                      />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${isChecked
                                            ? isCorrect && showCorrect
                                              ? 'bg-green-500 text-white'
                                              : 'bg-blue-500 text-white'
                                            : showCorrect && isCorrect
                                              ? 'bg-green-100 text-green-800 border border-green-300'
                                              : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {String.fromCharCode(64 + opt)}
                                          </div>
                                          <span className={`font-medium ${isChecked ? 'text-gray-900' : 'text-gray-800'
                                            }`}>
                                            {label}
                                          </span>
                                        </div>

                                        {/* Indicators */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {showCorrect && isCorrect && (
                                            <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-lg">
                                              Correct Answer
                                            </span>
                                          )}

                                          {isWrongServerAnswer && showCorrect && (
                                            <span className="px-2.5 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-lg">
                                              Your Answer
                                            </span>
                                          )}

                                          {isChecked && !serverHas && !showCorrect && (
                                            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-lg">
                                              Selected
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>

                            {/* Result Summary */}
                            {serverHas && serverRowForMe && (
                              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Your Choice</p>
                                    <p className="text-xl font-bold text-gray-900">
                                      Option {serverRowForMe.student_answer}
                                    </p>
                                  </div>
                                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Correct Answer</p>
                                    <p className="text-xl font-bold text-green-600">
                                      Option {correctOpt}
                                    </p>
                                  </div>
                                  <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Result</p>
                                    <p className={`text-xl font-bold ${serverRowForMe.result ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                      {serverRowForMe.result ? 'Correct ✓' : 'Incorrect ✗'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Score Summary Card - Only show if already taken */}
                  {hasAlreadyTakenTest && (
                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                          <Award className="w-7 h-7 text-blue-600" />
                          Your Results
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 text-center border border-blue-100">
                          <p className="text-sm text-gray-600 mb-1">Total Questions</p>
                          <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 text-center border border-green-100">
                          <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
                          <p className="text-3xl font-bold text-green-600">{correctAnswers}</p>
                        </div>

                        <div className="bg-white rounded-xl p-4 text-center border border-purple-100">
                          <p className="text-sm text-gray-600 mb-1">Score</p>
                          <p className="text-3xl font-bold text-purple-600">
                            {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-white rounded-xl border border-blue-100">
                        <p className="text-center text-lg font-semibold text-gray-700">
                          Final Score: <span className="text-blue-600">{correctAnswers}</span> out of <span className="text-gray-900">{totalQuestions}</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <p>© {new Date().getFullYear()} Online Examination System</p>
                <p className="mt-1 text-xs">Secure academic assessment platform</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Secured Connection
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  Auto-save Enabled
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}