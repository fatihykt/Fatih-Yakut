/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Scale, 
  Construction, 
  RefreshCw,
  Search,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types for the report
interface ReportSection {
  title: string;
  items: any[];
}

interface SourceInfo {
  article: string; // Madde numarası
  date: string;    // Resmi Gazete tarihi
  number: string;  // Resmi Gazete sayısı
  title: string;   // Mevzuat/Karar tam başlığı (Sitedeki orijinal hali)
}

interface GazetteReport {
  mostImportant: {
    title: string;
    change: string;
    affected: string;
    impact: string;
    summary: string;
    sourceInfo: SourceInfo;
  }[];
  regulations: {
    previous: string;
    newContent: string;
    deadlines: string;
    description: string;
    sourceInfo: SourceInfo;
  }[];
  appointments: {
    title: string;
    institution: string;
    details: string;
    sourceInfo: SourceInfo;
  }[];
  economy: {
    changes: string;
    impact: string;
    sourceInfo: SourceInfo;
  }[];
  constitutionalCourt: {
    title: string;
    description: string;
    outcome: string;
    sourceInfo: SourceInfo;
  }[];
  technicalExplanation: string;
  priorityTopics: {
    topic: string;
    update: string;
    sourceInfo: SourceInfo;
  }[];
  criticalUpdate: string;
}

