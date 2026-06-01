import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Loader2, LayoutDashboard, AlertCircle, ShieldCheck } from 'lucide-react';
import ProfileForm from './ProfileForm';
import NisnCard from './NisnCard';
import GlobalMandiriCard from './GlobalMandiriCard';

const Dashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('/api/student/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudentData(response.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Gagal mengambil data profil.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleUpdate = (updatedData) => {
    setStudentData((prev) => ({ ...prev, ...updatedData, is_verified: false, verification_status: 'pending', rejection_reason: null }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">{studentData?.nisn === 'admin' ? 'Portal Admin' : 'Portal Siswa'}</span>
            </div>
            <div className="flex items-center gap-2">
              {studentData?.nisn === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200 border border-indigo-200 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:block">Kelola User Request</span>
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 border border-transparent"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        {studentData && studentData.verification_status === 'pending' && studentData.nama_lengkap && (
           <div className="mb-8 p-4 bg-amber-50 text-amber-700 rounded-xl border border-amber-200 flex items-start sm:items-center gap-3 shadow-sm">
             <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
             <p className="text-sm font-medium">Data Anda sedang dalam proses verifikasi oleh admin. Perubahan yang Anda lakukan sudah tersimpan.</p>
           </div>
        )}

        {studentData && studentData.verification_status === 'rejected' && studentData.nama_lengkap && (
           <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
             <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
             <div>
               <p className="text-sm font-bold mb-1">Pengajuan Perubahan Data Ditolak</p>
               <p className="text-sm font-medium">{studentData.rejection_reason}</p>
             </div>
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Profil Siswa</h2>
                  <p className="text-slate-500 mt-1">Perbarui informasi identitas Anda untuk Kartu NISN.</p>
                </div>
                {studentData ? (
                  <ProfileForm student={studentData} onUpdate={handleUpdate} />
                ) : (
                  <p className="text-slate-500">Data tidak tersedia.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Card Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 sm:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                  Pratinjau Kartu
                </h3>
                <div className="w-full overflow-hidden flex flex-col gap-10">
                  {studentData && <NisnCard student={studentData} />}
                  
                  {studentData && (
                    <>
                      <div className="border-t border-slate-200 w-full"></div>
                      <GlobalMandiriCard student={studentData} />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
