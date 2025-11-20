# Atlas Assessment Platform - Production Redesign Plan

## 🎯 Vision
Transform Atlas into a world-class, production-ready assessment platform with exceptional UX, beautiful UI, and powerful features that rival top SaaS products like Typeform, Google Forms, and Microsoft Forms.

## 🔍 Current UX Pain Points

### Critical Issues
1. **Save Button Accessibility**: With 50+ questions, users must scroll to top to save (terrible UX)
2. **No Organization**: All assessments in flat list, no folders/projects
3. **Overwhelming Creation Flow**: All options shown at once, no guidance
4. **Limited AI Options**: Only "number of questions" - missing complexity, type ratios, difficulty
5. **Poor Question Management**: Arrow buttons for reordering (should be drag & drop)
6. **No Preview Mode**: Can't see respondent view before publishing
7. **Basic Analytics**: Just raw response data, no insights or charts
8. **No Templates**: Users start from scratch every time
9. **No Collaboration**: Single user editing only

## 🎨 Design System

### Modern UI Principles
- **Style**: Clean, minimal design inspired by Linear, Notion, Vercel
- **Colors**:
  - Primary: Indigo (600-700)
  - Success: Emerald (500-600)
  - Warning: Amber (500-600)
  - Danger: Rose (500-600)
  - Neutral: Slate (50-900)
- **Typography**: Inter font family, clear hierarchy
- **Spacing**: 4px base unit (4, 8, 12, 16, 24, 32, 48, 64)
- **Shadows**: Subtle, layered shadows for depth
- **Animations**: Smooth 150-300ms transitions, spring physics
- **Icons**: Heroicons v2 (outline for secondary, solid for primary)

### Component Library
1. **Buttons**: Primary, Secondary, Ghost, Danger with loading states
2. **Inputs**: Text, Number, Select, Multi-select, File upload with validation
3. **Cards**: Elevated, flat, interactive with hover states
4. **Modals**: Full overlay, slide-over, bottom sheet
5. **Navigation**: Sidebar, breadcrumbs, tabs
6. **Feedback**: Toast notifications, inline alerts, empty states
7. **Data Display**: Tables, charts, stat cards, progress bars

## 🗂️ New Features

### 1. Projects & Folders System
**Purpose**: Organize assessments into logical groups

**Features**:
- Create unlimited projects (like folders)
- Nest projects (up to 3 levels)
- Project settings: name, description, color, icon
- Move assessments between projects
- Archive/restore projects
- Project-level permissions (future: team collaboration)

**UI**:
- Sidebar navigation with collapsible project tree
- Drag & drop to move assessments
- Project colors for visual organization
- Star/favorite projects

### 2. Multi-Step Creation Wizard
**Purpose**: Guide users through assessment creation with less overwhelm

**Steps**:
1. **Choose Starting Point**
   - Start from scratch
   - Use template (pre-made or custom)
   - Duplicate existing assessment
   - Import from file

2. **Basic Information**
   - Title (required)
   - Description (with rich text editor)
   - Assessment type (Quiz, Survey, Poll, Assessment, Exam)
   - Project/folder location
   - Tags for organization

3. **Question Strategy**
   - Manual creation (add one by one)
   - AI Generation (with advanced options)
   - Import from file (CSV, Excel, JSON)
   - Import from URL
   - Select from question bank

4. **AI Generation Options** (if selected)
   - Content source (text, file, URL)
   - Number of questions (1-100)
   - Difficulty level (Beginner, Intermediate, Advanced, Mixed)
   - Question type distribution:
     - Single choice: X%
     - Multiple choice: X%
     - Text answers: X%
     - Rating scales: X%
     - Yes/No: X%
   - Point allocation strategy (Equal, Difficulty-based, Custom)
   - Topic focus (optional keywords)
   - Bloom's Taxonomy level (Remember, Understand, Apply, Analyze, Evaluate, Create)

5. **Edit Questions**
   - Inline editing with sticky save bar
   - Drag & drop reordering
   - Bulk actions (delete, duplicate, move)
   - Question bank integration

6. **Configure Settings**
   - Time limit
   - Pagination
   - Randomization
   - Passing score
   - Retake policy
   - Results display
   - Certificate generation
   - Deadline/scheduling