const SourceBadge = ({ info }: { info: SourceInfo }) => {
  if (!info) return null;
  return (
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <FileText size={10} /> Orijinal Mevzuat Başlığı
        </span>
        <p className="text-[11px] font-medium text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
          {info.title || 'Başlık bilgisi bulunamadı'}
        </p>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-mono text-slate-400 italic">
        <div className="flex items-center gap-1">
          <Scale size={10} className="text-slate-300" />
          <span>MADDE: <span className="text-slate-500 font-bold uppercase">{info.article || '-'}</span></span>
        </div>
        <div className="flex items-center gap-1">
          <FileText size={10} className="text-slate-300" />
          <span>TARİH/SAYI: <span className="text-slate-500 font-bold uppercase">{info.date || '-'} / {info.number || '-'}</span></span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [report, setReport] = useState<GazetteReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toLocaleDateString('tr-TR'));

  const fetchGazetteReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Bugünkü (${new Date().toLocaleDateString('tr-TR')}) Türkiye Cumhuriyeti Resmi Gazete içeriğini analiz et ve aşağıdaki formatta Türkçe bir rapor hazırla.
        
        Lütfen özellikle şu konulara odaklan:
        - İmar ve şehircilik
        - Yapı denetimi
        - Çevre ve şehircilik
        - Kamu ihale mevzuatı
        - Devlet memurları ve kamu personeli
        - Belediyeler
        - Sosyal hizmetler
        - Sağlık
        - Vergi ve ekonomi
        - İnşaat
        - Afet ve yangın güvenliği yönetmelikleri
        - Yapı ruhsatları, kaçış mesafesi, yangın yönetmeliği, geçici kabul, kamu yapım işleri, sosyal tesis / özel tesis sınıflandırmaları.

        Rapor Formatı (JSON):
        {
          "mostImportant": [
            {
              "title": "Kararın Başlığı",
              "change": "Ne değişti?",
              "affected": "Kimler etkilendi?",
              "impact": "Pratik etkisi ne olacak?",
              "summary": "2-3 cümlelik basit özet",
              "sourceInfo": { 
                "article": "İlgili Madde No", 
                "date": "00.00.2026", 
                "number": "00000",
                "title": "SİTEDEKİ TAM MEVZUAT BAŞLIĞI"
              }
            }
          ],
          "regulations": [
            {
              "previous": "Eski durum neydi?",
              "newContent": "Yeni düzenleme ne getiriyor?",
              "deadlines": "Kritik tarihler veya son süreler var mı?",
              "description": "Neden önemli? açıklaması ile birlikte",
              "sourceInfo": { 
                "article": "İlgili Madde No", 
                "date": "00.00.2026", 
                "number": "00000",
                "title": "SİTEDEKİ TAM MEVZUAT BAŞLIĞI"
              }
            }
          ],
          "appointments": [
            {
              "title": "Atama/Görev",
              "institution": "Kurum",
              "details": "Detaylar",
              "sourceInfo": { 
                "article": "İlgili Karar No", 
                "date": "00.00.2026", 
                "number": "00000",
                "title": "SİTEDEKİ TAM MEVZUAT BAŞLIĞI"
              }
            }
          ],
          "economy": [
            {
              "changes": "Vergi/Teşvik/Finansal düzenleme",
              "impact": "Piyasa etkisi",
              "sourceInfo": { 
                "article": "İlgili Madde No", 
                "date": "00.00.2026", 
                "number": "00000",
                "title": "SİTEDEKİ TAM MEVZUAT BAŞLIĞI"
              }
            }
          ],
          "constitutionalCourt": [
            {
              "title": "Karar Başlığı/Konusu",
              "description": "Kararın detaylı ve açıklayıcı özeti",
              "outcome": "Karar sonucu (İptal/Red/Hak İhlali vb.)",
              "sourceInfo": { 
                "article": "Karar/Esas No", 
                "date": "00.00.2026", 
                "number": "00000",
                "title": "SİTEDEKİ TAM MEVZUAT BAŞLIĞI"
              }
            }
          ],
          "technicalExplanation": "Mevzuatın teknik terimlerden arındırılmış, örneklerle halk dilinde açıklaması.",
          "priorityTopics": [
            { 
              "topic": "Konu Başlığı", 
              "update": "Güncelleme detayı",
              "sourceInfo": { 
                "article": "İlgili Madde No", 
                "date": "00.00.2026", 
                "number": "00000",
                "title": "SİTEDEKİ TAM MEVZUAT BAŞLIĞI"
              }
            }
          ],
          "criticalUpdate": "Günün en kritik tek bir cümlesi."
        }

        Kurallar:
        - Her bilgi maddesi için MUTLAKA "sourceInfo" (kaynak bilgisi) ekle.
        - "sourceInfo.title" kısmına, Resmi Gazete web sitesinde yayımlanan o düzenlemenin TAM VE ORIJINAL BAŞLIĞINI (örneğin: "YAPI DENETİMİ UYGULAMA YÖNETMELİĞİNDE DEĞİŞİKLİK YAPILMASINA DAİR YÖNETMELİK") yaz.
        - Madde numarasını, Resmi Gazete tarihini ve sayısını net bir şekilde belirt.
        - Raporu çok uzun tutma.
        - Gereksiz hukuki terminolojiden kaçın.
        - En önemli değişiklikleri en başa koy.
        - Teknik hükümleri uzman olmayanlar için basitleştir.
        - Önem sırasına göre sırala.
        - Mutlaka "Neden önemli?" açıklamasını ekle.
        - JSON dışında bir metin döndürme, sadece geçerli bir JSON nesnesi döndür.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
        },
      });

      const data = JSON.parse(response.text || '{}');
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError("Rapor oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGazetteReport();
  }, [fetchGazetteReport]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Resmi Gazete Takipçisi</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{date}</p>
            </div>
          </div>
          <button 
            onClick={fetchGazetteReport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Güncelleniyor...' : 'Raporu Yenile'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <div className="w-12 h-12 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 font-medium">Bugünkü kararlar analiz ediliyor...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              className="bg-red-50 border border-red-100 p-6 rounded-2xl flex items-start gap-4"
            >
              <AlertCircle className="text-red-600 w-6 h-6 shrink-0 mt-1" />
              <div>
                <h3 className="text-red-900 font-bold">Bir Sorun Oluştu</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button 
                  onClick={fetchGazetteReport}
                  className="mt-4 text-sm font-bold text-red-600 hover:underline"
                >
                  Tekrar Dene
                </button>
              </div>
            </motion.div>
          ) : report ? (
            <motion.div 
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Critical Banner */}
              <div className="bg-red-600 text-white p-6 rounded-2xl shadow-xl shadow-red-100 relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded inline-block mb-3 uppercase tracking-widest">Günün Kritik Gelişmesi</span>
                  <h2 className="text-xl font-bold leading-tight uppercase tracking-tight italic">
                    “{report.criticalUpdate}”
                  </h2>
                </div>
                <div className="absolute top-[-20%] right-[-10%] opacity-10">
                  <AlertCircle size={150} />
                </div>
              </div>

              {/* 1. Most Important Decisions */}
              <section id="important-decisions">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-red-600 w-5 h-5" />
                  <h2 className="text-lg font-bold text-slate-800">1. Günün En Önemli Kararları</h2>
                </div>
                <div className="grid gap-4">
                  {report.mostImportant.map((item, i) => (
                    <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-red-200 transition-colors">
                      <h3 className="font-bold text-slate-900 text-lg mb-4 underline decoration-red-200 underline-offset-4">{item.title}</h3>
                      <div className="grid md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-3">
                          <div>
                            <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Ne Değişti?</span>
                            <p className="text-slate-700 leading-relaxed">{item.change}</p>
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Kimler Etkilendi?</span>
                            <p className="text-slate-700 leading-relaxed font-medium">{item.affected}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <span className="text-slate-400 font-bold text-[10px] uppercase block mb-1">Pratik Etki</span>
                            <p className="text-slate-700 leading-relaxed">{item.impact}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                             <span className="text-blue-600 font-bold text-[10px] uppercase block mb-1">Özet ve Neden Önemli?</span>
                             <p className="text-slate-600 text-xs italic">{item.summary}</p>
                          </div>
                        </div>
                      </div>
                      <SourceBadge info={item.sourceInfo} />
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. New Regulations */}
              <section id="regulations">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="text-blue-600 w-5 h-5" />
                  <h2 className="text-lg font-bold text-slate-800">2. Yeni Yönetmelik ve Tebliğler</h2>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  {report.regulations.map((reg, i) => (
                    <div key={i} className={`p-6 ${i !== 0 ? 'border-t border-slate-100' : ''}`}>
                       <div className="grid md:grid-cols-2 gap-8">
                          <div>
                            <div className="mb-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Önceki Durum</span>
                              <p className="text-sm text-slate-600 line-through decoration-slate-300 decoration-2">{reg.previous}</p>
                            </div>
                            <div>
                               <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2 block">Yeni Düzenleme</span>
                               <p className="text-sm text-slate-900 font-medium">{reg.newContent}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                             {reg.deadlines && (
                               <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                 <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-wider mb-1 block">Kritik Tarihler / Son Süreler</span>
                                 <p className="text-sm text-yellow-900 font-bold">{reg.deadlines}</p>
                               </div>
                             )}
                             <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                               {reg.description}
                             </p>
                          </div>
                       </div>
                       <SourceBadge info={reg.sourceInfo} />
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Appointments */}
              <div className="grid md:grid-cols-2 gap-6">
                <section id="appointments">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="text-slate-600 w-5 h-5" />
                    <h2 className="text-lg font-bold text-slate-800">3. Atama ve Kurumsal Değişimler</h2>
                  </div>
                  <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3">
                    {report.appointments.length > 0 ? report.appointments.map((app, i) => (
                      <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                          <Users className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{app.title}</p>
                          <p className="text-xs text-slate-500 mb-1">{app.institution}</p>
                          <p className="text-[11px] text-slate-400">{app.details}</p>
                          <SourceBadge info={app.sourceInfo} />
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-slate-500 text-center py-4">Bugün önemli bir atama bulunmuyor.</p>
                    )}
                  </div>
                </section>

                <section id="economy">
                  <div className="flex items-center gap-2 mb-4">
                    <Scale className="text-green-600 w-5 h-5" />
                    <h2 className="text-lg font-bold text-slate-800">4. Ekonomi ve Vergi</h2>
                  </div>
                  <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4">
                    {report.economy.map((eco, i) => (
                      <div key={i}>
                        <p className="text-sm font-bold text-slate-900 mb-1">{eco.changes}</p>
                        <p className="text-xs text-slate-600">{eco.impact}</p>
                        <SourceBadge info={eco.sourceInfo} />
                      </div>
                    ))}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                       <CheckCircle2 className="w-4 h-4 text-green-500" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Piyasa Etkisi Değerlendirildi</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Constitutional Court Decisions */}
              <section id="aym-decisions">
                 <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="text-purple-600 w-5 h-5" />
                    <h2 className="text-lg font-bold text-slate-800">Anayasa Mahkemesi Kararları</h2>
                 </div>
                 <div className="space-y-4">
                    {report.constitutionalCourt && report.constitutionalCourt.length > 0 ? (
                      report.constitutionalCourt.map((aym, i) => (
                        <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl border-l-4 border-l-purple-500">
                          <h3 className="font-bold text-slate-900 mb-2">{aym.title}</h3>
                          <p className="text-sm text-slate-700 leading-relaxed mb-4">{aym.description}</p>
                          <div className="inline-block bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                            SONUÇ: {aym.outcome}
                          </div>
                          <SourceBadge info={aym.sourceInfo} />
                        </div>
                      ))
                    ) : (
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl text-center">
                        <p className="text-sm text-slate-500">Bugün yayımlanan bir Anayasa Mahkemesi kararı bulunmuyor.</p>
                      </div>
                    )}
                 </div>
              </section>

              {/* 5. Technical Explanation */}
              <section id="technical">
                <div className="bg-slate-900 text-slate-100 p-8 rounded-3xl relative overflow-hidden">
                   <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                      <div className="bg-white/10 p-4 rounded-2xl shrink-0">
                        <Construction size={32} className="text-blue-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <span className="bg-blue-500 w-2 h-6 rounded-full inline-block"></span>
                          5. Teknik ve Mesleki Analiz (Basit Dil)
                        </h2>
                        <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                          {report.technicalExplanation}
                        </p>
                      </div>
                   </div>
                   <div className="absolute top-1/2 left-[-5%] opacity-5">
                      <Search size={300} />
                   </div>
                </div>
              </section>

              {/* 6. Priority Topics */}
              <section id="priority-topics">
                 <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="text-orange-500 w-5 h-5" />
                    <h2 className="text-lg font-bold text-slate-800">6. Sizin İçin Özel Öncelikli Konular</h2>
                 </div>
                 <div className="grid sm:grid-cols-2 gap-4">
                    {report.priorityTopics.map((topic, i) => (
                      <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col">
                        <span className="text-[10px] font-bold text-orange-600 uppercase mb-2">{topic.topic}</span>
                        <p className="text-sm text-slate-700 leading-relaxed">{topic.update}</p>
                        <SourceBadge info={topic.sourceInfo} />
                      </div>
                    ))}
                 </div>
              </section>

              <footer className="pt-10 pb-20 text-center">
                <p className="text-slate-400 text-xs">
                   Bu rapor yapay zeka tarafından günlük Resmi Gazete içerikleri analiz edilerek oluşturulmuştur.<br/>
                   Resmi işlemlerden önce mutlaka orijinal mevzuatı kontrol ediniz.
                </p>
              </footer>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  );
}
