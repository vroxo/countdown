import React from 'react';
import { FlatList, ListRenderItem, StyleSheet } from 'react-native';
import { Event } from '../types';
import { EventCard } from './EventCard';
import { EmptyState } from './EmptyState';
import { spacing } from '../theme/styles';

interface EventListProps {
  events: Event[];
  onEventPress?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  onEventDelete?: (event: Event) => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  onEventPress,
  onEventEdit,
  onEventDelete,
}) => {
  const renderEvent: ListRenderItem<Event> = ({ item }) => (
    <EventCard
      event={item}
      onPress={() => onEventPress?.(item)}
      onEdit={() => onEventEdit?.(item)}
      onDelete={() => onEventDelete?.(item)}
    />
  );

  if (events.length === 0) {
    return <EmptyState />;
  }

  return (
    <FlatList
      data={events}
      renderItem={renderEvent}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
});