7. **Customize Appearance**
   - Theme/color scheme
   - Logo upload
   - Custom header/footer
   - Background image
   - Font selection

8. **Preview & Publish**
   - Respondent preview
   - Mobile preview
   - Publish or save as draft
   - Generate share link
   - Embed code
   - QR code

### 3. Sticky Save Bar
**Purpose**: Always accessible save/publish buttons regardless of scroll position

**Features**:
- Fixed bottom bar (mobile) or floating button (desktop)
- Auto-save indicator ("Last saved 2 minutes ago")
- Unsaved changes warning
- Quick actions: Save, Preview, Publish, Discard
- Keyboard shortcut: Cmd/Ctrl+S

### 4. Drag & Drop Interface
**Purpose**: Intuitive question reordering and organization

**Features**:
- Visual drag handles
- Smooth animations during drag
- Drop zones highlighted
- Multi-select for bulk dragging
- Keyboard accessibility (Alt+Up/Down)

### 5. Question Bank
**Purpose**: Reusable question library

**Features**:
- Save questions to personal bank
- Tag questions by topic/category
- Search and filter
- Drag from bank into assessment
- Public/private questions
- Community question sharing (future)

### 6. Templates System
**Purpose**: Quick start with pre-made assessments

**Templates**:
- Employee Satisfaction Survey
- Customer Feedback Form
- Product Knowledge Quiz
- Skill Assessment Test
- Event Registration Form
- Course Evaluation
- Personality Quiz
- Trivia Quiz
- Exit Interview
- 360 Degree Feedback
- Custom templates (user-created)

**Features**:
- Template preview
- Customize before creating
- Save assessments as templates
- Share templates with team

### 7. Advanced Analytics
**Purpose**: Actionable insights from responses

**Features**:
- Response rate over time (line chart)
- Score distribution (histogram)
- Question difficulty analysis (% correct)
- Time spent per question
- Completion rate
- Dropout points (where users quit)
- Individual respondent reports
- Export to CSV, PDF, Excel
- Filter by date range, score, completion status
- Compare multiple assessments

**Visualizations**:
- Charts: Line, Bar, Pie, Scatter
- Heatmaps for rating questions
- Word clouds for text responses
- Statistical summary (mean, median, mode, std dev)

### 8. Preview Mode
**Purpose**: See exactly what respondents will see

