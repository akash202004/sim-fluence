"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { 
  Navbar, 
  NavBody, 
  NavItems, 
  MobileNav, 
  MobileNavHeader, 
  MobileNavMenu, 
  MobileNavToggle, 
  NavbarButton 
} from "@/components/ui/resizable-navbar";
import { signIn, signOut } from "next-auth/react";

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
}

interface CaptionType {
  id: string;
  name: string;
  description: string;
}

const CAPTION_TYPES: CaptionType[] = [
  { id: "one-line", name: "One Line", description: "Short and punchy caption" },
  { id: "descriptive", name: "Descriptive", description: "Detailed explanation of the photo" },
  { id: "story", name: "Story", description: "Narrative style caption" },
  { id: "question", name: "Question", description: "Engaging question format" },
  { id: "quote", name: "Quote", description: "Inspirational quote style" },
];

// SVG icons for sections
const icons = {
  upload: (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V6M5 12l7-7 7 7"/><rect x="5" y="19" width="14" height="2" rx="1"/></svg>
  ),
  description: (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 9h8M8 13h6"/></svg>
  ),
  platform: (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3h-8"/><path d="M12 7v10"/></svg>
  ),
  tone: (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/></svg>
  ),
  caption: (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 9h8M8 13h6"/></svg>
  ),
  result: (
    <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>
  ),
};

// Remove TikTok from platforms
const SOCIAL_PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: icons.platform },
  { id: "facebook", name: "Facebook", icon: icons.platform },
  { id: "twitter", name: "Twitter", icon: icons.platform },
  { id: "linkedin", name: "LinkedIn", icon: icons.platform },
];

const TONES = [
  { id: "funny", name: "Funny", icon: "😄" },
  { id: "professional", name: "Professional", icon: "💼" },
  { id: "human-touch", name: "Human Touch", icon: "🤝" },
  { id: "inspirational", name: "Inspirational", icon: "✨" },
  { id: "casual", name: "Casual", icon: "😊" },
  { id: "sarcastic", name: "Sarcastic", icon: "😏" },
];

// Update FormSection to use SVG icons and only black/white/gray
const FormSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-black border border-zinc-800 rounded-2xl p-5 shadow-lg">
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
      <span className="text-xl text-white">{icon}</span> {title}
    </h3>
    {children}
  </div>
);

