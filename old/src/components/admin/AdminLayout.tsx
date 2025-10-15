import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon as LogoutIcon,
  Bars3Icon as MenuAlt2Icon,
  XMarkIcon as XIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  StarIcon,
  TrophyIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon, current: true },
  { name: 'Users', href: '/admin/users', icon: UsersIcon, current: false },
  // Inline sections on dashboard
  { name: 'Articles', href: '/admin#articles', icon: DocumentTextIcon, current: false },
  { name: 'Courses', href: '/admin#courses', icon: AcademicCapIcon, current: false },
  { name: 'Jobs', href: '/admin#jobs', icon: BriefcaseIcon, current: false },
  { name: 'Bookings', href: '/admin#bookings', icon: CalendarDaysIcon, current: false },
  { name: 'Queries', href: '/admin#queries', icon: ChatBubbleLeftRightIcon, current: false },
  { name: 'Questions', href: '/admin#questions', icon: ChatBubbleLeftRightIcon, current: false },
  { name: 'Reviews', href: '/admin#reviews', icon: StarIcon, current: false },
  { name: 'Resumes', href: '/admin#resumes', icon: DocumentTextIcon, current: false },
  { name: 'Awards', href: '/admin#awards', icon: TrophyIcon, current: false },
  { name: 'Champions', href: '/admin#champions', icon: TrophyIcon, current: false },
  { name: 'Mentors', href: '/admin#mentors', icon: TrophyIcon, current: false },
  { name: 'Brands', href: '/admin#brands', icon: TrophyIcon, current: false },
  { name: 'Materials', href: '/admin/materials', icon: DocumentTextIcon, current: false },
  { name: 'Assessments', href: '/admin/assessments', icon: DocumentTextIcon, current: false },
  { name: 'Premium Users', href: '/admin/premium-users', icon: StarIcon, current: false },
  { name: 'Premium Meetings', href: '/admin/pmeetings', icon: CalendarDaysIcon, current: false },
  { name: 'Groups', href: '/admin/groups', icon: UsersIcon, current: false },
  { name: 'Callbacks', href: '/admin/calls', icon: PhoneIcon, current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Update current nav item based on route and hash (for /admin#section)
  const updatedNavigation = navigation.map(item => {
    let isCurrent = false;
    if (item.href.includes('#')) {
      const [base, hash] = item.href.split('#');
      isCurrent = location.pathname === base && location.hash === `#${hash}`;
    } else {
      isCurrent = location.pathname === item.href;
    }
    return { ...item, current: isCurrent };
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className="md:hidden">
        <div className={`fixed inset-0 flex z-40 ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="fixed inset-0">
            <div className="absolute inset-0 bg-gray-600 opacity-75" onClick={() => setSidebarOpen(false)}></div>
          </div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {updatedNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={classNames(
                        item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-4 h-6 w-6'
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div>
                  <div className="text-base font-medium text-gray-800">
                    {user?.name || 'Admin'}
                  </div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="ml-auto flex-shrink-0 p-1 text-gray-400 hover:text-gray-500"
              >
                <LogoutIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 w-14">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4
            ">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {updatedNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                      'mr-3 h-6 w-6'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="ml-auto flex-shrink-0 p-1 text-gray-400 hover:text-gray-500"
              >
                <LogoutIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <MenuAlt2Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
