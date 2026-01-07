import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend } from 'recharts';
import { LayoutDashboard, BookOpen, Filter, TrendingUp, Award } from 'lucide-react';

// --- بيانات افتراضية ومنهجية المواد ---
const initialData = {
  Economy: {
    name: "Economy",
    assessments: [
      { type: "Quiz 1", weight: 5, obtained: 4 },
      { type: "Quiz 2", weight: 5, obtained: 5 },
      { type: "Quiz 3", weight: 5, obtained: 3 },
      { type: "Quiz 4", weight: 5, obtained: 5 },
      { type: "Quiz 5", weight: 5, obtained: 2 }, // سيتم استبعاد الأقل
      { type: "Midterm", weight: 25, obtained: 22 },
      { type: "Final", weight: 50, obtained: 0 },
    ],
    config: { dropLowestQuiz: true, quizCountToKeep: 4 }
  },
  Math: {
    name: "Math",
    assessments: [
      { type: "Quiz 1", weight: 10, obtained: 8 },
      { type: "Midterm", weight: 40, obtained: 35 },
      { type: "Final", weight: 50, obtained: 0 },
    ],
    config: { dropLowestQuiz: false }
  }
};

const COLORS = ['#D4AF37', '#C0C0C0', '#FFD700', '#808080']; // تدرجات الذهبي والرمادي

export default function GradeDashboard() {
  const [courses, setCourses] = useState(initialData);
  const [selectedCourse, setSelectedCourse] = useState("Economy");
  const [activeTab, setActiveTab] = useState("dashboard");

  // --- منطق الحسابات الذكي ---
  const calculateStats = (courseName) => {
    const course = courses[courseName];
    let quizzes = course.assessments.filter(a => a.type.includes("Quiz"));
    let others = course.assessments.filter(a => !a.type.includes("Quiz"));
    
    let processedQuizzes = [...quizzes];
    if (course.config.dropLowestQuiz) {
      processedQuizzes = quizzes.sort((a, b) => b.obtained - a.obtained).slice(0, course.config.quizCountToKeep);
    }

    const currentTotal = [...processedQuizzes, ...others].reduce((acc, curr) => acc + curr.obtained, 0);
    const maxPossible = [...processedQuizzes, ...others].reduce((acc, curr) => acc + curr.weight, 0);
    const totalWeight = 100;
    const remainingToAplus = 95 - currentTotal;

    return { currentTotal, maxPossible, remainingToAplus, processedQuizzes, others };
  };

  const stats = calculateStats(selectedCourse);

  // --- تلوين الكارد الخاص بـ A+ ---
  const getAplusColor = (rem) => {
    if (rem <= 5) return "text-yellow-500"; // قريب جداً (ذهبي)
    if (rem <= 15) return "text-green-500"; // جيد
    return "text-gray-400"; // بعيد
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-sans">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-800 p-6">
        <h1 className="text-2xl font-bold text-[#D4AF37] mb-10">MY GRADE</h1>
        <nav className="space-y-4">
          <button onClick={() => setActiveTab("dashboard")} className={flex items-center gap-3 w-full p-2 rounded ${activeTab === 'dashboard' ? 'bg-[#D4AF37] text-black' : 'text-gray-400'}}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <div className="pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 mb-2 uppercase">Courses</p>
            {Object.keys(courses).map(name => (
              <button key={name} onClick={() => { setSelectedCourse(name); setActiveTab("courseDetails"); }} 
                className={flex items-center gap-3 w-full p-2 text-sm ${selectedCourse === name ? 'text-[#D4AF37]' : 'text-gray-400'}}>
                <BookOpen size={16} /> {name}
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "dashboard" ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Header / Filter */}
            <div className="col-span-12 flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">نظرة عامة: <span className="text-[#D4AF37]">{selectedCourse}</span></h2>
              <select onChange={(e) => setSelectedCourse(e.target.value)} className="bg-gray-900 border border-[#D4AF37] text-white p-1 rounded">
                {Object.keys(courses).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* 4- مقياس A+ Card */}
            <div className="col-span-3 bg-gray-900 p-6 rounded-xl border border-gray-800 flex flex-col items-center justify-center">
              <Award size={48} className={getAplusColor(stats.remainingToAplus)} />
              <p className="mt-2 text-gray-400 text-sm">باقي لك على A+</p>
              <span className={text-3xl font-bold ${getAplusColor(stats.remainingToAplus)}}>{stats.remainingToAplus}</span>
            </div>

            {/* 1- مقياس أعمال الترم (بدون الفاينل) */}
            <div className="col-span-4 bg-gray-900 p-6 rounded-xl border border-gray-800">
              <p className="text-sm text-gray-400 mb-4">أعمال الفصل (بدون الفاينل)</p>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={[{value: stats.currentTotal}, {value: 50 - stats.currentTotal}]} innerRadius={50} outerRadius={60} startAngle={180} endAngle={0} dataKey="value">
                    <Cell fill="#D4AF37" />
                    <Cell fill="#222" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-2xl font-bold">{stats.currentTotal} / 50</p>
            </div>

            {/* 2- أفضل الكويزات */}
            <div className="col-span-5 bg-gray-900 p-6 rounded-xl border border-gray-800">
              <p className="text-sm text-gray-400 mb-4">تحليل أفضل الكويزات</p>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={stats.processedQuizzes}>
                  <XAxis dataKey="type" hide />
                  <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #D4AF37'}} />
                  <Bar dataKey="obtained" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 3- مقارنة كل المقررات (Bar Chart) */}
            <div className="col-span-12 bg-gray-900 p-6 rounded-xl border border-gray-800">
              <p className="text-sm text-gray-400 mb-4">مقارنة الأداء بين جميع المقررات</p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={Object.keys(courses).map(k => ({name: k, grade: calculateStats(k).currentTotal}))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip cursor={{fill: '#222'}} />
                  <Bar dataKey="grade" fill="#D4AF37" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* الصفحة الثانية: تفاصيل المادة والتعديل */
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-[#D4AF37] uppercase">{selectedCourse} Details</h2>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="pb-4">Assessment Type</th>
                  <th className="pb-4">Total Weight</th>
                  <th className="pb-4">Grade Obtained</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {courses[selectedCourse].assessments.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4">{item.type}</td>
                    <td className="py-4">{item.weight}</td>
                    <td className="py-4">
                      <input 
                        type="number" 
                        value={item.obtained}
                        onChange={(e) => {
                          const newCourses = {...courses};
                          newCourses[selectedCourse].assessments[idx].obtained = parseFloat(e.target.value) || 0;
                          setCourses(newCourses);
                        }}
                        className="bg-black border border-gray-700 text-[#D4AF37] w-20 px-2 py-1 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
