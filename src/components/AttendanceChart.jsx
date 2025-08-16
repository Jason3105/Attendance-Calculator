import { useState, useEffect } from 'react'
import './AttendanceChart.css'

function AttendanceChart({ subjects, attendanceData, setAttendanceData }) {
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [isMobile, setIsMobile] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState(null)
  const [isLongPress, setIsLongPress] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Generate dates for the last year
  const generateDates = () => {
    const dates = []
    const today = new Date()
    const startDate = new Date(today)
    startDate.setFullYear(today.getFullYear() - 1)
    startDate.setDate(startDate.getDate() + 1)

    const currentDate = new Date(startDate)
    while (currentDate <= today) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }

  const dates = generateDates()

  // Get months for the header
  const getMonths = () => {
    const months = []
    const today = new Date()
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      months.push({
        name: date.toLocaleString('default', { month: 'short' }),
        year: date.getFullYear()
      })
    }
    return months
  }

  // Get attendance level for a specific date
  const getAttendanceLevel = (date, subjectFilter = 'all') => {
    const dateKey = date.toISOString().split('T')[0]
    const dayData = attendanceData[dateKey]
    
    if (!dayData) return 0

    if (subjectFilter === 'all') {
      // Calculate overall attendance for the day
      const totalClasses = Object.values(dayData).reduce((sum, count) => sum + count, 0)
      if (totalClasses === 0) return 0
      if (totalClasses === 1) return 1
      if (totalClasses === 2) return 2
      if (totalClasses >= 3) return 3
      return totalClasses
    } else {
      // Get attendance for specific subject
      const subjectCount = dayData[subjectFilter] || 0
      return Math.min(subjectCount, 3)
    }
  }

  // Add attendance for a specific date and subject
  const addAttendance = (date, subjectName) => {
    const dateKey = date.toISOString().split('T')[0]
    setAttendanceData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [subjectName]: (prev[dateKey]?.[subjectName] || 0) + 1
      }
    }))
  }

  // Remove attendance for a specific date and subject
  const removeAttendance = (date, subjectName) => {
    const dateKey = date.toISOString().split('T')[0]
    setAttendanceData(prev => {
      const newData = { ...prev }
      if (newData[dateKey] && newData[dateKey][subjectName]) {
        if (newData[dateKey][subjectName] > 1) {
          newData[dateKey][subjectName]--
        } else {
          delete newData[dateKey][subjectName]
          if (Object.keys(newData[dateKey]).length === 0) {
            delete newData[dateKey]
          }
        }
      }
      return newData
    })
  }

  // Get total contributions for selected subject
  const getTotalContributions = (subjectFilter = 'all') => {
    return Object.values(attendanceData).reduce((total, dayData) => {
      if (subjectFilter === 'all') {
        return total + Object.values(dayData).reduce((sum, count) => sum + count, 0)
      } else {
        return total + (dayData[subjectFilter] || 0)
      }
    }, 0)
  }

  // Get streak information
  const getCurrentStreak = (subjectFilter = 'all') => {
    let streak = 0
    const today = new Date()
    const currentDate = new Date(today)
    
    while (currentDate >= dates[0]) {
      const level = getAttendanceLevel(currentDate, subjectFilter)
      if (level > 0) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }

  // Group dates by week
  const groupByWeeks = () => {
    const weeks = []
    let currentWeek = []
    
    dates.forEach((date, index) => {
      const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
      
      if (index === 0) {
        // Fill the first week with empty cells if needed
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push(null)
        }
      }
      
      currentWeek.push(date)
      
      if (dayOfWeek === 6 || index === dates.length - 1) { // Saturday or last date
        // Fill the last week with empty cells if needed
        while (currentWeek.length < 7) {
          currentWeek.push(null)
        }
        weeks.push(currentWeek)
        currentWeek = []
      }
    })
    
    return weeks
  }

  const weeks = groupByWeeks()
  const months = getMonths()
  const totalContributions = getTotalContributions(selectedSubject)
  const currentStreak = getCurrentStreak(selectedSubject)

  const subjectOptions = [
    { value: 'all', label: 'All Subjects' },
    ...subjects.map(subject => ({ value: subject.name, label: subject.name }))
  ]

  // Handle mobile touch interactions
  const handleTouchStart = (date, dayData) => {
    if (!isMobile) return
    
    setIsLongPress(false)
    const timer = setTimeout(() => {
      setIsLongPress(true)
      // Long press - remove attendance
      if (subjects.length > 0 && dayData) {
        let subjectToRemove = null
        
        if (selectedSubject === 'all') {
          // Find the first subject that has attendance on this day and still exists
          for (const subjectName of Object.keys(dayData)) {
            if (subjects.some(s => s.name === subjectName)) {
              subjectToRemove = subjectName
              break
            }
          }
        } else {
          // Check if the selected subject exists and has attendance on this day
          if (dayData[selectedSubject] && subjects.some(s => s.name === selectedSubject)) {
            subjectToRemove = selectedSubject
          }
        }
        
        if (subjectToRemove) {
          removeAttendance(date, subjectToRemove)
          // Provide haptic feedback if available
          if (navigator.vibrate) {
            navigator.vibrate(50)
          }
        }
      }
    }, 500) // 500ms for long press
    
    setLongPressTimer(timer)
  }

  const handleTouchEnd = (date) => {
    if (!isMobile) return
    
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
    
    // Short tap - add attendance (only if it wasn't a long press)
    if (!isLongPress && subjects.length > 0 && date <= new Date()) {
      const subjectName = selectedSubject === 'all' ? subjects[0].name : selectedSubject
      // Check if the subject still exists
      const subjectExists = subjects.some(s => s.name === subjectName)
      if (subjectExists) {
        addAttendance(date, subjectName)
        // Provide haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(30)
        }
      }
    }
  }

  const handleMouseClick = (date) => {
    if (isMobile) return // Skip mouse events on mobile
    
    if (subjects.length > 0 && date <= new Date()) {
      const subjectName = selectedSubject === 'all' ? subjects[0].name : selectedSubject
      // Check if the subject still exists
      const subjectExists = subjects.some(s => s.name === subjectName)
      if (subjectExists) {
        addAttendance(date, subjectName)
      }
    }
  }

  const handleContextMenu = (e, date, dayData) => {
    if (isMobile) return // Skip context menu on mobile
    
    e.preventDefault()
    if (subjects.length > 0 && dayData) {
      let subjectToRemove = null
      
      if (selectedSubject === 'all') {
        // Find the first subject that has attendance on this day and still exists
        for (const subjectName of Object.keys(dayData)) {
          if (subjects.some(s => s.name === subjectName)) {
            subjectToRemove = subjectName
            break
          }
        }
      } else {
        // Check if the selected subject exists and has attendance on this day
        if (dayData[selectedSubject] && subjects.some(s => s.name === selectedSubject)) {
          subjectToRemove = selectedSubject
        }
      }
      
      if (subjectToRemove) {
        removeAttendance(date, subjectToRemove)
      }
    }
  }

  // Reset selected subject if it no longer exists
  useEffect(() => {
    if (selectedSubject !== 'all' && !subjects.some(s => s.name === selectedSubject)) {
      setSelectedSubject('all')
    }
  }, [subjects, selectedSubject])

  return (
    <div className="attendance-chart">
      <div className="chart-header">
        <div className="chart-title">
          <h3>Attendance Activity</h3>
          <div className="chart-stats">
            <span className="stat">
              <strong>{totalContributions}</strong> classes in the last year
            </span>
            <span className="stat">
              <strong>{currentStreak}</strong> day streak
            </span>
          </div>
        </div>
        
        <div className="subject-filter">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="subject-select"
          >
            {subjectOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-container">
        <div className="month-labels">
          {months.map((month, index) => (
            <span key={index} className="month-label">
              {month.name}
            </span>
          ))}
        </div>

        <div className="chart-grid">
          <div className="day-labels">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="weeks-container">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="week">
                {week.map((date, dayIndex) => {
                  if (!date) {
                    return <div key={dayIndex} className="day empty"></div>
                  }

                  const level = getAttendanceLevel(date, selectedSubject)
                  const dateKey = date.toISOString().split('T')[0]
                  const dayData = attendanceData[dateKey]
                  const isToday = date.toDateString() === new Date().toDateString()
                  
                  let tooltip = date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                  
                  if (dayData) {
                    tooltip += '\n'
                    if (selectedSubject === 'all') {
                      Object.entries(dayData).forEach(([subject, count]) => {
                        // Check if subject still exists
                        const subjectExists = subjects.some(s => s.name === subject)
                        const displayName = subjectExists ? subject : `${subject} (deleted)`
                        tooltip += `\n${displayName}: ${count} class${count > 1 ? 'es' : ''}`
                      })
                    } else {
                      const count = dayData[selectedSubject] || 0
                      tooltip += `\n${count} class${count > 1 ? 'es' : ''}`
                    }
                  } else {
                    tooltip += '\nNo classes'
                  }

                  return (
                    <div
                      key={dayIndex}
                      className={`day level-${level} ${isToday ? 'today' : ''}`}
                      title={tooltip}
                      onClick={() => handleMouseClick(date)}
                      onContextMenu={(e) => handleContextMenu(e, date, dayData)}
                      onTouchStart={() => handleTouchStart(date, dayData)}
                      onTouchEnd={() => handleTouchEnd(date)}
                      onTouchCancel={() => {
                        if (longPressTimer) {
                          clearTimeout(longPressTimer)
                          setLongPressTimer(null)
                        }
                      }}
                      style={{ 
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none'
                      }}
                    ></div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="chart-legend">
          <span className="legend-label">Less</span>
          <div className="legend-squares">
            <div className="day level-0"></div>
            <div className="day level-1"></div>
            <div className="day level-2"></div>
            <div className="day level-3"></div>
          </div>
          <span className="legend-label">More</span>
        </div>
      </div>

      <div className="chart-instructions">
        <div className="instruction-header">
          <i className="fas fa-info-circle"></i>
        </div>
        <div className="instruction-text">
          {isMobile ? (
            <>
              <span className="instruction-line"><strong>Tap</strong> to add attendance</span>
              <span className="instruction-line"><strong>Long press</strong> to remove attendance</span>
              <span className="instruction-line">Swipe horizontally to see more dates</span>
            </>
          ) : (
            <>
              <span className="instruction-line"><strong>Left-click</strong> to add attendance, <strong>right-click</strong> to remove attendance</span>
              <span className="instruction-line">Hover over squares to see details</span>
              <span className="mobile-hint">Swipe horizontally to see more dates</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceChart
