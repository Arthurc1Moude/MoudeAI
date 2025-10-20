
import * as React from 'react';
'use client';

import {
  sendMessage,
  generateTitle,
  generateImageAction,
  generateAudioAction,
  type ChatState,
  type ImageState,
  type AudioState,
} from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Bot, Loader2, Send, User as UserIcon, ImageIcon, Phone, Plus, FileUp, ImageUp, Gamepad2, Video, X, File as FileIcon, BrainCircuit } from 'lucide-react';
import Image from 'next/image';
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  useUser,
  useFirestore,
  useCollection,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  serverTimestamp,
  query,
  orderBy,
  doc,
} from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { PhoneCallUI } from '@/components/phone-call-ui';
import { Markdown } from '@/components/Markdown';
import { PlayboxSuggestions } from '@/components/playbox-suggestions';


type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isImage?: boolean;
};

const modules = [
  "Geniea 1 Pro",
  "Geniea 1 Flash",
  "Geniea Nano 1o",
  "Geniea Super 13o",
  "Imagine 1 SUNO",
  "Imagine 1 Pro",
  "Deep Think",
  "PlayBox",
] as const;

export default function ChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;

  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const messagesCollection = useMemoFirebase(() => {
    if (!user || !chatId) return null;
    return query(
      collection(firestore, `users/${user.uid}/chats/${chatId}/messages`),
      orderBy('createdAt')
    );
  }, [firestore, user, chatId]);

  const { data: messages, isLoading: messagesLoading } =
    useCollection<Omit<Message, 'id'>>(messagesCollection);

  const [selectedModule, setSelectedModule] = useState<
    (typeof modules)[number]
  >(modules[0]);
  const [isTextPending, startTextTransition] = useTransition();
  const [isImagePending, startImageTransition] = useTransition();
  
  const [isPhoneCallActive, setIsPhoneCallActive] = useState(false);
  const [phoneCallText, setPhoneCallText] = useState('');

  const [imageProgress, setImageProgress] = useState(0);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);


  const initialChatState: ChatState = {};
  const [chatState, chatFormAction] = useActionState(sendMessage, initialChatState);

  const initialImageState: ImageState = {};
  const [imageState, imageFormAction] = useActionState(generateImageAction, initialImageState);

  const formRef = useRef<HTMLFormElement>(null);
  const queryInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isPending = isTextPending || isImagePending;

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
     async function handleResponse() {
      if (chatState?.response && user && firestore) {
        const assistantMessage = {
          role: 'assistant' as const,
          content: chatState.response,
          createdAt: serverTimestamp(),
        };
        const messagesColRef = collection(firestore, `users/${user.uid}/chats/${chatId}/messages`);
        addDocumentNonBlocking(messagesColRef, assistantMessage);
      }
      if (chatState?.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: chatState.error,
        });
      }
    }
    handleResponse();
  }, [chatState, user, firestore, chatId, toast]);
  
  useEffect(() => {
    async function handleImageResponse() {
      if (imageState?.imageUrl && user && firestore) {
        const assistantMessage = {
          role: 'assistant' as const,
          content: imageState.imageUrl,
          isImage: true,
          createdAt: serverTimestamp(),
        };
        const messagesColRef = collection(firestore, `users/${user.uid}/chats/${chatId}/messages`);
        addDocumentNonBlocking(messagesColRef, assistantMessage);
      }
       if (imageState?.error) {
        toast({
          variant: 'destructive',
          title: 'Image Generation Error',
          description: imageState.error,
        });
      }
    }
    handleImageResponse();
  }, [imageState, user, firestore, chatId, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isImagePending) {
        setImageProgress(0);
        let progress = 0;
        interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 95) { // Stop just before 100
                clearInterval(interval);
            }
            setImageProgress(progress);
        }, 300);
    } else {
        setImageProgress(100);
        setTimeout(() => setImageProgress(0), 500); // Hide after completion
    }

    return () => clearInterval(interval);
}, [isImagePending]);


  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
  
  const textFileToContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFormSubmit = async (formData: FormData) => {
    const query = formData.get('query') as string;
    if (!query.trim() && selectedFiles.length === 0 && selectedImages.length === 0) return;

    if (!user || !firestore) return;

    const userMessageContent: any[] = [{ type: 'text', text: query }];
    
    // Prepare history for the action
    const chatHistory = messages?.map(({ role, content }) => ({ role, content })) || [];
    formData.append('history', JSON.stringify(chatHistory));

    const imagePayload = await Promise.all(selectedImages.map(async (file) => ({
      name: file.name,
      content: await fileToDataUrl(file),
    })));
    formData.append('images', JSON.stringify(imagePayload));
    
    const filePayload = await Promise.all(selectedFiles.map(async (file) => ({
      name: file.name,
      content: await textFileToContent(file),
    })));
    formData.append('files', JSON.stringify(filePayload));


    startTextTransition(() => {
      let displayContent = query;
      if (selectedImages.length > 0) {
        displayContent += `\n[${selectedImages.length} image(s) attached]`;
      }
      if (selectedFiles.length > 0) {
        displayContent += `\n[${selectedFiles.length} file(s) attached]`;
      }

       const userMessage = {
        role: 'user' as const,
        content: displayContent.trim(),
        createdAt: serverTimestamp(),
      };
      const messagesColRef = collection(firestore, `users/${user.uid}/chats/${chatId}/messages`);
      addDocumentNonBlocking(messagesColRef, userMessage);

      // If this is the first message, generate and set the title
      if (messages?.length === 0) {
        generateTitle(query).then(title => {
          const chatRef = doc(firestore, `users/${user.uid}/chats/${chatId}`);
          setDocumentNonBlocking(chatRef, { title }, { merge: true });
        });
      }

      chatFormAction(formData);
    });
    formRef.current?.reset();
    setSelectedFiles([]);
    setSelectedImages([]);
  };
  
  const handleImageGeneration = async () => {
    const form = formRef.current;
    if (!form) return;
    const query = (form.elements.namedItem('query') as HTMLInputElement)?.value;
    if (!query?.trim() || !user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a prompt to generate an image.',
      });
      return;
    };

    startImageTransition(() => {
       const userMessage = {
        role: 'user' as const,
        content: `Generate an image of: ${query}`,
        createdAt: serverTimestamp(),
      };
      const messagesColRef = collection(firestore, `users/${user.uid}/chats/${chatId}/messages`);
      addDocumentNonBlocking(messagesColRef, userMessage);

      // If this is the first message, generate and set the title
      if (messages?.length === 0) {
        generateTitle(query).then(title => {
          const chatRef = doc(firestore, `users/${user.uid}/chats/${chatId}`);
          setDocumentNonBlocking(chatRef, { title }, { merge: true });
        });
      }
      
      const imageFormData = new FormData();
      imageFormData.append('prompt', query);
      imageFormAction(imageFormData);
    });
    formRef.current?.reset();
  };

  const handleAudioGeneration = (text: string) => {
    if (!text.trim()) {
      toast({
        title: 'Cannot generate audio',
        description: 'There is no text to convert to speech.',
      });
      return;
    }
    setPhoneCallText(text);
    setIsPhoneCallActive(true);
  };
  
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleImageUploadClick = () => {
    imageInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(prev => [...prev, ...Array.from(files)]);
    }
    // Reset file input to allow selecting the same file again
    if(event.target) event.target.value = '';
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
        setSelectedImages(prev => [...prev, ...Array.from(files)]);
    }
    if(event.target) event.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePlayboxSuggestion = (suggestion: string) => {
    if (queryInputRef.current) {
      queryInputRef.current.value = suggestion;
      queryInputRef.current.focus();
    }
  };


  const lastAssistantMessage = messages?.filter(m => m.role === 'assistant' && !m.isImage).pop();

  const showPlayboxSuggestions = selectedModule === 'PlayBox' && !messagesLoading && messages?.length === 0;


  return (
    <>
      <div className="flex h-screen flex-col">
        <Card className="flex flex-1 flex-col overflow-hidden rounded-lg border-0 bg-card/50 shadow-none backdrop-blur-sm">
          {isImagePending && (
            <div className="absolute top-0 left-0 right-0 z-20 p-2">
              <div className="rounded-full bg-secondary/50 p-1 backdrop-blur-sm">
                <Progress value={imageProgress} className="h-2 rounded-full" />
                <p className="text-center text-xs text-muted-foreground mt-1">Generating your image...</p>
              </div>
            </div>
          )}
          <CardContent className="flex flex-1 flex-col gap-4 p-4 md:p-6">
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 py-4 pr-4">
                {messagesLoading ? (
                   <div className="flex justify-center p-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   </div>
                ) : showPlayboxSuggestions ? (
                   <PlayboxSuggestions onSuggestionClick={handlePlayboxSuggestion} />
                ) : (
                  messages?.map(message => (
                  <div
                    key={message.id}
                    className={cn('flex items-start gap-3', {
                      'justify-end': message.role === 'user',
                    })}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-9 w-9 shrink-0 border-2 border-primary">
                        <AvatarFallback className="bg-transparent text-primary">
                          <Bot size={20} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm',
                        message.role === 'user'
                          ? 'rounded-br-none bg-gradient-to-br from-primary to-red-500 text-primary-foreground'
                          : 'rounded-bl-none bg-secondary text-secondary-foreground'
                      )}
                    >
                     {message.isImage ? (
                        <Image
                          src={message.content}
                          alt="Generated image"
                          width={512}
                          height={512}
                          className="rounded-lg"
                        />
                      ) : (
                        <Markdown content={message.content} />
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-9 w-9 shrink-0 border-2 border-accent">
                        <AvatarFallback className="bg-transparent text-accent">
                          <UserIcon size={20} />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )))}
                {isTextPending && (
                  <div className="flex items-start gap-3 justify-end">
                     <div className="max-w-md rounded-2xl rounded-br-none bg-gradient-to-br from-primary to-red-500 text-primary-foreground px-4 py-2.5 shadow-sm">
                       <Loader2 className="h-5 w-5 animate-spin" />
                     </div>
                     <Avatar className="h-9 w-9 shrink-0 border-2 border-accent">
                      <AvatarFallback className="bg-transparent text-accent">
                        <UserIcon size={20} />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <ScrollBar />
            </ScrollArea>

            <div className="mt-auto space-y-2">
              {(selectedFiles.length > 0 || selectedImages.length > 0) && (
                <div className="rounded-lg bg-secondary/50 p-2">
                  <ScrollArea className="max-h-32 w-full">
                    <div className="flex flex-wrap gap-2">
                      {selectedImages.map((file, index) => (
                        <div key={index} className="relative h-16 w-16">
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${file.name}`}
                            fill
                            className="rounded-md object-cover"
                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-red-500 text-white hover:bg-red-600"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative flex items-center gap-2 rounded-md bg-secondary p-2 text-sm">
                           <FileIcon className="h-5 w-5 text-muted-foreground" />
                           <span className="max-w-xs truncate">{file.name}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-red-500 text-white hover:bg-red-600"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              <div className="flex items-center gap-2">
              <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending || isUserLoading || !lastAssistantMessage}
                  className="group relative h-9 shrink-0 overflow-hidden rounded-full bg-secondary/80 pl-2 pr-3 text-sm focus:bg-secondary"
                  onClick={() => handleAudioGeneration(lastAssistantMessage?.content || '')}
                  aria-label="Read last response aloud"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-green-500 to-cyan-500 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-90 group-hover:saturate-150"></span>
                  <span className="relative z-10 flex items-center gap-1.5 text-secondary-foreground group-hover:text-primary-foreground">
                    <Phone className="h-4 w-4" />
                    <span>Call</span>
                  </span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending || isUserLoading}
                  className="group relative h-9 shrink-0 overflow-hidden rounded-full bg-secondary/80 pl-2 pr-3 text-sm focus:bg-secondary"
                  onClick={handleImageGeneration}
                  aria-label="Generate Image"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-90 group-hover:saturate-150"></span>
                   <span className="relative z-10 flex items-center gap-1.5 text-secondary-foreground group-hover:text-primary-foreground">
                      <ImageIcon className="h-4 w-4" />
                      <span>Generate Image</span>
                  </span>
                </Button>
                 <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending || isUserLoading}
                  className="group relative h-9 shrink-0 overflow-hidden rounded-full bg-secondary/80 pl-2 pr-3 text-sm focus:bg-secondary"
                  onClick={() => setSelectedModule('Deep Think')}
                  aria-label="Deep Thinking Mode"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-600 opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-90 group-hover:saturate-150"></span>
                   <span className="relative z-10 flex items-center gap-1.5 text-secondary-foreground group-hover:text-primary-foreground">
                      <BrainCircuit className="h-4 w-4" />
                      <span>Deep Think</span>
                  </span>
                </Button>
              </div>
              <form
                ref={formRef}
                action={handleFormSubmit}
                className="flex items-center gap-2 md:gap-4"
              >
                <div className="group relative flex-1">
                  <div className="pointer-events-none absolute -inset-px rounded-full bg-gradient-to-r from-primary via-red-500 to-accent opacity-0 blur-sm transition-all duration-300 group-focus-within:opacity-80 group-focus-within:blur-[2px]"></div>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple accept="text/*,.pdf,.doc,.docx" />
                   <input type="file" ref={imageInputRef} onChange={handleImageChange} className="hidden" accept="image/*" multiple />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-2.5 top-1/2 z-10 h-7 w-7 -translate-y-1/2 text-white/50 hover:bg-white/10 hover:text-white"
                        aria-label="Add file or start Super PlayBox"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <div className="grid grid-cols-1 gap-2">
                        <Button variant="ghost" className="justify-start" onClick={handleFileUploadClick}>
                          <FileUp className="mr-2 h-4 w-4" /> Upload Files
                        </Button>
                        <Button variant="ghost" className="justify-start" onClick={handleImageUploadClick}>
                          <ImageUp className="mr-2 h-4 w-4" /> Upload Images
                        </Button>
                        <Button variant="ghost" className="justify-start" onClick={() => setSelectedModule('PlayBox')}>
                          <Gamepad2 className="mr-2 h-4 w-4" /> PlayBox
                        </Button>
                      </div>
                      <div className="mt-2 flex justify-center gap-2">
                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                            <Video className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                            <Phone className="h-5 w-5" />
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    ref={queryInputRef}
                    name="query"
                    placeholder="Ask Moude AI anything..."
                    disabled={isPending || isUserLoading}
                    autoComplete="off"
                    className="relative h-11 rounded-full bg-secondary/80 pl-12 text-base focus:bg-secondary"
                  />
                </div>

                <input type="hidden" name="module" value={selectedModule} />

                <div className="group relative">
                  <div className="pointer-events-none absolute -inset-px rounded-full bg-gradient-to-r from-primary via-red-500 to-accent opacity-0 blur-sm transition-all duration-300 group-focus-within:opacity-80 group-focus-within:blur-[2px] group-radix-state-open:opacity-80 group-radix-state-open:blur-[2px]"></div>
                  <Select
                    value={selectedModule}
                    onValueChange={value =>
                      setSelectedModule(value as (typeof modules)[number])
                    }
                    disabled={isPending || isUserLoading}
                  >
                    <SelectTrigger className="relative h-11 w-auto min-w-[150px] rounded-full bg-secondary/80 text-sm focus:bg-secondary md:min-w-[180px]">
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(mod => (
                        <SelectItem key={mod} value={mod}>
                          {mod}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  size="icon"
                  disabled={isPending || isUserLoading}
                  className="group relative h-11 w-11 shrink-0 overflow-hidden rounded-full"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-primary via-red-500 to-accent opacity-90 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:saturate-150"></span>
                  <span className="relative z-10 text-primary-foreground">
                    {isTextPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </span>
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
      {isPhoneCallActive && user && (
        <PhoneCallUI
          text={phoneCallText}
          open={isPhoneCallActive}
          onOpenChange={setIsPhoneCallActive}
          user={user}
        />
      )}
    </>
  );
}
