
"use server";

import {
  generateChatResponse,
  type GenerateChatResponseInput,
} from "@/ai/flows/generate-chat-response";
import { generateChatTitle } from "@/ai/flows/generate-chat-title";
import { generateImage, type GenerateImageInput } from "@/ai/flows/generate-image";
import { generateAudio, type GenerateAudioInput } from "@/ai/flows/generate-audio";
import { z } from "zod";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getSdks, initializeFirebase } from "@/firebase";

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

const ChatSchema = z.object({
  query: z.string(),
  module: z.enum(modules),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.any(),
  })),
  files: z.array(z.object({ name: z.string(), content: z.string() })).optional(),
  images: z.array(z.object({ name: z.string(), content: z.string() })).optional(),
});

export type ChatState = {
  response?: string;
  error?: string;
};

export async function sendMessage(
  prevState: ChatState,
  formData: FormData
): Promise<ChatState> {
  const historyString = formData.get("history") as string;
  let history = [];
  try {
    if (historyString) {
      history = JSON.parse(historyString);
    }
  } catch (error) {
    return { error: "Invalid history format." };
  }

  const filesString = formData.get("files") as string;
  let files = [];
  try {
    if (filesString) {
      files = JSON.parse(filesString);
    }
  } catch (error) {
    return { error: "Invalid files format." };
  }
  
  const imagesString = formData.get("images") as string;
  let images = [];
  try {
    if (imagesString) {
      images = JSON.parse(imagesString);
    }
  } catch (error) {
    return { error: "Invalid images format." };
  }
  
  const validatedFields = ChatSchema.safeParse({
    query: formData.get("query"),
    module: formData.get("module"),
    history: history,
    files: files,
    images: images,
  });

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.errors.map((e) => e.message).join(", ");
    return {
      error: `Invalid input: ${errorMessage}`,
    };
  }

  try {
    const input: GenerateChatResponseInput = validatedFields.data;
    const result = await generateChatResponse(input);
    return { response: result.response };
  } catch (error) {
    console.error(error);
    return {
      error: "An error occurred while generating a response. Please try again.",
    };
  }
}

export async function generateTitle(message: string): Promise<string> {
  try {
    const { title } = await generateChatTitle({ message });
    return title;
  } catch (error) {
    console.error("Error generating title:", error);
    // Fallback to a generic title or the start of the message
    return message.substring(0, 30);
  }
}

const ImageSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty."),
});

export type ImageState = {
  imageUrl?: string;
  error?: string;
};

export async function generateImageAction(
  prevState: ImageState,
  formData: FormData
): Promise<ImageState> {
  const validatedFields = ImageSchema.safeParse({
    prompt: formData.get('prompt')
  });

  if (!validatedFields.success) {
    return {
      error: `Invalid input: ${validatedFields.error.errors.map(e => e.message).join(", ")}`,
    };
  }

  try {
    const input: GenerateImageInput = validatedFields.data;
    const result = await generateImage(input);
    return { imageUrl: result.imageUrl };
  } catch (error) {
    console.error(error);
    return {
      error: "An error occurred while generating the image. Please try again.",
    };
  }
}

const AudioSchema = z.object({
  text: z.string().min(1, "Text cannot be empty."),
  uid: z.string(),
});

export type AudioState = {
  audioUrl?: string;
  error?: string;
};

export async function generateAudioAction(
  prevState: AudioState,
  formData: FormData
): Promise<AudioState> {
  const validatedFields = AudioSchema.safeParse({
    text: formData.get('text'),
    uid: formData.get('uid'),
  });

  if (!validatedFields.success) {
    return {
      error: `Invalid input: ${validatedFields.error.errors.map(e => e.message).join(", ")}`,
    };
  }

  try {
    const { firestore } = getSdks(initializeFirebase());
    const { text, uid } = validatedFields.data;
    
    const userRef = doc(firestore, `users/${uid}`);
    const userSnap = await getDoc(userRef);
    const voiceName = userSnap.exists() ? userSnap.data().voice || 'Algenib' : 'Algenib';

    const input: GenerateAudioInput = { text, voiceName };
    const result = await generateAudio(input);
    return { audioUrl: result.audioUrl };
  } catch (e: any) {
    console.error(e);
    // Check if the error object has more details
    const errorMessage = e.cause?.message || e.message || "An unknown error occurred during audio generation.";
    return {
      error: `Audio Generation Error: ${errorMessage}`,
    };
  }
}


const SettingsSchema = z.object({
  uid: z.string(),
  username: z.string().optional(),
  voice: z.string().optional(),
});

export type SettingsState = {
  success?: boolean;
  error?: string;
}

export async function updateSettings(prevState: SettingsState, formData: FormData): Promise<SettingsState> {
  const validatedFields = SettingsSchema.safeParse({
    uid: formData.get('uid'),
    username: formData.get('username'),
    voice: formData.get('voice'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }
  
  try {
    const { firestore } = getSdks(initializeFirebase());
    const { uid, ...settingsData } = validatedFields.data;

    if (!uid) {
      return { error: 'User not authenticated.' };
    }

    const userRef = doc(firestore, `users/${uid}`);
    
    const updateData: { [key: string]: any } = {};
    if (settingsData.username) {
      updateData.username = settingsData.username;
    }
    if (settingsData.voice) {
      updateData.voice = settingsData.voice;
    }

    if (Object.keys(updateData).length > 0) {
      await setDoc(userRef, updateData, { merge: true });
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { error: 'Failed to update settings.' };
  }
}
