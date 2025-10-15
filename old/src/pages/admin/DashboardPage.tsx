import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/adminService';

// Define interfaces for the data structures
interface DashboardStatsData {
  users: number;
  jobs: number;
  courses: number;
  articles: number;
  queries: number;
  questions: number;
  appointments: number;
  reviews: number;
  recentUsers: any[];
  recentQueries: any[];
}

const DashboardPage: React.FC = () => {
  useAuth(); // Hook for auth context, user object can be extracted if needed later
  const location = useLocation();
  const section = location.hash.slice(1);
  const isSectionView = section !== '';

  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [apptActionState, setApptActionState] = useState<Record<string, { meetingLink?: string; message?: string; loading?: 'accept' | 'reject' | null }>>({});

  // Minimal create forms state
  const [courseForm, setCourseForm] = useState({ title: '', description: '', shortDescription: '', price: '', duration: '', level: 'beginner', category: '', pageLink: '' });
  const [courseImage, setCourseImage] = useState<File | null>(null);
  const [articleForm, setArticleForm] = useState({ title: '', summary: '', content: '', tags: '', link: '' });
  const [articleImage, setArticleImage] = useState<File | null>(null);
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', type: 'full-time', category: '', description: '', applicationUrl: '' });
  const [jobLogo, setJobLogo] = useState<File | null>(null);
  const [awardForm, setAwardForm] = useState({ title: '', description: '', issuedBy: '', date: '', category: 'other', isFeatured: false });
  const [awardImage, setAwardImage] = useState<File | null>(null);
  // Brands form (Accreditations & Partners)
  const [brandForm, setBrandForm] = useState({ title: '', type: 'accreditation', text: '', link: '', order: 1, isActive: true });
  const [brandImage, setBrandImage] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  // Champions form
  const [championForm, setChampionForm] = useState({ name: '', company: '', beforeRole: '', afterRole: '', testimonial: '', rating: 5, isFeatured: true, order: 1 });
  const [championImage, setChampionImage] = useState<File | null>(null);
  // Mentors form
  const [mentorForm, setMentorForm] = useState({ name: '', title: '', company: '', bio: '', linkedin: '', isFeatured: true, order: 1, active: true });
  const [mentorImage, setMentorImage] = useState<File | null>(null);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<any | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // State for on-demand bookings
  const [appointments, setAppointments] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', message: '', date: '', timeSlot: '', type: 'consultation' });

  // View resume in modal
  const handleViewResume = async (id: string) => {
    try {
      setResumeLoading(true);
      setResumeModalOpen(true);
      setSelectedResume(null);
      const resp = await adminService.getResumeById(id);
      setSelectedResume(resp?.resume);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      alert(`Failed to load resume. ${msg}`);
      setResumeModalOpen(false);
    } finally {
      setResumeLoading(false);
    }
  };

  // Fetch main dashboard stats on initial load
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isSectionView) return; // Don't load stats in section view
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isSectionView]);

  // Fetch data for the specific section when hash changes
  useEffect(() => {
    const loadSectionData = async () => {
      if (!isSectionView) {
        setData([]);
        return;
      }

      setSectionLoading(true);
      setData([]);
      setError(null);

      try {
        let response: any;
        let dataKey;
        switch (section) {
          case 'users':
            response = await adminService.getUsers(1, 50);
            dataKey = 'users';
            break;
          case 'jobs':
            response = await adminService.getJobs(1, 50);
            dataKey = 'jobs';
            break;
          case 'courses':
            response = await adminService.getCourses(1, 50);
            dataKey = 'courses';
            break;
          case 'awards':
            response = await adminService.getAwards(1, 50);
            dataKey = 'awards';
            break;
          case 'brands':
            response = await adminService.getBrands(1, 50);
            dataKey = 'brands';
            break;
          case 'champions':
            response = await adminService.getChampions(1, 50);
            dataKey = 'champions';
            break;
          case 'mentors':
            response = await adminService.getMentors(1, 50);
            dataKey = 'mentors';
            break;
          case 'articles':
            response = await adminService.getArticles(1, 50);
            dataKey = 'articles';
            break;
          case 'reviews':
            response = await adminService.getReviews(1, 50);
            dataKey = 'reviews';
            break;
          case 'queries':
            response = await adminService.getQueries(1, 50);
            dataKey = 'queries';
            break;
          case 'questions':
            response = await adminService.getQuestions(1, 50);
            dataKey = 'questions';
            break;
          case 'bookings':
          case 'appointments':
            response = await adminService.getBookings(1, 50);
            dataKey = 'bookings';
            break;
          case 'resumes':
            response = await adminService.getResumes(1, 50);
            dataKey = 'resumes';
            break;
          default:
            setSectionLoading(false);
            return;
        }
        setData(response[dataKey] || []);
      } catch (err) {
        setError(`Failed to load ${section}.`);
      } finally {
        setSectionLoading(false);
      }
    };

    loadSectionData();
  }, [section, isSectionView]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const handleDelete = async (itemType: string, id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    setDeletingId(id);
    try {
      const deleteActions: { [key: string]: (id: string) => Promise<any> } = {
        user: adminService.deleteUser,
        job: adminService.deleteJob,
        course: adminService.deleteCourse,
        award: adminService.deleteAward,
        brand: adminService.deleteBrand,
        champion: adminService.deleteChampion,
        mentor: adminService.deleteMentor,
        article: adminService.deleteArticle,
        review: adminService.deleteReview,
        query: adminService.deleteQuery,
        question: adminService.deleteQuestion,
        booking: adminService.deleteBooking,
        resume: adminService.deleteResume,
      };
      await deleteActions[itemType](id);
      setData(prevData => prevData.filter(item => item._id !== id));
      if (itemType === 'booking') {
        setAppointments(prev => prev.filter(item => item._id !== id));
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      alert(`Failed to delete ${itemType}. ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAcceptAppointment = async (id: string) => {
    const { meetingLink } = apptActionState[id] || {};
    if (!meetingLink) {
      alert('Please provide a meeting link.');
      return;
    }
    setApptActionState(prev => ({ ...prev, [id]: { ...prev[id], loading: 'accept' } }));
    try {
      await adminService.confirmBooking(id, meetingLink);
      if (bookingsLoaded) {
        setAppointments(prevData => prevData.map(item => item._id === id ? { ...item, status: 'confirmed' } : item));
      }
      setData(prevData => prevData.map(item => item._id === id ? { ...item, status: 'confirmed' } : item));
      setApptActionState(prev => ({ ...prev, [id]: { ...prev[id], message: 'Appointment accepted!', loading: null } }));
    } catch (err) {
      setApptActionState(prev => ({ ...prev, [id]: { ...prev[id], message: 'Failed to accept.', loading: null } }));
    }
  };

  const handleReplySubmit = async () => {
    if (!selectedQuery || !replyMessage) return;

    setReplyLoading(true);
    try {
      await adminService.replyToQuery(selectedQuery._id, replyMessage);
      setReplyModalOpen(false);
      setReplyMessage('');
      // Optionally, refresh the queries list or update the specific query item in the state
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Unknown error';
      alert(`Failed to send reply. ${msg}`);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleRejectAppointment = async (id: string) => {
    if (!window.confirm('Reject this appointment? This will notify the user and keep the record.')) return;
    setApptActionState(prev => ({ ...prev, [id]: { ...prev[id], loading: 'reject' } }));
    try {
      const rejectMessage = apptActionState[id]?.message;
      await adminService.updateBookingStatus(id, { status: 'cancelled', message: rejectMessage });
      if (bookingsLoaded) {
        setAppointments(prevData => prevData.map(item => item._id === id ? { ...item, status: 'cancelled' } : item));
      }
      setData(prevData => prevData.map(item => item._id === id ? { ...item, status: 'cancelled' } : item));
      setApptActionState(prev => ({ ...prev, [id]: { ...prev[id], message: 'Appointment cancelled and user notified.', loading: null } }));
    } catch (err) {
      alert('Failed to reject appointment.');
      setApptActionState(prev => ({ ...prev, [id]: { ...prev[id], loading: null } }));
    }
  };

  const loadBookingsOnDemand = async () => {
    setBookingsLoading(true);
    try {
      const response = await adminService.getBookings(1, 50);
      setAppointments(response.bookings || []);
      setBookingsLoaded(true);
    } catch (err) {
      setError('Failed to load bookings.');
    } finally {
      setBookingsLoading(false);
    }
  };

  const renderSectionContent = () => {
    if (sectionLoading) return <p>Loading {section}...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    if (replyModalOpen && selectedQuery) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reply to Query</h2>
            <div className="mb-4">
              <p><strong>From:</strong> {selectedQuery.name} ({selectedQuery.email})</p>
              <p><strong>Subject:</strong> {selectedQuery.subject}</p>
              <p className="mt-2 p-2 bg-gray-100 rounded">{selectedQuery.message}</p>
            </div>
            <textarea
              className="w-full border rounded p-2"
              rows={4}
              placeholder="Write your reply..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setReplyModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={replyLoading}
                className={`px-4 py-2 rounded text-white ${replyLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {replyLoading ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      );
    }
    const noData = !data || data.length === 0;

    const columns: { [key: string]: string[] } = {
      users: ['Name', 'Email', 'Role', 'Joined'],
      jobs: ['Title', 'Company', 'Location', 'Type'],
      courses: ['Title', 'Price', 'Duration', 'Level', 'Page Link'],
      awards: ['Title', 'Issued By', 'Date', 'Category', 'Featured'],
      brands: ['Title', 'Type', 'Text', 'Link', 'Order', 'Active'],
      champions: ['Name', 'Company', 'Before', 'After', 'Rating', 'Featured', 'Order'],
      mentors: ['Name', 'Title', 'Company', 'Featured', 'Order', 'Active'],
      articles: ['Title', 'Summary', 'Tags', 'Link'],
      reviews: ['User', 'Course', 'Rating', 'Comment'],
      queries: ['Name', 'Email', 'Subject', 'Date', 'Actions'],
      questions: ['Subject', 'Name', 'Email', 'Date'],
      resumes: ['Filename', 'User', 'Type', 'Size', 'Uploaded'],
    };

    const renderers: { [key: string]: (item: any) => React.ReactNode } = {
      users: (item) => (
        <>
          <td>{item.name}</td>
          <td>{item.email}</td>
          <td>{item.role}</td>
          <td>{formatDate(item.createdAt)}</td>
        </>
      ),
      jobs: (item) => (
        <>
          <td>{item.title}</td>
          <td>{item.company}</td>
          <td>{item.location}</td>
          <td>{item.type}</td>
        </>
      ),
      courses: (item) => (
        <>
          <td>{item.title}</td>
          <td>{item.price}</td>
          <td>{item.duration}</td>
          <td>{item.level}</td>
            <td>
            {item.pageLink ? (
              <a
                href={item.pageLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Open
              </a>
            ) : (
              '-' 
            )}
          </td>
        </>
      ),
      awards: (item) => (
        <>
          <td>{item.title}</td>
          <td>{item.issuedBy}</td>
          <td>{formatDate(item.date)}</td>
          <td>{item.category}</td>
          <td>{item.isFeatured ? 'Yes' : 'No'}</td>
        </>
      ),
      brands: (item) => (
        <>
          <td>{item.title}</td>
          <td>{item.type}</td>
          <td className="max-w-xs truncate" title={item.text}>{item.text || '-'}</td>
          <td>{item.link ? <a href={item.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">Open</a> : '-'}</td>
          <td>{item.order ?? '-'}</td>
          <td>{item.isActive ? 'Yes' : 'No'}</td>
        </>
      ),
      champions: (item) => (
        <>
          <td>{item.name}</td>
          <td>{item.company}</td>
          <td>{item.beforeRole}</td>
          <td>{item.afterRole}</td>
          <td>{item.rating ?? 5}</td>
          <td>{item.isFeatured ? 'Yes' : 'No'}</td>
          <td>{item.order ?? '-'}</td>
        </>
      ),
      mentors: (item) => (
        <>
          <td>{item.name}</td>
          <td>{item.title}</td>
          <td>{item.company || '-'}</td>
          <td>{item.isFeatured ? 'Yes' : 'No'}</td>
          <td>{item.order ?? '-'}</td>
          <td>{item.active ? 'Yes' : 'No'}</td>
        </>
      ),
      articles: (item) => (
        <>
          <td>{item.title}</td>
          <td>{item.summary}</td>
          <td>{Array.isArray(item.tags) ? item.tags.join(', ') : ''}</td>
          <td>
            {(item.link || item.readMoreLnk) ? (
              <a href={item.link || item.readMoreLnk} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open</a>
            ) : (
              '-'
            )}
          </td>
        </>
      ),
      reviews: (item) => (
        <>
          <td>{item.user?.name || 'N/A'}</td>
          <td>{item.course?.title || 'N/A'}</td>
          <td>{item.rating}</td>
          <td>{item.comment}</td>
        </>
      ),
      queries: (item) => (
        <>
          <td>{item.name}</td>
          <td>{item.email}</td>
          <td>{item.subject}</td>
          <td>{formatDate(item.createdAt)}</td>
          <td>
            <button
              onClick={() => {
                setSelectedQuery(item);
                setReplyModalOpen(true);
              }}
              className="text-blue-600 hover:underline"
            >
              Reply
            </button>
          </td>
        </>
      ),
      questions: (item) => (
        <>
          <td>{item.subject || '(No subject)'}</td>
          <td>{item.name || 'Anonymous'}</td>
          <td>{item.email || 'N/A'}</td>
          <td>{formatDate(item.createdAt)}</td>
        </>
      ),
      resumes: (item) => (
        <>
          <td>{item.filename}</td>
          <td>{item.user ? `${item.user.name} (${item.user.email})` : '—'}</td>
          <td>{item.mimetype}</td>
          <td>{Math.round((item.size || 0) / 1024)} KB</td>
          <td>{formatDate(item.createdAt)}</td>
        </>
      ),
    };

    if (section === 'bookings' || section === 'appointments') {
      return <AppointmentManager data={data} apptActionState={apptActionState} setApptActionState={setApptActionState} onAccept={handleAcceptAppointment} onReject={handleRejectAppointment} onDelete={(id: string) => handleDelete('booking', id)} formatDate={formatDate} />;
    }

    const createBar = (
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        {section === 'courses' && (
          <form
            className="grid grid-cols-1 md:grid-cols-6 gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!courseForm.title || !courseForm.description || !courseForm.shortDescription || !courseForm.category) return alert('Title, Descriptions and Category are required');
              if (!courseImage) return alert('Course image is required');
              try {
                setCreating(true);
                const fd = new FormData();
                fd.append('title', courseForm.title);
                fd.append('description', courseForm.description);
                fd.append('shortDescription', courseForm.shortDescription);
                fd.append('price', String(Number(courseForm.price) || 0));
                fd.append('duration', String(Number(courseForm.duration) || 1));
                fd.append('level', courseForm.level);
                fd.append('category', courseForm.category);
                if (courseForm.pageLink) fd.append('pageLink', courseForm.pageLink);
                fd.append('image', courseImage);
                await adminService.createCourse(fd);
                setCourseForm({ title: '', description: '', shortDescription: '', price: '', duration: '', level: 'beginner', category: '', pageLink: '' });
                setCourseImage(null);
                // refresh
                const response = await adminService.getCourses(1, 50);
                setData(response.courses || []);
              } catch (err: any) {
                alert(err?.response?.data?.message || 'Failed to create course');
              } finally {
                setCreating(false);
              }
            }}
          >
            <input className="border rounded px-3 py-2 text-sm" placeholder="Title" value={courseForm.title} onChange={(e) => setCourseForm((s) => ({ ...s, title: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm md:col-span-2" placeholder="Short Description" value={courseForm.shortDescription} onChange={(e) => setCourseForm((s) => ({ ...s, shortDescription: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Category" value={courseForm.category} onChange={(e) => setCourseForm((s) => ({ ...s, category: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Price" value={courseForm.price} onChange={(e) => setCourseForm((s) => ({ ...s, price: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Duration (weeks)" value={courseForm.duration} onChange={(e) => setCourseForm((s) => ({ ...s, duration: e.target.value }))} />
            <select className="border rounded px-3 py-2 text-sm" value={courseForm.level} onChange={(e) => setCourseForm((s) => ({ ...s, level: e.target.value }))}>
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
            <input className="border rounded px-3 py-2 text-sm md:col-span-2" placeholder="Page Link (optional)" value={courseForm.pageLink} onChange={(e) => setCourseForm((s) => ({ ...s, pageLink: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm md:col-span-3" placeholder="Description" value={courseForm.description} onChange={(e) => setCourseForm((s) => ({ ...s, description: e.target.value }))} />
            <input type="file" accept="image/*" className="border rounded px-3 py-2 text-sm md:col-span-3" onChange={(e) => setCourseImage(e.target.files?.[0] || null)} />
            <div className="flex justify-end md:col-span-6"><button type="submit" disabled={creating} className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white ${creating ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{creating ? 'Creating…' : 'Add Course'}</button></div>
          </form>
        )}
        {section === 'awards' && (
          <form
            className="grid grid-cols-1 md:grid-cols-6 gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!awardForm.title || !awardForm.description || !awardForm.issuedBy || !awardForm.date) return alert('Title, Description, Issued By and Date are required');
              if (!awardImage) return alert('Award image is required');
              try {
                setCreating(true);
                const fd = new FormData();
                fd.append('title', awardForm.title);
                fd.append('description', awardForm.description);
                fd.append('issuedBy', awardForm.issuedBy);
                fd.append('date', awardForm.date);
                fd.append('category', awardForm.category);
                fd.append('isFeatured', String(awardForm.isFeatured));
                fd.append('image', awardImage);
                await adminService.createAward(fd);
                setAwardForm({ title: '', description: '', issuedBy: '', date: '', category: 'other', isFeatured: false });
                setAwardImage(null);
                const response = await adminService.getAwards(1, 50);
                setData(response.awards || []);
              } catch (err: any) {
                alert(err?.response?.data?.message || 'Failed to create award');
              } finally {
                setCreating(false);
              }
            }}
          >
            <input className="border rounded px-3 py-2 text-sm" placeholder="Title" value={awardForm.title} onChange={(e) => setAwardForm((s) => ({ ...s, title: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Issued By" value={awardForm.issuedBy} onChange={(e) => setAwardForm((s) => ({ ...s, issuedBy: e.target.value }))} />
            <input type="date" className="border rounded px-3 py-2 text-sm" value={awardForm.date} onChange={(e) => setAwardForm((s) => ({ ...s, date: e.target.value }))} />
            <select className="border rounded px-3 py-2 text-sm" value={awardForm.category} onChange={(e) => setAwardForm((s) => ({ ...s, category: e.target.value }))}>
              <option value="academic">academic</option>
              <option value="professional">professional</option>
              <option value="community">community</option>
              <option value="other">other</option>
            </select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={awardForm.isFeatured} onChange={(e) => setAwardForm((s) => ({ ...s, isFeatured: e.target.checked }))} /> Featured</label>
            <input className="border rounded px-3 py-2 text-sm md:col-span-3" placeholder="Description" value={awardForm.description} onChange={(e) => setAwardForm((s) => ({ ...s, description: e.target.value }))} />
            <input type="file" accept="image/*" className="border rounded px-3 py-2 text-sm md:col-span-3" onChange={(e) => setAwardImage(e.target.files?.[0] || null)} />
            <div className="flex justify-end md:col-span-6"><button type="submit" disabled={creating} className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white ${creating ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{creating ? 'Creating…' : 'Add Award'}</button></div>
          </form>
        )}
        {section === 'brands' && (
          <form
            className="grid grid-cols-1 md:grid-cols-6 gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!brandForm.title) return alert('Title is required');
              if (!brandImage) return alert('Brand image is required');
              try {
                setCreating(true);
                const fd = new FormData();
                fd.append('title', brandForm.title);
                fd.append('type', brandForm.type);
                if (brandForm.text) fd.append('text', brandForm.text);
                if (brandForm.link) fd.append('link', brandForm.link);
                fd.append('order', String(brandForm.order || 1));
                fd.append('isActive', String(Boolean(brandForm.isActive)));
                fd.append('image', brandImage);
                await adminService.createBrand(fd);
                setBrandForm({ title: '', type: 'accreditation', text: '', link: '', order: 1, isActive: true });
                setBrandImage(null);
                const response = await adminService.getBrands(1, 50);
                setData(response.brands || []);
              } catch (err: any) {
                alert(err?.response?.data?.message || 'Failed to create brand');
              } finally {
                setCreating(false);
              }
            }}
          >
            <input className="border rounded px-3 py-2 text-sm" placeholder="Title" value={brandForm.title} onChange={(e) => setBrandForm((s) => ({ ...s, title: e.target.value }))} />
            <select className="border rounded px-3 py-2 text-sm" value={brandForm.type} onChange={(e) => setBrandForm((s) => ({ ...s, type: e.target.value }))}>
              <option value="accreditation">accreditation</option>
              <option value="partner">partner</option>
            </select>
            <input className="border rounded px-3 py-2 text-sm" placeholder="Link (optional)" value={brandForm.link} onChange={(e) => setBrandForm((s) => ({ ...s, link: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Order" value={brandForm.order} onChange={(e) => setBrandForm((s) => ({ ...s, order: Number(e.target.value) }))} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={brandForm.isActive} onChange={(e) => setBrandForm((s) => ({ ...s, isActive: e.target.checked }))} /> Active</label>
            <input type="file" accept="image/*" className="border rounded px-3 py-2 text-sm" onChange={(e) => setBrandImage(e.target.files?.[0] || null)} />
            <textarea className="border rounded px-3 py-2 text-sm md:col-span-6" placeholder="Text (optional)" value={brandForm.text} onChange={(e) => setBrandForm((s) => ({ ...s, text: e.target.value }))} />
            <div className="flex justify-end md:col-span-6"><button type="submit" disabled={creating} className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white ${creating ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{creating ? 'Creating…' : 'Add Brand'}</button></div>
          </form>
        )}
        {section === 'champions' && (
          <form
            className="grid grid-cols-1 md:grid-cols-6 gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!championForm.name || !championForm.company || !championForm.beforeRole || !championForm.afterRole || !championForm.testimonial) return alert('Fill all required fields');
              if (!championImage) return alert('Champion image is required');
              try {
                setCreating(true);
                const fd = new FormData();
                fd.append('name', championForm.name);
                fd.append('company', championForm.company);
                fd.append('beforeRole', championForm.beforeRole);
                fd.append('afterRole', championForm.afterRole);
                fd.append('testimonial', championForm.testimonial);
                fd.append('rating', String(championForm.rating || 5));
                fd.append('isFeatured', String(Boolean(championForm.isFeatured)));
                fd.append('order', String(championForm.order || 1));
                fd.append('image', championImage);
                await adminService.createChampion(fd);
                setChampionForm({ name: '', company: '', beforeRole: '', afterRole: '', testimonial: '', rating: 5, isFeatured: true, order: 1 });
                setChampionImage(null);
                const response = await adminService.getChampions(1, 50);
                setData(response.champions || []);
              } catch (err: any) {
                alert(err?.response?.data?.message || 'Failed to create champion');
              } finally {
                setCreating(false);
              }
            }}
          >
            <input className="border rounded px-3 py-2 text-sm" placeholder="Name" value={championForm.name} onChange={(e) => setChampionForm((s) => ({ ...s, name: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Company" value={championForm.company} onChange={(e) => setChampionForm((s) => ({ ...s, company: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Before Role" value={championForm.beforeRole} onChange={(e) => setChampionForm((s) => ({ ...s, beforeRole: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="After Role" value={championForm.afterRole} onChange={(e) => setChampionForm((s) => ({ ...s, afterRole: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" type="number" min={1} max={5} placeholder="Rating (1-5)" value={championForm.rating} onChange={(e) => setChampionForm((s) => ({ ...s, rating: Number(e.target.value) }))} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={championForm.isFeatured} onChange={(e) => setChampionForm((s) => ({ ...s, isFeatured: e.target.checked }))} /> Featured</label>
            <textarea className="border rounded px-3 py-2 text-sm md:col-span-3" placeholder="Testimonial" value={championForm.testimonial} onChange={(e) => setChampionForm((s) => ({ ...s, testimonial: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Order" value={championForm.order} onChange={(e) => setChampionForm((s) => ({ ...s, order: Number(e.target.value) }))} />
            <input type="file" accept="image/*" className="border rounded px-3 py-2 text-sm md:col-span-2" onChange={(e) => setChampionImage(e.target.files?.[0] || null)} />
            <div className="flex justify-end md:col-span-6"><button type="submit" disabled={creating} className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white ${creating ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{creating ? 'Creating…' : 'Add Champion'}</button></div>
          </form>
        )}
        {section === 'mentors' && (
          <form
            className="grid grid-cols-1 md:grid-cols-6 gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!mentorForm.name || !mentorForm.title) return alert('Name and Title are required');
              if (!mentorImage) return alert('Mentor image is required');
              try {
                setCreating(true);
                const fd = new FormData();
                fd.append('name', mentorForm.name);
                fd.append('title', mentorForm.title);
                if (mentorForm.company) fd.append('company', mentorForm.company);
                if (mentorForm.bio) fd.append('bio', mentorForm.bio);
                if (mentorForm.linkedin) fd.append('linkedin', mentorForm.linkedin);
                fd.append('isFeatured', String(Boolean(mentorForm.isFeatured)));
                fd.append('order', String(mentorForm.order || 1));
                fd.append('active', String(Boolean(mentorForm.active)));
                fd.append('image', mentorImage);
                await adminService.createMentor(fd);
                setMentorForm({ name: '', title: '', company: '', bio: '', linkedin: '', isFeatured: true, order: 1, active: true });
                setMentorImage(null);
                const response = await adminService.getMentors(1, 50);
                setData(response.mentors || []);
              } catch (err: any) {
                alert(err?.response?.data?.message || 'Failed to create mentor');
              } finally {
                setCreating(false);
              }
            }}
          >
            <input className="border rounded px-3 py-2 text-sm" placeholder="Name" value={mentorForm.name} onChange={(e) => setMentorForm((s) => ({ ...s, name: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Title" value={mentorForm.title} onChange={(e) => setMentorForm((s) => ({ ...s, title: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Company (optional)" value={mentorForm.company} onChange={(e) => setMentorForm((s) => ({ ...s, company: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="LinkedIn URL (optional)" value={mentorForm.linkedin} onChange={(e) => setMentorForm((s) => ({ ...s, linkedin: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mentorForm.isFeatured} onChange={(e) => setMentorForm((s) => ({ ...s, isFeatured: e.target.checked }))} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={mentorForm.active} onChange={(e) => setMentorForm((s) => ({ ...s, active: e.target.checked }))} /> Active</label>
            <textarea className="border rounded px-3 py-2 text-sm md:col-span-3" placeholder="Short Bio (optional)" value={mentorForm.bio} onChange={(e) => setMentorForm((s) => ({ ...s, bio: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Order" value={mentorForm.order} onChange={(e) => setMentorForm((s) => ({ ...s, order: Number(e.target.value) }))} />
            <input type="file" accept="image/*" className="border rounded px-3 py-2 text-sm md:col-span-2" onChange={(e) => setMentorImage(e.target.files?.[0] || null)} />
            <div className="flex justify-end md:col-span-6"><button type="submit" disabled={creating} className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white ${creating ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{creating ? 'Creating…' : 'Add Mentor'}</button></div>
          </form>
        )}
        {section === 'articles' && (
          <form
            className="grid grid-cols-1 md:grid-cols-6 gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!articleForm.title || !articleForm.content) return alert('Title and Content are required');
              try {
                setCreating(true);
                const fd = new FormData();
                fd.append('title', articleForm.title);
                fd.append('summary', articleForm.summary);
                fd.append('content', articleForm.content);
                fd.append('isPublished', 'true');
                const tags = articleForm.tags ? articleForm.tags.split(',').map(t => t.trim()) : [];
                tags.forEach((t) => fd.append('tags', t));
                if (articleForm.link) fd.append('link', articleForm.link);
                if (articleImage) fd.append('image', articleImage);
                await adminService.createArticle(fd);
                setArticleForm({ title: '', summary: '', content: '', tags: '', link: '' });
                setArticleImage(null);
                const response = await adminService.getArticles(1, 50);
                setData(response.articles || []);
              } catch (err: any) {
                alert(err?.response?.data?.message || 'Failed to create article');
              } finally {
                setCreating(false);
              }
            }}
          >
            <input className="border rounded px-3 py-2 text-sm" placeholder="Title" value={articleForm.title} onChange={(e) => setArticleForm((s) => ({ ...s, title: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Summary" value={articleForm.summary} onChange={(e) => setArticleForm((s) => ({ ...s, summary: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Tags (comma separated)" value={articleForm.tags} onChange={(e) => setArticleForm((s) => ({ ...s, tags: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Read More Link (optional)" value={articleForm.link} onChange={(e) => setArticleForm((s) => ({ ...s, link: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm md:col-span-2" placeholder="Content" value={articleForm.content} onChange={(e) => setArticleForm((s) => ({ ...s, content: e.target.value }))} />
            <input type="file" accept="image/*" className="border rounded px-3 py-2 text-sm" onChange={(e) => setArticleImage(e.target.files?.[0] || null)} />
            <div className="flex justify-end md:col-span-6"><button type="submit" disabled={creating} className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white ${creating ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{creating ? 'Creating…' : 'Add Article'}</button></div>
          </form>
        )}
        {section === 'jobs' && (
          <form
            className="grid grid-cols-1 md:grid-cols-6 gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!jobForm.title || !jobForm.company || !jobForm.location || !jobForm.category || !jobForm.description || !jobForm.applicationUrl) return alert('Fill all required fields');
              try {
                setCreating(true);
                const fd = new FormData();
                fd.append('title', jobForm.title);
                fd.append('company', jobForm.company);
                fd.append('location', jobForm.location);
                fd.append('type', jobForm.type.toLowerCase());
                fd.append('category', jobForm.category);
                fd.append('description', jobForm.description);
                fd.append('applicationUrl', jobForm.applicationUrl);
                if (jobLogo) fd.append('logo', jobLogo);
                await adminService.createJob(fd);
                setJobForm({ title: '', company: '', location: '', type: 'full-time', category: '', description: '', applicationUrl: '' });
                setJobLogo(null);
                const response = await adminService.getJobs(1, 50);
                setData(response.jobs || []);
              } catch (err: any) {
                alert(err?.response?.data?.message || 'Failed to create job');
              } finally {
                setCreating(false);
              }
            }}
          >
            <input className="border rounded px-3 py-2 text-sm" placeholder="Title" value={jobForm.title} onChange={(e) => setJobForm((s) => ({ ...s, title: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Company" value={jobForm.company} onChange={(e) => setJobForm((s) => ({ ...s, company: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm" placeholder="Location" value={jobForm.location} onChange={(e) => setJobForm((s) => ({ ...s, location: e.target.value }))} />
            <select className="border rounded px-3 py-2 text-sm" value={jobForm.type} onChange={(e) => setJobForm((s) => ({ ...s, type: e.target.value }))}>
              <option value="full-time">full-time</option>
              <option value="part-time">part-time</option>
              <option value="contract">contract</option>
              <option value="internship">internship</option>
              <option value="freelance">freelance</option>
            </select>
            <input className="border rounded px-3 py-2 text-sm" placeholder="Category" value={jobForm.category} onChange={(e) => setJobForm((s) => ({ ...s, category: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm md:col-span-2" placeholder="Application URL" value={jobForm.applicationUrl} onChange={(e) => setJobForm((s) => ({ ...s, applicationUrl: e.target.value }))} />
            <input className="border rounded px-3 py-2 text-sm md:col-span-3" placeholder="Description" value={jobForm.description} onChange={(e) => setJobForm((s) => ({ ...s, description: e.target.value }))} />
            <input type="file" accept="image/*" className="border rounded px-3 py-2 text-sm" onChange={(e) => setJobLogo(e.target.files?.[0] || null)} />
            <div className="flex justify-end md:col-span-6"><button type="submit" disabled={creating} className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white ${creating ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{creating ? 'Creating…' : 'Add Job'}</button></div>
          </form>
        )}
        {noData && <p className="text-sm text-gray-500 mt-2">No {section} found.</p>}
      </div>
    );

    const sectionToType: Record<string, string> = {
      users: 'user',
      jobs: 'job',
      courses: 'course',
      awards: 'award',
      brands: 'brand',
      champions: 'champion',
      mentors: 'mentor',
      articles: 'article',
      reviews: 'review',
      queries: 'query',
      questions: 'question',
      resumes: 'resume',
      bookings: 'booking',
      appointments: 'booking',
    };

    return <>
      {createBar}
      <ManagementTable title={section} items={data} columns={[...columns[section], 'Actions']} renderRow={(item) => (
      <tr key={item._id}>
        {renderers[section](item)}
        <td className="space-x-2">
          {section === 'resumes' && (
            <button onClick={() => handleViewResume(item._id)} className="bg-blue-600 text-white px-2 py-1 rounded">View</button>
          )}
          <button onClick={() => handleDelete(sectionToType[section] || section, item._id)} disabled={deletingId === item._id} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
        </td>
      </tr>
    )} />

      {resumeModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
            <button className="absolute right-3 top-3 text-gray-600" onClick={() => setResumeModalOpen(false)}>✕</button>
            <h3 className="text-xl font-semibold mb-4">Resume Details</h3>
            {resumeLoading && <p>Loading…</p>}
            {!resumeLoading && selectedResume && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">Filename: <span className="font-medium text-gray-900">{selectedResume.filename}</span></div>
                <div className="text-sm text-gray-600">Type: <span className="font-medium text-gray-900">{selectedResume.mimetype}</span></div>
                <div className="text-sm text-gray-600">Size: <span className="font-medium text-gray-900">{Math.round((selectedResume.size||0)/1024)} KB</span></div>
                <div className="text-sm text-gray-600">Uploaded: <span className="font-medium text-gray-900">{formatDate(selectedResume.createdAt)}</span></div>
                {selectedResume.user && (
                  <div className="text-sm text-gray-600">User: <span className="font-medium text-gray-900">{selectedResume.user.name} ({selectedResume.user.email})</span></div>
                )}
                {selectedResume.analysis && (
                  <div>
                    <div className="font-semibold mb-1">AI Analysis</div>
                    <div className="prose max-h-64 overflow-auto whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{selectedResume.analysis}</div>
                  </div>
                )}
                {!selectedResume.analysis && selectedResume.extractedText && (
                  <div>
                    <div className="font-semibold mb-1">Extracted Text</div>
                    <div className="max-h-64 overflow-auto whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">{selectedResume.extractedText}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>;
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {isSectionView ? (
          <>
            <a href="/admin/dashboard" className="text-blue-500 hover:underline mb-4 inline-block">← Back to Dashboard</a>
            {renderSectionContent()}
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            {loading && <p>Loading dashboard...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {stats && (
              <>
                <DashboardStats stats={stats} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <RecentContent title="Recent Users" items={stats.recentUsers} renderItem={item => `${item.name} (${item.email})`} />
                  <RecentContent title="Recent Queries" items={stats.recentQueries} renderItem={item => item.subject} />
                </div>
                <div className="mt-6">
                  <div id="bookings" className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{bookingsLoaded ? `${appointments.length} shown` : 'Not loaded'}</span>
                        <button
                          onClick={loadBookingsOnDemand}
                          disabled={bookingsLoading}
                          className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white ${bookingsLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                          {bookingsLoading ? 'Loading…' : bookingsLoaded ? 'Reload' : 'Load Bookings'}
                        </button>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      <div className="px-6 py-4">
                        <form
                          className="grid grid-cols-1 md:grid-cols-3 gap-3"
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.date || !bookingForm.timeSlot) {
                              alert('Name, Email, Phone, Date and Time Slot are required');
                              return;
                            }
                            try {
                              setCreatingBooking(true);
                              const payload: any = {
                                name: bookingForm.name,
                                email: bookingForm.email,
                                phone: bookingForm.phone,
                                message: bookingForm.message || undefined,
                                date: bookingForm.date,
                                timeSlot: bookingForm.timeSlot,
                                type: bookingForm.type
                              };
                              await adminService.createBooking(payload);
                              setBookingForm({ name: '', email: '', phone: '', message: '', date: '', timeSlot: '', type: 'consultation' });
                              alert('Booking created');
                              loadBookingsOnDemand(); // Refresh list
                            } catch (err: any) {
                              console.error('Create booking failed', err);
                              alert(err?.response?.data?.message || 'Failed to create booking');
                            } finally {
                              setCreatingBooking(false);
                            }
                          }}
                        >
                          <input className="border rounded px-3 py-2 text-sm" placeholder="Name" value={bookingForm.name} onChange={(e) => setBookingForm((s) => ({ ...s, name: e.target.value }))} />
                          <input className="border rounded px-3 py-2 text-sm" placeholder="Email" value={bookingForm.email} onChange={(e) => setBookingForm((s) => ({ ...s, email: e.target.value }))} />
                          <input className="border rounded px-3 py-2 text-sm" placeholder="Phone" value={bookingForm.phone} onChange={(e) => setBookingForm((s) => ({ ...s, phone: e.target.value }))} />
                          <input type="date" className="border rounded px-3 py-2 text-sm" value={bookingForm.date} onChange={(e) => setBookingForm((s) => ({ ...s, date: e.target.value }))} />
                          <input className="border rounded px-3 py-2 text-sm" placeholder="Time Slot (e.g., 10:00)" value={bookingForm.timeSlot} onChange={(e) => setBookingForm((s) => ({ ...s, timeSlot: e.target.value }))} />
                          <select className="border rounded px-3 py-2 text-sm" value={bookingForm.type} onChange={(e) => setBookingForm((s) => ({ ...s, type: e.target.value }))}>
                            <option value="consultation">Consultation</option>
                            <option value="demo">Demo</option>
                            <option value="support">Support</option>
                            <option value="other">Other</option>
                          </select>
                          <input className="border rounded px-3 py-2 text-sm md:col-span-3" placeholder="Message (optional)" value={bookingForm.message} onChange={(e) => setBookingForm((s) => ({ ...s, message: e.target.value }))} />
                          <div className="md:col-span-3 flex justify-end">
                            <button type="submit" disabled={creatingBooking} className={`inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium text-white ${creatingBooking ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                              {creatingBooking ? 'Creating...' : 'Quick Create Booking'}
                            </button>
                          </div>
                        </form>
                      </div>
                      {(bookingsLoaded ? appointments : []).slice(0, 5).map((appt) => (
                        <div key={appt._id} className="px-6 py-4">
                          <AppointmentManager data={[appt]} apptActionState={apptActionState} setApptActionState={setApptActionState} onAccept={handleAcceptAppointment} onReject={handleRejectAppointment} onDelete={(id: string) => handleDelete('booking', id)} formatDate={formatDate} isSingleView={true} />
                        </div>
                      ))}
                      {(!bookingsLoaded) && (
                        <div className="px-6 py-6 text-sm text-gray-500">Click "Load Bookings" to fetch the latest bookings</div>
                      )}
                      {(bookingsLoaded && appointments.length === 0) && (
                        <div className="px-6 py-6 text-sm text-gray-500">No bookings found</div>
                      )}
                    </div>
                    <div className="bg-gray-50 px-6 py-3 text-right">
                      <a href="/admin/dashboard#bookings" className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                        View all bookings
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

// Helper Components
const DashboardStats = ({ stats }: { stats: DashboardStatsData }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <StatCard title="Users" value={stats.users} />
    <StatCard title="Jobs" value={stats.jobs} />
    <StatCard title="Courses" value={stats.courses} />
    <StatCard title="Articles" value={stats.articles} />
    <StatCard title="Queries" value={stats.queries} />
    <StatCard title="Questions" value={stats.questions} />
    <StatCard title="Bookings" value={stats.appointments} />
    <StatCard title="Reviews" value={stats.reviews} />
  </div>
);

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="bg-white p-4 rounded-lg shadow"><p className="text-xl font-bold">{value ?? '...'}</p><p>{title}</p></div>
);

const RecentContent = ({ title, items, renderItem }: { title: string; items: any[]; renderItem: (item: any) => string }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h2 className="font-bold mb-2">{title}</h2>
    <ul>{items?.map(item => <li key={item._id} className="text-sm truncate">{renderItem(item)}</li>)}</ul>
  </div>
);

const ManagementTable = ({ title, items, columns, renderRow }: { title: string; items: any[]; columns: string[]; renderRow: (item: any) => React.ReactNode }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4 capitalize">Manage {title}</h2>
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>{columns.map(col => <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>)}</tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">{items.map(item => renderRow(item))}</tbody>
      </table>
    </div>
  </div>
);

const AppointmentManager = ({ data, apptActionState, setApptActionState, onAccept, onReject, onDelete, formatDate, isSingleView = false }: any) => (
  <div>
    {!isSingleView && <h2 className="text-2xl font-bold mb-4">Manage Appointments</h2>}
    {data.map((appt: any) => (
      <div key={appt._id} className="bg-white p-4 mb-4 rounded shadow-none border-0">
        <p><strong>Name:</strong> {appt.name}</p>
        <p><strong>Email:</strong> {appt.email}</p>
        <p><strong>Date:</strong> {formatDate(appt.date)}</p>
        <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-white text-xs ${
          appt.status === 'confirmed' ? 'bg-green-500' :
          appt.status === 'cancelled' ? 'bg-gray-500' :
          appt.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500'
        }`}>{appt.status}</span></p>
        {appt.status === 'pending' && (
          <div className="mt-4">
            <input type="text" placeholder="Enter meeting link" className="border p-2 rounded w-full mb-2" value={apptActionState[appt._id]?.meetingLink || ''} onChange={(e) => setApptActionState((prev: any) => ({ ...prev, [appt._id]: { ...prev[appt._id], meetingLink: e.target.value } }))} />
            <textarea placeholder="Optional rejection message to user" className="border p-2 rounded w-full mb-2" value={apptActionState[appt._id]?.message || ''} onChange={(e) => setApptActionState((prev: any) => ({ ...prev, [appt._id]: { ...prev[appt._id], message: e.target.value } }))} />
            <button onClick={() => onAccept(appt._id)} disabled={apptActionState[appt._id]?.loading === 'accept'} className="bg-green-500 text-white px-4 py-2 rounded mr-2">Accept</button>
            <button onClick={() => onReject(appt._id)} disabled={apptActionState[appt._id]?.loading === 'reject'} className="bg-red-500 text-white px-4 py-2 rounded">Reject</button>
            {apptActionState[appt._id]?.message && <p className="text-sm mt-2">{apptActionState[appt._id]?.message}</p>}
          </div>
        )}
        <div className="mt-4">
          <button onClick={() => onDelete(appt._id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">Delete</button>
        </div>
      </div>
    ))}
  </div>
);

export default DashboardPage;
