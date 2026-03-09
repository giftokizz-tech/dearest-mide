# Dearest Mide - User Application

A modern, responsive, and user-friendly blog application built with **Bootstrap 5**, **HTML5**, **CSS3**, and **JavaScript**. This is the public-facing side of the Dearest Mide blog platform where readers can discover, search, and engage with blog content.

## 🎯 Features

- **📱 Fully Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **🎨 Modern UI/UX** - Clean, intuitive interface with professional styling
- **✨ Smooth Animations** - Engaging animations using AOS (Animate On Scroll)
- **🌙 Dark/Light Theme Toggle** - Users can switch between dark and light modes
- **🔍 Advanced Search & Filter** - Find articles by title, category, and tags
- **📰 Featured Articles** - Showcase important blog posts prominently
- **👤 Author Profiles** - View detailed information about blog authors
- **💬 Comment System** - Readers can engage with content through comments
- **📊 Related Posts** - Discover similar content automatically
- **📸 Image Galleries** - Beautiful image presentations with overlays
- **🔗 Social Sharing** - Share articles on social media platforms
- **⚡ Performance Optimized** - Fast loading and smooth interactions

## 🛠️ Tech Stack

- **Frontend Framework**: Bootstrap 5.3.0
- **Styling**: CSS3 with Custom Animations
- **JavaScript**: Vanilla JS (No dependencies)
- **Animation Library**: AOS (Animate On Scroll)
- **Icons**: Font Awesome 6.4.0
- **Design Pattern**: Component-based architecture

## 📁 Project Structure

```
user/
├── index.html                 # Home page - Featured and latest articles
├── package.json              # Project metadata and scripts
├── README.md                 # This file
├── css/
│   └── styles.css           # Custom styles and animations
├── js/
│   └── app.js               # Main application JavaScript
├── pages/
│   ├── search.html          # Search and filter page
│   ├── post-detail.html     # Individual blog post page
│   └── author.html          # Author profile page
└── assets/                  # Static assets (placeholder)
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools or dependencies required

### Installation & Running

#### Option 1: Using Python (Recommended)
```bash
cd user
python -m http.server 8000
# Navigate to http://localhost:8000
```

#### Option 2: Using Node.js
```bash
cd user
npx http-server
# Navigate to http://localhost:8080
```

#### Option 3: Using Live Server (VS Code)
- Install the "Live Server" extension in VS Code
- Right-click on `index.html`
- Select "Open with Live Server"

#### Option 4: Direct File Access
- Simply open `index.html` in your browser
- Note: Some features may be limited due to CORS restrictions

## 📄 Pages & Routes

| Page | Path | Description |
|------|------|-------------|
| Home | `index.html` | Featured articles, categories, latest posts |
| Search | `pages/search.html?q=keyword` | Search and advanced filtering |
| Post Detail | `pages/post-detail.html` | Individual blog post with comments |
| Author Profile | `pages/author.html` | Author information and their articles |

## 🎨 Design Features

### Color Scheme
- **Primary**: `#6f42c1` (Purple)
- **Secondary**: `#e83e8c` (Pink)
- **Light**: `#f8f9fa`
- **Dark**: `#1a1a1a`

### Typography
- **Headings**: Segoe UI, bold weights (700-800)
- **Body**: Segoe UI, regular weight (400-600)
- **Font Size**: 16px base

### Animations
- ✨ Fade In/Up effects on scroll
- 🎯 Scale and bounce animations on hover
- 🔄 Smooth transitions for all interactive elements
- 📍 Fixed reading progress bar
- 🎪 Floating background elements

## 🔄 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px
- **Small Mobile**: Below 576px

## 🌙 Dark Mode Implementation

The app includes a toggle button in the navbar that switches between light and dark themes:
- Theme preference is saved in localStorage
- CSS variables automatically adapt to theme
- All components support both themes

## 🔍 Search & Filtering

