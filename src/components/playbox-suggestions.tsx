'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Dices, Feather } from "lucide-react";

interface PlayboxSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
    { 
        title: "Dungeon Adventure",
        description: "Explore a dark dungeon, fight monsters, and find treasure.",
        prompt: "Let's play a classic fantasy dungeon crawl. I am a brave adventurer stepping into a long-forgotten tomb...",
        Icon: Dices,
    },
    {
        title: "Sci-Fi Mystery",
        description: "Solve a crime on a futuristic space station.",
        prompt: "Let's play a sci-fi mystery. I am a detective on the orbital station 'Helios', and I've just been assigned a strange new case...",
        Icon: Sparkles,
    },
    {
        title: "Collaborative Story",
        description: "Write a story together one sentence at a time.",
        prompt: "Let's write a story together, one sentence at a time. I'll start: The old clock tower chimed for a thirteenth time, and a thick fog rolled into the cobblestone streets.",
        Icon: Feather,
    }
];

export function PlayboxSuggestions({ onSuggestionClick }: PlayboxSuggestionsProps) {
  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold font-headline bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Welcome to the PlayBox!
        </h2>
        <p className="text-muted-foreground mt-2">
          Choose an adventure or create your own.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        {suggestions.map((suggestion) => (
             <Card 
                key={suggestion.title}
                className="bg-card/50 backdrop-blur-sm border-border/30 hover:border-primary/50 hover:bg-card/80 transition-all cursor-pointer flex flex-col"
                onClick={() => onSuggestionClick(suggestion.prompt)}
             >
                <CardContent className="p-6 flex flex-col items-center text-center flex-1">
                    <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                        <suggestion.Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{suggestion.title}</h3>
                    <p className="text-sm text-muted-foreground flex-1">{suggestion.description}</p>
                    <Button variant="link" className="mt-4">Start Playing</Button>
                </CardContent>
            </Card>
        ))}
      </div>
      <p className="text-muted-foreground mt-8 text-sm">
        Or, just type your own story idea in the input below and send!
      </p>
    </div>
  );
}
