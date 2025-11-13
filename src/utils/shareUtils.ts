import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';
import { Event } from '../types';
import { formatDateTime } from './dateUtils';

/**
 * Share event details using native share dialog
 */
export const shareEvent = async (event: Event): Promise<boolean> => {
  try {
    const message = buildShareMessage(event);

    if (Platform.OS === 'web') {
      // For web, try to use Web Share API
      if (navigator.share) {
        await navigator.share({
          title: event.name,
          text: message,
        });
        return true;
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(message);
        alert('Evento copiado para a área de transferência!');
        return true;
      }
    } else {
      // For mobile, use React Native Share
      const result = await Share.share({
        message,
        title: `Compartilhar: ${event.name}`,
      });

      return result.action === Share.sharedAction;
    }
  } catch (error) {
    console.error('Error sharing event:', error);
    return false;
  }
};

/**
 * Build share message for an event
 */
const buildShareMessage = (event: Event): string => {
  const date = formatDateTime(event.targetDate);
  
  let message = `🎯 ${event.name}\n\n`;
  message += `📅 Data: ${date}\n`;
  
  if (event.categoryId) {
    const categoryEmoji = getCategoryEmoji(event.categoryId);
    message += `${categoryEmoji}\n`;
  }

  if (event.isRecurring) {
    message += `🔄 Evento recorrente\n`;
  }

  message += `\n⏰ Acompanhe a contagem regressiva no Countdown App!`;

  return message;
};

/**
 * Get emoji for category
 */
const getCategoryEmoji = (categoryId: string): string => {
  const categories: Record<string, string> = {
    '1': '👤 Pessoal',
    '2': '💼 Trabalho',
    '3': '🎂 Aniversário',
    '4': '✈️ Viagem',
    '5': '🎉 Evento',
  };

  return categories[categoryId] || '';
};

/**
 * Check if sharing is available
 */
export const isSharingAvailable = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return !!navigator.share || !!navigator.clipboard;
  }
  
  return await Sharing.isAvailableAsync();
};

/**
 * Share multiple events as a list
 */
export const shareEventsList = async (events: Event[]): Promise<boolean> => {
  try {
    let message = `📋 Meus Eventos (${events.length})\n\n`;

    events.forEach((event, index) => {
      const date = formatDateTime(event.targetDate);
      message += `${index + 1}. ${event.name}\n   📅 ${date}\n\n`;
    });

    message += `⏰ Compartilhado do Countdown App`;

    if (Platform.OS === 'web') {
      if (navigator.share) {
        await navigator.share({
          title: 'Meus Eventos',
          text: message,
        });
        return true;
      } else {
        await navigator.clipboard.writeText(message);
        alert('Lista de eventos copiada!');
        return true;
      }
    } else {
      const result = await Share.share({
        message,
        title: 'Compartilhar Eventos',
      });

      return result.action === Share.sharedAction;
    }
  } catch (error) {
    console.error('Error sharing events list:', error);
    return false;
  }
};

