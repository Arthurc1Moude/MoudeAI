'use client';

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CheckCircle, PersonStanding, Triangle } from "lucide-react";

export type VoiceOption = {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Neutral';
  description: string;
};

const voices: VoiceOption[] = [
    { id: 'Algenib', name: 'Algenib', gender: 'Male', description: 'A deep, authoritative voice.' },
    { id: 'Achernar', name: 'Achernar', gender: 'Female', description: 'A clear, professional voice.' },
    { id: 'Canopus', name: 'Canopus', gender: 'Male', description: 'A friendly and warm voice.' },
    { id: 'Sirius', name: 'Sirius', gender: 'Female', description: 'A bright and energetic voice.' },
    { id: 'Rigel', name: 'Rigel', gender: 'Male', description: 'A calm and steady voice.' },
    { id: 'Vega', name: 'Vega', gender: 'Female', description: 'A smooth and sophisticated voice.' },
    { id: 'Hadar', name: 'Hadar', gender: 'Male', description: 'A resonant and engaging voice.' },
    { id: 'Spica', name: 'Spica', gender: 'Female', description: 'A gentle and reassuring voice.' },
    { id: 'Antares', name: 'Antares', gender: 'Neutral', description: 'A balanced, neutral voice.' },
    { id: 'Deneb', name: 'Deneb', gender: 'Neutral', description: 'A crisp, androgynous voice.' },
];

interface VoiceSelectionProps {
  selectedVoice: string;
  onVoiceSelect: (voiceId: string) => void;
}

export function VoiceSelection({ selectedVoice, onVoiceSelect }: VoiceSelectionProps) {
    
  const getIcon = (gender: VoiceOption['gender']) => {
    switch (gender) {
        case 'Male': return <PersonStanding className="h-5 w-5"/>;
        case 'Female': return <PersonStanding className="h-5 w-5"/>; // Could use a different icon
        case 'Neutral': return <Triangle className="h-5 w-5 fill-current"/>;
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {voices.map((voice) => (
        <Card
          key={voice.id}
          onClick={() => onVoiceSelect(voice.id)}
          className={cn(
            'p-4 rounded-lg cursor-pointer transition-all duration-200 border-2',
            selectedVoice === voice.id
              ? 'border-primary bg-primary/10 shadow-lg'
              : 'border-transparent bg-secondary/50 hover:bg-secondary'
          )}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{voice.name}</h3>
            {selectedVoice === voice.id && <CheckCircle className="h-5 w-5 text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{voice.description}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            {getIcon(voice.gender)}
            <span>{voice.gender}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
