// --------------------------- Fetch Online Tests ---------------------------
// Commented out unused function due to missing dependencies and integration issues
// const fetchOnlineTests = async (): Promise<OnlineTest[]> => {
    try {
      // Use teacherEmail from API response instead of localStorage
      if (!teacherEmail) {
        console.log("[FETCH ONLINE TESTS] Teacher email not available yet");
        return [];
      }

      console.log("[FETCH ONLINE TESTS] Fetching online tests for email:", teacherEmail);
      let testsRes;
      try {
        testsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exams/?sub_teacher=${teacherEmail}`);
      } catch (error: unknown) {
        console.error("[FETCH ONLINE TESTS] Error fetching online tests:", error);
        
        // If there's a CORS error, provide empty data
        if ((error as { response?: { status?: number } }).response?.status === 403 || 
            (error instanceof Error && error.message && error.message.includes('CORS'))) {
          console.log("[FETCH ONLINE TESTS] CORS error detected, returning empty data");
          testsRes = { data: [] };
        } else {
          throw error;
        }
      }
      const testsData = testsRes.data || [];
      setOnlineTests(testsData);
      return testsData;
    } catch (err) {
      console.error("Error fetching online tests:", err);
      setOnlineTests([]);
      return [];
    }
  // };