export default function CaptionGeneratorPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Form states
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [description, setDescription] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedCaptionType, setSelectedCaptionType] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [error, setError] = useState("");
  
  // New states for editing and regeneration
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const [regenerationCount, setRegenerationCount] = useState(0);

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Simulation", link: "/simulation" },
    { name: "Analytics", link: "/analytics" },
    { name: "About", link: "/about" },
  ];

  const ProfileDropdown = () => {
    if (!session) return null;
    
    return (
      <div className="relative" ref={profileDropdownRef}>
        <button
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="flex items-center space-x-2 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              width={36}
              height={36}
              className="w-9 h-9 rounded-full border-2 border-zinc-700"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {session.user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </button>
        
        {isProfileDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-50">
            <div className="p-3 border-b border-zinc-800">
              <p className="text-sm font-semibold text-white truncate">
                {session.user?.name || 'User'}
              </p>
              <p className="text-xs text-zinc-400 truncate">
                {session.user?.email || 'user@example.com'}
              </p>
            </div>
            <div className="p-2">
              <button
                onClick={() => {
                  signOut();
                  setIsProfileDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: UploadedPhoto[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
    }));

    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    setUploadedPhotos((prev) => {
      const photo = prev.find(p => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter(p => p.id !== id);
    });
  };

  const generateCaption = async () => {
    if (!uploadedPhotos.length || !description || !selectedPlatform || !selectedTone || !selectedCaptionType) {
      setError("Please fill in all fields to generate a caption.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedCaption("");
    setIsEditing(false);
    setEditedCaption("");

    try {
      const captionType = CAPTION_TYPES.find(ct => ct.id === selectedCaptionType);
      const platform = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);
      const tone = TONES.find(t => t.id === selectedTone);

      const prompt = `Create a ${captionType?.name.toLowerCase()} caption for a ${platform?.name} post with a ${tone?.name.toLowerCase()} tone. \n\nPhoto description: ${description}\n\nRequirements:\n- Platform: ${platform?.name}\n- Tone: ${tone?.name}\n- Caption type: ${captionType?.name}\n- Number of photos: ${uploadedPhotos.length}\n\nGenerate an engaging, platform-appropriate caption that matches the specified tone and type.`;

      const response = await fetch('/api/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          platform: selectedPlatform,
          tone: selectedTone,
          captionType: selectedCaptionType,
          description,
          photoCount: uploadedPhotos.length,
          userId: (session as any).databaseId, // Include the user's database ID
        }),
      });

      if (!response.ok) {
        throw new Error('API response was not ok.');
      }

      const data = await response.json();
      setGeneratedCaption(data.caption);
      setRegenerationCount(prev => prev + 1);
    } catch (err) {
      setError("Failed to generate caption. Please try again later.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to start editing the caption
  const startEditing = () => {
    setIsEditing(true);
    setEditedCaption(generatedCaption);
  };

  // Function to save edited caption
  const saveEditedCaption = () => {
    setGeneratedCaption(editedCaption);
    setIsEditing(false);
    setEditedCaption("");
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setEditedCaption("");
  };

  // Function to regenerate caption
  const regenerateCaption = () => {
    generateCaption();
  };

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-zinc-300">Loading Session...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar className="mt-0 top-0">
        <NavBody>
          <div className="relative z-20 flex items-center">
            <span className="text-xl font-bold text-white">Sim-Fluence</span>
          </div>
          <NavItems items={navItems} />
          <div className="relative z-20 flex flex-row items-center justify-end gap-2">
            {session ? <ProfileDropdown /> : <button onClick={() => signIn("reddit")}>Login</button>}
          </div>
        </NavBody>
        <MobileNav>
          <MobileNavHeader>
            <div className="relative z-20 flex items-center">
              <span className="text-xl font-bold text-white">Sim-Fluence</span>
            </div>
            <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            {navItems.map((item, idx) => (
              <NavbarButton key={idx} href={item.link} variant="secondary" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                {item.name}
              </NavbarButton>
            ))}
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
              AI Caption Generator
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto">
              Upload your photos, provide some context, and let our AI craft the perfect caption.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* Left Column - Form */}
            <div className="lg:col-span-3 space-y-6">
              <FormSection title="Upload Photos" icon={icons.upload}>
                <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center bg-zinc-900/50 hover:border-blue-500 hover:bg-zinc-900 transition-all">
                  <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors shadow-md shadow-blue-900/50">
                    Choose Photos
                  </button>
                  <p className="mt-2 text-sm text-zinc-500">You can upload multiple images (JPG, PNG, WebP)</p>
                </div>
                {uploadedPhotos.length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-base font-medium text-zinc-300 mb-3">
                      Uploaded ({uploadedPhotos.length})
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {uploadedPhotos.map((photo) => (
                        <div key={photo.id} className="relative group aspect-square">
                          <Image src={photo.preview} alt="Preview" width={200} height={200} className="w-full h-full object-cover rounded-lg border border-zinc-800" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                            <button onClick={() => removePhoto(photo.id)} className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-lg font-bold hover:bg-red-500 transition-transform transform hover:scale-110">
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </FormSection>

              <FormSection title="Photo Description" icon={icons.description}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., A group of friends laughing on a beach at sunset, with golden light."
                  className="w-full h-28 p-3 border border-zinc-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-zinc-900 text-white placeholder-zinc-500"
                />
              </FormSection>

              <FormSection title="Choose Platform" icon={icons.platform}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <button key={platform.id} onClick={() => setSelectedPlatform(platform.id)} className={`p-3 rounded-xl border-2 font-medium transition-all flex flex-col items-center justify-center gap-2 text-white h-24 ${selectedPlatform === platform.id ? "border-blue-500 bg-blue-900/30" : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"}`}>
                      <div className="text-3xl">{platform.icon}</div>
                      <div className="text-sm font-semibold">{platform.name}</div>
                    </button>
                  ))}
                </div>
              </FormSection>

              <FormSection title="Choose Tone" icon={icons.tone}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TONES.map((tone) => (
                    <button key={tone.id} onClick={() => setSelectedTone(tone.id)} className={`p-3 rounded-xl border-2 font-medium transition-all flex flex-col items-center justify-center gap-2 text-white h-24 ${selectedTone === tone.id ? "border-blue-500 bg-blue-900/30" : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"}`}>
                       <div className="text-3xl">{tone.icon}</div>
                      <div className="text-sm font-semibold">{tone.name}</div>
                    </button>
                  ))}
                </div>
              </FormSection>
              
              <FormSection title="Caption Type" icon={icons.caption}>
                 <div className="space-y-3">
                  {CAPTION_TYPES.map((type) => (
                    <button key={type.id} onClick={() => setSelectedCaptionType(type.id)} className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all text-white ${selectedCaptionType === type.id ? "border-blue-500 bg-blue-900/30" : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"}`}>
                      <div className="font-semibold">{type.name}</div>
                      <div className="text-sm text-zinc-400">{type.description}</div>
                    </button>
                  ))}
                </div>
              </FormSection>
              
              <button
                onClick={generateCaption}
                disabled={isGenerating || !uploadedPhotos.length || !description || !selectedPlatform || !selectedTone || !selectedCaptionType}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-zinc-600 disabled:to-zinc-700 shadow-lg shadow-blue-900/50"
              >
                {isGenerating ? "Generating..." : "Generate Caption"}
              </button>
            </div>

            {/* Right Column - Generated Caption */}
            <div className="lg:col-span-2 lg:sticky lg:top-24">
               <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col min-h-[500px]">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                  <span>🚀</span> Generated Caption
                </h3>
                <div className="flex-grow flex flex-col justify-center">
                  {isGenerating ? (
                    <div className="text-center">
                        <div className="w-10 h-10 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-zinc-400">Crafting your masterpiece...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                        <p className="text-red-400 font-medium">{error}</p>
                    </div>
                  ) : generatedCaption ? (
                    <div className="space-y-4">
                      <div className="bg-black border border-zinc-700 rounded-xl p-4 min-h-[12rem]">
                        {isEditing ? (
                          <textarea
                            value={editedCaption}
                            onChange={(e) => setEditedCaption(e.target.value)}
                            className="w-full h-full min-h-[12rem] bg-transparent text-white text-base sm:text-lg leading-relaxed resize-none border-none outline-none focus:ring-0"
                            placeholder="Edit your caption here..."
                          />
                        ) : (
                          <p className="text-white whitespace-pre-wrap text-base sm:text-lg leading-relaxed">
                            {generatedCaption}
                          </p>
                        )}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="space-y-3">
                        {isEditing ? (
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={saveEditedCaption}
                              className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-500 font-semibold transition-colors"
                            >
                              Save Changes
                            </button>
                            <button 
                              onClick={cancelEditing}
                              className="w-full py-2.5 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 gap-3">
                            <button 
                              onClick={() => navigator.clipboard.writeText(generatedCaption)} 
                              className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-semibold transition-colors"
                            >
                              Copy
                            </button>
                            <button 
                              onClick={startEditing}
                              className="w-full py-2.5 bg-zinc-600 text-white rounded-lg hover:bg-zinc-500 font-semibold transition-colors"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={regenerateCaption}
                              disabled={isGenerating}
                              className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isGenerating ? "Generating..." : "Regenerate"}
                            </button>
                          </div>
                        )}
                        
                        {/* Regeneration counter */}
                        {regenerationCount > 0 && (
                          <div className="text-center">
                            <p className="text-xs text-zinc-500">
                              Regenerated {regenerationCount} time{regenerationCount !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                        
                        <button 
                          onClick={() => {
                            setGeneratedCaption("");
                            setRegenerationCount(0);
                            setIsEditing(false);
                            setEditedCaption("");
                          }} 
                          className="w-full py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-500 font-semibold transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4 opacity-30">✨</div>
                      <p className="text-zinc-500">Your generated caption will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}