export interface Project {
  id: string;
  name: string;
  kind: string;
  summary: string;
  description: string;
  tags: string[];
  github: string;
  extra?: { label: string; url: string };
  accent: string;
  symbol: string;
}

// Descriptions are based on the projects' public READMEs. No live API is needed.
export const projects: Project[] = [
  {
    id: 'rinku', name: 'Rinku', kind: 'LIBRARY / KOTLIN MULTIPLATFORM',
    summary: 'Deep links. Fewer loose ends.',
    description: 'One way in, wherever your app lives. A lightweight Kotlin Multiplatform library that brings deep link handling together across Android, iOS, and JVM desktop. Built to work with your navigation library, not replace it.',
    tags: ['Kotlin', 'Multiplatform', 'Deep linking'],
    github: 'https://github.com/theolm/Rinku',
    extra: { label: 'Documentation ↗', url: 'https://theolm.github.io/Rinku/' },
    accent: '#b8bb9b', symbol: '⌘',
  },
  {
    id: 'smartnotes', name: 'SmartNotes', kind: 'APP / LOCAL-FIRST AI',
    summary: 'Your thoughts. Your device.',
    description: 'A private voice journal with on-device transcription, note organization, and search by meaning. Built with Flutter for Android, iOS, and macOS. No account, no cloud AI, no telemetry. Your thoughts stay with you.',
    tags: ['Flutter', 'On-device AI', 'Local-first'],
    github: 'https://github.com/theolm/SmartNotes',
    extra: { label: 'Releases ↗', url: 'https://github.com/theolm/SmartNotes/releases' },
    accent: '#ba9d83', symbol: '≋',
  },
  {
    id: 'chatlaunch', name: 'ChatLaunch', kind: 'APP / ANDROID',
    summary: 'A conversation. Not a contact.',
    description: 'Start a WhatsApp conversation without saving another number to your contacts. A small, focused Android app built with Jetpack Compose, with a quick settings tile for an even shorter path to hello.',
    tags: ['Kotlin', 'Jetpack Compose', 'Android'],
    github: 'https://github.com/theolm/WhatsAppNoContact',
    extra: { label: 'Get on F-Droid ↗', url: 'https://f-droid.org/packages/dev.theolm.wwc/' },
    accent: '#8eafa0', symbol: '↗',
  },
  {
    id: 'kmp-record', name: 'KMP-Record', kind: 'LIBRARY / KOTLIN MULTIPLATFORM',
    summary: 'One API. Capture every word.',
    description: 'A lightweight audio recording library for Kotlin Multiplatform. Share recording logic between Android and iOS through a simple API. An early-stage experiment in making native capabilities feel a little less platform-specific.',
    tags: ['Kotlin', 'Multiplatform', 'Audio'],
    github: 'https://github.com/theolm/kmp-record',
    accent: '#9fa7c5', symbol: '◉',
  },
];
