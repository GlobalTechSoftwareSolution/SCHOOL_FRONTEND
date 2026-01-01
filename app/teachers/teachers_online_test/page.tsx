"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Image from "next/image";
import DashboardLayout from "@/app/components/DashboardLayout";
import {
  PlusCircle,
  Trash2,
  Eye,
  ChevronRight,
  FileText,
  Users,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Save,
  BookOpen,
  RefreshCw,
  User,
  AlertCircle
} from "lucide-react";

interface Question {
  id?: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_option: number;
}

interface Subject {
  id: number;
  subject_name: string;
  subject_id?: number;
  subject?: number;
  name?: string;
  [key: string]: string | number | boolean | undefined;
}

interface RawClassData {
  id?: number;
  class_id?: number;
  class_name?: string;
  name?: string;
  section?: string;
  sec?: string;
  [key: string]: string | number | boolean | undefined;
}

interface ClassType {
  id: number;
  class_name: string;
  section?: string;
}

interface OnlineTest {
  id: number;
  title: string;
  class_id: number;
  class_name?: string;
  section?: string;
  sub: number;
  sub_teacher: string;
  created_at?: string;
  status?: string;
  correct_option?: number;
}

interface Teacher {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  subject_list?: Subject[];
  [key: string]: unknown;
}

interface StudentAnswer {
  id: number;
  exam_details?: {
    id: number;
    class_name: string;
    section: string;
    subject_name: string;
    teacher_name: string;
    title: string;
    class_id: number;
    sub: number;
    sub_teacher: string;
  };
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_option: number;
  student_email?: string;
  email?: string;
  student_id?: number;
  student?: number | { id?: number };
  student_answer: number | null;
  result: boolean;
  exam: number;
  student_name?: string;
}

interface Student {
  id: number;
  email: string;
  student_email?: string;
  user_email?: string;
  fullname?: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  class_id?: number;
  [key: string]: unknown;
}

interface StudentProfile {
  id?: number | string;
  student_id?: number | string;
  name?: string;
  fullname?: string;
  email?: string;
  profile_picture?: string;
  profile_image?: string;
  image?: string;
  avatar?: string;
  class_id?: number;
  class_name?: string;
  section?: string;
  username?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  admission_date?: string;
  residential_address?: string;
  [key: string]: string | number | boolean | undefined;
}

interface ExamWithDetails extends OnlineTest {
  questions: Question[];
  student_answers?: StudentAnswer[];
}

