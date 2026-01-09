# Todo App Frontend

Next.js 16 frontend for the Todo Application with modern dashboard design, JWT authentication, and task management.

## 🏗️ Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4.x
- **Icons**: Lucide React
- **Fonts**: Space Grotesk (headings), Roboto (body)
- **Authentication**: JWT Bearer tokens

## 🎨 Design System

### Theme Colors

```css
Primary: #B9FF66    /* Lime green - highlights, active states, stat cards */
Secondary: #191A23  /* Dark - text, buttons, borders */
Tertiary: #F3F3F3   /* Light gray - backgrounds, cards */
Neutral: #F9FAFB    /* Off-white - main background */
```

### Typography

- **Headings**: Space Grotesk (400, 500, 600, 700)
- **Body Text**: Roboto (400, 500, 700)
- **Usage**:
  - All headings, task titles, numbers → Space Grotesk
  - All body text, labels, descriptions → Roboto

### Spacing System

```css
Small: 8px    /* Internal elements, small gaps */
Medium: 16px  /* Standard padding, gaps */
Large: 24px   /* Section spacing, major gaps */
```

### Border Radius

```css
Small: 8px    /* Tags, chips, small elements */
Medium: 12px  /* Buttons, cards, inputs */
Large: 18px   /* Sections, major containers */
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── signin/page.tsx             # Sign in page
│   │   ├── signup/page.tsx             # Sign up page
│   │   ├── dashboard/page.tsx          # Main dashboard (NEW)
│   │   ├── layout.tsx                  # Root layout
│   │   └── globals.css                 # Global styles
│   ├── components/
│   │   ├── auth/
│   │   │   ├── SignInForm.tsx          # Sign in form
│   │   │   └── SignUpForm.tsx          # Sign up form
│   │   ├── dashboard/                  # Dashboard components (NEW)
│   │   │   ├── Sidebar.tsx             # Collapsible sidebar with user profile
│   │   │   ├── DashboardStats.tsx      # Stats cards (total/completed/pending)
│   │   │   └── TaskFilters.tsx         # Filter buttons and search
│   │   ├── tasks/
│   │   │   ├── TaskForm.tsx            # Create/edit task form
│   │   │   ├── TaskItem.tsx            # Individual task card
│   │   │   └── TaskList.tsx            # Task list with filtering
│   │   └── Navbar.tsx                  # Navigation bar (landing/auth only)
│   └── lib/
│       └── api.ts                      # API client with typed methods
├── public/                             # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the `frontend/` directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Production API URL
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## 🎯 Features

### Authentication
- ✅ User sign up with name, email, password
- ✅ User sign in with JWT token
- ✅ Token stored in localStorage
- ✅ Protected routes (redirect to /signin if not authenticated)
- ✅ Get current user info from JWT token
- ✅ Logout functionality

### Dashboard
- ✅ Modern sidebar with user profile
- ✅ Collapsible sidebar (desktop)
- ✅ Hamburger menu (mobile)
- ✅ Real-time task statistics (total, completed, pending)
- ✅ Task filters (All, Active, Completed)
- ✅ Search functionality
- ✅ Responsive design

### Task Management
- ✅ Create tasks with title, description, due date, category
- ✅ View tasks with category names (SQL join)
- ✅ Edit tasks
- ✅ Delete tasks
- ✅ Toggle completion status
- ✅ Overdue indicator
- ✅ Category badges
- ✅ Animated task cards

### Category Management
- ✅ Create categories
- ✅ View categories
- ✅ Assign categories to tasks

## 🧩 Component Documentation

### Dashboard Components

#### Sidebar (`components/dashboard/Sidebar.tsx`)

Collapsible sidebar with user profile and navigation.

**Props:**
```typescript
interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  isMobileOpen: boolean
  onMobileClose: () => void
}
```

**Features:**
- User avatar with first letter of name
- User name and email display
- Navigation items: Dashboard, Tasks, Categories
- Logout button
- Collapse/expand toggle (desktop)
- Overlay menu (mobile)
- Smooth animations

**Styling:**
- Width: 250px (expanded), 80px (collapsed)
- Background: Tertiary (#F3F3F3)
- Active state: Primary (#B9FF66) background

#### DashboardStats (`components/dashboard/DashboardStats.tsx`)

Statistics cards showing task metrics.

**Props:**
```typescript
interface DashboardStatsProps {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
}
```

**Features:**
- 3 stat cards with icons
- Animated counters
- Hover effects
- Staggered entrance animation
- Decorative background patterns

**Styling:**
- Background: Primary (#B9FF66)
- Text: Secondary (#191A23)
- Radius: Medium (12px)

#### TaskFilters (`components/dashboard/TaskFilters.tsx`)

Filter buttons and search input.

**Props:**
```typescript
interface TaskFiltersProps {
  activeFilter: 'all' | 'active' | 'completed'
  onFilterChange: (filter: 'all' | 'active' | 'completed') => void
  searchQuery: string
  onSearchChange: (query: string) => void
}
```

**Features:**
- Filter buttons: All, Active, Completed
- Search input with icon
- Active state highlighting
- Responsive layout

### Task Components

#### TaskForm (`components/tasks/TaskForm.tsx`)

Form for creating and editing tasks.

**Props:**
```typescript
interface TaskFormProps {
  userId: string | null
  task?: Task
  onSuccess?: () => void
  onCancel?: () => void
}
```

**Features:**
- Title input (required)
- Category select (required)
- Description textarea (optional)
- Due date picker (optional)
- Create/Update modes
- Error handling
- Loading states

**Styling:**
- Background: Tertiary (#F3F3F3)
- Inputs: White with Primary focus border
- Buttons: Secondary background

#### TaskItem (`components/tasks/TaskItem.tsx`)

Individual task card with actions.

**Props:**
```typescript
interface TaskItemProps {
  task: Task
  userId: string | null
  onUpdate: () => void
  onEdit: (task: Task) => void
}
```

**Features:**
- Custom checkbox with lime green accent
- Task title and description
- Category badge
- Due date with overdue indicator
- Edit and delete buttons
- Hover effects
- Completion state (strikethrough, opacity)

**Styling:**
- Background: Tertiary (#F3F3F3)
- Border: Secondary with opacity
- Hover: Scale and shadow effects

#### TaskList (`components/tasks/TaskList.tsx`)

List of tasks with filtering and search.

**Props:**
```typescript
interface TaskListProps {
  userId: string | null
  onEdit: (task: Task) => void
  refreshTrigger?: number
  filter?: 'all' | 'active' | 'completed'
  searchQuery?: string
}
```

**Features:**
- Filters tasks by completion status
- Searches across title, description, category
- Loading state with spinner
- Empty state with emoji
- Staggered entrance animations

## 🔌 API Client

The `lib/api.ts` file provides a typed API client for all backend endpoints.

### Usage Example

```typescript
import { api } from '@/lib/api'

