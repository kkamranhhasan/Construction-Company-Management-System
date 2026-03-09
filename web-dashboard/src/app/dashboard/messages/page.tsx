"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Search, Loader2, Send, MessageSquareHeart, User, Paperclip, Mic, X, Play, Square, Image as ImageIcon, Video, FileAudio, Camera, MapPin, Check, CheckCheck, CircleDot } from "lucide-react"

export default function MessagesPage() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  
  const [contacts, setContacts] = useState<any[]>([])
  const [loadingContacts, setLoadingContacts] = useState(true)
  const [activeContact, setActiveContact] = useState<any | null>(null)
  
  const [messages, setMessages] = useState<any[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Video / Photo Capture State
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [isRecordingVideo, setIsRecordingVideo] = useState(false)
  const videoRecorderRef = useRef<MediaRecorder | null>(null)
  const videoChunksRef = useRef<Blob[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Clear states when changing contacts
  useEffect(() => {
     setNewMessage("")
     setAttachment(null)
     cancelRecording()
     if (showCamera) closeCamera()
  }, [activeContact])

  useEffect(() => {
     fetch("/api/users/contacts")
       .then(res => res.json())
       .then(data => {
           if (Array.isArray(data)) setContacts(data)
           setLoadingContacts(false)
       })
       .catch(() => setLoadingContacts(false))
  }, [])

  useEffect(() => {
     if (!activeContact) return;
     
     setLoadingMessages(true);
     fetch(`/api/messages?userId=${activeContact.id}`)
       .then(res => res.json())
       .then(data => {
           if (Array.isArray(data)) {
               setMessages(data)
               
               // Mark unseen messages as read
               const unreadIds = data
                  .filter((m: any) => m.receiverId === userId && !m.readAt)
                  .map((m: any) => m.id);
                  
               if (unreadIds.length > 0) {
                   fetch("/api/messages/read", {
                       method: "PATCH",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ messageIds: unreadIds })
                   }).catch(console.error);
               }
           }
           setLoadingMessages(false)
       })
       .catch(() => setLoadingMessages(false))
  }, [activeContact, userId])

  useEffect(() => {
     // Scroll to bottom when messages update
     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
      e?.preventDefault()
      if ((!newMessage.trim() && !attachment) || !activeContact || sending) return;
      
      const content = newMessage.trim();
      const currentAttachment = attachment; // Copy reference
      
      setNewMessage("");
      setAttachment(null);
      setSending(true);
      
      // Optimistic update
      const tempMsg = {
          id: `temp-${Date.now()}`,
          senderId: userId,
          receiverId: activeContact.id,
          content,
          fileType: currentAttachment ? currentAttachment.type.split('/')[0] : null,
          fileName: currentAttachment ? currentAttachment.name : null,
          createdAt: new Date().toISOString(),
          sender: session?.user || { name: 'Me' },
          isDelivered: false
      }
      setMessages(prev => [...prev, tempMsg])
      
      try {
          const formData = new FormData();
          formData.append("receiverId", activeContact.id);
          formData.append("content", content);
          if (currentAttachment) {
              formData.append("file", currentAttachment);
          }

          const res = await fetch("/api/messages", {
              method: "POST",
              body: formData
          })
          const data = await res.json()
          
          if (res.ok) {
              // Replace optimistic message with real one
              setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m))
          }
      } catch (err) {
          console.error("Failed to send message", err)
      } finally {
          setSending(false)
      }
  }

  const shareLocation = () => {
      if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser");
          return;
      }
      
      setSending(true);
      navigator.geolocation.getCurrentPosition(
          async (position) => {
              const { latitude, longitude } = position.coords;
              
              const tempMsg = {
                  id: `temp-loc-${Date.now()}`,
                  senderId: userId,
                  receiverId: activeContact.id,
                  content: "📍 Shared Location",
                  latitude,
                  longitude,
                  createdAt: new Date().toISOString(),
                  sender: session?.user || { name: 'Me' },
                  isDelivered: false
              }
              setMessages(prev => [...prev, tempMsg])
              
              try {
                  const formData = new FormData();
                  formData.append("receiverId", activeContact.id);
                  formData.append("content", "📍 Shared Location");
                  formData.append("latitude", latitude.toString());
                  formData.append("longitude", longitude.toString());
                  
                  const res = await fetch("/api/messages", { method: "POST", body: formData });
                  const data = await res.json();
                  if (res.ok) {
                      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m))
                  }
              } catch(e) {
                  console.error(e)
              } finally {
                  setSending(false)
              }
          },
          (error) => {
              alert("Unable to retrieve your location");
              setSending(false)
          }
      );
  }

  // Camera Handlers
  const openCamera = async () => {
      setShowCamera(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          streamRef.current = stream;
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
      } catch (err) {
          console.error("Camera access denied", err);
          alert("Camera access denied or unavailable.");
          setShowCamera(false);
      }
  }

  const closeCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      setShowCamera(false);
      setIsRecordingVideo(false);
  }

  const capturePhoto = () => {
      if (!videoRef.current) return;
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
              if (blob) {
                  const file = new File([blob], `Photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                  setAttachment(file);
                  closeCamera();
              }
          }, 'image/jpeg');
      }
  }

  const toggleVideoRecording = () => {
      if (isRecordingVideo) {
          // Stop recording
          videoRecorderRef.current?.stop();
          setIsRecordingVideo(false);
      } else {
          // Start recording
          if (!streamRef.current) return;
          videoChunksRef.current = [];
          
          try {
              const recorder = new MediaRecorder(streamRef.current);
              videoRecorderRef.current = recorder;
              
              recorder.ondataavailable = (e) => {
                  if (e.data.size > 0) videoChunksRef.current.push(e.data);
              }
              recorder.onstop = () => {
                  const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
                  const file = new File([videoBlob], `Video-${Date.now()}.webm`, { type: 'video/webm' });
                  setAttachment(file);
                  closeCamera();
              }
              recorder.start();
              setIsRecordingVideo(true);
          } catch(e) {
              console.error("Could not start video recording", e)
          }
      }
  }

  // Audio Recording Handlers
  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) audioChunksRef.current.push(event.data);
          };

          mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              const audioFile = new File([audioBlob], `VoiceMessage-${Date.now()}.webm`, { type: 'audio/webm' });
              setAttachment(audioFile);
              // Stop all audio tracks to turn off microphone
              stream.getTracks().forEach(track => track.stop());
          };

          mediaRecorder.start();
          setIsRecording(true);
          setRecordingDuration(0);

          recordingTimerRef.current = setInterval(() => {
              setRecordingDuration(prev => prev + 1);
          }, 1000);
      } catch (error) {
          console.error("Error accessing microphone:", error);
          alert("Could not access microphone.");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      }
  };

  const cancelRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop(); // This will still fire onstop, but we handle state below
          setIsRecording(false);
          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
          setAttachment(null); // Clear the attachment
      }
  };

  const formatDuration = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const renderMessageContent = (msg: any) => {
      return (
          <div className="flex flex-col gap-1 w-full">
              {msg.latitude && msg.longitude && (
                  <div className="mb-2">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${msg.latitude},${msg.longitude}`} target="_blank" rel="noopener noreferrer" className="block w-full min-w-[200px] max-w-sm overflow-hidden rounded-lg border border-slate-200 dark:border-white/10 relative">
                          {/* Map Image Placeholder using random terrain block as a texture because Google Static Maps requires an API Key */}
                          <img src={`https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80`} 
                               alt="Map Preview" 
                               className="w-full h-32 object-cover bg-slate-200"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                              <div className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 hover:scale-105 transition-transform">
                                  <MapPin className="w-3 h-3 text-red-500" /> View on Map
                              </div>
                          </div>
                      </a>
                  </div>
              )}
              {msg.fileUrl && (
                  <div className="mb-2 max-w-sm rounded-lg overflow-hidden border border-slate-200/50 dark:border-white/10">
                      {msg.fileType === 'image' && (
                          <img src={msg.fileUrl} alt={msg.fileName} className="w-full h-auto object-cover max-h-60" />
                      )}
                      {msg.fileType === 'video' && (
                          <video src={msg.fileUrl} controls className="w-full max-h-60 bg-black" />
                      )}
                      {msg.fileType === 'audio' && (
                          <div className="p-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                              <audio src={msg.fileUrl} controls className="w-full h-10" />
                          </div>
                      )}
                  </div>
              )}
              {/* Optimistic rendering for when url doesn't exist yet but we know the type */}
              {!msg.fileUrl && msg.fileType && (
                   <div className="mb-2 p-4 max-w-sm rounded-lg border border-slate-200/50 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center gap-2 text-slate-500 shadow-inner">
                      <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                      <span className="text-xs font-medium">Uploading {msg.fileType}...</span>
                   </div>
              )}
              {msg.content && <span className="leading-relaxed whitespace-pre-wrap">{msg.content}</span>}
          </div>
      )
  }

  return (
    <div className="flex bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden relative" style={{ height: 'calc(100vh - 12rem)' }}>
        
        {/* Camera Modal Overlay */}
        {showCamera && (
            <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
                <div className="relative w-full max-w-2xl aspect-video bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    
                    {/* Recording Indicator */}
                    {isRecordingVideo && (
                        <div className="absolute top-4 left-4 bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> REC
                        </div>
                    )}
                    
                    <button onClick={closeCamera} className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-md transition">
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="absolute bottom-6 left-0 w-full flex justify-center gap-6">
                        <button onClick={capturePhoto} className="flex flex-col items-center gap-2 group">
                            <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 group-hover:bg-white/40 transition backdrop-blur-sm">
                                <Camera className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-white text-xs font-medium drop-shadow-md">Photo</span>
                        </button>
                        <button onClick={toggleVideoRecording} className="flex flex-col items-center gap-2 group">
                            <div className={`w-16 h-16 rounded-full border-4 ${isRecordingVideo ? 'border-red-500' : 'border-white'} flex items-center justify-center ${isRecordingVideo ? 'bg-red-500/20' : 'bg-white/20 group-hover:bg-white/40'} transition backdrop-blur-sm`}>
                                {isRecordingVideo ? <Square className="w-6 h-6 text-red-500 fill-current" /> : <Video className="w-7 h-7 text-white" />}
                            </div>
                            <span className="text-white text-xs font-medium drop-shadow-md">{isRecordingVideo ? 'Stop' : 'Video'}</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Sidebar Contacts */}
        <div className="w-80 border-r border-slate-200 dark:border-white/10 flex flex-col bg-slate-50/50 dark:bg-slate-900/20">
            <div className="p-4 border-b border-slate-200 dark:border-white/10">
                <h2 className="text-xl font-bold mb-4">Messages</h2>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input type="text" placeholder="Search contacts..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500/50" />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
                {loadingContacts ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
                ) : contacts.length === 0 ? (
                    <div className="text-center p-8 text-sm text-slate-500">No contacts available.</div>
                ) : (
                    <div className="space-y-1">
                        {contacts.map(contact => (
                            <button
                                key={contact.id}
                                onClick={() => setActiveContact(contact)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left
                                    ${activeContact?.id === contact.id ? 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 shadow-sm' : 'hover:bg-white dark:hover:bg-slate-800 border-transparent'}
                                    border
                                `}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden shrink-0 border border-white dark:border-slate-700">
                                    {contact.image ? (
                                        <img src={contact.image} alt={contact.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <div className="font-semibold text-slate-900 dark:text-white truncate text-sm">{contact.name || contact.email || contact.phone}</div>
                                    <div className="text-xs text-slate-500 capitalize">{contact.role.toLowerCase().replace('_', ' ')}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
            {activeContact ? (
                <>
                    {/* Chat Header */}
                    <div className="h-16 border-b border-slate-200 dark:border-white/10 flex items-center px-6 gap-3 shrink-0 shadow-sm z-10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden border border-slate-200 dark:border-slate-700">
                            {activeContact.image ? (
                                <img src={activeContact.image} alt={activeContact.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-5 h-5" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{activeContact.name || activeContact.email || activeContact.phone}</h3>
                            <p className="text-xs text-slate-500 capitalize">{activeContact.role.toLowerCase().replace('_', ' ')}</p>
                        </div>
                    </div>

                    {/* Messages Window */}
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-[#0a0f1a] space-y-4">
                        {loadingMessages ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-orange-500" /></div>
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                                <MessageSquareHeart className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                                <p>No messages yet. Say hello!</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isMe = msg.senderId === userId;
                                const showAvatar = index === messages.length - 1 || messages[index + 1]?.senderId !== msg.senderId;

                                return (
                                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className="w-8 shrink-0 flex flex-col justify-end pb-1">
                                            {showAvatar && !isMe && (
                                                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden border border-white dark:border-slate-800 shadow-sm">
                                                    {msg.sender?.image ? <img src={msg.sender.image} className="w-full h-full object-cover" alt="" /> : <User className="w-4 h-4"/>}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm flex flex-col gap-1 ${
                                                isMe 
                                                    ? 'bg-orange-500 text-white rounded-br-sm' 
                                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white rounded-bl-sm'
                                            }`}>
                                                {renderMessageContent(msg)}
                                            </div>
                                            
                                            {/* Timestamp and Read Receipts */}
                                            <div className="flex items-center gap-1.5 mt-1.5 px-1">
                                                <span className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </span>
                                                
                                                {isMe && (
                                                    <div className="flex items-center">
                                                        {msg.readAt ? (
                                                            <div className="flex items-center gap-1 text-[10px] text-blue-500 font-medium" title={`Seen ${new Date(msg.readAt).toLocaleString()}`}>
                                                                <CheckCheck className="w-3.5 h-3.5" />
                                                                <span>Read</span>
                                                            </div>
                                                        ) : msg.isDelivered ? (
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-400" title="Delivered">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1 text-[10px] text-slate-300" title="Sending">
                                                                <CircleDot className="w-2.5 h-2.5 animate-pulse" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] z-10">
                        {/* Selected Attachment Preview */}
                        {attachment && !isRecording && (
                            <div className="mb-3 px-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {attachment.type.startsWith('image') ? <ImageIcon className="w-5 h-5 text-orange-500 shrink-0" /> :
                                     attachment.type.startsWith('video') ? <Video className="w-5 h-5 text-purple-500 shrink-0" /> :
                                     <FileAudio className="w-5 h-5 text-emerald-500 shrink-0" />}
                                    <span className="text-sm font-medium truncate">{attachment.name}</span>
                                </div>
                                <button onClick={() => setAttachment(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition" title="Remove attachment">
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*,video/*,audio/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) setAttachment(e.target.files[0])
                                }}
                            />
                            
                            {!isRecording ? (
                                <>
                                    <div className="flex items-center gap-1 shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full p-1">
                                        <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-2 text-slate-400 hover:text-orange-500 hover:bg-white dark:hover:bg-slate-800 rounded-full transition shadow-sm"
                                            title="Attach File"
                                        >
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={openCamera}
                                            className="p-2 text-slate-400 hover:text-orange-500 hover:bg-white dark:hover:bg-slate-800 rounded-full transition shadow-sm"
                                            title="Capture Photo or Video"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={shareLocation}
                                            className="p-2 text-slate-400 hover:text-orange-500 hover:bg-white dark:hover:bg-slate-800 rounded-full transition shadow-sm"
                                            title="Share Live Location"
                                        >
                                            <MapPin className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    <input 
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Write a message..."
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-medium"
                                    />
                                    
                                    {newMessage.trim() || attachment ? (
                                        <button 
                                            type="submit"
                                            disabled={sending}
                                            className="w-12 h-12 shrink-0 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-full flex items-center justify-center transition shadow-[0_0_15px_rgba(249,115,22,0.3)] hover:shadow-orange-500/50"
                                        >
                                            <Send className="w-5 h-5 ml-1" />
                                        </button>
                                    ) : (
                                        <button 
                                            type="button"
                                            onClick={startRecording}
                                            className="w-12 h-12 shrink-0 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full flex items-center justify-center transition shadow-sm"
                                            title="Record Audio"
                                        >
                                            <Mic className="w-5 h-5" />
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-between bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-full px-2 py-1.5 pl-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                                        <span className="text-sm font-bold text-red-600 dark:text-red-400 tracking-wide">Recording {formatDuration(recordingDuration)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-950/50 rounded-full p-1 backdrop-blur-sm">
                                        <button type="button" onClick={cancelRecording} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 text-slate-600 dark:text-slate-400 transition" title="Cancel">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={stopRecording} className="w-9 h-9 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition shadow-sm" title="Stop & Attach">
                                            <Square className="w-3.5 h-3.5 fill-current" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-950">
                    <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <MessageSquareHeart className="w-10 h-10 text-orange-500/50" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Your Messages</h2>
                    <p className="font-medium text-sm text-slate-500 text-center max-w-xs">Select a contact from the sidebar to view their message history and reply.</p>
                </div>
            )}
        </div>

    </div>
  )
}
