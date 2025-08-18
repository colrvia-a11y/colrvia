# Colrvia App Architecture

## Overview
Colrvia is a mobile-first color palette discovery app with Supabase integration for authentication and data persistence. The app guides users through an interview process to generate personalized color stories and palettes.

## Core Features
1. **Bottom Tab Navigation**: Home, Via Chat, Dashboard (Favorites), More
2. **Interview Flow**: Home → Interview Intro → Text/Voice Interview → Create Story → Reveal
3. **Authentication**: Supabase auth with magic link and email/password
4. **Data Management**: Stories stored in Supabase with RLS
5. **Via Chat**: AI-powered color consultation with image analysis

## Key Components & Structure

### Authentication & Routing
- `go_router` for navigation with auth guards
- Protected routes redirect to sign-in with `?next=` parameter
- Auth state managed via Supabase session

### Data Models
- **Stories**: User's color palettes with interview inputs and results
- **Interview Answers**: Local storage for interview progression
- **Client Types**: Answers, DesignInput, Palette structures as specified

### Screens Architecture
1. **Main Navigation Shell**: Bottom tab bar wrapper
2. **Home**: Hero CTA to Interview Intro + "How it works"
3. **Interview Flow**: 
   - Intro screen with Text/Voice options
   - Text interview with local JSON questionnaire
   - Voice interview (mock implementation)
4. **Reveal**: Palette display with actions (Save, Share, etc.)
5. **Via Chat**: Conversational AI interface with image support
6. **Dashboard**: User's saved stories grid
7. **More**: Profile, Billing, Support, Legal, Feedback
8. **Auth**: Sign-in with magic link and email/password

### Technical Implementation
- **Theme**: Dark moss green primary, soft peach accent, peach→white gradients
- **Local Storage**: `shared_preferences` for interview state persistence
- **Image Handling**: `image_picker` for Via chat attachments
- **Permissions**: Camera/gallery access for image features
- **API Integration**: Mock endpoints for story creation and Via responses

### File Structure (10-12 files total)
1. `main.dart` - App entry point and routing
2. `theme.dart` - Updated color scheme and styling
3. `models/` - Data models and types
4. `services/` - Supabase config, API services, local storage
5. `screens/` - Main navigation shell and screen implementations
6. `widgets/` - Reusable UI components
7. `data/` - Interview questionnaire JSON

This architecture prioritizes maintainability, follows Flutter best practices, and implements the complete MVP feature set within the specified constraints.