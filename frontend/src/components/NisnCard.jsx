import { useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import nisnImage from '../nisn.jpg';

const NisnCard = ({ student }) => {
  const cardRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (scrollContainerRef.current) {
        e.preventDefault();
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    };
    
    const element = scrollContainerRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 1.0, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `Kartu-NISN-${student.nama_lengkap || 'Siswa'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading card', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const tutWuriUrl = "https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg";

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Scrollable wrapper that prevents cutoff */}
      <div 
        ref={scrollContainerRef}
        className="w-full overflow-x-auto pb-4 custom-scrollbar"
      >
        <div 
          ref={cardRef}
          className="relative w-[480px] h-[300px] shrink-0 rounded-xl overflow-hidden bg-[#BDDCFA] text-slate-800 border border-[#BDDCFA]"
          style={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}
        >
          {/* Subtle watermark in center */}
          <div className="absolute inset-0 flex justify-center items-center opacity-[0.04] pointer-events-none">
            <img src={tutWuriUrl} alt="Watermark" className="w-64 h-64" />
          </div>

          {/* Blue line overlay across the top */}
          <div className="absolute top-[52px] left-0 w-full h-[3.5px] bg-[#619bd1] opacity-70 z-0"></div>

          {/* Top Header - Extreme Left */}
          <div className="absolute top-2.5 left-3 flex items-center gap-2 z-10">
            <img src={tutWuriUrl} alt="Logo" className="w-[42px] h-[42px] object-contain" />
            <div className="flex flex-col justify-center mt-0.5">
              <span className="text-[8px] font-black text-black leading-tight font-sans tracking-wide whitespace-nowrap">KEMENTERIAN</span>
              <span className="text-[8px] font-black text-black leading-tight font-sans tracking-wide whitespace-nowrap">PENDIDIKAN, KEBUDAYAAN</span>
              <span className="text-[8px] font-black text-black leading-tight font-sans tracking-wide whitespace-nowrap">RISET, DAN TEKNOLOGI</span>
            </div>
          </div>
          
          {/* Top Header - Extreme Right */}
          <div className="absolute top-3 right-3 flex items-center z-10">
            <h1 className="text-[26px] font-black text-[#2e598b] tracking-wider leading-none font-sans whitespace-nowrap">KARTU NISN</h1>
          </div>

          {/* Subtitle placed on the line */}
          <div className="absolute top-[47px] right-3 z-10">
            <h2 className="text-[9.5px] font-bold text-[#2e598b] tracking-widest font-sans whitespace-nowrap">NOMOR INDUK SISWA NASIONAL</h2>
          </div>

          {/* Main Content */}
          <div className="px-5 pt-[105px] flex gap-5 items-start relative">

            {/* Left Column (Photo) */}
            <div className="flex flex-col items-center w-[85px] shrink-0 relative z-10">
              
              {/* The 3-people Logo Above Photo */}
              <div className="absolute -top-[35px] left-0 w-[85px] flex justify-center items-center h-[20px] overflow-visible z-10">
                <img src={nisnImage} alt="Logo NISN" className="max-w-[300%] max-h-[300%] object-contain mix-blend-multiply rotate-90 scale-[1.35]" />
              </div>

              <div className="w-[85px] h-[115px] bg-red-600 border-2 border-white shadow-sm relative overflow-hidden">
                {student.foto_profil ? (
                  <img src={student.foto_profil} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-red-600 flex items-center justify-center">
                    <span className="text-[11px] text-white">3x4</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Data fields) */}
            <div className="flex-1 z-10 pt-1">
              <table className="text-[13px] text-black font-serif w-full leading-[1.35]">
                <tbody>
                  <tr>
                    <td className="w-[105px] pb-1.5 font-semibold whitespace-nowrap">NISN</td>
                    <td className="w-3 pb-1.5 font-semibold">:</td>
                    <td className="pb-1.5 font-bold whitespace-nowrap">{student.nisn || '-'}</td>
                  </tr>
                  <tr>
                    <td className="pb-1.5 font-semibold whitespace-nowrap">Nama</td>
                    <td className="pb-1.5 font-semibold">:</td>
                    <td className="pb-1.5 uppercase whitespace-nowrap">{student.nama_lengkap || '-'}</td>
                  </tr>
                  <tr>
                    <td className="pb-1.5 font-semibold whitespace-nowrap">Tempat Lahir</td>
                    <td className="pb-1.5 font-semibold">:</td>
                    <td className="pb-1.5 uppercase whitespace-nowrap">{student.tempat_lahir || '-'}</td>
                  </tr>
                  <tr>
                    <td className="pb-1.5 font-semibold whitespace-nowrap">Tanggal Lahir</td>
                    <td className="pb-1.5 font-semibold">:</td>
                    <td className="pb-1.5 whitespace-nowrap">{formatDate(student.tanggal_lahir)}</td>
                  </tr>
                  <tr>
                    <td className="pb-1.5 font-semibold whitespace-nowrap">Jenis Kelamin</td>
                    <td className="pb-1.5 font-semibold">:</td>
                    <td className="pb-1.5 capitalize whitespace-nowrap">{student.jenis_kelamin || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* QR Code (Absolute to Card) */}
          <div className="absolute bottom-5 right-6 w-[70px] h-[70px] bg-white p-1 shadow-sm border border-slate-200 z-10">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&ecc=H&data=${encodeURIComponent(`NISN : ${student.nisn || '-'} || Nama : ${student.nama_lengkap || '-'}`)}`} 
              alt="QR" 
              className="w-full h-full object-contain"
            />
            {/* Logo Tut Wuri in Center of QR */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-[1.5px] rounded-sm">
                <img src={tutWuriUrl} alt="Logo SD/Tut Wuri" className="w-[16px] h-[16px] object-contain" />
              </div>
            </div>
          </div>

          {/* DAPODIK Logo (Absolute to Card) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center z-10">
             <div className="flex items-center gap-1">
               <span className="text-[18px] font-black text-[#1e4b7a] tracking-tighter">DAPODIK</span>
               <div className="w-4 h-4 bg-[#f8b22a] border border-[#1e4b7a] rounded-sm flex items-center justify-center">
                 <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
               </div>
             </div>
             <span className="text-[6px] font-bold text-[#1e4b7a] tracking-[0.2em] uppercase -mt-0.5">Data Pokok Pendidikan</span>
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
