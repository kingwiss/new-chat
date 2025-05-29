# Contributing to Random Video Chat

Thank you for your interest in contributing to this project! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites
- Node.js 14 or higher
- npm or yarn
- Git
- Modern web browser with WebRTC support

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/random-video-chat.git
   cd random-video-chat
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to `http://localhost:3000`

## Development Guidelines

### Code Style
- Use ES6+ JavaScript features
- Follow consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### File Structure
```
├── index.html          # Main HTML file
├── script.js           # Client-side JavaScript
├── server.js           # Server-side Node.js
├── styles.css          # CSS styles
├── package.json        # Dependencies and scripts
└── README.md           # Project documentation
```

### Testing

Before submitting changes:
1. Test video chat functionality
2. Test text messaging
3. Test user matching system
4. Test on different browsers
5. Test responsive design on mobile

## How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser and OS information
   - Screenshots if applicable

### Suggesting Features

1. **Check existing issues** for similar requests
2. **Create a feature request** with:
   - Clear description of the feature
   - Use case and benefits
   - Possible implementation approach

### Submitting Code Changes

1. **Create a new branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow coding guidelines
   - Test thoroughly
   - Update documentation if needed

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Add: descriptive commit message"
   ```

4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request:**
   - Provide clear description
   - Reference related issues
   - Include screenshots for UI changes

### Commit Message Guidelines

Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Examples:
- `feat: add gender preference filtering`
- `fix: resolve video connection