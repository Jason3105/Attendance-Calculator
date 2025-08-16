import { useState, useEffect } from 'react'
import AttendanceChart from './AttendanceChart'
import QuickAttendance from './QuickAttendance'
import './AttendanceCalculator.css'

function AttendanceCalculator() {
  // Load subjects from localStorage or use default
  const loadSubjects = () => {
    const saved = localStorage.getItem('attendanceSubjects')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing saved subjects:', error)
      }
    }
    return [{ id: 1, name: 'Subject 1', attended: '', total: '' }]
  }

  const [subjects, setSubjects] = useState(loadSubjects)
  const [attendanceData, setAttendanceData] = useState(() => {
    const saved = localStorage.getItem('attendanceHistory')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Error parsing attendance history:', error)
      }
    }
    return {}
  })

  // Save subjects to localStorage whenever subjects change
  useEffect(() => {
    localStorage.setItem('attendanceSubjects', JSON.stringify(subjects))
  }, [subjects])

  // Save attendance data whenever it changes
  useEffect(() => {
    localStorage.setItem('attendanceHistory', JSON.stringify(attendanceData))
  }, [attendanceData])

  // Clean up orphaned attendance data when subjects change
  useEffect(() => {
    const currentSubjectNames = subjects.map(s => s.name)
    const hasOrphanedData = Object.values(attendanceData).some(dayData =>
      Object.keys(dayData).some(subjectName => !currentSubjectNames.includes(subjectName))
    )

    if (hasOrphanedData) {
      setAttendanceData(prev => {
        const newData = { ...prev }
        Object.keys(newData).forEach(dateKey => {
          if (newData[dateKey]) {
            Object.keys(newData[dateKey]).forEach(subjectName => {
              if (!currentSubjectNames.includes(subjectName)) {
                delete newData[dateKey][subjectName]
              }
            })
            // If no subjects left for this date, remove the date entry
            if (Object.keys(newData[dateKey]).length === 0) {
              delete newData[dateKey]
            }
          }
        })
        return newData
      })
    }
  }, [subjects, attendanceData])

  const addSubject = () => {
    const newId = Date.now() // Use timestamp for unique ID
    const existingSubjectNumbers = subjects.map(s => {
      const match = s.name.match(/Subject (\d+)/)
      return match ? parseInt(match[1]) : 0
    }).filter(num => num > 0)
    
    const nextNumber = existingSubjectNumbers.length > 0 
      ? Math.max(...existingSubjectNumbers) + 1 
      : 1
    
    setSubjects([...subjects, { 
      id: newId, 
      name: `Subject ${nextNumber}`, 
      attended: '', 
      total: '' 
    }])
  }

  const updateSubject = (id, field, value) => {
    setSubjects(subjects.map(subject => 
      subject.id === id 
        ? { ...subject, [field]: value }
        : subject
    ))
  }

  const removeSubject = (id) => {
    const subjectToRemove = subjects.find(s => s.id === id)
    const subjectName = subjectToRemove?.name
    
    // If this is the last subject, replace it with a fresh blank subject
    if (subjects.length === 1) {
      const newId = Date.now()
      setSubjects([{ 
        id: newId, 
        name: 'Subject 1', 
        attended: '', 
        total: '' 
      }])
    } else {
      // Remove the subject from the list if there are multiple subjects
      setSubjects(subjects.filter(subject => subject.id !== id))
    }
    
    // Clean up orphaned attendance data for this subject
    if (subjectName) {
      setAttendanceData(prev => {
        const newData = { ...prev }
        Object.keys(newData).forEach(dateKey => {
          if (newData[dateKey] && newData[dateKey][subjectName]) {
            delete newData[dateKey][subjectName]
            // If no subjects left for this date, remove the date entry
            if (Object.keys(newData[dateKey]).length === 0) {
              delete newData[dateKey]
            }
          }
        })
        return newData
      })
    }
  }

  const calculatePercentage = (attended, total) => {
    const attendedNum = parseInt(attended) || 0
    const totalNum = parseInt(total) || 0
    if (totalNum === 0) return 0
    return ((attendedNum / totalNum) * 100).toFixed(2)
  }

  const getClassesNeededFor75 = (attended, total) => {
    const attendedNum = parseInt(attended) || 0
    const totalNum = parseInt(total) || 0
    if (totalNum === 0) return 0
    const currentPercentage = (attendedNum / totalNum) * 100
    if (currentPercentage >= 75) return 0
    
    const classesNeeded = Math.ceil((0.75 * totalNum - attendedNum) / 0.25)
    return Math.max(0, classesNeeded)
  }

  const getClassesCanSkip = (attended, total) => {
    const attendedNum = parseInt(attended) || 0
    const totalNum = parseInt(total) || 0
    if (totalNum === 0) return 0
    const currentPercentage = (attendedNum / totalNum) * 100
    if (currentPercentage < 75) return 0
    
    const maxSkip = Math.floor((attendedNum - 0.75 * totalNum) / 0.75)
    return Math.max(0, maxSkip)
  }

  const getOverallStats = () => {
    const totalAttended = subjects.reduce((sum, s) => sum + (parseInt(s.attended) || 0), 0)
    const totalClasses = subjects.reduce((sum, s) => sum + (parseInt(s.total) || 0), 0)
    const overallPercentage = calculatePercentage(totalAttended, totalClasses)
    
    return {
      totalAttended,
      totalClasses,
      overallPercentage,
      status: totalClasses > 0 && overallPercentage >= 75 ? 'safe' : totalClasses > 0 ? 'danger' : 'neutral'
    }
  }

  // Handler for attendance added from QuickAttendance component
  const handleAttendanceAdded = (date, subjectName) => {
    const dateKey = date.toISOString().split('T')[0]
    setAttendanceData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [subjectName]: (prev[dateKey]?.[subjectName] || 0) + 1
      }
    }))
  }

  const overallStats = getOverallStats()

  return (
    <div className="attendance-calculator">
      <header className="header">
        <div className="container">
          <h1 className="title">
            <i className="fas fa-graduation-cap"></i>
            Attendance Calculator
          </h1>
          <p className="subtitle">Track your college attendance and meet the 75% requirement</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Overall Statistics */}
          <div className={`stats-card ${overallStats.status}`}>
            <div className="stats-header">
              <h2>Overall Attendance</h2>
              {overallStats.totalClasses > 0 && (
                <span className={`status-badge ${overallStats.status}`}>
                  {overallStats.status === 'safe' ? (
                    <><i className="fas fa-check-circle"></i> Safe</>
                  ) : (
                    <><i className="fas fa-exclamation-triangle"></i> Below 75%</>
                  )}
                </span>
              )}
            </div>
            <div className="stats-content">
              <div className="stat-item">
                <span className="stat-value">{overallStats.overallPercentage}%</span>
                <span className="stat-label">Current Percentage</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{overallStats.totalAttended}</span>
                <span className="stat-label">Classes Attended</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{overallStats.totalClasses}</span>
                <span className="stat-label">Total Classes</span>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="subjects-section">
            <div className="section-header">
              <h2>Subjects</h2>
              <button onClick={addSubject} className="btn btn-primary">
                <i className="fas fa-plus"></i> Add Subject
              </button>
            </div>

            <div className="subjects-list">
              {subjects.map((subject) => {
                const percentage = calculatePercentage(subject.attended, subject.total)
                const classesNeeded = getClassesNeededFor75(subject.attended, subject.total)
                const classesCanSkip = getClassesCanSkip(subject.attended, subject.total)
                const hasData = subject.attended !== '' && subject.total !== '' && parseInt(subject.total) > 0
                const isBelow75 = hasData && percentage < 75

                return (
                  <div key={subject.id} className={`subject-card ${hasData ? (isBelow75 ? 'danger' : 'safe') : ''}`}>
                    <div className="subject-header">
                      <input
                        type="text"
                        value={subject.name}
                        onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                        className="subject-name-input"
                        placeholder="Subject Name"
                      />
                      <button 
                        onClick={() => removeSubject(subject.id)}
                        className="btn btn-danger btn-sm"
                        title={subjects.length === 1 ? "Clear subject data" : "Remove subject"}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>

                    <div className="subject-inputs">
                      <div className="input-group">
                        <label>Classes Attended</label>
                        <input
                          type="number"
                          min="0"
                          value={subject.attended}
                          onChange={(e) => updateSubject(subject.id, 'attended', e.target.value)}
                          className="form-input"
                          placeholder="0"
                        />
                      </div>
                      <div className="input-group">
                        <label>Total Classes</label>
                        <input
                          type="number"
                          min="0"
                          value={subject.total}
                          onChange={(e) => updateSubject(subject.id, 'total', e.target.value)}
                          className="form-input"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="subject-stats">
                      <div className="percentage-display">
                        {hasData && (
                          <span className={`percentage ${isBelow75 ? 'danger' : 'safe'}`}>
                            {percentage}%
                          </span>
                        )}
                      </div>

                      <div className="recommendations">
                        {hasData && (
                          <>
                            {isBelow75 ? (
                              <div className="recommendation danger">
                                <i className="fas fa-chart-line"></i>
                                <span>Need to attend {classesNeeded} more classes to reach 75%</span>
                              </div>
                            ) : (
                              <div className="recommendation safe">
                                <i className="fas fa-smile"></i>
                                <span>Can skip {classesCanSkip} classes and still maintain 75%</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Attendance Entry */}
          <QuickAttendance 
            subjects={subjects} 
            onAttendanceAdded={handleAttendanceAdded}
          />

          {/* Attendance Chart */}
          <AttendanceChart 
            subjects={subjects} 
            attendanceData={attendanceData}
            setAttendanceData={setAttendanceData}
          />
        </div>
      </main>
    </div>
  )
}

export default AttendanceCalculator
