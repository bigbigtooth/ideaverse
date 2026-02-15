/**
 * @fileoverview Vue Router configuration for IdeaVerse application
 * @module router
 * @description Defines all application routes with lazy loading for optimal performance.
 * Routes include:
 * - Home: Landing page with problem input
 * - Think: Main analysis workflow (supports session ID parameter)
 * - History: Session history management
 * - Settings: Application configuration
 * 
 * @copyright 2026 BigTooth
 * @license GPL-3.0
 */

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

/**
 * Application router instance
 * Uses HTML5 history mode for clean URLs
 * @type {import('vue-router').Router}
 */
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {
                title: 'IdeaVerse - AI-Powered Deep Thinking'
            }
        },
        {
            path: '/think/:id?',
            name: 'think',
            component: () => import('../views/ThinkView.vue'),
            meta: {
                title: 'Think - IdeaVerse'
            }
        },
        {
            path: '/history',
            name: 'history',
            component: () => import('../views/HistoryView.vue'),
            meta: {
                title: 'History - IdeaVerse'
            }
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('../views/SettingsView.vue'),
            meta: {
                title: 'Settings - IdeaVerse'
            }
        }
    ]
})

export default router
