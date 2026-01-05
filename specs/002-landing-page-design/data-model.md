# Data Model: Landing Page Design

## Entities

### User (Contextual)
Represented for authentication navigation.
- **id**: UUID
- **role**: USER (Determines navigation visibility)

### Feature Card
The 6 features displayed in the features section.
- **id**: Slug/ID
- **title**: String
- **description**: String
- **icon**: Asset Link / Icon name

## State Transitions
- **Theme State**: Light / Dark (Persistent via next-themes or local storage)
- **Navigation State**: Mobile Menu (Open/Closed)
- **Authentication State**: Logged In / Logged Out (Determines Navbar CTA labels)
