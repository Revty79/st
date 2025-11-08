# 🎭 Storyteller (ST)

> **A comprehensive digital toolkit for tabletop RPG world-building, character creation, and campaign management.**

Storyteller is a modern web application designed to empower Game Masters and players with powerful tools for creating rich, detailed fantasy worlds, custom races, creatures, items, and magical systems. Built with cutting-edge web technologies, it provides an intuitive interface for managing complex RPG content.

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey?style=flat-square&logo=sqlite)

---

## 🌟 Features

### 🌍 **World Builder**
- **Complete World Design**: Create detailed worlds with custom physics, magic systems, and lore
- **Timeline Management**: Build complex historical timelines with eras, settings, and markers
- **Calendar Systems**: Design custom calendars with moons, months, and weekdays
- **Climate & Geography**: Define climate zones, realms, and planetary characteristics
- **Master Catalogs**: Curate collections of races, creatures, languages, deities, and factions

### 🧬 **Race Designer**
- **Comprehensive Race Creation**: Design custom races with detailed lore and characteristics
- **Attribute Systems**: Set racial attribute maximums and base values
- **Bonus Skills**: Define racial skill bonuses and special abilities
- **Cultural Integration**: Include cultural mindsets, languages, and magical outlooks
- **Genre Flexibility**: Adapt races for different game settings and themes

### 🐉 **Creature Codex**
- **Monster Creation**: Design creatures with detailed stats, abilities, and behaviors
- **Challenge Rating**: Balance encounters with comprehensive CR systems
- **Behavioral AI**: Define tactics, habitat preferences, and interaction patterns
- **Loot & Harvesting**: Specify treasure drops and harvestable materials
- **Story Integration**: Include story hooks and campaign integration notes

### ⚔️ **Equipment Arsenal**
- **Weapons Database**: Create custom weapons with detailed statistics and effects
- **Armor Systems**: Design protective gear with coverage and encumbrance mechanics
- **General Items**: Build inventories of tools, consumables, and miscellaneous equipment
- **Timeline Integration**: Organize equipment by technological eras and availability

### 🔮 **Magic System Designer**
- **Spell Construction**: Build complex spells with modular components
- **Psionic Abilities**: Design mental powers and psychic phenomena
- **Special Abilities**: Create unique racial and class-based special powers
- **Scaling Systems**: Implement point-based and percentage-based ability scaling
- **Magic Theory**: Define magical traditions and power sources

### 👤 **User Management**
- **Secure Authentication**: Robust user accounts with role-based permissions
- **Collaboration**: Share content between users with appropriate access controls
- **Personal Libraries**: Organize and manage individual content collections

---

## 🚀 Getting Started

### **Prerequisites**
- [Node.js](https://nodejs.org/) (18.0 or later)
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Revty79/st.git
   cd st
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   TIDE_SECRET=your-secure-secret-key-here
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### **First Steps**
1. Create an account through the registration system
2. Navigate to the World Builder to create your first world
3. Use the Race Designer to create custom races for your setting
4. Explore the Creature Codex to populate your world with monsters
5. Build your equipment arsenal with custom weapons and armor

---

## 🛠️ Technology Stack

### **Frontend**
- **React 19.2.0** - Latest React with concurrent features
- **Next.js 16.0.1** - Full-stack React framework with App Router
- **TypeScript 5** - Type-safe development with strict mode
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Compiler** - Automatic optimization for better performance

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **SQLite** - Lightweight, embedded database with WAL mode
- **better-sqlite3** - High-performance SQLite driver
- **bcryptjs** - Secure password hashing

### **Development**
- **ESLint** - Code linting and style enforcement
- **TypeScript** - Compile-time type checking
- **Babel React Compiler** - Advanced React optimizations

---

## 📁 Project Structure

```
st/
├── src/
│   ├── app/
│   │   ├── api/           # API routes for all game systems
│   │   ├── dashboard/     # User dashboard
│   │   ├── login/         # Authentication pages
│   │   └── worldbuilder/  # Main world-building interface
│   │       ├── worlds/    # World management & details
│   │       ├── races/     # Race designer
│   │       ├── creatures/ # Creature codex
│   │       ├── inventory/ # Equipment arsenal
│   │       └── skillsets/ # Magic & abilities system
│   ├── components/        # Reusable React components
│   └── server/           # Server-side utilities
│       ├── auth.ts       # Authentication helpers
│       ├── db.ts         # Database schema & connection
│       └── session.ts    # Session management
├── data/                 # SQLite database files
└── debug_*.js           # Development debugging tools
```

---

## 🔐 Security Features

- **🔒 Secure Authentication**: bcrypt password hashing with salt
- **🍪 Session Management**: HTTP-only cookies with HMAC signatures
- **🛡️ SQL Injection Protection**: Prepared statements throughout
- **🔑 Role-Based Access**: User roles for content access control
- **🌐 CSRF Protection**: SameSite cookies and secure headers

---

## 📖 API Documentation

### **Core Endpoints**
- `GET/POST /api/world` - World management
- `GET/POST/PUT/DELETE /api/races` - Race designer
- `GET/POST/PUT/DELETE /api/creatures` - Creature codex
- `GET/POST/PUT/DELETE /api/items` - Equipment management
- `GET/POST/PUT/DELETE /api/skills` - Magic & abilities system

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

All API endpoints return JSON responses with consistent error handling and proper HTTP status codes.

---

## 🎮 Usage Examples

### **Creating a Custom Race**
1. Navigate to World Builder → Races
2. Click "Add" and enter your race name
3. Fill in the Identity & Lore tab with background information
4. Set attribute maximums in the Attributes tab
5. Add racial bonus skills and special abilities
6. Use the Preview tab to review your creation

### **Designing a World**
1. Go to World Builder → Worlds → World Details
2. Set up basic information (name, pitch, genre tags)
3. Configure astronomical details (suns, moons, calendar)
4. Define magic systems and technology levels
5. Add races and creatures from your catalogs
6. Save your world for campaign use

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript strict mode requirements
- Use Tailwind CSS for styling
- Write comprehensive error handling
- Include JSDoc comments for complex functions
- Test all database operations thoroughly

---

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 🗄️ Database Schema

The application uses SQLite with a comprehensive schema supporting:
- User management with role-based access
- Complex world hierarchies (worlds → eras → settings → markers)
- Detailed race definitions with attributes and abilities
- Rich creature stats with behavioral AI
- Equipment with timeline and genre categorization
- Modular magic system with scaling abilities

Foreign key constraints ensure data integrity, and WAL mode provides optimal performance.

---

## 🐛 Troubleshooting

### **Common Issues**
- **Database errors**: Ensure data/ directory has write permissions
- **Session issues**: Check TIDE_SECRET environment variable
- **Build failures**: Clear .next/ directory and rebuild

### **Debug Tools**
- Run `node debug_races.js` to check race database status
- Check browser console for client-side errors
- Review server logs for API debugging information

---

## 📄 License

This project is private and not currently licensed for public use.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Database powered by [SQLite](https://sqlite.org/)
- Authentication secured with [bcrypt](https://github.com/dcodeIO/bcrypt.js)

---

## 📞 Support

For support, feature requests, or bug reports, please create an issue in the repository or contact the development team.

**Happy World Building! 🌟**
