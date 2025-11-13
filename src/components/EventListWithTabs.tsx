import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { Event } from '../types';
import { EventCard } from './EventCard';
import { EmptyState } from './EmptyState';
import { spacing, fontSize } from '../theme/styles';
import { calculateTimeRemaining } from '../utils/dateUtils';

interface EventListWithTabsProps {
  events: Event[];
  onEventPress?: (event: Event) => void;
  onEventEdit?: (event: Event) => void;
  onEventDelete?: (event: Event) => void;
}

type TabType = 'all' | 'today' | 'week' | 'finished';

interface TabConfig {
  id: TabType;
  label: string;
}

const TABS: TabConfig[] = [
  { id: 'all', label: 'Todos' },
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: 'Semana' },
  { id: 'finished', label: 'Finalizados' },
];

export const EventListWithTabs: React.FC<EventListWithTabsProps> = ({
  events,
  onEventPress,
  onEventEdit,
  onEventDelete,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Update more frequently to catch events that become finished
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render every 5 seconds to recalculate event statuses
      setUpdateTrigger((n) => n + 1);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter events based on active tab
  const filteredEvents = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return events.filter((event) => {
      const eventDate = new Date(event.targetDate);
      const timeRemaining = calculateTimeRemaining(event.targetDate);
      const isFinished = timeRemaining.isFinished;

      switch (activeTab) {
        case 'all':
          return !isFinished;
        case 'today':
          return !isFinished && eventDate >= todayStart && eventDate < todayEnd;
        case 'week':
          return !isFinished && eventDate >= todayStart && eventDate < weekEnd;
        case 'finished':
          return isFinished;
        default:
          return true;
      }
    });
  }, [events, activeTab, updateTrigger]);

  // Calculate counts for each tab
  const tabCounts = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const counts = {
      all: 0,
      today: 0,
      week: 0,
      finished: 0,
    };

    events.forEach((event) => {
      const eventDate = new Date(event.targetDate);
      const timeRemaining = calculateTimeRemaining(event.targetDate);
      const isFinished = timeRemaining.isFinished;

      if (isFinished) {
        counts.finished++;
      } else {
        counts.all++;
        if (eventDate >= todayStart && eventDate < todayEnd) {
          counts.today++;
        }
        if (eventDate >= todayStart && eventDate < weekEnd) {
          counts.week++;
        }
      }
    });

    return counts;
  }, [events, updateTrigger]);

  const renderEvent: ListRenderItem<Event> = ({ item }) => (
    <EventCard
      event={item}
      onPress={() => onEventPress?.(item)}
      onEdit={() => onEventEdit?.(item)}
      onDelete={() => onEventDelete?.(item)}
    />
  );

  const renderEmptyState = () => {
    const emptyMessages: Record<TabType, string> = {
      all: 'Nenhum evento ativo',
      today: 'Nenhum evento para hoje',
      week: 'Nenhum evento nesta semana',
      finished: 'Nenhum evento finalizado',
    };

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessages[activeTab]}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tabs Header Wrapper */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
          style={styles.tabsScrollView}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id];

            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.7}
              >
                <View style={styles.tabContent}>
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                  <View style={[styles.badge, isActive && styles.badgeActive]}>
                    <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                      {count}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Count Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {filteredEvents.length} {filteredEvents.length === 1 ? 'evento' : 'eventos'}
        </Text>
      </View>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsWrapper: {
    height: 64,
    marginBottom: 0,
  },
  tabsScrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  tabsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
    height: 40,
  },
  tabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: fontSize.sm * 1.2,
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    minWidth: 28,
    height: 24,
    paddingHorizontal: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: fontSize.xs * 1.2,
    textAlign: 'center',
  },
  badgeTextActive: {
    color: '#ffffff',
  },
  summaryContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  summaryText: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

