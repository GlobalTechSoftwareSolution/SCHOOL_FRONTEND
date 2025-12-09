"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "@/app/components/DashboardLayout";

type QuestionType = {
  id: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_option: number;
};

type ExamType = {
  id: number;
  title: string;
  class_id: number;
  class_name?: string;
  section?: string;
  subject_name?: string;
  sub?: string;
  teacher_name?: string;
  sub_teacher?: string;
  exam_details?: {
    questions: QuestionType[];
  };
  questions: QuestionType[];
};

export default function StudentExamPage() {
  const [studentEmail, setStudentEmail] = useState("");
  const [classId, setClassId] = useState<number | null>(null);
  const [exams, setExams] = useState<ExamType[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<any>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Log component render and state values
  console.log("[DEBUG] Component render - studentEmail:", studentEmail, "classId:", classId, "exams:", exams.length, "selectedAnswers:", selectedAnswers);
  
  // Log exams whenever they change
  useEffect(() => {
    console.log("[DEBUG] Exams state updated:", exams);
    if (exams.length > 0) {
      console.log("[DEBUG] First exam details:", exams[0]);
    }
  }, [exams]);

  // 1️⃣ Get student email from localStorage
  useEffect(() => {
    console.log("[DEBUG] Component mounted - Step 1: Getting student email from localStorage");
    const data = localStorage.getItem("userData");
    console.log("[DEBUG] localStorage userData:", data);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        console.log("[DEBUG] Parsed userData:", parsed);
        if (parsed.email) {
          setStudentEmail(parsed.email);
          console.log("[DEBUG] Student email set to:", parsed.email);
        } else {
          console.log("[DEBUG] No email found in userData");
          setError("No email found in user data. Please log in again.");
        }
      } catch (err) {
        console.error("[DEBUG] Error parsing userData:", err);
        setError("Error reading user data. Please log in again.");
      }
    } else {
      console.log("[DEBUG] No userData found in localStorage");
      setError("No user data found. Please log in.");
    }
  }, []);
  
  // 2️⃣ Fetch student info → get class_id
  useEffect(() => {
    console.log("[DEBUG] Step 2: Fetching student info for email:", studentEmail);
    const fetchStudent = async () => {
      if (!studentEmail) {
        console.log("[DEBUG] No student email, skipping student fetch");
        return;
      }

      try {
        console.log("[DEBUG] Making API request to fetch student by email");
        // Use the same approach as student profile page - fetch by email directly
        const res = await axios.get(`http://127.0.0.1:8000/api/students/${studentEmail}/`);
        console.log("[DEBUG] Student API response:", res.data);
        
        const student = res.data;
        console.log("[DEBUG] Found student:", student);

        if (student && student.class_id) {
          console.log("[DEBUG] Setting class ID to:", student.class_id);
          setClassId(student.class_id);
        } else {
          console.log("[DEBUG] No class_id found for student:", student);
          setError("No class assigned to student. Please contact administrator.");
        }
      } catch (err: any) {
        console.error("[DEBUG] Student fetch error:", err);
        setError(`Error fetching student info: ${err.message}`);
      }
    };

    if (studentEmail) {
      fetchStudent();
    }
  }, [studentEmail]);
  
  // 3️⃣ Fetch exams for this class
  useEffect(() => {
    console.log("[DEBUG] Step 3: Fetching exams for class ID:", classId);
    if (!classId) {
      console.log("[DEBUG] No class ID, skipping exam fetch");
      return;
    }

    const fetchExams = async () => {
      try {
        setLoading(true);
        setError("");
        console.log("[DEBUG] Making API request to fetch exams");
        const res = await axios.get("http://127.0.0.1:8000/api/exams/");
        console.log("[DEBUG] Exams API response:", res.data);
        console.log("[DEBUG] Full exams response keys:", Object.keys(res));
        console.log("[DEBUG] Exams response data type:", typeof res.data);
        console.log("[DEBUG] Is exams response array?", Array.isArray(res.data));
        
        // Filter exams for this class
        const filteredExams = res.data.filter(
          (exam: any) => exam.class_id === classId
        );
        console.log("[DEBUG] Filtered exams for class ID", classId, ":", filteredExams);
        
        // Let's also check what endpoints might have questions
        console.log("[DEBUG] Trying alternative approaches to get questions...");
        
        // Fetch detailed exam info (including questions) for each exam
        const detailedExams = await Promise.all(
          filteredExams.map(async (exam: any) => {
            try {
              console.log(`[DEBUG] Fetching detailed info for exam ${exam.id}`);
              const detailRes = await axios.get(`http://127.0.0.1:8000/api/exams/${exam.id}/`);
              console.log(`[DEBUG] Detailed exam ${exam.id} data:`, detailRes.data);
              console.log(`[DEBUG] Detailed exam ${exam.id} data keys:`, Object.keys(detailRes.data));
              console.log(`[DEBUG] Does detailed exam have questions?`, !!detailRes.data.questions, 
                'Questions type:', typeof detailRes.data.questions, 
                'Questions length:', Array.isArray(detailRes.data.questions) ? detailRes.data.questions.length : 'Not an array');
              
              // Log each question if they exist
              if (detailRes.data.questions && Array.isArray(detailRes.data.questions)) {
                console.log(`[DEBUG] Questions for exam ${exam.id}:`, detailRes.data.questions);
              }
              
              // Try to see if there's another endpoint for questions
              try {
                console.log(`[DEBUG] Trying to fetch questions from potential quiz_questions endpoint for exam ${exam.id}`);
                const quizQuestionsRes = await axios.get(`http://127.0.0.1:8000/api/submit_multiple_mcq/?exam_id=${exam.id}`);
                console.log(`[DEBUG] Quiz questions for exam ${exam.id}:`, quizQuestionsRes.data);
              } catch (quizErr: any) {
                console.log(`[DEBUG] No quiz_questions endpoint found for exam ${exam.id}`, quizErr.message);
              }
              
              // Try to see if there's another endpoint for questions
              try {
                console.log(`[DEBUG] Trying to fetch questions from potential mcq endpoint for exam ${exam.id}`);
                const mcqRes = await axios.get(`http://127.0.0.1:8000/api/mcq/?exam_id=${exam.id}`);
                console.log(`[DEBUG] MCQ for exam ${exam.id}:`, mcqRes.data);
              } catch (mcqErr: any) {
                console.log(`[DEBUG] No mcq endpoint found for exam ${exam.id}`, mcqErr.message);
              }
              
              // Merge the detailed info with the basic exam info
              const mergedExam = {
                ...exam,
                ...detailRes.data,
                questions: detailRes.data.questions || []
              };
              console.log(`[DEBUG] Merged exam ${exam.id} data:`, mergedExam);
              console.log(`[DEBUG] Merged exam questions length:`, mergedExam.questions.length);
              return mergedExam;
            } catch (detailErr: any) {
              console.error(`[DEBUG] Error fetching details for exam ${exam.id}:`, detailErr);
              // Return the original exam data if details can't be fetched
              const fallbackExam = {
                ...exam,
                questions: [] // Ensure we always have a questions array
              };
              console.log(`[DEBUG] Using fallback for exam ${exam.id}:`, fallbackExam);
              return fallbackExam;
            }
          })
        );
        
        console.log("[DEBUG] All detailed exams:", detailedExams);
        setExams(detailedExams);
      } catch (err: any) {
        console.error("[DEBUG] Exam fetch error:", err);
        setError(`Error fetching exams: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [classId]);
  
  // 4️⃣ Handle selecting options
  const selectAnswer = (questionId: number, option: number) => {
    console.log("[DEBUG] Selecting answer for question", questionId, "with option", option);
    console.log("[DEBUG] Current selected answers:", selectedAnswers);
    setSelectedAnswers((prev: any) => {
      const newAnswers = {
        ...prev,
        [questionId]: option,
      };
      console.log("[DEBUG] Updated selected answers:", newAnswers);
      return newAnswers;
    });
  };
  
  // 5️⃣ Submit MCQ answers
  const submitAnswers = async (exam: any) => {
    console.log("[DEBUG] Step 5: Submitting answers for exam:", exam);
    console.log("[DEBUG] Current selected answers:", selectedAnswers);
    setLoading(true);

    // Check if exam has questions before proceeding
    // Handle different possible structures for questions
    let questions: QuestionType[] = [];
    if (exam.questions && Array.isArray(exam.questions)) {
      questions = exam.questions;
    } else if (exam.exam_details && exam.exam_details.questions && Array.isArray(exam.exam_details.questions)) {
      questions = exam.exam_details.questions;
    } else {
      console.error("[DEBUG] Exam has no questions or questions is not an array");
      console.log("[DEBUG] Exam structure:", JSON.stringify(exam, null, 2));
      setError("Exam has no questions available.");
      setLoading(false);
      return;
    }

    // If we still don't have questions, try to fetch them
    if (questions.length === 0) {
      console.log("[DEBUG] No questions in memory, trying to fetch...");
      try {
        console.log("[DEBUG] Fetching questions for exam", exam.id);
        const detailRes = await axios.get(`http://127.0.0.1:8000/api/exams/${exam.id}/`);
        console.log("[DEBUG] Fetched exam details:", detailRes.data);
        if (detailRes.data.questions && Array.isArray(detailRes.data.questions)) {
          questions = detailRes.data.questions;
          console.log("[DEBUG] Got questions from API fetch:", questions.length);
        }
      } catch (fetchErr: any) {
        console.error("[DEBUG] Error fetching questions:", fetchErr);
        setError(`Error fetching questions: ${fetchErr.message}`);
      }
    }

    // If still no questions, show error
    if (questions.length === 0) {
      console.error("[DEBUG] Still no questions available after fetching");
      setError("No questions available for this exam.");
      setLoading(false);
      return;
    }

    console.log("[DEBUG] Questions to submit:", questions);
    console.log("[DEBUG] Building payload with", questions.length, "questions");

    const payload = {
      exam_id: exam.id,
      student_email: studentEmail,
      answers: questions.map((q) => {
        const answer = {
          id: q.id,
          student_answer: selectedAnswers[q.id] || 0,
        };
        console.log("[DEBUG] Answer for question", q.id, ":", answer);
        return answer;
      }),
    };

    console.log("[DEBUG] Submit payload:", payload);

    try {
      console.log("[DEBUG] Sending POST request to submit answers");
      // Use POST instead of PATCH as per API requirements
      const response = await axios.post(
        "http://127.0.0.1:8000/api/submit_multiple_mcq/",
        payload
      );
      console.log("[DEBUG] Submit response:", response.data);

      // Check correct/wrong
      console.log("[DEBUG] Evaluating answers");
      const evaluation = questions.map((q) => {
        const studentAns = selectedAnswers[q.id];
        console.log("[DEBUG] Question", q.id, "student answer:", studentAns, "correct option:", q.correct_option);
        return {
          question: q.question || (q as any).question_text,
          correct: q.correct_option === studentAns,
          correct_option: q.correct_option,
          your_answer: studentAns,
        };
      });

      console.log("[DEBUG] Evaluation results:", evaluation);
      setResult(evaluation);
    } catch (err: any) {
      console.error("[DEBUG] Submit error:", err);
      setError(`Error submitting answers: ${err.message}`);
    }

    setLoading(false);
  };
  
  return (
    <DashboardLayout role="students">
      <div className="p-6 text-black">
        <h1 className="text-2xl font-bold mb-4">Student Exams</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!classId && !error && (
          <div className="flex items-center justify-center h-32">
            <div className="text-gray-500">
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                  Loading...
                </div>
              ) : (
                "Loading student information..."
              )}
            </div>
          </div>
        )}

        {exams.map((exam) => (
          <div key={exam.id} className="border p-4 rounded mb-6">
            <h2 className="text-xl font-semibold mb-3">{exam.title}</h2>
            <div className="mb-3 text-sm text-gray-600">
              <p>Subject: {exam.subject_name || exam.sub}</p>
              <p>Class: {exam.class_name} {exam.section && `- ${exam.section}`}</p>
              <p>Teacher: {exam.teacher_name || exam.sub_teacher}</p>
            </div>

            {/* Check if questions exist before mapping */}
            {(() => {
              console.log("[DEBUG] Rendering questions for exam:", exam);
              // Handle different possible structures for questions
              let questions: QuestionType[] = [];
              if (exam.questions && Array.isArray(exam.questions)) {
                questions = exam.questions;
                console.log("[DEBUG] Found questions in exam.questions:", questions.length);
              } else if (exam.exam_details && exam.exam_details.questions && Array.isArray(exam.exam_details.questions)) {
                questions = exam.exam_details.questions;
                console.log("[DEBUG] Found questions in exam.exam_details.questions:", questions.length);
              } else {
                console.log("[DEBUG] No questions found in expected locations");
                console.log("[DEBUG] Exam structure keys:", Object.keys(exam));
                console.log("[DEBUG] Exam full structure:", exam);
              }
              
              console.log("[DEBUG] Final questions array for exam", exam.id, ":", questions);
              console.log("[DEBUG] Questions array length:", questions.length);
              console.log("[DEBUG] Is questions array?", Array.isArray(questions));
              
              // If no questions found, show loading message
              if (questions.length === 0) {
                console.log("[DEBUG] Showing reload button for exam", exam.id);
                return (
                  <div className="mb-4">
                    <p className="text-gray-500 italic">No questions available for this exam.</p>
                    <button 
                      className="mt-2 text-blue-600 underline"
                      onClick={async () => {
                        try {
                          console.log("[DEBUG] Reloading questions for exam", exam.id);
                          
                          // Try multiple approaches to get questions
                          let questionsData = [];
                          
                          // Approach 1: Standard exam detail endpoint
                          try {
                            console.log("[DEBUG] Attempt 1: Standard exam detail endpoint");
                            const detailRes = await axios.get(`http://127.0.0.1:8000/api/exams/${exam.id}/`);
                            console.log("[DEBUG] Standard exam detail response:", detailRes.data);
                            if (detailRes.data.questions && Array.isArray(detailRes.data.questions)) {
                              questionsData = detailRes.data.questions;
                              console.log("[DEBUG] Found questions in standard endpoint:", questionsData.length);
                            }
                          } catch (standardErr: any) {
                            console.log("[DEBUG] Standard endpoint failed:", standardErr.message);
                          }
                          
                          // Approach 2: Quiz questions endpoint
                          if (questionsData.length === 0) {
                            try {
                              console.log("[DEBUG] Attempt 2: Quiz questions endpoint");
                              const quizQuestionsRes = await axios.get(`http://127.0.0.1:8000/api/quiz_questions/?exam_id=${exam.id}`);
                              console.log("[DEBUG] Quiz questions response:", quizQuestionsRes.data);
                              if (Array.isArray(quizQuestionsRes.data)) {
                                questionsData = quizQuestionsRes.data;
                                console.log("[DEBUG] Found questions in quiz_questions endpoint:", questionsData.length);
                              }
                            } catch (quizErr: any) {
                              console.log("[DEBUG] Quiz questions endpoint failed:", quizErr.message);
                            }
                          }
                          
                          // Approach 3: MCQ endpoint
                          if (questionsData.length === 0) {
                            try {
                              console.log("[DEBUG] Attempt 3: MCQ endpoint");
                              const mcqRes = await axios.get(`http://127.0.0.1:8000/api/mcq/?exam_id=${exam.id}`);
                              console.log("[DEBUG] MCQ response:", mcqRes.data);
                              if (Array.isArray(mcqRes.data)) {
                                questionsData = mcqRes.data;
                                console.log("[DEBUG] Found questions in mcq endpoint:", questionsData.length);
                              }
                            } catch (mcqErr: any) {
                              console.log("[DEBUG] MCQ endpoint failed:", mcqErr.message);
                            }
                          }
                          
                          // Approach 4: submit_multiple_mcq endpoint (GET request)
                          if (questionsData.length === 0) {
                            try {
                              console.log("[DEBUG] Attempt 4: submit_multiple_mcq endpoint");
                              const submitRes = await axios.get(`http://127.0.0.1:8000/api/submit_multiple_mcq/?exam_id=${exam.id}`);
                              console.log("[DEBUG] submit_multiple_mcq response:", submitRes.data);
                              if (Array.isArray(submitRes.data)) {
                                questionsData = submitRes.data;
                                console.log("[DEBUG] Found questions in submit_multiple_mcq endpoint:", questionsData.length);
                              }
                            } catch (submitErr: any) {
                              console.log("[DEBUG] submit_multiple_mcq endpoint failed:", submitErr.message);
                            }
                          }
                          
                          // If we found questions, update the state
                          if (questionsData.length > 0) {
                            console.log("[DEBUG] Updating exam with questions:", questionsData.length);
                            // Update the exam in state with the fetched questions
                            setExams(prevExams => {
                              console.log("[DEBUG] Previous exams:", prevExams);
                              const updatedExams = prevExams.map(e => {
                                const updated = e.id === exam.id 
                                  ? {...e, questions: questionsData} 
                                  : e;
                                console.log("[DEBUG] Updated exam:", e.id === exam.id ? updated : "Not this one");
                                return updated;
                              });
                              console.log("[DEBUG] Updated exams array:", updatedExams);
                              return updatedExams;
                            });
                          } else {
                            console.log("[DEBUG] No questions found in any endpoint");
                            setError("No questions found for this exam from any available endpoint.");
                          }
                        } catch (err: any) {
                          console.error("Error fetching questions:", err);
                          setError(`Error fetching questions: ${err.message}`);
                        }
                      }}
                    >
                      Reload Questions
                    </button>
                  </div>
                );
              }
              
              console.log("[DEBUG] Rendering", questions.length, "questions");
              return questions && questions.length > 0 ? (
                questions.map((q) => {
                  console.log("[DEBUG] Rendering question:", q);
                  return (
                  <div key={q.id} className="mb-4">
                    <p className="font-medium">{q.question || (q as any).question_text}</p>

                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {[1, 2, 3, 4].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question_${q.id}`}
                            checked={selectedAnswers[q.id] === opt}
                            onChange={() => selectAnswer(q.id, opt)}
                          />
                          {q[`option_${opt}` as keyof QuestionType] || (q as any)[`option_${opt}`]}
                        </label>
                      ))}
                    </div>
                  </div>
                )})
              ) : (
                <p>No questions available for this exam.</p>
              );
            })()}

            <button
              className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
              onClick={() => submitAnswers(exam)}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Answers"}
            </button>

            {/* Show result */}
            {result && (
              <div className="mt-5 p-4 bg-gray-100 rounded">
                <h3 className="text-lg font-bold mb-2">Result</h3>

                {result.map((r: any, index: number) => (
                  <div
                    key={index}
                    className={`p-2 rounded mb-2 ${
                      r.correct ? "bg-green-200" : "bg-red-200"
                    }`}
                  >
                    <p>
                      <strong>Q:</strong> {r.question}
                    </p>
                    <p>
                      <strong>Your Answer:</strong> {r.your_answer}
                    </p>
                    {!r.correct && (
                      <p>
                        <strong>Correct Answer:</strong> {r.correct_option}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}