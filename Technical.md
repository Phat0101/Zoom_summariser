# Zoom AI Summariser - Technical Documentation

## Overview

Zoom AI Summariser is a Next.js application designed to summarise Zoom transcripts using Google's Generative AI (Gemini). It addresses the challenge of multiple speakers sharing the same device during a Zoom meeting, resulting in transcripts attributing all speech to a single user. The application allows users to:

- Segment transcripts by different speakers and time periods
- Add speaker profiles with background information
- Customise the AI system prompt for improved summarisation
- Generate individual summaries for each speaker's contribution
- Export the formatted summaries for further use

## Technologies Used

- **Next.js 14**: A React framework for building server-rendered applications and APIs.
- **TypeScript**: Adds static typing to JavaScript, enhancing code quality and developer experience.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **shadcn/ui**: A collection of re-usable UI components built with Tailwind CSS.
- **Vercel AI SDK**: Utilities provided by Vercel to integrate AI features into applications.
- **Google AI SDK**: Used to interact with Google's Generative AI (Gemini) for text summarization.
- **React Hooks**: Including custom hooks like `useLocalStorage` for state management.
- **Framer Motion**: A library for animating React components.
- **React Icons**: Provides popular icons as React components.

## Important Libraries

Extracted from `package.json`:

- `"@ai-sdk/google": "^0.0.51"`
- `"ai": "^3.4.7"`
- `"react-resizable-panels": "^2.1.4"`
- `"react-syntax-highlighter": "^15.5.0"`
- `"react-markdown": "^9.0.1"`
- `"framer-motion": "^11.11.10"`
- `"tailwind-merge": "^2.5.2"`
- `"tailwindcss-animate": "^1.0.7"`
- `"clsx": "^2.1.1"`
- `"class-variance-authority": "^0.7.0"`

## Project Structure

- **`src/`**
  - **`app/`**
    - **`api/summary/route.ts`**: API route for summarising transcripts using Google AI SDK.
    - **`page.tsx`**: Main application page.
  - **`components/`**
    - **`NavBar.tsx`**: Navigation bar with theme and font size controls.
    - **`Result.tsx`**: Displays generated summaries.
    - **`transcript-summarizer.tsx`**: Core component for transcript handling and summary generation.
    - **`ui/`**: UI components from shadcn/ui.
  - **`hooks/`**
    - **`useLocalStorage.ts`**: Custom hook for persisting state in local storage.
  - **`lib/`**
    - **`parse.ts`**: Parses raw transcript text into a usable format.

## Key Components

### `transcript-summarizer.tsx`

- **Functionality**:
  - Upload and parse transcript files.
  - Manage state for speakers, timeframes, system prompts, and summaries.
  - Add speakers with notes and assign timeframes.
  - Generate summaries using the API.

- **Technologies Used**:
  - React hooks (`useState`, `useEffect`, `useRef`).
  - Custom `useLocalStorage` hook for persisting data.
  - UI components from shadcn/ui.
  - Animations with Framer Motion.

### `parse.ts`

- Processes raw transcript text.
- Splits transcript into individual lines with timestamps.

### `NavBar.tsx`

- Provides navigation between main and summary pages.
- Contains controls for toggling dark mode and adjusting font size.
- Utilises React Icons and shadcn/ui `Button` component.

### `Result.tsx`

- Displays generated summaries in a readable format.
- Renders markdown content using `react-markdown`.
- Syntax highlighting with `react-syntax-highlighter`.
- Allows users to download summaries.

### `api/summary/route.ts`

- Handles POST requests to generate summaries.
- Uses Google AI SDK to interface with Gemini model.
- Processes speaker transcripts and returns summaries.

## State Management

- **React `useState` and `useEffect` Hooks**: For managing component state and side effects.
- **Custom `useLocalStorage` Hook**: Persists state across sessions by syncing state with `localStorage`.

## Styling and UI

- **Tailwind CSS**: Provides utility classes for styling.
- **shadcn/ui Components**: Pre-built components styled with Tailwind CSS.
- **Responsive Design**: The app is designed to be responsive across different screen sizes.
- **Dark Mode**: Users can toggle between light and dark themes.

## Animations

- **Framer Motion**: Adds animations and transitions to enhance user experience.
- Used in components like `NavBar`, `transcript-summarizer.tsx`, and `Result.tsx`.

## Extending the Application

### Adding New Features

- **UI Components**: Create new components in the `components` directory. Use existing components as references.
- **State Management**: Leverage React hooks and the `useLocalStorage` hook for state persistence.
- **API Integration**: Add new API routes in `src/app/api/` as needed.

### Modifying Existing Features

- **Update Components**: Modify components in `components/` to adjust functionality.
- **Enhance Parsing Logic**: Adjust `parse.ts` for different transcript formats.
- **Improve Summarization**: Modify the system prompt or parameters in `api/summary/route.ts` to enhance AI summarisation.

### Bug Fixing

- **Debugging**: Use console logs and React DevTools to inspect state and component hierarchy.
- **Error Handling**: Ensure API calls and asynchronous operations have proper error handling.
- **Testing**: Write tests for critical functions and components.

## Important Considerations

- **API Keys and Security**:
  - Store API keys in the `.env` file (included in `.gitignore`).
  - Avoid committing sensitive information to version control.
- **Environment Variables**:
  - Ensure all required environment variables are defined before starting the app.
- **Dependency Management**:
  - Keep dependencies up-to-date to include the latest features and security patches.
  - Use `npm audit` to identify and fix vulnerabilities.

## Setup and Deployment

- **Development**:
  - Install dependencies: `npm install`
  - Run the development server: `npm run dev`
- **Production**:
  - Build the application: `npm run build`
  - Start the production server: `npm start`
- **Linting and Formatting**:
  - Lint the code: `npm run lint`

## Additional Resources

- **Next.js Documentation**: [Next.js Docs](https://nextjs.org/docs)
- **Tailwind CSS Documentation**: [Tailwind CSS Docs](https://tailwindcss.com/docs)
- **shadcn/ui Documentation**: [shadcn/ui Docs](https://ui.shadcn.com/)
- **Vercel AI SDK**: [Vercel AI SDK](https://github.com/vercel-labs/ai)
- **Google AI SDK**: Refer to Google's documentation for the latest usage guidelines.

## Contact and Support

- For any questions or support, refer to project maintainers or create an issue in the repository.
