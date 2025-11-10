"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import { Calendar, Clock, Users, Trophy, Target, BookOpen, Star, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  category: string;
  participants: number;
  status: "upcoming" | "ongoing" | "completed";
  image: string;
  location?: string;
  organizer?: string;
}

const ActivitiesPage = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data for demonstration
  const sampleActivities: Activity[] = [
    {
      id: 1,
      title: "Annual Science Exhibition",
      description: "Students showcase their innovative science projects and experiments",
      date: "2024-12-15",
      time: "09:00 AM",
      category: "Academic",
      participants: 150,
      status: "upcoming" as const,
      image: "/activities/science.avif",
      location: "School Auditorium",
      organizer: "Science Department"
    },
    {
      id: 2,
      title: "Sports Day Championship",
      description: "Annual inter-house sports competition with various athletic events",
      date: "2024-12-20",
      time: "08:00 AM",
      category: "Sports",
      participants: 300,
      status: "upcoming" as const,
      image: "/activities/sports.png",
      location: "School Ground",
      organizer: "Physical Education Department"
    },
    {
      id: 3,
      title: "Cultural Fest - Harmony 2024",
      description: "Celebrating diversity through music, dance, and drama performances",
      date: "2024-11-30",
      time: "05:00 PM",
      category: "Cultural",
      participants: 200,
      status: "ongoing" as const,
      image: "/activities/fest.avif",
      location: "Open Air Theatre",
      organizer: "Cultural Committee"
    },
    {
      id: 4,
      title: "Coding Competition",
      description: "Programming contest for students to showcase their coding skills",
      date: "2024-11-25",
      time: "02:00 PM",
      category: "Technical",
      participants: 50,
      status: "completed" as const,
      image: "/activities/coding.avif",
      location: "Computer Lab",
      organizer: "Computer Science Department"
    },
    {
      id: 5,
      title: "Art & Craft Exhibition",
      description: "Display of creative artwork and craft items by students",
      date: "2024-12-10",
      time: "11:00 AM",
      category: "Cultural",
      participants: 80,
      status: "upcoming" as const,
      image: "/activities/art.avif",
      location: "Art Gallery",
      organizer: "Art Department"
    },
    {
      id: 6,
      title: "Debate Competition",
      description: "Inter-school debate competition on current topics",
      date: "2024-12-05",
      time: "10:00 AM",
      category: "Academic",
      participants: 40,
      status: "upcoming" as const,
      image: "/activities/debate.avif",
      location: "Conference Hall",
      organizer: "English Department"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setActivities(sampleActivities);
      setLoading(false);
    }, 1000);
  }, []);

  // Get unique categories for filter
  const categories = ["all", ...new Set(activities.map(activity => activity.category))];

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || activity.category === filterCategory;
    const matchesStatus = filterStatus === "all" || activity.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      upcoming: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Calendar },
      ongoing: { color: "bg-green-100 text-green-800 border-green-200", icon: Clock },
      completed: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: Trophy }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      Academic: BookOpen,
      Sports: Target,
      Cultural: Star,
      Technical: Users
    };
    
    const Icon = iconMap[category as keyof typeof iconMap] || Calendar;
    return <Icon className="w-4 h-4" />;
  };


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8 mt-20 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">School Activities</h1>
                <p className="text-gray-600 mt-1">Discover and participate in various school events and activities</p>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4" />
                Add Activity
              </button>
            </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{activities.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-xl font-bold text-blue-600 mt-1">
                  {activities.filter(a => a.status === "upcoming").length}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-green-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ongoing</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {activities.filter(a => a.status === "ongoing").length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-xl font-bold text-purple-600 mt-1">
                  {activities.reduce((sum, a) => sum + a.participants, 0)}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setFilterCategory("all");
                setFilterStatus("all");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map(activity => (
            <div key={activity.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="h-48 relative">
                <img 
                  src={activity.image} 
                  alt={activity.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const nextElement = target.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.classList.remove('hidden');
                    }
                  }}
                />
                <div className="hidden absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      {getCategoryIcon(activity.category)}
                    </div>
                    <h3 className="font-semibold text-gray-900">{activity.category}</h3>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  {getStatusBadge(activity.status)}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-3">{activity.title}</h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{activity.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{activity.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{activity.participants} participants</span>
                  </div>
                  {activity.location && (
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>{activity.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ActivitiesPage;