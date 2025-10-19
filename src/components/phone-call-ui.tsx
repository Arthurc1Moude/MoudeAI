

'use client';
import type { Timeout } from 'node:timers';

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bot, Mic, MicOff, PhoneOff, Waves } from "lucide-react";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { generateAudioAction, type AudioState } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { type User } from "firebase/auth";
import { cn } from "@/lib/utils";

interface PhoneCallUIProps {
  text: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function PhoneCallUI({ text, open, onOpenChange, user }: PhoneCallUIProps) {
  const [status, setStatus] = useState<'connecting' | 'active' | 'error' | 'ended'>('connecting');
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const initialAudioState: AudioState = {};
  const [audioState, audioFormAction, isAudioPending] = useActionState(generateAudioAction, initialAudioState);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const [isConnecting, startConnecting] = useTransition();

  useEffect(() => {
    if (open) {
      // Reset state on open
      setStatus('connecting');
      setTimer(0);
      setIsMuted(false);
      
      startConnecting(() => {
        const formData = new FormData();
        formData.append('text', text);
        formData.append('uid', user.uid);
        audioFormAction(formData);
      });
    }
  }, [open, text, user.uid, audioFormAction, startConnecting]);


  useEffect(() => {
    if (audioState?.audioUrl && audioRef.current) {
      audioRef.current.src = audioState.audioUrl;
      audioRef.current.play().then(() => {
        setStatus('active');
      }).catch(e => {
        console.error("Audio playback failed:", e);
        setStatus('error');
      });
    }
    if (audioState?.error) {
      toast({
        variant: "destructive",
        title: "Audio Generation Error",
        description: audioState.error,
      });
      setStatus('error');
    }
  }, [audioState, toast]);

  useEffect(() => {
  let interval: Timeout | undefined;
    if (status === 'active') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if(audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleHangUp = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setStatus('ended');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl bg-gradient-to-br from-gray-900 to-black text-white border-white/10 backdrop-blur-lg shadow-2xl shadow-black/40">
        <DialogTitle className="sr-only">AI Voice Call</DialogTitle>
        <DialogDescription className="sr-only">An active voice call with Moude AI. The AI is reading a message aloud.</DialogDescription>
        <div className="flex flex-col items-center gap-6 py-8">
          <p className="text-lg font-medium text-gray-300 tracking-wider">
            {isConnecting && 'Connecting...'}
            {status === 'active' && formatTime(timer)}
            {status === 'error' && 'Call Failed'}
            {status === 'ended' && 'Call Ended'}
          </p>

          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-gray-700 shadow-lg">
               <AvatarFallback className="bg-gradient-to-br from-primary to-red-500 text-white">
                <Bot size={80} />
              </AvatarFallback>
            </Avatar>
            {(isConnecting || status === 'active') && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Waves className="h-40 w-40 animate-pulse text-green-400 opacity-20" />
                 </div>
            )}
             <div className="absolute inset-0 rounded-full ring-4 ring-green-500/50 ring-offset-4 ring-offset-gray-900 animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-bold mt-2">Moude AI</h2>
          
          <div className="flex items-center gap-4 text-gray-400">
            <Mic className="h-6 w-6 text-green-500 animate-pulse"/>
            <p>Speaking...</p>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <Button 
                size="icon" 
                variant="ghost"
                className={cn(
                  "h-16 w-16 rounded-full transition-all text-white/80 hover:text-white",
                   isMuted ? "bg-white/10" : "bg-white/20 hover:bg-white/30"
                )}
                onClick={() => setIsMuted(!isMuted)}
                aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
            </Button>
            <Button 
                size="icon" 
                className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 shadow-lg ring-4 ring-red-600/50 hover:ring-red-700/50 transition-all"
                onClick={handleHangUp}
                aria-label="Hang up"
            >
              <PhoneOff size={32} />
            </Button>
          </div>
        </div>
      </DialogContent>
      <audio ref={audioRef} onEnded={handleHangUp} className="hidden" />
    </Dialog>
  );
}
