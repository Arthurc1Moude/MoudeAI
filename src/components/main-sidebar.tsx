
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  MessageSquare,
  Settings,
  PanelLeft,
  Bot,
  LogOut,
  PlusSquare,
  Loader2,
  Gem,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

type Chat = {
  id: string;
  title: string;
  createdAt: any;
};

function ChatList() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const chatsCollection = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/chats`),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: chats, isLoading } = useCollection<Chat>(chatsCollection);
  const pathname = usePathname();

  if (isUserLoading || isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <SidebarMenu>
      {chats?.map(chat => (
        <SidebarMenuItem key={chat.id}>
          <SidebarMenuButton
            asChild
            isActive={pathname === `/chat/${chat.id}`}
            tooltip={{ children: chat.title }}
          >
            <Link href={`/chat/${chat.id}`}>
              <MessageSquare />
              <span>{chat.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export function MainSidebar() {
  const { toggleSidebar } = useSidebar();
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const handleNewChat = async () => {
    if (!user || !firestore) return;
    try {
      const newChatData = {
        title: 'New Chat',
        createdAt: serverTimestamp(),
      };
      const chatsColRef = collection(firestore, `users/${user.uid}/chats`);
      const docRefPromise = addDocumentNonBlocking(chatsColRef, newChatData);
      
      const docRef = await docRefPromise;
      if (docRef) {
        router.push(`/chat/${docRef.id}`);
      }

    } catch (error) {
      console.error('Error creating new chat document reference:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <Sidebar
      side="left"
      collapsible="icon"
      variant="sidebar"
      className="border-r border-border/30 bg-card/20 backdrop-blur-sm"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot size={24} />
          </div>
          <h1
            className="text-xl font-bold group-data-[collapsible=icon]:hidden"
            suppressHydrationWarning
          >
            Moude AI
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        {user && (
          <>
            <div className="flex items-center justify-between p-2 pt-0 group-data-[collapsible=icon]:hidden">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Chats
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleNewChat}
              >
                <PlusSquare size={18} />
              </Button>
            </div>
            <ChatList />
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
           {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/pricing'}
                tooltip={{ children: 'Upgrade' }}
              >
                <Link href="/pricing">
                  <Gem />
                  <span>Upgrade</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/settings'}
                tooltip={{ children: 'Settings' }}
              >
                <Link href="/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleSignOut}
                tooltip={{ children: 'Sign Out' }}
              >
                <LogOut />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => toggleSidebar()}>
              <PanelLeft />
              <span>Collapse</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
