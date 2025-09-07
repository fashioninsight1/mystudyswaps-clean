import React, { useState, useEffect } from 'react';
import { Book, Target, Trophy } from 'lucide-react';

export function Dashboard() {
  const [assessments, setAssessments] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const [assessmentsRes, statsRes] = await Promise.all([
        fetch('/api/assessments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/users/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const assessmentsData = await assessmentsRes.json();
      const statsData = await statsRes.json();
      
      setAssessments(assessmentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const startAssessment = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/assessments/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: 'Mathematics',
          topic: 'Algebra',
          keyStage: 'KS3',
          numQuestions: 10
        })
      });

      const assessment = await response.json();
      window.location.href = `/assessment/${assessment.id}`;
    } catch (error) {
      console.error('Failed to start assessment:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Study Swaps</h1>
        <p className="text-gray-600">Welcome back! Ready to learn today?</p>
      </header>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Assessments</p>
                <p className="text-2xl font-bold">{stats.assessmentsCompleted}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center">
              <Book className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{Math.round(parseFloat(stats.averageScore))}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <button
            onClick={startAssessment}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Assessment
          </button>
          <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors">
            Upload Study Materials
          </button>
          <button className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Generate Revision Guide
          </button>
        </div>
      </div>
    </div>
  );
}
