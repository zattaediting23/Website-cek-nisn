import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Contact, Calendar, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [nisn, setNisn] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setNewPassword('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/reset-password', {
        nisn,
        tanggal_lahir: tanggalLahir
      });

      setSuccessMsg(response.data.message);
      setNewPassword(response.data.newPassword);
    } catch (err) {
      let errorMessage = 'Terjadi kesalahan saat mereset password.';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 overflow-hidden relative">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-400 opacity-20 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-indigo-400 opacity-20 blur-2xl"></div>

        <div className="relative z-10">
          <Link to="/login" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors duration-200">
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Login
          </Link>
          
          <h2 className="text-3xl font-bold text-white mb-2">Lupa Password</h2>
          <p className="text-blue-100 mb-8 font-light text-sm">
            Masukkan NISN dan Tanggal Lahir Anda untuk mereset password. Password akan direset menjadi format DDMMYYYY dari tanggal lahir Anda.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
              {error}
            </div>
          )}

          {successMsg ? (
            <div className="bg-green-500/20 border border-green-500/50 text-green-100 px-5 py-6 rounded-xl mb-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
              <p className="font-medium">{successMsg}</p>
              <div className="bg-black/20 p-3 rounded-lg border border-white/10 mt-4">
                <p className="text-xs text-green-200 mb-1">Password Baru Anda:</p>
                <p className="text-xl font-mono font-bold tracking-wider">{newPassword}</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 mt-6 bg-white text-indigo-600 font-bold rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-blue-50 transition-all duration-300"
              >
                Kembali ke Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium text-blue-100 ml-1">NISN</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Contact className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-300"
                    placeholder="Masukkan NISN"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-blue-100 ml-1">Tanggal Lahir</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/20 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-4 bg-white text-indigo-600 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300 flex items-center justify-center transform active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
