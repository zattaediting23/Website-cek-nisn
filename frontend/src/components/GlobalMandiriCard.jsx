import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import globalLogo from '../global.jpg';

const GlobalMandiriCard = ({ student }) => {
  const cardRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { quality: 1, pixelRatio: 3 });
      const link = document.createElement('a');
      link.download = `Kartu-GM-${student.nama_lengkap || 'Siswa'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Gagal mengunduh kartu:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const d = new Date(dateString);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={scrollContainerRef}
        className={`w-full max-w-[480px] overflow-x-auto pb-4 custom-scrollbar select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <div 
          ref={cardRef}
          className="relative w-[480px] h-[300px] shrink-0 rounded-lg overflow-hidden bg-white text-black font-sans border border-slate-200"
          style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
        >
          {/* --- BACKGROUND SVGS --- */}
          <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 480 300" preserveAspectRatio="none">
            <defs>
              <pattern id="batik" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20,0 A20,20 0 0,0 40,20 A20,20 0 0,0 20,40 A20,20 0 0,0 0,20 A20,20 0 0,0 20,0" fill="none" stroke="#f6d365" strokeWidth="1.5" opacity="0.25"/>
                <circle cx="20" cy="20" r="10" fill="none" stroke="#f6d365" strokeWidth="1" opacity="0.3"/>
                <circle cx="20" cy="20" r="3" fill="#f6d365" opacity="0.4"/>
              </pattern>
            </defs>

            {/* Top-Left Yellow Shape */}
            <path d="M0,0 L180,0 C150,40 100,60 0,70 Z" fill="#f5d97d" />

            {/* Yellow backdrop for Red Batik */}
            <path d="M0,45 C85,35 170,75 180,160 C190,245 140,295 90,300 L0,300 Z" fill="#f2c94c" />
            
            {/* Main Red Batik at BOTTOM LEFT */}
            <path d="M0,50 C80,40 160,80 170,160 C180,240 130,290 80,300 L0,300 Z" fill="#cf4370" />
            <path d="M0,50 C80,40 160,80 170,160 C180,240 130,290 80,300 L0,300 Z" fill="url(#batik)" />

            {/* Purple cloud shape at bottom right */}
            <path d="M370,300 C360,280 380,260 400,260 C410,240 440,230 460,240 C470,210 480,210 480,210 L480,300 Z" fill="#d2c4df" opacity="0.8" />
            <path d="M390,300 C380,285 395,270 410,270 C415,255 435,245 450,255 L480,245 L480,300 Z" fill="#c3b1d4" opacity="0.6" />
          </svg>

          {/* --- CONTENT LAYER --- */}
          <div className="relative z-10 w-full h-full">
            
            {/* HEADER AREA (Anchored to Right) */}
            <div className="absolute top-[18px] right-0 h-[54px] w-[340px] bg-[#fbf5d4] rounded-l-full flex items-center z-0 shadow-sm">
              {/* GM Logo */}
              <div className="relative z-10 w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center border-[3px] border-[#f2c94c] shadow-md overflow-hidden flex-shrink-0 -ml-5">
                <img src={globalLogo} alt="Logo GM" className="w-full h-full object-cover -rotate-90 scale-[1.35]" draggable="false" />
              </div>
              {/* Text */}
              <div className="flex-1 flex flex-col justify-center items-center pr-3 pl-1">
                <h1 className="text-[16px] font-black text-black leading-[1.1] tracking-wider" style={{ fontFamily: 'Arial, sans-serif' }}>KARTU PELAJAR</h1>
                <h2 className="text-[13px] font-black text-black leading-[1.1] tracking-wide" style={{ fontFamily: 'Arial, sans-serif' }}>SD GLOBAL MANDIRI PATROL</h2>
                <p className="text-[8px] font-bold text-black leading-tight mt-[1px]">Jl. Wirautama No. 103, Patrol, Kab. Indramayu</p>
              </div>
            </div>

            {/* PHOTO */}
            <div className="absolute top-[90px] left-[35px]">
              <div className="w-[85px] h-[110px] bg-slate-200 border-[2px] border-white overflow-hidden shadow-sm">
                {(student.foto_profil_gm || student.foto_profil) ? (
                  <img src={student.foto_profil_gm || student.foto_profil} alt="Foto" className="w-full h-full object-cover" draggable="false" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] text-center p-2">Foto</div>
                )}
              </div>
            </div>

            {/* STUDENT DATA */}
            <div className="absolute top-[95px] left-[140px] w-[300px]">
              <table className="text-[10px] text-[#111] leading-[1.6]" style={{ fontFamily: 'Arial, sans-serif' }}>
                <tbody>
                  <tr className="font-bold">
                    <td className="w-[65px] align-top">NIS/NISN</td>
                    <td className="w-2 align-top">:</td>
                    <td className="align-top">{student.nisn || '-'}</td>
                  </tr>
                  <tr className="font-medium">
                    <td className="align-top">T . T . L</td>
                    <td className="align-top">:</td>
                    <td className="align-top">{student.tempat_lahir || '-'}, {formatDate(student.tanggal_lahir)}</td>
                  </tr>
                  <tr className="font-medium">
                    <td className="align-top">Kelamin</td>
                    <td className="align-top">:</td>
                    <td className="align-top">{student.jenis_kelamin || '-'}</td>
                  </tr>
                  <tr className="font-medium">
                    <td className="align-top">Alamat</td>
                    <td className="align-top">:</td>
                    <td className="align-top">Ciputat</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* BOTTOM STAMP & SIGNATURE */}
            <div className="absolute bottom-[10px] left-[150px] flex items-end">
              
              {/* STAMP */}
              <div className="relative top-1 left-0 opacity-85 rotate-[-15deg] z-20">
                <div className="w-[60px] h-[60px] rounded-full border-[1.5px] border-blue-800 flex items-center justify-center p-0.5 bg-white/40 backdrop-blur-[1px]">
                  <div className="w-full h-full rounded-full border-[1px] border-blue-800 border-dashed flex flex-col items-center justify-center text-center relative">
                     {/* Circular Text (Simulated) */}
                     <span className="text-[4px] text-blue-800 font-bold uppercase leading-[1] mt-1">SD GLOBAL MANDIRI</span>
                     <span className="text-[5px] text-blue-800 font-bold uppercase leading-[1] mt-[1px]">PATROL</span>
                     <div className="absolute inset-0 flex items-center justify-center opacity-30 top-1">
                        <img src={globalLogo} alt="" className="w-6 h-6 object-contain grayscale -rotate-90" draggable="false" />
                     </div>
                  </div>
                </div>
              </div>

              {/* SIGNATURE AREA */}
              <div className="flex flex-col items-center relative z-10 text-center ml-[25px] pb-1">
                <p className="text-[9.5px] text-[#111] font-bold mb-[1px]" style={{ fontFamily: 'Arial, sans-serif' }}>Patrol, 10 Agustus 2024</p>
                <p className="text-[9.5px] text-[#111] font-bold mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Kepala Sekolah</p>
                
                <div className="relative h-[28px] flex items-center justify-center w-full my-0.5">
                  <div className="relative z-10 font-['Brush_Script_MT',cursive] text-[#1e3a8a] text-[28px] -rotate-6 ml-2">
                    Mona Affrias
                  </div>
                </div>

                <p className="text-[10px] text-[#111] font-black" style={{ fontFamily: 'Arial, sans-serif' }}>
                  MONA AFFRIAS, S.E.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-6 py-2.5 bg-white text-blue-600 border border-blue-100 font-semibold rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all mt-4"
      >
        <Download className="w-4 h-4" />
        Unduh Kartu Pelajar
      </button>
    </div>
  );
};

export default GlobalMandiriCard;