**Features**:
- Desktop preview
- Mobile preview (responsive)
- Tablet preview
- Dark mode preview
- Test submission (doesn't count as real response)
- Share preview link (requires login)

### 9. Collaboration Features (Phase 2)
**Purpose**: Team collaboration on assessments

**Features**:
- Multi-user editing
- Real-time cursors and presence
- Comments on questions
- Suggestion mode (like Google Docs)
- Version history
- Role-based permissions (Owner, Editor, Viewer)
- Activity log

### 10. Enhanced Settings
**All possible settings users might need**:

**Timing**:
- Overall time limit
- Per-question time limit
- Show timer to respondents
- Auto-submit on timeout

**Pagination**:
- Questions per page (1, 5, 10, all)
- Progress indicator
- Allow navigation back
- Randomize question order
- Randomize option order

**Scoring** (for quizzes):
- Passing score percentage
- Show score immediately
- Show correct answers
- Partial credit for multiple choice
- Negative marking for wrong answers
- Weight questions differently

**Attempts**:
- Allow multiple attempts (1, 3, unlimited)
- Keep best score / last score / average
- Time between attempts
- Show previous attempt

**Access Control**:
- Password protection
- Email verification required
- IP restrictions
- Geographic restrictions
- Specific users only (whitelist emails)
- Response limit (max submissions)

**Notifications**:
- Email on new response
- Daily/weekly summary
- Response threshold alerts
- Slack/Discord webhooks

**Certificates**:
- Generate PDF certificate on passing
- Custom certificate template
- Include score and date
- Signed by administrator

**Scheduling**:
- Start date/time
- End date/time
- Timezone handling
- Automatic unpublish

**Data Collection**:
- Collect respondent email
- Collect respondent name
- Custom demographic fields
- GDPR compliance options
- Data retention policy

**Branding**:
- Custom domain (pro feature)
- Remove "Powered by Atlas" badge
- Custom thank you page
- Redirect after submission

## 🗄️ Database Schema Updates

### New Tables

```sql
-- Projects/Folders
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- hex color
    icon VARCHAR(50), -- icon name
    position INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    thumbnail_url TEXT,
    assessment_data JSONB, -- template structure
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question Bank
CREATE TABLE question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_type question_type NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer JSONB,
    points INTEGER DEFAULT 0,
    tags TEXT[], -- for categorization
    difficulty_level VARCHAR(50), -- beginner, intermediate, advanced
    subject VARCHAR(100),
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Tags
CREATE TABLE assessment_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Version History
CREATE TABLE assessment_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    snapshot JSONB, -- full assessment state
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collaboration (Phase 2)
CREATE TABLE assessment_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- owner, editor, viewer
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Updated Tables

```sql
-- Add project reference to assessments
ALTER TABLE assessments ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE assessments ADD COLUMN thumbnail_url TEXT;
ALTER TABLE assessments ADD COLUMN tags TEXT[];

-- Expand settings JSONB to include all new options
-- settings will now include:
-- {
--   "timer": { "enabled": true, "minutes": 30, "per_question": false },
--   "pagination": { "enabled": true, "questions_per_page": 5 },
--   "scoring": { "passing_score": 70, "show_immediately": true, "show_correct": true },
--   "attempts": { "max_attempts": 3, "score_type": "best" },
--   "access": { "password": "xyz", "email_required": true },
--   "branding": { "logo_url": "", "primary_color": "#4F46E5" },
--   "scheduling": { "start_date": "2025-01-01", "end_date": "2025-12-31" }
-- }
```

## 📱 UI/UX Improvements

### Navigation
- **Sidebar**: Projects tree, starred items, recent assessments, templates
- **Top Bar**: Search (Cmd+K), notifications, user menu, create button
- **Breadcrumbs**: Current location in project hierarchy
- **Quick Switcher**: Cmd+K to search and jump to any assessment

### Dashboard
- **Stats Cards**: Total assessments, total responses, avg completion rate, avg score
- **Recent Activity**: Last 10 actions (created, published, response received)
- **Charts**: Response trends, popular assessments, performance over time
- **Quick Actions**: Create new, view templates, import data

### Empty States
- Friendly illustrations and helpful CTAs
- "No assessments yet" → "Create your first assessment"
- "No responses yet" → "Share your link to get started"
- "No templates" → "Browse our template library"

### Loading States
- Skeleton screens instead of spinners
- Progressive loading (show what you have)
- Optimistic UI updates

### Error States
- Friendly error messages
- Actionable recovery options
- Network error handling with retry
- Form validation with inline errors

### Responsive Design
- Mobile-first approach
- Touch-friendly targets (48px minimum)
- Responsive tables (stack on mobile)
- Bottom sheets on mobile, modals on desktop

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Focus indicators
- Screen reader friendly
- Color contrast WCAG AA compliant
- Skip to content link

### Performance
- Code splitting per route
- Lazy load components
- Image optimization
- Debounced search
- Virtual scrolling for long lists
- Service worker for offline support

## 🎯 Implementation Priority

### Phase 1: Foundation (Current Sprint)
1. ✅ Design system and component library
2. ✅ Projects/Folders system
3. ✅ Database schema updates
4. ✅ Sticky save bar
5. ✅ Drag & drop reordering

### Phase 2: Creation Flow (Next Sprint)
6. ✅ Multi-step wizard
7. ✅ Advanced AI options
8. ✅ Templates system
9. ✅ Preview mode

### Phase 3: Power Features (Sprint 3)
10. ✅ Question bank
11. ✅ Enhanced analytics
12. ✅ Theme customization
13. ✅ All settings options

### Phase 4: Collaboration (Future)
14. Real-time collaboration
15. Comments and suggestions
16. Version history
17. Team management

## 🚀 Success Metrics

### UX Metrics
- Time to create first assessment: < 2 minutes
- Question edit success rate: > 95%
- User satisfaction score: > 4.5/5
- Feature discovery rate: > 60% use templates

### Performance Metrics
- Page load time: < 1.5s
- Time to interactive: < 3s
- Lighthouse score: > 90
- Bundle size: < 500KB (gzipped)

### Business Metrics
- User activation rate: > 40%
- Weekly active users
- Assessments created per user
- Response rate per assessment

---

**Next Steps**: Start with Phase 1 implementation - Design system, Projects, and Sticky save bar.