// Get current user
const user = await api.getCurrentUser()

// Get tasks
const tasks = await api.getTasks(userId)

// Create task
const newTask = await api.createTask(userId, {
  title: 'Complete documentation',
  category_id: 1,
  description: 'Write comprehensive README',
  due_date: '2026-01-15T17:00:00Z'
})

// Update task
await api.updateTask(userId, taskId, {
  title: 'Updated title',
  completed: true
})

// Delete task
await api.deleteTask(userId, taskId)

// Toggle completion
await api.toggleTaskComplete(userId, taskId)

// Get categories
const categories = await api.getCategories(userId)

// Create category
await api.createCategory(userId, { name: 'Work' })
```

### API Client Features

- ✅ Automatic JWT token injection from localStorage
- ✅ TypeScript interfaces for all requests/responses
- ✅ Error handling with automatic 401 redirect
- ✅ Async/await support
- ✅ RESTful methods (GET, POST, PUT, PATCH, DELETE)

## 🎨 Design Principles

### 1. Theme Consistency
- All colors from defined palette
- No arbitrary color values
- Consistent spacing using tokens
- Uniform border radius

### 2. Typography Hierarchy
- Space Grotesk for emphasis and headings
- Roboto for readability and body text
- Clear size differentiation
- Proper line heights

### 3. Animations
- Smooth transitions (200-300ms)
- Staggered entrance animations
- Hover effects on interactive elements
- Loading states with spinners

### 4. Responsive Design
- Mobile-first approach
- Sidebar collapses to hamburger menu
- Stats cards stack vertically
- Touch-friendly button sizes
- Flexible grid layouts

### 5. User Experience
- Clear visual feedback
- Loading states
- Error messages
- Empty states with helpful text
- Confirmation dialogs for destructive actions

## 🔒 Authentication Flow

### Sign Up Flow
1. User fills sign up form (name, email, password)
2. POST to `/api/auth/signup`
3. Receive JWT token and user data
4. Store token in localStorage
5. Redirect to `/dashboard`

### Sign In Flow
1. User fills sign in form (email, password)
2. POST to `/api/auth/signin`
3. Receive JWT token and user data
4. Store token in localStorage
5. Redirect to `/dashboard`

### Protected Routes
1. Check for token in localStorage
2. If no token → redirect to `/signin`
3. Fetch user data via `/api/auth/me`
4. If 401 error → redirect to `/signin`
5. Store user data in state
6. Render protected content

### Logout Flow
1. User clicks logout button
2. Remove token from localStorage
3. Redirect to landing page (`/`)

## 🧪 Testing the Frontend

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Access `/dashboard` without token (should redirect)
- [ ] Logout and verify redirect to home

**Dashboard:**
- [ ] Sidebar displays user name and email
- [ ] Stats cards show correct counts
- [ ] Sidebar collapses/expands (desktop)
- [ ] Hamburger menu works (mobile)

**Task Management:**
- [ ] Create task with all fields
- [ ] Create task with only required fields
- [ ] Edit task
- [ ] Delete task (with confirmation)
- [ ] Toggle task completion
- [ ] View overdue tasks (red indicator)

**Filtering & Search:**
- [ ] Filter by All/Active/Completed
- [ ] Search by task title
- [ ] Search by description
- [ ] Search by category name
- [ ] Empty state displays correctly

**Responsive Design:**
- [ ] Test on mobile (< 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Sidebar behavior on different screens
- [ ] Stats cards layout on different screens

## 🐛 Troubleshooting

### Issue: "Failed to fetch user"

**Cause:** Backend not running or CORS issue

**Solution:**
1. Ensure backend is running on port 8000
2. Check `NEXT_PUBLIC_API_URL` in `.env.local`
3. Verify CORS settings in backend

### Issue: Tasks not loading

**Cause:** Invalid or expired JWT token

**Solution:**
1. Clear localStorage
2. Sign in again
3. Check browser console for errors

### Issue: Styles not applying

**Cause:** Tailwind CSS not configured properly

**Solution:**
1. Restart dev server
2. Clear `.next` cache: `rm -rf .next`
3. Rebuild: `npm run dev`

### Issue: Fonts not loading

**Cause:** Google Fonts blocked or slow connection

**Solution:**
1. Check network tab in browser DevTools
2. Verify font URLs in global styles
3. Consider self-hosting fonts

## 📱 Mobile Responsiveness

### Breakpoints

```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices (tablets) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
```

### Mobile Optimizations

- Sidebar becomes hamburger menu
- Stats cards stack vertically
- Task form takes full width
- Touch-friendly button sizes (min 44x44px)
- Reduced padding on small screens
- Simplified animations for performance

## 🚀 Deployment

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Build and Deploy

```bash
# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel (recommended)
vercel deploy

# Or deploy to other platforms
# - Netlify
# - AWS Amplify
# - Docker container
```

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Notes

- Dashboard does NOT include Navbar (Navbar only for landing/auth pages)
- All API calls include JWT token automatically
- User ID is fetched from `/api/auth/me` endpoint
- Tasks include category names via SQL join on backend
- Animations use CSS for better performance
- Theme system is strictly enforced across all components

## 🎓 Learning Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📄 License

MIT License - See LICENSE file for details
