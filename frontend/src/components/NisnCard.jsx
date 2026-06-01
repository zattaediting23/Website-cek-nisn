import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';

const NisnCard = ({ student }) => {
  const cardRef = useRef(null);

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 1.0 });
      const link = document.createElement('a');
      link.download = `Kartu-NISN-${student.nisn || 'Siswa'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading card:', err);
      alert('Gagal mengunduh kartu. Silakan coba lagi.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div 
        ref={cardRef}
        className="relative w-[320px] h-[200px] rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-600 to-yellow-500 text-white font-sans border border-white/20"
        style={{
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Background Pattern / Watermark (using placeholder for Tut Wuri Handayani) */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32">
            <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
          </svg>
        </div>

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 px-4 py-2 flex items-center justify-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
          </div>
          <div className="text-center">
            <h1 className="text-xs font-bold uppercase tracking-wider">Kementerian Pendidikan</h1>
            <h2 className="text-[10px] font-medium opacity-90">Republik Indonesia</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex gap-4 h-[calc(200px-50px)]">
          {/* Photo */}
          <div className="w-20 h-24 rounded-lg overflow-hidden bg-white/20 border-2 border-white/30 flex-shrink-0 flex items-center justify-center">
            {student.foto_profil ? (
              <img src={student.foto_profil} alt="Foto Profil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-white/70">Foto 3x4</span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-center space-y-1.5">
            <div className="mb-1">
              <p className="text-[9px] text-yellow-100 uppercase font-semibold tracking-wider">Nomor Induk Siswa Nasional</p>
              <p className="text-lg font-bold tracking-widest">{student.nisn || '-'}</p>
            </div>
            
            <div className="grid grid-cols-[60px_1fr] text-[10px] items-start">
              <span className="opacity-80">Nama</span>
              <span className="font-semibold uppercase line-clamp-1">{student.nama_lengkap || '-'}</span>
              
              <span className="opacity-80">TTL</span>
              <span className="font-semibold uppercase line-clamp-2">
                {student.tempat_lahir || '-'}, {formatDate(student.tanggal_lahir)}
              </span>
              
              <span className="opacity-80">Kelamin</span>
              <span className="font-semibold uppercase">{student.jenis_kelamin || '-'}</span>
            </div>
          </div>
        </div>

        {/* Footer/Barcode placeholder */}
        <div className="absolute bottom-2 right-4 flex flex-col items-end opacity-50">
           <div className="flex gap-0.5 h-4 items-end">
              {[...Array(15)].map((_, i) => (
                <div key={i} className={`bg-white ${Math.random() > 0.5 ? 'w-1' : 'w-0.5'} h-full`}></div>
              ))}
           </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 border border-blue-100 font-semibold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
      >
        <Download className="w-4 h-4" />
        Download Kartu NISN
      </button>
    </div>
  );
};

export default NisnCard;
