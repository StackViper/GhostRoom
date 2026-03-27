import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#475569',
        tabBarStyle: {
          backgroundColor: '#111118',
          borderTopColor: 'rgba(255,255,255,0.05)',
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '800',
          letterSpacing: 2,
        },
        headerStyle: { backgroundColor: '#0a0a0f' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '900', fontSize: 16 },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Chambers',
          headerTitle: 'GHOSTROOM',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          headerTitle: 'NEW CHAMBER',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="join"
        options={{
          title: 'Join',
          headerTitle: 'JOIN CHAMBER',
          tabBarIcon: ({ color, size }) => <Ionicons name="link" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'OPERATOR',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
