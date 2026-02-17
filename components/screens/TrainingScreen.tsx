import { Tab } from '@/components/BottomNav';

const COURSES = [
  { title: 'Blue Screen Presentation', lessons: 8, progress: 100, status: 'Completed' },
  { title: '11 Benefits Illustration', lessons: 5, progress: 60, status: 'In Progress' },
  { title: 'Objection Handling Mastery', lessons: 12, progress: 0, status: 'Start' },
  { title: 'Church Strategy Deep Dive', lessons: 6, progress: 0, status: 'Start' },
];

const STATUS_STYLES: Record<string, string> = {
  Completed: 'bg-green-100 text-green-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Start: 'bg-gray-100 text-gray-600',
};

const PROGRESS_COLOR: Record<string, string> = {
  Completed: 'bg-green-500',
  'In Progress': 'bg-blue-500',
  Start: 'bg-gray-300',
};

const ICON: Record<string, string> = {
  Completed: '✅',
  'In Progress': '📖',
  Start: '📚',
};

export default function TrainingScreen({ onTabChange: _onTabChange }: { onTabChange: (tab: Tab) => void }) {
  const overallProgress = 42;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Training Center</h1>
        <p className="text-gray-500 mt-1">Level up your skills</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-2xl p-7 text-white mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80 mb-1">Overall Progress</p>
          <p className="text-5xl font-bold mb-1">{overallProgress}%</p>
          <p className="text-sm opacity-70">Complete all courses to unlock advanced scripts</p>
          <div className="w-64 bg-white/30 rounded-full h-2.5 mt-4">
            <div className="bg-white h-2.5 rounded-full" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-6xl opacity-30">🎓</p>
        </div>
      </div>

      {/* Course Grid */}
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COURSES.map((course, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-green-100 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ICON[course.status]}</span>
                <div>
                  <p className="font-semibold text-gray-800">{course.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{course.lessons} lessons</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[course.status]}`}>
                {course.status}
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress</span>
                <span className="font-semibold">{course.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${PROGRESS_COLOR[course.status]}`}
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
            {course.status !== 'Completed' && (
              <button className={`mt-4 w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                course.status === 'In Progress'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
                {course.status === 'In Progress' ? 'Continue →' : 'Start Course →'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