export default function CreateExamPage() {

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewDetailsLoading, setViewDetailsLoading] = useState<Record<number, boolean>>({});
  // Cache for exam details and student answers to improve performance
  const [examDetailsCache, setExamDetailsCache] = useState<Record<number, ExamWithDetails>>({});
  const [studentAnswersCache, setStudentAnswersCache] = useState<Record<number, StudentAnswer[]>>({});
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  // Store teacher email from API response
  const [teacherEmail, setTeacherEmail] = useState<string | null>(null);

  const [teacherSubjects, setTeacherSubjects] = useState<Subject[]>([]);
  const [allClasses, setAllClasses] = useState<ClassType[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  const [onlineTests, setOnlineTests] = useState<OnlineTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [showExamDetails, setShowExamDetails] = useState(false);

  const [examDetails, setExamDetails] = useState<ExamWithDetails | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<StudentAnswer[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<{
    student_id?: number;
    student_name?: string;
    student_email?: string;
    answers: StudentAnswer[];
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    profile?: StudentProfile;
  } | null>(null);

  const [studentProfiles, setStudentProfiles] = useState<Record<string, StudentProfile | null>>({});
  const [loadingStudentProfile, setLoadingStudentProfile] = useState<string | null>(null);
  const [profileFetchErrors, setProfileFetchErrors] = useState<Record<string, boolean>>({});

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Debug effect to log student profiles changes
  useEffect(() => {

  }, [studentProfiles]);

  const [showStudentDetails, setShowStudentDetails] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    { question: "", option_1: "", option_2: "", option_3: "", option_4: "", correct_option: 1 },
  ]);

  // --------------------------- Fetch Teacher Data ---------------------------
  const fetchTeacherData = useCallback(async (): Promise<{ subjects: Subject[], email: string | null }> => {
    try {
      // Try to get email from multiple sources in localStorage
      const storedUserData = localStorage.getItem("userData");
      const storedUserInfo = localStorage.getItem("userInfo");
      const storedUserEmail = localStorage.getItem("userEmail");
      const storedTeacherEmailSetting = localStorage.getItem("teacher_email");

      let email = "";

      // 1. HIGH PRIORITY: Try to get definitive email from userData or userInfo
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          if (userData.email) email = userData.email;
        } catch (e) {
          console.error("[FETCH TEACHER DATA] Error parsing userData:", e);
        }
      }

      if (!email && storedUserInfo) {
        try {
          const userInfo = JSON.parse(storedUserInfo);
          if (userInfo.email) email = userInfo.email;
        } catch (e) {
          console.error("[FETCH TEACHER DATA] Error parsing userInfo:", e);
        }
      }

      // 2. MEDIUM PRIORITY: Try userEmail
      if (!email && storedUserEmail) {
        email = storedUserEmail;
      }

      // 3. LOW PRIORITY: Try teacher_email (might be stale)
      if (!email && storedTeacherEmailSetting) {
        email = storedTeacherEmailSetting;
      }

      // If still no email, this is not necessarily an error - we can try to fetch all teachers
      if (!email) {
        console.warn("[FETCH TEACHER DATA] Teacher email not found in localStorage, will attempt to fetch all teachers");
      }




      let teacherRes;
      try {
        teacherRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teachers/?email=${email}`);
      } catch (error: unknown) {
        console.error("[FETCH TEACHER DATA] Error fetching teacher data:", error);

        // If there's a CORS error, try a different approach
        if (axios.isAxiosError(error) && (error.response?.status === 403 || error.message?.includes('CORS'))) {

          // Try without the email parameter
          teacherRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/teachers/`);
          // Filter by email
          if (teacherRes.data && Array.isArray(teacherRes.data)) {
            teacherRes.data = teacherRes.data.filter((teacher: Teacher) => teacher.email === email);
          } else {
            teacherRes.data = [];
          }
        } else {
          // Provide fallback data structure

          teacherRes = { data: [{ email: email, subject_list: [] }] };
        }
      }
      const teacher = teacherRes.data && Array.isArray(teacherRes.data)
        ? teacherRes.data.find((t: { email: string; subject_list?: Subject[] }) => t.email === email) || teacherRes.data[0]
        : null;



      setTeacherEmail(email); // Use the DEFINITIVE email from login data

      // Process subjects from teacher API response
      let subjects: Subject[] = [];



      if (teacher) {
        // Handle different possible structures of subject_list
        if (Array.isArray(teacher.subject_list)) {
          // Process each subject to ensure it has the correct structure
          subjects = teacher.subject_list.map((subject: Subject | number | string | null) => {
            if (!subject) return null;

            // Handle case where subject is just an ID/string
            if (typeof subject === 'number' || typeof subject === 'string') {
              return { id: Number(subject), subject_name: `Subject ${subject}` } as Subject;
            }

            // Handle case where subject is an object
            const sId = subject.id || subject.subject_id || subject.subject;
            const sName = subject.subject_name || subject.name || (sId ? `Subject ${sId}` : 'Unknown Subject');

            if (sId) {
              return { id: Number(sId), subject_name: String(sName) } as Subject;
            }
            return null;
          }).filter((s: Subject | null): s is Subject => s !== null && s.id > 0);
        } else {


          // Try to handle different possible structures of subject_list
          // Check if it's an object with subject data
          if (teacher.subject_list && typeof teacher.subject_list === 'object') {
            // Try to extract subject data from the object
            // This might be a single subject or an object with subject properties
            const subjectObj = teacher.subject_list;

            // Check if it has subject properties
            if (subjectObj.id && subjectObj.subject_name) {
              // It's a single subject object
              subjects = [{
                id: Number(subjectObj.id),
                subject_name: String(subjectObj.subject_name)
              }];
            } else {
              // Try to find subject data in the object properties
              const subjectKeys = Object.keys(subjectObj);

              // Try to process each property as a potential subject
              subjects = subjectKeys.map(key => {
                const value = subjectObj[key];
                if (typeof value === 'object' && value !== null && value.id && value.subject_name) {
                  return {
                    id: Number(value.id),
                    subject_name: String(value.subject_name)
                  } as Subject;
                }
                return null;
              }).filter((s): s is Subject => s !== null);
            }
          }
        }
      } else {

      }


      const validSubjects = subjects.filter((s) => s && s.id);


      setTeacherSubjects(validSubjects);

      if (validSubjects.length > 0) {
        setSubject(validSubjects[0].id);
      }

      return { subjects: validSubjects, email: email };
    } catch (err) {
      console.error("Error fetching teacher subjects:", err);
      setTeacherSubjects([]);
      setSubject(null);
      return { subjects: [], email: null };
    }
  }, []);  // --------------------------- Fetch All Classes ---------------------------
  const fetchAllClasses = useCallback(async (): Promise<ClassType[]> => {
    try {
      let classRes;
      try {
        classRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/classes/`);
      } catch (error: unknown) {
        console.error("[FETCH ALL CLASSES] Error fetching classes:", error);

        // If there's a CORS error, provide empty data
        if (axios.isAxiosError(error) && (error.response?.status === 403 || error.message?.includes('CORS'))) {

          classRes = { data: [] };
        } else {
          throw error;
        }
      }

      const allClassesData = classRes.data
        .filter((c: RawClassData) => c && (c.id || c.class_id))
        .map((c: RawClassData) => ({
          id: c.id || c.class_id,
          class_name: c.class_name || c.name || `Class ${c.id || c.class_id}`,
          section: c.section || c.sec || null,
        }));

      setAllClasses(allClassesData);
      return allClassesData;
    } catch (err) {
      console.error("Error fetching all classes:", err);
      setAllClasses([]);
      return [];
    }
  }, []);

  // --------------------------- Fetch Online Tests ---------------------------
  const fetchOnlineTests = useCallback(async (emailToUse?: string, subjectsToUse?: Subject[]): Promise<OnlineTest[]> => {
    try {
      // First try to get teacher email from arguments, then from state, then from localStorage as fallback
      let email = emailToUse || teacherEmail;

      if (!email) {
        // Try to get email from localStorage as fallback
        const storedUserData = localStorage.getItem("userData");
        const storedUserEmail = localStorage.getItem("userEmail");

        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            email = userData.email;
          } catch (e) {
            console.error("[FETCH ONLINE TESTS] Error parsing userData:", e);
          }
        }

        if (!email && storedUserEmail) {
          email = storedUserEmail;
        }
      }

      if (!email) {
        // Even without email, try to fetch all exams and filter on client side if needed
        let testsRes;
        try {
          testsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/`);
        } catch (error: unknown) {
          console.error("[FETCH ONLINE TESTS] Error fetching all online tests:", error);

          // If there's a CORS error, provide empty data
          if (axios.isAxiosError(error) && (error.response?.status === 403 || error.message?.includes('CORS'))) {
            testsRes = { data: [] };
          } else {
            throw error;
          }
        }

        // If we have data, set all tests
        const allTestsData = testsRes.data || [];
        setOnlineTests(allTestsData);
        return allTestsData;
      }

      let testsRes;
      try {
        testsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/?sub_teacher=${email}`);
      } catch (error: unknown) {
        console.error("[FETCH ONLINE TESTS] Error fetching online tests:", error);

        // If there's a CORS error, provide empty data
        if (axios.isAxiosError(error) && (error.response?.status === 403 || error.message?.includes('CORS'))) {
          testsRes = { data: [] };
        } else {
          // Fallback: try to fetch all exams and filter by email
          try {
            const allTestsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/`);
            const filteredTests = allTestsRes.data.filter((test: OnlineTest) =>
              test.sub_teacher === email
            );
            setOnlineTests(filteredTests);
            return filteredTests;
          } catch (fallbackError) {
            console.error("[FETCH ONLINE TESTS] Fallback also failed:", fallbackError);
            throw error;
          }
        }
      }
      const testsData = testsRes?.data || [];

      // Filter exams to only show those for subjects the teacher teaches
      const subjects = subjectsToUse || teacherSubjects;
      const teacherSubjectIds = subjects.map(s => s.id);
      const filteredTests = teacherSubjectIds.length > 0
        ? testsData.filter((test: OnlineTest) => teacherSubjectIds.includes(test.sub))
        : testsData;

      setOnlineTests(filteredTests);
      return filteredTests;
    } catch (err) {
      console.error("Error fetching online tests:", err);
      // Fallback: try to fetch all exams if specific search fails
      try {
        const allTestsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/`);
        const allTestsData = allTestsRes.data || [];
        // Extract email for filtering
        const emailToSearch = emailToUse || teacherEmail || localStorage.getItem("teacher_email");

        const filteredTests = allTestsData.filter((test: OnlineTest) =>
          test.sub_teacher === emailToSearch
        );
        setOnlineTests(filteredTests);
        return filteredTests;
      } catch (fallbackError) {
        console.error("[FETCH ONLINE TESTS] Fallback also failed:", fallbackError);
        setOnlineTests([]);
        return [];
      }
    }
  }, [teacherEmail, teacherSubjects]);

  // --------------------------- Fetch Exam Details (with caching) ---------------------------
  const fetchExamDetails = async (examId: number): Promise<ExamWithDetails | null> => {
    // Check cache first
    if (examDetailsCache[examId]) {
      setExamDetails(examDetailsCache[examId]);
      return examDetailsCache[examId];
    }

    try {
      let examRes;
      try {
        examRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/${examId}/`);
      } catch (error: unknown) {
        console.error(`[FETCH EXAM DETAILS] Error fetching exam ${examId}:`, error);

        // If there's a CORS error, provide empty data
        if (axios.isAxiosError(error) && (error.response?.status === 403 || error.message?.includes('CORS'))) {
          examRes = { data: {} };
        } else {
          throw error;
        }
      }
      const examData = examRes.data;

      if (!examData.questions || !Array.isArray(examData.questions) || examData.questions.length === 0) {
        try {
          let questionsRes;
          try {
            questionsRes = await axios.get(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/submit_multiple_mcq/?exam_id=${examId}`
            );
          } catch (error: unknown) {
            console.error(`[FETCH EXAM DETAILS] Error fetching questions for exam ${examId}:`, error);

            // If there's a CORS error, provide empty data
            if (axios.isAxiosError(error) && (error.response?.status === 403 || error.message?.includes('CORS'))) {
              questionsRes = { data: { mcq_answers: [] } };
            } else {
              throw error;
            }
          }

          if (questionsRes.data && Array.isArray(questionsRes.data.mcq_answers)) {
            examData.questions = questionsRes.data.mcq_answers.map((item: Question) => ({
              id: item.id,
              question: item.question,
              option_1: item.option_1,
              option_2: item.option_2,
              option_3: item.option_3,
              option_4: item.option_4,
              correct_option: item.correct_option,
            }));
          }
        } catch (questionsError) {
          console.error("Error fetching questions:", questionsError);
          examData.questions = [];
        }
      }

      // Cache the result
      setExamDetailsCache(prev => ({ ...prev, [examId]: examData }));
      setExamDetails(examData);
      return examData;
    } catch (err: unknown) {
      console.error("Error fetching exam details:", err);
      setExamDetails(null);
      return null;
    }
  };

  // --------------------------- Fetch Student Answers (with caching) ---------------------------
  const fetchStudentAnswers = async (examId: number): Promise<StudentAnswer[]> => {
    // Check cache first
    if (studentAnswersCache[examId]) {
      setStudentAnswers(studentAnswersCache[examId]);
      return studentAnswersCache[examId];
    }

    try {
      let testResultsRes;
      try {
        testResultsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/submit_multiple_mcq/?exam_id=${examId}`
        );
      } catch (error: unknown) {
        console.error(`[FETCH STUDENT ANSWERS] Error fetching student answers for exam ${examId}:`, error);

        // If there's a CORS error, provide empty data
        if (axios.isAxiosError(error) && (error.response?.status === 403 || error.message?.includes('CORS'))) {
          testResultsRes = { data: {} };
        } else {
          throw error;
        }
      }
      const testData = testResultsRes.data || {};

      let answersData: StudentAnswer[] = [];

      if (testData.mcq_answers && Array.isArray(testData.mcq_answers)) {
        answersData = testData.mcq_answers;
      } else if (Array.isArray(testData)) {
        answersData = testData;
      } else {
        return [];
      }

      // Group answers by student
      const studentGroups: Record<string, StudentAnswer[]> = {};
      answersData.forEach((answer: StudentAnswer, index: number) => {
        // 1. Try to find student email from various potential fields
        let email = answer.student_email || answer.email;
        const studentId = answer.student_id || (typeof answer.student === 'number' ? answer.student : (answer.student?.id));

        // 2. If no email, try to resolve it from studentId using the allStudents cache
        if (!email && studentId) {
          const foundStudent = allStudents.find((s: { id?: number; student_id?: number; email?: string; student_email?: string; user_email?: string }) => (s.id === studentId || s.student_id === studentId));
          if (foundStudent) {
            email = foundStudent.email || foundStudent.student_email || foundStudent.user_email;
          }
        }

        // 3. Clean up the email for use as a key
        let studentKey = email;
        if (typeof email === 'string' && email.includes('@')) {
          const emailMatch = email.match(/([\w.-]+@[\w.-]+)/);
          if (emailMatch && emailMatch[1]) {
            studentKey = emailMatch[1];
          }
        }

        // Final fallback for missing email/student
        if (!studentKey) {
          studentKey = studentId ? `student_${studentId}` : `unknown_${answer.id || index}`;
        }

        studentKey = studentKey.toLowerCase();


        if (!studentGroups[studentKey]) {
          studentGroups[studentKey] = [];
        }
        studentGroups[studentKey].push(answer);
      });


      const enhancedAnswers: StudentAnswer[] = [];

      Object.entries(studentGroups).forEach(([/*_studentKey*/, studentAnswers]) => {
        const hasSubmissions = studentAnswers.some((ans: StudentAnswer) =>
          ans.student_answer !== null && ans.student_answer !== undefined
        );

        if (hasSubmissions) {
          studentAnswers.forEach((answer: StudentAnswer) => {
            // Re-resolve identifying info for each answer in the group
            let studentEmail = answer.student_email || answer.email;
            const studentId = answer.student_id || (typeof answer.student === 'number' ? answer.student : (answer.student?.id));

            if (!studentEmail && studentId) {
              const foundStudent = allStudents.find((s: { id?: number; student_id?: number; email?: string; student_email?: string; user_email?: string }) => (s.id === studentId || s.student_id === studentId));
              if (foundStudent) {
                studentEmail = foundStudent.email || foundStudent.student_email || foundStudent.user_email;
              }
            }

            if (typeof studentEmail === 'string' && studentEmail.includes('@')) {
              const emailMatch = studentEmail.match(/([\w.-]+@[\w.-]+)/);
              if (emailMatch && emailMatch[1]) {
                studentEmail = emailMatch[1];
              }
            }

            if (studentEmail) studentEmail = studentEmail.toLowerCase();

            const studentName = answer.student_name || (studentEmail ? studentEmail.split('@')[0] : `Student ${studentId || 'Unknown'}`);

            const enhancedAnswer = {
              id: answer.id || 0,
              exam_details: answer.exam_details,
              question: answer.question,
              option_1: answer.option_1,
              option_2: answer.option_2,
              option_3: answer.option_3,
              option_4: answer.option_4,
              correct_option: answer.correct_option || 0,
              student_answer: answer.student_answer !== undefined ? answer.student_answer : null,
              result: answer.result || false,
              exam: answer.exam || examId,
              student_id: studentId,
              student_name: studentName,
              student_email: studentEmail,
              email: studentEmail
            };

            enhancedAnswers.push(enhancedAnswer);
          });
        }
      });


      // Cache the result
      setStudentAnswersCache(prev => ({ ...prev, [examId]: enhancedAnswers }));
      setStudentAnswers(enhancedAnswers);

      // Fetch profiles for all students with emails - USING CACHED DATA
      const studentEmails = Array.from(new Set(
        enhancedAnswers
          .filter(a => a.student_email || a.email)
          .map(a => a.student_email || a.email)
      )) as string[];


      // Fetch profiles in "parallel" from cache
      await Promise.all(studentEmails.map(email => {
        if (email && !studentProfiles[email.toLowerCase()] && !profileFetchErrors[email.toLowerCase()]) {
          return fetchStudentProfile(email);
        }
        return Promise.resolve();
      }));

      return enhancedAnswers;
    } catch (err: unknown) {
      console.error("Error fetching student answers:", err);
      setStudentAnswers([]);
      return [];
    }
  }

  // --------------------------- Fetch Student Profile (UPDATED FOR YOUR API) ---------------------------
  const fetchStudentProfile = async (email: string): Promise<StudentProfile | null> => {
    // Clean the email if it contains extra text
    // Clean and lowercase the email
    let cleanEmail = email;
    if (typeof email === 'string' && email.includes('@')) {
      const emailMatch = email.match(/([\w.-]+@[\w.-]+)/);
      if (emailMatch && emailMatch[1]) {
        cleanEmail = emailMatch[1];
      }
    }
    cleanEmail = cleanEmail.toLowerCase();

    // Check cache first
    if (studentProfiles[cleanEmail] !== undefined) {
      return studentProfiles[cleanEmail];
    }

    // Mark as loading
    setLoadingStudentProfile(cleanEmail);

    try {

      let studentData = null;

      // USE CACHED allStudents LIST
      if (allStudents.length > 0) {
        // Find student by email in the cached list
        const foundStudent = allStudents.find((student: Student) => {
          const studentEmail = student.email || student.student_email || student.user_email;
          return studentEmail && studentEmail.toLowerCase() === cleanEmail.toLowerCase();
        });

        if (foundStudent) {
          studentData = foundStudent;
        }
      }

      // If not in cache, fallback to fetching specifically (though we should have fetched all)
      if (!studentData) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/`);
          if (response.data && Array.isArray(response.data)) {
            setAllStudents(response.data); // Update cache
            studentData = response.data.find((student: Student) => {
              const studentEmail = student.email || student.student_email || student.user_email;
              return studentEmail && studentEmail.toLowerCase() === cleanEmail.toLowerCase();
            });
          }
        } catch (error) {
          console.error(`[PROFILE] Error fetching students list for ${cleanEmail}:`, error);
          setProfileFetchErrors(prev => ({ ...prev, [cleanEmail]: true }));
        }
      }

      if (studentData) {
        // Normalize the student data according to your API response
        const normalizedProfile: StudentProfile = {
          id: studentData.id || studentData.student_id,
          student_id: studentData.student_id,
          // Ensure we don't use empty strings for name fields
          name: (studentData.fullname && studentData.fullname.trim() !== '') ? studentData.fullname :
            (studentData.name && studentData.name.trim() !== '') ? studentData.name :
              cleanEmail.split('@')[0],
          fullname: (studentData.fullname && studentData.fullname.trim() !== '') ? studentData.fullname : undefined,
          first_name: (studentData.first_name && studentData.first_name.trim() !== '') ? studentData.first_name : undefined,
          last_name: (studentData.last_name && studentData.last_name.trim() !== '') ? studentData.last_name : undefined,
          email: studentData.email || cleanEmail,
          profile_picture: studentData.profile_picture,
          profile_image: studentData.profile_picture,
          image: studentData.profile_picture,
          avatar: studentData.profile_picture,
          class_id: studentData.class_id,
          class_name: studentData.class_name,
          section: studentData.section,
          phone: studentData.phone,
          date_of_birth: studentData.date_of_birth,
          gender: studentData.gender,
          admission_date: studentData.admission_date,
          residential_address: studentData.residential_address,
          ...studentData
        };


        setStudentProfiles(prev => ({
          ...prev,
          [cleanEmail]: normalizedProfile
        }));

        setLoadingStudentProfile(null);
        return normalizedProfile;
      } else {

        // Create a basic profile from email
        const basicProfile: StudentProfile = {
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          student_id: `temp_${cleanEmail}`,
          student_name: email.split('@')[0],
          fullname: email.split('@')[0]
        };

        setStudentProfiles(prev => ({
          ...prev,
          [cleanEmail]: basicProfile
        }));

        setProfileFetchErrors(prev => ({ ...prev, [cleanEmail]: true }));
        setLoadingStudentProfile(null);
        return basicProfile;
      }
    } catch (error: unknown) {
      console.error(`[PROFILE] Error in fetchStudentProfile for ${email}:`, error);

      // Create a fallback profile
      const fallbackProfile: StudentProfile = {
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        student_id: `unknown_${Date.now()}`,
        student_name: email.split('@')[0],
        fullname: email.split('@')[0]
      };

      setStudentProfiles(prev => ({
        ...prev,
        [cleanEmail]: fallbackProfile
      }));

      setProfileFetchErrors(prev => ({ ...prev, [cleanEmail]: true }));
      setLoadingStudentProfile(null);
      return fallbackProfile;
    }
  };

  // --------------------------- View Exam Details ---------------------------
  const viewExamDetails = async (examId: number) => {
    // Set loading state for this specific exam
    setViewDetailsLoading(prev => ({ ...prev, [examId]: true }));

    setSelectedTest(examId);
    try {
      await fetchExamDetails(examId);
      await fetchStudentAnswers(examId);
      setShowExamDetails(true);
      setShowStudentDetails(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error loading exam details:", error);
    } finally {
      // Clear loading state for this specific exam
      setViewDetailsLoading(prev => ({ ...prev, [examId]: false }));
    }
  };

  // --------------------------- View Student Details ---------------------------
  const viewStudentDetails = async (answers: StudentAnswer[]) => {
    // Clear the current selection first to show it's loading/changing
    setSelectedStudent(null);

    // Ensure we have exam details (for the full question list)
    let currentExam = examDetails;
    if (!currentExam || currentExam.id !== selectedTest) {
      if (selectedTest) {
        currentExam = await fetchExamDetails(selectedTest);
      }
    }

    if (!answers || answers.length === 0) return;

    const firstAnswer = answers[0];

    // Merge provided student answers with full exam questions to ensure none are missing
    const mergedAnswers = [...answers];
    if (currentExam && currentExam.questions) {
      currentExam.questions.forEach(q => {
        const hasAns = answers.find(a => a.question === q.question);
        if (!hasAns) {
          // Add a dummy "unanswered" record for this student
          mergedAnswers.push({
            id: -(q.id || 0), // Negative ID to indicate it's a dummy
            question: q.question,
            option_1: q.option_1,
            option_2: q.option_2,
            option_3: q.option_3,
            option_4: q.option_4,
            correct_option: q.correct_option,
            student_answer: null,
            result: false,
            exam: selectedTest || 0,
            student_name: firstAnswer.student_name,
            student_email: firstAnswer.student_email,
            email: firstAnswer.email
          } as StudentAnswer);
        }
      });
    }

    const totalQuestions = mergedAnswers.length;
    const correctAnswers = mergedAnswers.filter(a => a.result).length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Extract clean email
    const rawEmail = firstAnswer.student_email || firstAnswer.email;
    let emailToUse = rawEmail;
    if (typeof rawEmail === 'string' && rawEmail.includes('@')) {
      const emailMatch = rawEmail.match(/([\w.-]+@[\w.-]+)/);
      if (emailMatch && emailMatch[1]) {
        emailToUse = emailMatch[1];
      }
    }
    let profile: StudentProfile | undefined = undefined;


    if (emailToUse) {
      const cleanEmail = emailToUse.toLowerCase();
      // Fetch profile if not already loaded
      if (!studentProfiles[cleanEmail]) {
        const fetchedProfile = await fetchStudentProfile(cleanEmail);
        profile = fetchedProfile || undefined;
      } else {
        profile = studentProfiles[cleanEmail] || undefined;
      }
    }

    // Get student name from profile or fallback
    const studentName = (profile?.name && String(profile.name).trim() !== '') ? String(profile.name) :
      (profile?.fullname && String(profile.fullname).trim() !== '') ? String(profile.fullname) :
        (profile?.first_name && String(profile.first_name).trim() !== '') ? String(profile.first_name) :
          firstAnswer.student_name ||
          (emailToUse ? emailToUse.split('@')[0] : 'Unknown Student');


    const studentInfo = {
      student_id: profile?.student_id ? Number(profile.student_id) :
        (profile?.id ? Number(profile.id) : (firstAnswer.student_id || undefined)),
      student_name: studentName,
      student_email: emailToUse,
      fullname: profile?.fullname || undefined,
      answers: mergedAnswers,
      totalQuestions,
      correctAnswers,
      score,
      profile: profile || undefined
    };

    setSelectedStudent(studentInfo);
    setShowStudentDetails(true);
  };

  // --------------------------- Back to Tests List ---------------------------
  const backToTests = () => {
    setShowExamDetails(false);
    setShowStudentDetails(false);
    setSelectedTest(null);
    setSelectedStudent(null);
    setStudentAnswers([]);
    setExamDetails(null);
  };

  // --------------------------- Get Student Groups ---------------------------
  const getStudentGroups = () => {
    const groups: Record<string, StudentAnswer[]> = {};

    studentAnswers.forEach((answer, index) => {
      const rawEmail = (answer.student_email && answer.student_email.trim() !== '') ?
        answer.student_email.trim() :
        (answer.email && answer.email.trim() !== '') ? answer.email.trim() : '';

      // Clean up the email if it contains extra text
      let studentKey = '';
      if (rawEmail && rawEmail.includes('@')) {
        const emailMatch = rawEmail.match(/([\w.-]+@[\w.-]+)/);
        if (emailMatch && emailMatch[1]) {
          studentKey = emailMatch[1];
        } else {
          studentKey = rawEmail;
        }
      } else if (answer.student_id) {
        studentKey = `student_${answer.student_id}`;
      } else {
        studentKey = `student_${answer.id || index}`;
      }


      if (!groups[studentKey]) {
        groups[studentKey] = [];
      }
      groups[studentKey].push(answer);
    });

    return groups;
  };

  // --------------------------- Get Option Text ---------------------------
  const getOptionText = (answer: StudentAnswer, optionNumber: number): string => {
    switch (optionNumber) {
      case 1: return answer.option_1;
      case 2: return answer.option_2;
      case 3: return answer.option_3;
      case 4: return answer.option_4;
      default: return '';
    }
  };

  // --------------------------- Get Student Submission Status ---------------------------
  const getStudentSubmissionStatus = (answers: StudentAnswer[]) => {
    const submittedCount = answers.filter(a => a.student_answer !== null).length;
    const totalCount = answers.length;

    if (submittedCount === 0) return { text: "Not Submitted", color: "bg-red-100 text-red-800" };
    if (submittedCount === totalCount) return { text: "Submitted", color: "bg-green-100 text-green-800" };
    return { text: "Partially Submitted", color: "bg-yellow-100 text-yellow-800" };
  };

  // --------------------------- Get Profile Picture ---------------------------
  const getProfilePicture = (email: string) => {
    if (!email) return null;
    const cleanEmail = email.toLowerCase();
    if (!studentProfiles[cleanEmail]) return null;

    const profile = studentProfiles[cleanEmail];
    return profile?.profile_picture || profile?.profile_image || profile?.image || profile?.avatar;
  };

  // --------------------------- Get Student Name ---------------------------
  const getStudentName = (email: string) => {
    if (!email) return 'Student';
    const cleanEmail = email.toLowerCase();

    if (!studentProfiles[cleanEmail]) {
      return email.split('@')[0] || 'Student';
    }

    const profile = studentProfiles[email];
    // Check for non-empty values in order of preference
    const name = (profile?.name && String(profile.name).trim() !== '') ? String(profile.name) :
      (profile?.fullname && String(profile.fullname).trim() !== '') ? String(profile.fullname) :
        (profile?.first_name && String(profile.first_name).trim() !== '') ? String(profile.first_name) :
          email?.split('@')[0] || 'Student';

    return name;
  };

  // --------------------------- Get Subject Name ---------------------------
  const getSubjectName = (subjectId: number | string) => {
    const sId = Number(subjectId);
    const subject = teacherSubjects.find(s => s.id === sId);
    return subject ? subject.subject_name : `Subject ${sId}`;
  };

  // --------------------------- Get Class Name ---------------------------
  const getClassName = (classId: number | string) => {
    const cId = Number(classId);
    const cls = allClasses.find(c => c.id === cId);
    return cls ? cls.class_name : `Class ${cId}`;
  };

  // --------------------------- Get Student Class Info ---------------------------
  const getStudentClassInfo = (email: string) => {
    if (!email) return null;
    const cleanEmail = email.toLowerCase();
    const profile = studentProfiles[cleanEmail];
    if (!profile) return null;

    if (profile.class_name) return profile.class_name;
    if (profile.class_id) return getClassName(profile.class_id);
    return null;
  };

  // --------------------------- Create Exam ---------------------------
  const createExam = async () => {
    try {
      setSaving(true);

      if (!title.trim()) {
        alert("Please enter an exam title");
        return;
      }
      if (!subject) {
        alert("Please select a subject");
        return;
      }
      if (!selectedClass) {
        alert("Please select a class");
        return;
      }

      for (const q of questions) {
        if (!q.question || !q.option_1 || !q.option_2 || !q.option_3 || !q.option_4) {
          alert("All questions and options must be filled");
          return;
        }
      }

      // Use teacherEmail from API response instead of localStorage
      if (!teacherEmail) {
        alert("Teacher not loaded");
        return;
      }

      const payload = {
        title,
        class_id: selectedClass,
        sub: subject,
        sub_teacher: teacherEmail,
        questions,
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/`, payload);

      alert("Exam Created Successfully!");
      setTitle("");
      setSubject(teacherSubjects[0]?.id || null);
      setSelectedClass(allClasses[0]?.id || null);
      setQuestions([{ question: "", option_1: "", option_2: "", option_3: "", option_4: "", correct_option: 1 }]);

      await fetchOnlineTests();
    } catch (err: unknown) {
      console.error("Error creating exam:", err);
      let errorMessage = "Error creating exam";
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = JSON.stringify(err.response.data);
      }
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // --------------------------- Refresh Tests List ---------------------------
  const refreshTests = async () => {
    setLoading(true);
    // Clear caches when refreshing
    setExamDetailsCache({});
    setStudentAnswersCache({});
    // Refresh teacher data first to ensure we have the latest email
    const teacherData = await fetchTeacherData();
    await fetchOnlineTests(teacherData.email || undefined, teacherData.subjects);
    setLoading(false);
  };
  // --------------------------- Load Teacher + Classes ---------------------------
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        setError(null);

        const [teacherData, classesData, studentsData] = await Promise.all([
          fetchTeacherData(),
          fetchAllClasses(),
          axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/`).catch(() => ({ data: [] }))
        ]);

        if (!isMounted) return;

        // Cache all students
        if (Array.isArray(teacherData.subjects)) {
          // This confirms teacherData is valid
        }

        if (classesData) {
          // Confirm classesData is valid
        }

        const studentList = (studentsData as { data?: Student[] }).data || [];
        setAllStudents(studentList);

        // Use the returned teacher data to fetch tests immediately
        await fetchOnlineTests(teacherData.email || undefined, teacherData.subjects);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please try again later.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchTeacherData, fetchAllClasses]); // eslint-disable-line react-hooks/exhaustive-deps



  // --------------------------- Refresh Tests Effect ---------------------------
  // Reload tests when teacherEmail changes
  useEffect(() => {
    if (teacherEmail) {
      fetchOnlineTests();
    }
  }, [teacherEmail, fetchOnlineTests]);


  // --------------------------- Add / Remove / Update Questions ---------------------------
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", option_1: "", option_2: "", option_3: "", option_4: "", correct_option: 1 },
    ]);
  };
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (i: number, key: keyof Question, value: string | number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [key]: value };
      return updated;
    });
  };

  return (
    <DashboardLayout role="teachers">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Exam Management</h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Create and manage online tests for your students</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={refreshTests}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Refresh</span>
                </button>
                <div className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  <span className="font-medium">{onlineTests.length} Exams</span>
                </div>
              </div>
            </div>
          </div>

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading exam data...</p>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Main content */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Create Exam Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 ml-2 sm:ml-3">Create New Exam</h2>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 sm:mb-4">Exam Information</h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title</label>
                          <input
                            type="text"
                            placeholder="e.g., Mid-Term Mathematics Exam"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <div className="relative">
                              <select
                                value={subject ?? ""}
                                onChange={(e) => setSubject(Number(e.target.value))}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm sm:text-base"
                              >
                                <option value="">Select Subject</option>
                                {teacherSubjects.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.subject_name}
                                  </option>
                                ))}
                              </select>                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronRight className="w-5 h-5 text-gray-400 transform rotate-90" />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <div className="relative">
                              <select
                                value={selectedClass ?? ""}
                                onChange={(e) => setSelectedClass(Number(e.target.value))}
                                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm sm:text-base"
                              >
                                <option value="">Select Class</option>
                                {allClasses.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.class_name}
                                    {c.section && ` - ${c.section}`}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                <ChevronRight className="w-5 h-5 text-gray-400 transform rotate-90" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Questions Section */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Exam Questions</h3>
                        <button
                          onClick={addQuestion}
                          className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 w-fit"
                        >
                          <PlusCircle className="w-4 h-4 mr-1" />
                          <span className="hidden xs:inline">Add Question</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {questions.map((q, i) => (
                          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                              <div className="flex items-center">
                                <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 text-blue-600 rounded-full font-semibold text-xs sm:text-sm">
                                  {i + 1}
                                </span>
                                <h4 className="ml-2 sm:ml-3 font-medium text-gray-900 text-sm sm:text-base">Question #{i + 1}</h4>
                              </div>
                              {questions.length > 1 && (
                                <button
                                  onClick={() => removeQuestion(i)}
                                  className="p-1.5 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                              )}
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                <textarea
                                  placeholder="Enter your question here..."
                                  value={q.question}
                                  onChange={(e) => updateQuestion(i, "question", e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                                />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {[1, 2, 3, 4].map((optionNum) => (
                                  <div key={optionNum}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Option {optionNum}
                                      {q.correct_option === optionNum && (
                                        <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                                          Correct Answer
                                        </span>
                                      )}
                                    </label>
                                    <input
                                      type="text"
                                      placeholder={`Option ${optionNum}`}
                                      value={q[`option_${optionNum}` as keyof Question] as string}
                                      onChange={(e) => updateQuestion(i, `option_${optionNum}` as keyof Question, e.target.value)}
                                      className={`w-full px-3 py-2 sm:px-4 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${q.correct_option === optionNum
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-300'
                                        }`}
                                    />
                                  </div>
                                ))}
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Select Correct Answer</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {[1, 2, 3, 4].map((optionNum) => (
                                    <button
                                      key={optionNum}
                                      onClick={() => updateQuestion(i, "correct_option", optionNum)}
                                      className={`px-2 py-2 sm:px-4 sm:py-3 rounded-lg border transition-all text-xs sm:text-sm ${q.correct_option === optionNum
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                                        }`}
                                    >
                                      Option {optionNum}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 gap-3">
                      <div className="text-sm text-gray-500">
                        {questions.length} question{questions.length !== 1 ? 's' : ''} • Total Marks: {questions.length * 10}
                      </div>
                      <button
                        onClick={createExam}
                        disabled={saving}
                        className="flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-1 sm:mr-2 animate-spin" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1 sm:mr-2" />
                            <span>Create Exam</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Exams List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 ml-2 sm:ml-3">My Exams</h2>
                    </div>
                    <span className="text-sm text-gray-500">{onlineTests.length} total</span>
                  </div>

                  {loading ? (
                    <div className="text-center py-6 sm:py-8">
                      <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 animate-spin mx-auto mb-2 sm:mb-3" />
                      <p className="text-gray-500 text-sm sm:text-base">Loading exams...</p>
                    </div>
                  ) : onlineTests.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">No exams yet</h3>
                      <p className="text-gray-500 text-sm sm:text-base mb-3 sm:mb-4">Create your first exam to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {onlineTests.map((test) => (
                        <div
                          key={test.id}
                          className={`border rounded-xl p-3 sm:p-4 transition-all hover:shadow-md cursor-pointer ${selectedTest === test.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                            }`}
                          onClick={() => viewExamDetails(test.id)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">{test.title}</h3>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              ID: {test.id}
                            </span>
                          </div>

                          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center">
                              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                              <span className="truncate">Subject: {getSubjectName(test.sub)}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                              <span className="truncate">Class: {test.class_name || getClassName(test.class_id)}</span>
                            </div>
                            {test.section && (
                              <div className="flex items-center">
                                <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                                <span className="truncate">Section: {test.section}</span>
                              </div>
                            )}
                            {test.created_at && (
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                                <span>{new Date(test.created_at).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-100">
                            <button
                              className="flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                              disabled={viewDetailsLoading[test.id]}
                            >
                              {viewDetailsLoading[test.id] ? (
                                <>
                                  <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                                  <span>Loading...</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  <span>View Details</span>
                                </>
                              )}
                            </button>
                            {test.status && (
                              <span className={`text-xs px-2 py-1 rounded-full ${test.status === 'active'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-yellow-100 text-yellow-600'
                                }`}>
                                {test.status}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Exam Details Modal */}
          {showExamDetails && examDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
              <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-xs md:max-w-md">{examDetails.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
                        <span className="flex items-center text-gray-600 text-sm">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span>Subject ID: {examDetails.sub}</span>
                        </span>
                        {examDetails.created_at && (
                          <span className="flex items-center text-gray-600 text-sm">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span>Created: {new Date(examDetails.created_at).toLocaleDateString()}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-3">
                        {examDetails.section && (
                          <div className="flex items-center">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
                            <span>Class: {examDetails.class_name || `Class ${examDetails.class_id}`}</span>
                          </div>
                        )}

                        {examDetails.section && (
                          <div className="flex items-center">
                            <span>Section: {examDetails.section}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={backToTests}
                        className="px-4 py-2 sm:px-5 sm:py-2 border border-gray-400 text-gray-800 rounded-xl hover:border-gray-600 hover:bg-gray-50 transition-all text-sm font-medium shadow-sm"
                      >
                        ← Back to Exams
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-grow p-4 sm:p-6 space-y-6 sm:space-y-8">
                  {/* Questions Section */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Exam Questions</h3>
                      <span className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-xs sm:text-sm w-fit">
                        {examDetails.questions?.length || 0} Questions
                      </span>
                    </div>

                    {examDetails.questions && examDetails.questions.length > 0 ? (
                      <div className="space-y-3 sm:space-y-4">
                        {examDetails.questions.map((question, index) => (
                          <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
                            <div className="flex items-start mb-3 sm:mb-4">
                              <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full font-semibold flex-shrink-0 text-xs sm:text-sm">
                                {index + 1}
                              </span>
                              <p className="ml-2 sm:ml-3 font-medium text-gray-900 text-sm sm:text-base">{question.question}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 ml-8 sm:ml-11">
                              {[1, 2, 3, 4].map((optionNum) => (
                                <div
                                  key={optionNum}
                                  className={`p-2 sm:p-3 rounded-lg border ${question.correct_option === optionNum
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 bg-white'
                                    }`}
                                >
                                  <div className="flex items-center">
                                    <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 rounded-full text-xs sm:text-sm ${question.correct_option === optionNum
                                      ? 'bg-green-500 text-white'
                                      : 'bg-gray-100 text-gray-600'
                                      }`}>
                                      {optionNum}
                                    </span>
                                    <span className="text-xs sm:text-sm">{question[`option_${optionNum}` as keyof Question]}</span>
                                    {question.correct_option === optionNum && (
                                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 ml-auto" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        No questions available for this exam.
                      </div>
                    )}
                  </div>

                  {/* Student Answers Section */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Student Submissions</h3>
                      <div className="text-sm text-gray-500">
                        {Object.keys(getStudentGroups()).length} Students Submitted
                      </div>
                    </div>

                    {Object.keys(getStudentGroups()).length === 0 ? (
                      <div className="text-center py-6 sm:py-8 text-gray-500">
                        No student submissions yet.
                      </div>
                    ) : (
                      <>
                        <div className="overflow-hidden border border-gray-200 rounded-xl">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student
                                  </th>
                                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Class
                                  </th>
                                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Questions Answered
                                  </th>
                                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Correct Answers
                                  </th>
                                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Score
                                  </th>
                                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {Object.entries(getStudentGroups()).map(([studentKey, answers]) => {
                                  const firstAnswer = answers[0];
                                  // Extract clean email
                                  const rawEmail = firstAnswer.student_email || firstAnswer.email || studentKey;
                                  let email = rawEmail;
                                  if (typeof rawEmail === 'string' && rawEmail.includes('@')) {
                                    const emailMatch = rawEmail.match(/([\w.-]+@[\w.-]+)/);
                                    if (emailMatch && emailMatch[1]) {
                                      email = emailMatch[1];
                                    }
                                  }


                                  const studentName = getStudentName(email);
                                  const profilePicture = getProfilePicture(email);
                                  const studentClassLabel = getStudentClassInfo(email);
                                  const isProfileLoading = loadingStudentProfile === email;


                                  const submittedCount = answers.filter(a => a.student_answer !== null).length;
                                  const totalQuestions = answers.length;
                                  const correctCount = answers.filter(a => a.result).length;
                                  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
                                  const status = getStudentSubmissionStatus(answers);

                                  return (
                                    <tr key={studentKey} className="hover:bg-gray-50">
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                          <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden bg-blue-100">
                                            {isProfileLoading ? (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                                              </div>
                                            ) : profilePicture ? (
                                              <Image
                                                src={profilePicture}
                                                alt={studentName}
                                                width={40}
                                                height={40}
                                                className="h-8 w-8 sm:h-10 sm:w-10 object-cover"
                                                onError={(e) => {
                                                  (e.target as HTMLImageElement).style.display = 'none';
                                                  const parent = (e.target as HTMLImageElement).parentElement;
                                                  if (parent) {
                                                    const userIcon = document.createElement('div');
                                                    userIcon.className = "w-full h-full flex items-center justify-center";
                                                    userIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user text-blue-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                                                    parent.appendChild(userIcon);
                                                  }
                                                }}
                                              />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="ml-3 sm:ml-4">
                                            <div className="text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[150px] md:max-w-xs">
                                              {isProfileLoading ? "Loading..." : (studentName && studentName.trim() !== '' ? studentName : 'Student')}
                                            </div>
                                            {/* <div className="text-xs text-gray-500">
                                              {profile?.fullname && profile.fullname.trim() !== '' ? profile.fullname : (profile?.name && profile.name.trim() !== '' ? profile.name : 'No full name available')}
                                            </div> */}
                                            {email && !email.startsWith('student_') && (
                                              <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[100px] sm:max-w-[150px] md:max-w-xs">
                                                {email}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {studentClassLabel || 'N/A'}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {submittedCount}/{totalQuestions}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {correctCount}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 sm:px-3 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${score >= 80 ? 'bg-green-100 text-green-800' :
                                          score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                          }`}>
                                          {score}%
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 sm:px-3 sm:py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                          {status.text}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                          onClick={() => viewStudentDetails(answers)}
                                          className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                                        >
                                          View Details
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Summary Statistics */}
                        <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4">
                            <div className="text-xs sm:text-sm font-medium text-blue-700">Total Students</div>
                            <div className="text-xl sm:text-2xl font-bold text-blue-900 mt-1">
                              {Object.keys(getStudentGroups()).length}
                            </div>
                          </div>
                          <div className="bg-green-50 border border-green-100 rounded-xl p-3 sm:p-4">
                            <div className="text-xs sm:text-sm font-medium text-green-700">Average Score</div>
                            <div className="text-xl sm:text-2xl font-bold text-green-900 mt-1">
                              {Object.keys(getStudentGroups()).length > 0
                                ? Math.round(Object.values(getStudentGroups()).reduce((acc, answers) => {
                                  const correctCount = answers.filter(a => a.result).length;
                                  const totalQuestions = answers.length;
                                  return acc + (correctCount / totalQuestions * 100);
                                }, 0) / Object.keys(getStudentGroups()).length)
                                : 0}%
                            </div>
                          </div>
                          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 sm:p-4">
                            <div className="text-xs sm:text-sm font-medium text-purple-700">Total Submissions</div>
                            <div className="text-xl sm:text-2xl font-bold text-purple-900 mt-1">
                              {studentAnswers.length}
                            </div>
                          </div>
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 sm:p-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-700">Completion Rate</div>
                            <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                              {Object.keys(getStudentGroups()).length > 0
                                ? Math.round((Object.values(getStudentGroups()).filter(answers =>
                                  answers.filter(a => a.student_answer !== null).length === answers.length
                                ).length / Object.keys(getStudentGroups()).length) * 100)
                                : 0}%
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student Details Modal */}
          {showStudentDetails && selectedStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
              <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                        {selectedStudent.profile?.profile_picture ? (
                          <Image
                            src={selectedStudent.profile.profile_picture}
                            alt={selectedStudent.student_name || "Studentname"}
                            width={48}
                            height={48}
                            className="h-10 w-10 sm:h-12 sm:w-12 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                const userIcon = document.createElement('div');
                                userIcon.className = "w-full h-full flex items-center justify-center";
                                userIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user text-blue-600"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                                parent.appendChild(userIcon);
                              }
                            }}
                          />
                        ) : (
                          <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate max-w-[150px] sm:max-w-[200px] md:max-w-xs">
                          {selectedStudent.student_name}
                        </h2>
                        <div className="text-gray-600 text-sm sm:text-base">
                          {selectedStudent.student_email && (
                            <div className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-xs">
                              {selectedStudent.student_email}
                            </div>
                          )}
                          {selectedStudent.profile?.student_id && (
                            <div className="text-sm text-gray-500">
                              Student ID: {selectedStudent.profile.student_id}
                            </div>
                          )}
                          {selectedStudent.profile?.class_name && (
                            <div className="text-sm text-gray-500">
                              Class: {selectedStudent.profile.class_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setShowStudentDetails(false);
                          setSelectedStudent(null);
                        }}
                        className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm sm:text-base"
                      >
                        Back to Exam
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-grow p-4 sm:p-6">
                  {/* Performance Summary */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Performance Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 sm:p-4">
                        <div className="text-xs sm:text-sm font-medium text-blue-700">Total Questions</div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-900 mt-1">
                          {selectedStudent.totalQuestions}
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-xl p-3 sm:p-4">
                        <div className="text-xs sm:text-sm font-medium text-green-700">Correct Answers</div>
                        <div className="text-xl sm:text-2xl font-bold text-green-900 mt-1">
                          {selectedStudent.correctAnswers}
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3 sm:p-4">
                        <div className="text-xs sm:text-sm font-medium text-red-700">Incorrect Answers</div>
                        <div className="text-xl sm:text-2xl font-bold text-red-900 mt-1">
                          {selectedStudent.totalQuestions - selectedStudent.correctAnswers}
                        </div>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 sm:p-4">
                        <div className="text-xs sm:text-sm font-medium text-purple-700">Score</div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-900 mt-1">
                          {selectedStudent.score}%
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 sm:mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1 sm:mb-2">
                        <span>Exam Progress</span>
                        <span>{selectedStudent.score}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <div
                          className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-300"
                          style={{ width: `${selectedStudent.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Question-wise Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Question-wise Analysis</h3>
                    <div className="space-y-4 sm:space-y-6">
                      {selectedStudent.answers.map((answer, index) => (
                        <div key={answer.id || index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5">
                          <div className="flex items-start mb-3 sm:mb-4">
                            <span className="inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 text-white rounded-full font-semibold flex-shrink-0 text-xs sm:text-sm">
                              {index + 1}
                            </span>
                            <div className="ml-2 sm:ml-3 flex-1">
                              <p className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{answer.question}</p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {[1, 2, 3, 4].map((optionNum) => {
                                  const isCorrectOption = answer.correct_option === optionNum;
                                  const isStudentAnswer = answer.student_answer === optionNum;

                                  return (
                                    <div
                                      key={optionNum}
                                      className={`p-2 sm:p-3 rounded-lg border ${isCorrectOption && isStudentAnswer
                                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                        : isCorrectOption
                                          ? 'border-green-500 bg-green-50'
                                          : isStudentAnswer
                                            ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                                            : 'border-gray-200 bg-white'
                                        }`}
                                    >
                                      <div className="flex items-center">
                                        <span className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 rounded-full text-xs sm:text-sm ${isCorrectOption && isStudentAnswer
                                          ? 'bg-green-500 text-white'
                                          : isCorrectOption
                                            ? 'bg-green-500 text-white'
                                            : isStudentAnswer
                                              ? 'bg-red-500 text-white'
                                              : 'bg-gray-100 text-gray-600'
                                          }`}>
                                          {optionNum}
                                        </span>
                                        <span className="text-xs sm:text-sm">{getOptionText(answer, optionNum)}</span>

                                        {isCorrectOption && (
                                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 ml-auto" />
                                        )}
                                        {isStudentAnswer && !isCorrectOption && (
                                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 ml-auto" />
                                        )}
                                      </div>

                                      {isStudentAnswer && (
                                        <div className="mt-1.5 sm:mt-2 text-xs font-medium">
                                          {isCorrectOption ? (
                                            <span className="text-green-600">✓ You selected the correct answer</span>
                                          ) : (
                                            <span className="text-red-600">✗ You selected this answer</span>
                                          )}
                                        </div>
                                      )}
                                      {!isStudentAnswer && isCorrectOption && (
                                        <div className="mt-1.5 sm:mt-2 text-xs text-gray-500">
                                          Correct answer
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center justify-between pt-2 sm:pt-3 border-t border-gray-200 gap-2">
                                <div>
                                  <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${answer.result
                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                    : answer.student_answer === null
                                      ? 'bg-gray-100 text-gray-800 border border-gray-300'
                                      : 'bg-red-100 text-red-800 border border-red-300'
                                    }`}>
                                    {answer.result ? (
                                      <>
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Correct
                                      </>
                                    ) : answer.student_answer === null ? (
                                      <>
                                        <AlertCircle className="w-3 h-3 mr-1" />
                                        Not Answered
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-3 h-3 mr-1" />
                                        Incorrect
                                      </>
                                    )}
                                  </span>
                                </div>
                                <div className="text-xs sm:text-sm text-gray-500">
                                  {answer.student_answer !== null ? (
                                    <>Student selected: Option {answer.student_answer}</>
                                  ) : (
                                    <>Student did not answer</>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}