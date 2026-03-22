import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { useGetCertificate } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Download, Share2, Award, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Certificate() {
  const { user, authHeaders } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: cert, isLoading } = useGetCertificate({
    query: { enabled: !!user?.certificateGenerated },
    request: { headers: authHeaders }
  });

  if (isLoading || !user) {
    return <AppLayout requireAuth />;
  }

  if (!user.certificateGenerated || !cert) {
    return (
      <AppLayout requireAuth>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Award className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Certificate Locked</h2>
          <p className="text-muted-foreground max-w-md">
            You must complete all internship tasks to unlock your certificate. Head back to the tasks page to continue your progress.
          </p>
        </div>
      </AppLayout>
    );
  }

  const handleDownload = async () => {
    if (!certRef.current) return;
    try {
      setIsGenerating(true);
      
      // Temporarily ensure high quality render
      const scale = 3; 
      const canvas = await html2canvas(certRef.current, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      
      // A4 Landscape: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      pdf.save(`${cert.userName.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppLayout requireAuth>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-display font-bold">Your Certificate</h1>
            <p className="text-muted-foreground">Proof of your dedication and hard work.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-xl">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button 
              onClick={handleDownload} 
              disabled={isGenerating}
              className="rounded-xl shadow-shadow-primary"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating PDF...</>
              ) : (
                <><Download className="w-4 h-4 mr-2" /> Download PDF</>
              )}
            </Button>
          </div>
        </div>

        {/* Certificate Container for rendering */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card w-full max-w-[1000px] aspect-[1.414] mx-auto shadow-2xl rounded-sm overflow-hidden border border-border"
        >
          {/* The actual certificate that gets captured */}
          <div 
            ref={certRef}
            className="w-full h-full p-12 bg-white relative text-black"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {/* Outer Decorative Border */}
            <div className="absolute inset-4 border-2 border-primary/20" />
            <div className="absolute inset-5 border border-primary/10" />

            <div className="h-full flex flex-col items-center justify-center text-center px-16 relative z-10">
              
              <div className="mb-8">
                <span className="text-primary font-display font-bold text-3xl tracking-tight uppercase">
                  InternHub
                </span>
                <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full" />
              </div>

              <h2 className="text-5xl font-serif text-gray-900 mb-2 uppercase tracking-widest">
                Certificate of Completion
              </h2>
              <p className="text-lg text-gray-500 uppercase tracking-widest mb-10">
                This is to proudly certify that
              </p>

              <h3 className="text-6xl font-serif italic text-primary mb-10 font-bold">
                {cert.userName}
              </h3>

              <p className="text-xl text-gray-700 max-w-3xl leading-relaxed mb-16">
                has successfully completed the <span className="font-bold text-gray-900">{cert.internshipTitle}</span> program 
                with exceptional performance over {cert.totalDays} days in the field of {cert.internshipField}.
              </p>

              <div className="w-full flex justify-between items-end px-12 mt-auto">
                <div className="text-center">
                  <div className="w-48 border-b-2 border-gray-400 mb-2" />
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Date</p>
                  <p className="text-base text-gray-900">{cert.completionDate}</p>
                </div>
                
                <div className="w-32 h-32 relative flex items-center justify-center">
                  <img 
                    src={`${import.meta.env.BASE_URL}images/certificate-seal.png`} 
                    alt="Official Seal"
                    className="w-full h-full object-contain drop-shadow-xl"
                  />
                </div>

                <div className="text-center">
                  <div className="w-48 border-b-2 border-gray-400 mb-2" />
                  <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Certificate ID</p>
                  <p className="text-base text-gray-900 font-mono">{cert.certificateId}</p>
                </div>
              </div>

            </div>
            
            {/* Background watermarks / styling */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden">
              <Award className="w-[800px] h-[800px] text-primary" />
            </div>
          </div>
        </motion.div>

      </div>
    </AppLayout>
  );
}
