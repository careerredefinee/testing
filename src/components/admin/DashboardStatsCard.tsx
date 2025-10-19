import { ReactNode } from 'react';

interface DashboardStatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: string;
  link?: string;
}

export const DashboardStatsCard = ({
  title,
  value,
  icon,
  color,
  link
}: DashboardStatsCardProps) => {
  const cardContent = (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {value}
              </div>
            </dd>
          </div>
        </div>
      </div>
      {link && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <a
              href={link}
              className="font-medium text-cyan-700 hover:text-cyan-900"
            >
              View all
            </a>
          </div>
        </div>
      )}
    </div>
  );

  return link ? (
    <a href={link} className="block hover:opacity-90 transition-opacity">
      {cardContent}
    </a>
  ) : (
    cardContent
  );
};

export default DashboardStatsCard;
