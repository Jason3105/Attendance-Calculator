import { useState } from 'react'
import './QuickAttendance.css'

function QuickAttendance({ subjects, onAttendanceAdded }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })

  const [attendanceEntries, setAttendanceEntries] = useState({})

  const handleSubjectToggle = (subjectName) => {
    setAttendanceEntries(prev => ({
      ...prev,
      [subjectName]: !prev[subjectName]
    }))
  }

  const saveAttendance = () => {
    const date = new Date(selectedDate)
    Object.entries(attendanceEntries).forEach(([subjectName, attended]) => {
      if (attended) {
        onAttendanceAdded(date, subjectName)
      }
    })
    
    // Reset entries
    setAttendanceEntries({})
    
    // Show success message
    const notification = document.createElement('div')
    notification.className = 'attendance-notification'
    notification.textContent = 'Attendance saved successfully!'
    document.body.appendChild(notification)
    
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)
  }

  const hasAnySelection = Object.values(attendanceEntries).some(Boolean)

  return (
    <div className="quick-attendance">
      <div className="quick-header">
        <h3>Quick Attendance Entry</h3>
        <p>Mark your attendance for today or any specific date</p>
      </div>

      <div className="attendance-form">
        <div className="date-selector">
          <label htmlFor="attendance-date">Select Date:</label>
          <input
            id="attendance-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="date-input"
          />
        </div>

        {subjects.length > 0 ? (
          <>
            <div className="subjects-grid">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={`subject-checkbox ${attendanceEntries[subject.name] ? 'selected' : ''}`}
                  onClick={() => handleSubjectToggle(subject.name)}
                >
                  <div className="checkbox">
                    {attendanceEntries[subject.name] && (
                      <i className="fas fa-check"></i>
                    )}
                  </div>
                  <span className="subject-label">{subject.name}</span>
                  <span className="class-count">
                    {attendanceEntries[subject.name] ? '1 class' : 'No class'}
                  </span>
                </div>
              ))}
            </div>

            <div className="action-buttons">
              <button
                onClick={saveAttendance}
                disabled={!hasAnySelection}
                className="btn btn-primary save-btn"
              >
                <i className="fas fa-save"></i>
                Save Attendance
              </button>
              
              <button
                onClick={() => setAttendanceEntries({})}
                className="btn btn-secondary"
              >
                <i className="fas fa-times"></i>
                Clear All
              </button>
            </div>
          </>
        ) : (
          <div className="no-subjects">
            <i className="fas fa-info-circle"></i>
            <p>Add subjects first to start tracking attendance</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuickAttendance
