# Artist Grid Tool

A professional web application designed for artists to create accurate grid overlays on reference images using the traditional grid method for drawing and painting.

## Features

- **Image Upload**: Upload any image format to use as a reference
- **Customizable Grid**: Adjust grid size, color, width, and style
- **Aspect Ratio Control**: Maintain original proportions or customize
- **Diagonal Lines**: Add diagonal grid lines for more precise measurements
- **Label Display**: Toggle coordinate labels on grid intersections
- **Image Adjustments**: Control brightness and contrast
- **Physical Dimensions**: Set real-world measurements for scaling
- **Responsive Design**: Works on desktop and mobile devices
- **Settings Persistence**: Automatically saves your preferences

## Technologies Used

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React hooks with local storage
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner for toasts
- **Query Management**: TanStack Query

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/grid-maker.git
   cd grid-maker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Usage

1. **Upload an Image**: Click the upload area or drag and drop an image file
2. **Customize Grid**: Use the control panel to adjust:
   - Grid size (number of divisions)
   - Grid color and line width
   - Aspect ratio options
   - Diagonal lines toggle
   - Label visibility
   - Image brightness and contrast
3. **Set Physical Dimensions**: Enter real-world measurements for accurate scaling
4. **Export**: Right-click on the canvas to save the overlaid image

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui components
│   ├── ControlPanel.tsx
│   ├── GridCanvas.tsx
│   ├── ImageUpload.tsx
│   └── Manual.tsx
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── pages/           # Route components
└── main.tsx         # App entry point
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Author

Created and Manufactured by Xe54z
