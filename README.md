# Attendance Calculator

A modern React-based attendance tracking application designed for college students to monitor and maintain the mandatory 75% attendance requirement.

## Features

### 📊 **Smart Attendance Tracking**
- Real-time attendance percentage calculation
- Subject-wise attendance monitoring
- 75% mandatory attendance compliance tracking

### 📈 **Visual Analytics**
- GitHub-style contribution chart for attendance patterns
- Interactive date-wise attendance visualization
- Monthly and yearly attendance overview

### 📱 **Mobile-Friendly Design**
- Responsive design optimized for all devices
- Touch-friendly interactions (tap to add, long press to remove)
- GitHub-themed dark UI for better user experience

### ⚡ **Quick Attendance Entry**
- Daily attendance marking interface
- Bulk subject selection
- Date-specific attendance logging

### 💾 **Data Persistence**
- LocalStorage integration for data retention
- No account required - works offline
- Automatic data backup and restore

### 🎯 **Smart Recommendations**
- Attendance status indicators (Safe/At Risk/Danger)
- Skip recommendations when attendance is high
- Required classes calculation to maintain 75%

## Technologies Used

- **Frontend**: React.js with Vite
- **Styling**: CSS3 with GitHub theme
- **Icons**: Font Awesome
- **Charts**: Custom GitHub-style contribution chart
- **Storage**: Browser LocalStorage

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Jason3105/Attendance-Calculator.git
cd Attendance-Calculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Adding Subjects
1. Click the "Add Subject" button
2. Enter subject name, classes attended, and total classes
3. The attendance percentage is calculated automatically

### Tracking Daily Attendance
1. Use the "Quick Attendance Entry" section
2. Select the date and subjects attended
3. Save to update your attendance chart

### Using the Attendance Chart
- **Desktop**: Left-click to add attendance, right-click to remove
- **Mobile**: Tap to add attendance, long press to remove
- Filter by specific subjects using the dropdown
- Scroll horizontally to view different months

### Understanding Status Indicators
- 🟢 **Safe**: Above 75% attendance (can skip some classes)
- 🟡 **At Risk**: Close to 75% (attend regularly)
- 🔴 **Danger**: Below 75% (must attend all remaining classes)

## Features Overview

### Main Dashboard
- Overall attendance statistics
- Subject-wise breakdown
- Quick action buttons

### Subject Management
- Add/remove subjects dynamically
- Real-time percentage calculations
- Status-based color coding

### Attendance Chart
- Visual representation of attendance patterns
- Interactive date selection
- Subject filtering capabilities

### Mobile Optimization
- Touch-friendly interface
- Responsive breakpoints
- Optimized typography and spacing

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you find this project helpful, please consider giving it a ⭐ on GitHub!

## Acknowledgments

- Inspired by GitHub's contribution chart design
- Built with modern React practices
- Optimized for college student workflow

---

**Made with ❤️ for students struggling with attendance tracking**
