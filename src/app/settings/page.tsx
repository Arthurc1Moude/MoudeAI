'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUser, useDoc, useMemoFirebase } from "@/firebase";
import { useFirestore } from "@/firebase/provider";
import { doc } from "firebase/firestore";
import { useActionState, useEffect, useState } from "react";
import { updateSettings, type SettingsState } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { VoiceSelection, type VoiceOption } from "@/components/voice-selection";

type UserProfile = {
  username?: string;
  email?: string;
  voice?: VoiceOption['id'];
};

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userRef);

  const [username, setUsername] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption['id']>('Algenib');

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
      setSelectedVoice(userProfile.voice || 'Algenib');
    }
  }, [userProfile]);

  const initialSettingsState: SettingsState = {};
  const [settingsState, settingsFormAction, isPending] = useActionState(updateSettings, initialSettingsState);

  useEffect(() => {
    if (settingsState?.success) {
      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated.',
      });
    }
    if (settingsState?.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: settingsState.error,
      });
    }
  }, [settingsState, toast]);

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <header className="bg-background/50 backdrop-blur-sm border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and voice preferences.</p>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="container">
          <form action={settingsFormAction} className="space-y-8">
            {user && <input type="hidden" name="uid" value={user.uid} />}
            <input type="hidden" name="voice" value={selectedVoice} />

            <Card className="bg-card/50 backdrop-blur-sm border-0 rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your display name"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user?.email || ''} 
                    className="rounded-lg" 
                    disabled 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Separator />

            <Card className="bg-card/50 backdrop-blur-sm border-0 rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle>Voice Preference</CardTitle>
              </CardHeader>
              <CardContent>
                <VoiceSelection 
                  selectedVoice={selectedVoice}
                  onVoiceSelect={setSelectedVoice}
                />
              </CardContent>
            </Card>

            <Separator />

            <Card className="bg-card/50 backdrop-blur-sm border-0 rounded-xl shadow-lg">
              <CardHeader>
                <CardTitle>Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" className="rounded-lg" disabled/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" className="rounded-lg" disabled/>
                </div>
                <p className="text-sm text-muted-foreground">Password changes are disabled in this demo.</p>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button type="submit" className="rounded-lg w-32" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
