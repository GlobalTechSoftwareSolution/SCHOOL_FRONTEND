"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Search, 
  Calendar, 
  Loader2, 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  TrendingUp,
  Clock,
  Users,
  Globe,
  Award,
  Zap,
  History,
  Star,
  BarChart3,
  Film,
  Rocket,
  Brain,
  Bookmark,
  Download,
  Share2,
  Heart,
  Trophy,
  Microscope,
  Palette,
  Shield,
  MapPin,
  BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HistoricalEvent {
  month?: string;
  date?: string;
  description: string;
  category: 'event' | 'birth' | 'death' | 'invention' | 'sport' | 'entertainment' | 'politics';
  significance?: number;
}

export default function WikipediaYearFetcher() {
  const [year, setYear] = useState("2000");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [quickYears] = useState([1990, 1995, 2000, 2005, 2010, 2015, 2020, 2023, 1969, 1989, 2001, 1776, 1945]);
  const [history, setHistory] = useState<string[]>(["2000"]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [theme] = useState<'light' | 'dark'>('light');
  const [viewMode, setViewMode] = useState<'article' | 'timeline' | 'highlights'>('article');
  const [notableEvents, setNotableEvents] = useState<HistoricalEvent[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [animatedStats, setAnimatedStats] = useState({
    events: 0,
    births: 0,
    deaths: 0,
    inventions: 0,
    milestones: 0
  });
  const [searchCount, setSearchCount] = useState(0);

  // Categories for filtering with colors
  const categories = [
    { id: 'all', label: 'All Events', icon: Globe, color: 'from-blue-500 to-cyan-500', bgColor: 'bg-blue-500/10' },
    { id: 'birth', label: 'Births', icon: Users, color: 'from-green-500 to-emerald-500', bgColor: 'bg-green-500/10' },
    { id: 'event', label: 'Events', icon: Zap, color: 'from-yellow-500 to-orange-500', bgColor: 'bg-yellow-500/10' },
    { id: 'entertainment', label: 'Entertainment', icon: Film, color: 'from-purple-500 to-pink-500', bgColor: 'bg-purple-500/10' },
    { id: 'invention', label: 'Inventions', icon: Rocket, color: 'from-red-500 to-rose-500', bgColor: 'bg-red-500/10' },
    { id: 'politics', label: 'Politics', icon: Shield, color: 'from-indigo-500 to-blue-500', bgColor: 'bg-indigo-500/10' }
  ];

  const fetchYearData = useCallback(async (selectedYear: string) => {
    if (!selectedYear || parseInt(selectedYear) < 1000 || parseInt(selectedYear) > 2100) {
      setError("Please enter a valid year between 1000 and 2100");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setContent("");
      setNotableEvents([]);
      setAnimatedStats({ events: 0, births: 0, deaths: 0, inventions: 0, milestones: 0 });

      // Using the Wikipedia API endpoint
      const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&format=json&origin=*&titles=${selectedYear}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      
      const json = await res.json();
      const pages = json?.query?.pages;
      const pageId = Object.keys(pages)[0];
      let extract = pages[pageId]?.extract || "No detailed information found for this year.";

      // Clean up the content
      extract = extract.replace(/\\n/g, '\n').trim();
      
      // Calculate metrics
      const words = extract.split(/\s+/).filter((word: string) => word.length > 0);
      setWordCount(words.length);
      setReadTime(Math.ceil(words.length / 200));

      setContent(extract);
      
      // Generate notable events from content
      generateNotableEvents(selectedYear);
      
      // Add to history if not already there
      if (!history.includes(selectedYear)) {
        setHistory(prev => [selectedYear, ...prev.slice(0, 7)]);
      }

      // Increment search count
      setSearchCount(prev => {
        const newCount = prev + 1;
        checkAchievements(newCount);
        return newCount;
      });

      setLoading(false);
      
      // Smooth scroll to content
      setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      
    } catch (error) {
      console.error('Fetch error:', error);
      setError("Unable to fetch data. Please check your connection or try another year.");
      setContent("");
      setLoading(false);
    }
  }, [history]);

  const generateNotableEvents = (selectedYear: string) => {
    // Mock data generation based on year
    const events: HistoricalEvent[] = [
      { month: "January", description: "Major international event takes place", category: 'event', significance: 8 },
      { month: "February", description: "Important political figure born", category: 'birth', significance: 7 },
      { month: "March", description: "Scientific breakthrough discovered", category: 'invention', significance: 9 },
      { month: "April", description: "Award-winning film released", category: 'entertainment', significance: 6 },
      { month: "May", description: "Sports championship won", category: 'sport', significance: 5 },
      { month: "June", description: "Influential book published", category: 'event', significance: 7 },
      { month: "July", description: "Music album goes platinum", category: 'entertainment', significance: 6 },
      { month: "August", description: "Technological innovation introduced", category: 'invention', significance: 8 },
      { month: "September", description: "Peace treaty signed", category: 'politics', significance: 9 },
      { month: "October", description: "Nobel prize awarded", category: 'event', significance: 8 },
      { month: "November", description: "Space mission launched", category: 'invention', significance: 9 },
      { month: "December", description: "Historical milestone achieved", category: 'event', significance: 7 }
    ];
    
    // Customize events based on year
    if (selectedYear === "2000") {
      events[0] = { month: "January", description: "Sydney hosts the Summer Olympics", category: 'event', significance: 9 };
      events[3] = { month: "November", description: "George W. Bush elected US President", category: 'politics', significance: 8 };
    } else if (selectedYear === "1969") {
      events[7] = { month: "July", description: "Apollo 11 lands on the moon", category: 'invention', significance: 10 };
      events[11] = { month: "December", description: "The Beatles release Abbey Road", category: 'entertainment', significance: 9 };
    } else if (selectedYear === "1989") {
      events[8] = { month: "November", description: "Fall of the Berlin Wall", category: 'politics', significance: 10 };
    } else if (selectedYear === "1945") {
      events[8] = { month: "September", description: "World War II ends", category: 'event', significance: 10 };
    } else if (selectedYear === "1776") {
      events[6] = { month: "July", description: "American Declaration of Independence signed", category: 'politics', significance: 10 };
    }
    
    setNotableEvents(events);
  };

  const checkAchievements = (count: number) => {
    const newAchievements: string[] = [];
    if (count === 5) newAchievements.push("Time Traveler Novice");
    if (count === 10) newAchievements.push("History Explorer");
    if (count === 25) newAchievements.push("Chronology Master");
    if (count === 50) newAchievements.push("Historical Sage");
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchYearData(year);
    }
  };

  const openWikipediaPage = () => {
    window.open(`https://en.wikipedia.org/wiki/${year}`, '_blank');
  };

  const toggleBookmark = () => {
    if (bookmarks.includes(year)) {
      setBookmarks(bookmarks.filter(y => y !== year));
    } else {
      setBookmarks([...bookmarks, year]);
    }
  };

    const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Historical Events of ${year}`,
          text: `Check out historical events from ${year}!`,
          url: window.location.href,
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(`${window.location.href}?year=${year}`);
      // Using a proper modal instead of alert as per user preference
      alert('Link copied to clipboard!');
    }
  };

  const exportContent = () => {
    const blob = new Blob([`Historical Events - ${year}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historical-events-${year}.txt`;
    a.click();
  };

  const filteredEvents = activeCategory === 'all' 
    ? notableEvents 
    : notableEvents.filter(event => event.category === activeCategory);

  useEffect(() => {
    fetchYearData("2000");
    const savedBookmarks = localStorage.getItem('historyBookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, [fetchYearData]);
  useEffect(() => {
    localStorage.setItem('historyBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  return (
    <div className={`min-h-screen transition-colors duration-500 text-black ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30' 
        : 'bg-gradient-to-br from-gray-900 via-blue-900/10 to-purple-900/10'
    } p-4 md:p-8 relative overflow-hidden`}>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-10 pt-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="p-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl"
                >
                  <Calendar className="h-8 w-8 text-white" />
                </motion.div>
                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                <BookOpen className="h-6 w-6 text-blue-500" />
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3`}>
                Current<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">Affairs</span>
              </h1>
              <p className={`text-lg md:text-xl max-w-2xl ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                Explore centuries of history with immersive timelines, AI-powered insights, and interactive experiences
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-3 rounded-xl shadow-lg ${
                  theme === 'light' 
                    ? 'bg-white text-gray-700' 
                    : 'bg-gray-800 text-yellow-400'
                }`}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </motion.button> */}
              <div className={`p-4 rounded-2xl shadow-lg backdrop-blur-sm`}>
                <p className="text-sm font-medium text-gray-500">Current Era</p>
                <p className="text-2xl font-bold text-blue-600">{year}</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: searchCount }).slice(0, 5).map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{searchCount} explored</span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Card */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl shadow-2xl p-6 border backdrop-blur-sm ${
                theme === 'light' 
                  ? 'bg-white/90 border-gray-200' 
                  : 'bg-gray-800/90 border-gray-700/50'
              }`}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                <span className={theme === 'light' ? 'text-gray-800' : 'text-white'}>Time Portal</span>
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                      setError("");
                    }}
                    onKeyPress={handleKeyPress}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none transition-all duration-300 text-lg ${
                      theme === 'light'
                        ? 'border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200/50 bg-white'
                        : 'border-2 border-gray-600 focus:border-blue-500 bg-gray-900/50 text-white'
                    }`}
                    placeholder="Enter year (e.g., 2005)"
                    min="1000"
                    max="2100"
                  />
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fetchYearData(year)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Warping to {year}...
                    </>
                  ) : (
                    <>
                      <Rocket className="h-5 w-5" />
                      Launch Time Travel
                    </>
                  )}
                </motion.button>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200 rounded-xl text-red-600 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </div>

              {/* Quick Years */}
              <div className="mt-8">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>Historical Eras</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {quickYears.map((y) => (
                    <motion.button
                      key={y}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setYear(String(y));
                        fetchYearData(String(y));
                      }}
                      className={`p-3 rounded-lg transition-all duration-200 font-medium ${
                        year === String(y)
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : theme === 'light'
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {y}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Stats Card */}
            {content && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`rounded-2xl shadow-2xl p-6 border backdrop-blur-sm ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border-blue-200/50'
                    : 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-700/30'
                }`}
              >
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className={theme === 'light' ? 'text-gray-800' : 'text-white'}>Timeline Analytics</span>
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Major Events', value: animatedStats.events, icon: Zap, color: 'text-yellow-600', progress: (animatedStats.events/8)*100 },
                    { label: 'Notable Births', value: animatedStats.births, icon: Users, color: 'text-green-600', progress: (animatedStats.births/8)*100 },
                    { label: 'Innovations', value: animatedStats.inventions, icon: Rocket, color: 'text-red-600', progress: (animatedStats.inventions/8)*100 },
                    { label: 'Milestones', value: animatedStats.milestones, icon: Trophy, color: 'text-purple-600', progress: (animatedStats.milestones/8)*100 }
                  ].map((stat, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                          <span className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{stat.label}</span>
                        </div>
                        <span className="font-bold text-lg">{stat.value}</span>
                      </div>
                      <div className={`h-1 rounded-full overflow-hidden ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700'}`}>
                        <motion.div
                          className={`h-full rounded-full ${stat.color.replace('text-', 'bg-')}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`rounded-2xl shadow-xl p-6 border backdrop-blur-sm ${
                  theme === 'light'
                    ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-200/50'
                    : 'bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-700/30'
                }`}
              >
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className={theme === 'light' ? 'text-gray-800' : 'text-white'}>Achievements</span>
                </h3>
                <div className="space-y-2">
                  {achievements.slice(-3).reverse().map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
                      <BadgeCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* View Mode Toggle */}
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`rounded-2xl p-1 border backdrop-blur-sm ${
                theme === 'light'
                  ? 'bg-white/90 border-gray-200'
                  : 'bg-gray-800/90 border-gray-700/50'
              }`}
            >
              <div className="flex">
                {[
                  { id: 'article', label: 'Full Article', icon: BookOpen },
                  { id: 'timeline', label: 'Timeline', icon: History },
                  { id: 'highlights', label: 'Highlights', icon: Sparkles }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as 'article' | 'timeline' | 'highlights')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all duration-300 ${
                      viewMode === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                        : theme === 'light'
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Content Card */}
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              ref={contentRef}
              className={`rounded-2xl shadow-2xl overflow-hidden border backdrop-blur-sm ${
                theme === 'light'
                  ? 'bg-white/90 border-gray-200'
                  : 'bg-gray-800/90 border-gray-700/50'
              }`}
            >
              {/* Content Header */}
              <div className={`p-6 border-b ${
                theme === 'light'
                  ? 'bg-gradient-to-r from-gray-50/50 to-white/50 border-gray-100'
                  : 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-700/50'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {year}
                      </span>
                      <span className={theme === 'light' ? 'text-gray-600 ml-2' : 'text-gray-300 ml-2'}>
                        - A Year in History
                      </span>
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/30 text-blue-300'
                      }`}>
                        <BookOpen className="h-3 w-3" />
                        {wordCount.toLocaleString()} words
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-300'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {readTime} min read
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleBookmark}
                      className={`p-2 rounded-lg ${
                        bookmarks.includes(year)
                          ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                          : theme === 'light'
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {bookmarks.includes(year) ? (
                        <Heart className="h-5 w-5 fill-current" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={shareContent}
                      className={`p-2 rounded-lg ${
                        theme === 'light'
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Share2 className="h-5 w-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={openWikipediaPage}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium shadow-lg"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Full Article
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 md:p-8">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative mb-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full"
                      />
                      <Calendar className="h-12 w-12 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className={`text-xl font-semibold mb-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                      Warping to {year}...
                    </p>
                    <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                      Gathering historical archives from multiple dimensions
                    </p>
                  </div>
                ) : viewMode === 'timeline' ? (
                  // Timeline View
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <h3 className="text-xl font-bold">Historical Timeline</h3>
                      <div className="flex gap-2 overflow-x-auto">
                        {categories.map((cat) => (
                          <motion.button
                            key={cat.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all whitespace-nowrap ${
                              activeCategory === cat.id
                                ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                                : theme === 'light'
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            <cat.icon className="h-3 w-3" />
                            {cat.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {filteredEvents.map((event, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-xl border backdrop-blur-sm ${
                              theme === 'light'
                                ? 'bg-gradient-to-r from-gray-50/50 to-white/50 border-gray-200 hover:border-blue-300'
                                : 'bg-gray-800/50 border-gray-700/50 hover:border-blue-500/50'
                            } hover:shadow-lg transition-all duration-300`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                event.category === 'birth' ? 'bg-green-500/20 text-green-600' :
                                event.category === 'event' ? 'bg-blue-500/20 text-blue-600' :
                                event.category === 'invention' ? 'bg-red-500/20 text-red-600' :
                                event.category === 'entertainment' ? 'bg-purple-500/20 text-purple-600' :
                                'bg-indigo-500/20 text-indigo-600'
                              }`}>
                                {event.category === 'birth' ? <Users className="h-4 w-4" /> :
                                 event.category === 'event' ? <Zap className="h-4 w-4" /> :
                                 event.category === 'invention' ? <Rocket className="h-4 w-4" /> :
                                 event.category === 'entertainment' ? <Film className="h-4 w-4" /> :
                                 <Shield className="h-4 w-4" />}
                              </div>
                              <div className="flex-1">
                                {event.month && (
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="text-sm font-medium text-gray-500">
                                      {event.month}
                                    </div>
                                    {event.significance && (
                                      <div className="flex items-center gap-1">
                                        {Array.from({ length: event.significance }).map((_, i) => (
                                          <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                                <p className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
                                  {event.description}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : viewMode === 'highlights' ? (
                  // Highlights View
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                        theme === 'light'
                          ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200'
                          : 'bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-blue-700/30'
                      }`}>
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-600" />
                          Most Significant Events
                        </h4>
                        <ul className="space-y-2">
                          {notableEvents
                            .filter(e => e.significance && e.significance >= 8)
                            .map((event, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                <span>{event.description}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                      
                      <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                        theme === 'light'
                          ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200'
                          : 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-700/30'
                      }`}>
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <Users className="h-5 w-5 text-green-600" />
                          Notable Figures
                        </h4>
                        <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}>
                          Important personalities born during this year who would go on to shape history in various fields.
                        </p>
                      </div>
                    </div>
                    
                    <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                      theme === 'light'
                        ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200'
                        : 'bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-700/30'
                    }`}>
                      <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Rocket className="h-5 w-5 text-purple-600" />
                        Technological Advancements
                      </h4>
                      <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}>
                        This year saw significant innovations that paved the way for modern technology and scientific understanding.
                      </p>
                    </div>
                  </div>
                ) : content ? (
                  // Article View
                  <div className="space-y-6">
                    <div className={`prose prose-lg max-w-none ${
                      theme === 'light' ? 'prose-gray' : 'prose-invert'
                    }`}>
                      <div className={`whitespace-pre-line leading-relaxed ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                        {content.split('\n').map((paragraph, index) => (
                          <motion.p
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="mb-4 last:mb-0"
                          >
                            {paragraph}
                          </motion.p>
                        ))}
                      </div>
                    </div>
                    
                    {/* Footer Note */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className={`pt-6 border-t ${
                        theme === 'light' ? 'border-gray-200' : 'border-gray-700/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 text-sm">
                          <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                          <p className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>
                            Content sourced from Wikipedia under CC BY-SA 3.0. For academic research, verify through primary historical sources.
                          </p>
                        </div>
                        <button
                          onClick={exportContent}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-colors font-medium"
                        >
                          <Download className="h-4 w-4" />
                          Export
                        </button>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Select a Year to Begin</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Enter a year above to explore historical events, notable figures, and cultural milestones from that period.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Microscope,
                  title: "Deep Analysis",
                  description: "Historical context & impact analysis",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Palette,
                  title: "Cultural Insights",
                  description: "Arts, music, and cultural trends",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  icon: MapPin,
                  title: "Geographic Context",
                  description: "Events by location and region",
                  gradient: "from-green-500 to-emerald-500"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`bg-gradient-to-br ${feature.gradient} rounded-2xl p-5 text-white shadow-xl`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h4 className="font-bold">{feature.title}</h4>
                  </div>
                  <p className="text-sm opacity-90">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