The search page (`pages/search.html`) offers:
- **Text Search** - By article title or content
- **Category Filter** - Technology, Lifestyle, Travel, Personal Growth
- **Date Range Filter** - Last week, month, or year
- **Tag Filtering** - Popular blog tags
- **Sort Options** - Recent, Popular, Most Viewed, Alphabetical
- **Pagination** - Navigate through results

## 💬 Interactive Features

### Newsletter Subscription
- Email validation
- LocalStorage integration
- Toast notifications

### Comments System
- Comment form with validation
- Existing comments display
- Reply functionality (can be extended)

### Social Sharing
- Twitter integration
- Facebook sharing
- LinkedIn sharing
- Email sharing

### Follow Authors
- Follow/Unfollow functionality
- Author statistics
- Related articles display

## 📊 Performance Optimizations

- 🎯 Lazy loading of images
- 📦 Minimal external dependencies
- 🔄 Efficient CSS and JavaScript
- 🗜️ Compressed images used
- ⚡ Optimized animations
- 📱 Mobile-first design

## 🔧 Customization Guide

### Changing Colors
Edit the CSS variables in `css/styles.css`:
```css
:root {
    --primary-color: #6f42c1;
    --secondary-color: #e83e8c;
    /* ... other variables */
}
```

### Adding New Posts
Posts are stored in `js/app.js` in the `mockPosts` array:
```javascript
const mockPosts = [
    {
        id: 1,
        title: "Your Post Title",
        excerpt: "Short description...",
        // ... other properties
    }
];
```

### Modifying Animations
Adjust animation values in `css/styles.css`:
```css
@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
}
```

## 🔌 API Integration

The app is currently using mock data. To integrate with a real API:

1. Update the `API` object in `js/app.js`
2. Replace mock data with actual API calls
3. Implement proper error handling
4. Add loading states

Example:
```javascript
const API = {
    getPosts: async () => {
        const response = await fetch('/api/posts');
        return response.json();
    }
};
```

## 🧪 Testing

Test these core functionalities:
- [ ] Theme toggle works across pages
- [ ] Search filters work correctly
- [ ] Responsive design on various screen sizes
- [ ] Animations perform smoothly
- [ ] Newsletter subscription works
- [ ] Social sharing buttons open correct URLs
- [ ] Dark mode is persistent
- [ ] Navigation works on mobile

## 🚀 Deployment

### Static Hosting (Recommended)
- **Netlify**: Drag and drop the `user` folder
- **Vercel**: Connect GitHub repository
- **GitHub Pages**: Push to `gh-pages` branch
- **AWS S3**: Upload files and configure for hosting

### Docker
```dockerfile
FROM nginx:alpine
COPY user /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables
Create a `.env.local` file for API endpoints:
```
VITE_API_URL=https://api.example.com
VITE_APP_NAME=Dearest Mide
```

## 📝 Usage Examples

### Search with Parameters
```
pages/search.html?category=technology
pages/search.html?q=react
pages/search.html?sort=popular
```

### Call JavaScript Functions
```javascript
// Search posts
appUtils.searchPosts('web development');

// Get related posts
appUtils.getRelatedPosts(1, 3);

// Format date
appUtils.formatDate(new Date());

// Show notification
appUtils.showToast('Welcome!', 'success');
```

## 🔐 Security Considerations

- Input validation on all forms
- XSS protection through proper HTML escaping
- HTTPS recommended for production
- Content Security Policy headers
- No sensitive data stored in localStorage

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

To contribute improvements:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support & Contact

- GitHub Issues: [Create an issue](https://github.com/giftokizz-tech/dearest-mide/issues)
- Email: support@dearest-mide.com
- Twitter: [@DearestMide](https://twitter.com/DearestMide)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🎉 Acknowledgments

- Bootstrap 5 documentation and community
- Font Awesome for beautiful icons
- AOS library for scroll animations
- Unsplash for free images

---

**Happy Reading! 📚✨**

Made with ❤️ by the Dearest Mide Team
